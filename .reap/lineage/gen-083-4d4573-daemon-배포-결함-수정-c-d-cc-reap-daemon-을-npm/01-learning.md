# Learning

## Project Overview

REAP v0.17.4. 본 세대는 **daemon 배포 결함**을 다룬다. `daemon/` 은 본 repo 안의 별도 앱(`@c-d-cc/reap-daemon` v0.1.0)이며, reap 의 `dependencies` 에 `file:./daemon` 으로 선언되어 있다. daemon 연동은 `config.daemon: true` opt-in 이고, 실패는 전 호출부에서 silent-fail 로 감싸여 있다.

관련 코드:
- `src/cli/commands/daemon/client.ts` — spawn / health / `resolveDaemonBin`
- `src/cli/commands/daemon/lifecycle.ts` — `ensureRegistered` / `triggerIndexing`
- lifecycle 진입점 **5곳** (backlog 은 4곳으로 적었으나 실측은 5곳): `run/start.ts:194`, `run/learning.ts:75`, `run/implementation.ts:96`, `run/completion.ts:476`, `run/early-close.ts:167`
- `src/core/prompt.ts:224` — `daemon: true` 시 agent prompt 에 Code Intelligence 절 주입
- `daemon/src/indexer/languages.ts:11` — `QUERIES_DIR`
- `daemon/scripts/build.sh` — `bun build src/index.ts --outdir dist --target node`

## Source Backlog

`daemon-배포-결함-수정-npm-설치-환경에서-daemon-동작-불가-reap-daemon-독립-발행.md` (type: task, priority: high, 2026-07-26 작성, 2026-08-19 재검증).

요지: **npm 으로 설치한 사용자는 `daemon: true` 를 켜도 daemon 을 전혀 쓸 수 없다.** `dependencies` 는 `file:./daemon` 인데 발행 tarball 의 `files` 에 `daemon/` 이 없고, `@c-d-cc/reap-daemon` 은 npm 에 미발행이다. npm 은 끊긴 심링크를 만들고, 실패는 전부 silent-fail 이라 사용자에게 아무것도 보이지 않는다.

해결 방향은 **C. npm 독립 발행**(A 번들 / B optionalDependencies 는 기각). 하위 항목 S1~S5:
- S1 `@c-d-cc/reap-daemon` npm 발행 준비
- S2 reap 의 `dependencies` 에서 제거 + `resolveDaemonBin` 3단계화
- S3 미설치 시 1회 안내 (silent-fail 정책을 깨야 하는 유일한 지점)
- S4 배포 산출물 검증 (tarball 기준)
- S5 자기진단 게이트의 허위 커버리지 주장 정정

## Key Findings

### 1. Backlog 의 사실 주장은 모두 재확인됨

| 주장 | 확인 결과 |
|---|---|
| `npm view @c-d-cc/reap-daemon` → E404 | **참** (2026-08-19 실행) |
| `package.json` `files` 에 `daemon/` 없음 | **참** — `dist/`, `scripts/postinstall.sh`, `README.md`, `RELEASE_NOTICE.md` 뿐 |
| `dependencies` 에 `"@c-d-cc/reap-daemon": "file:./daemon"` | **참** |
| `daemon/package.json` 에 `files` / `publishConfig` 부재 | **참** — 현재 pack 하면 `src/`, `tests/`, `bun.lock` 까지 들어간다 |
| `integrity.ts` / `fix.ts` 에 daemon 언급 0건 | **참** (`grep -c daemon` = 0, 0) |
| `resolveDaemonBin` 2단계, 미설치 판정 없음 | **참** (client.ts:70-76) |

### 2. Backlog 의 원인 분석 한 곳이 틀렸다 — 폴백 경로는 dev 에서도 안 맞는다

backlog 은 *"소스 트리에서 dog-fooding 중이라 `resolveDaemonBin` 의 폴백 경로가 항상 맞는다"* 고 적었다. **틀렸다.**

`join(__dirname, "..", "..", "..", "daemon", "dist", "index.js")` 를 실제로 계산하면:
- dev (`bun src/cli/index.ts`): `src/cli/commands/daemon` + 3×`..` = `src` → **`src/daemon/dist/index.js`** — 없음
- dist (번들): `dist/cli` + 3×`..` = repo 의 **부모** → **`<repo의 부모>/daemon/dist/index.js`** — 없음

즉 폴백은 **어느 환경에서도 맞지 않는 죽은 경로**다. dog-fooding 이 동작하는 진짜 이유는 1차 경로다 — `file:./daemon` 선언 때문에 npm 이 `node_modules/@c-d-cc/reap-daemon -> ../../daemon` 심링크를 만들었고, 소스 트리에서는 그 대상이 실존하므로 `require.resolve` 가 성공한다:

```
$ node -e 'console.log(require.resolve("@c-d-cc/reap-daemon/dist/index.js"))'
/Users/hichoi/cdws/reap/daemon/dist/index.js
```

**결과적 제약**: S2 로 `dependencies` 에서 `file:./daemon` 을 제거하면 그 심링크가 사라지고, **우리 자신의 dog-fooding 이 끊긴다.** 폴백 경로 수정은 선택이 아니라 S2 의 필수 동반 작업이다.

### 3. (신규) 배포하더라도 daemon 은 심볼을 0개 추출한다 — queries 경로

`daemon/src/indexer/languages.ts:11`:
```ts
const QUERIES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "queries");
```
- src 실행: `daemon/src/indexer` + 2×`..` = `daemon/queries` — 맞음
- **dist 실행: `daemon/dist` + 2×`..` = `<repo>/queries` — 없음**

실측 (dist 번들을 bun 으로 spawn, fixture `tests/fixtures/daemon-sample` 인덱싱):
```
{"filesProcessed":3,"nodesCreated":0,"edgesCreated":1}
symbols?q=validateId → []
```
**심볼 0개.** daemon 은 정상적으로 뜨고 health 도 ok 이며 인덱싱도 "성공"으로 보고하지만 아무것도 추출하지 못한다.

이것은 longterm 의 안티패턴 *"Cross-asset path helpers without dist/dev branching"* 에 정확히 해당한다.

### 4. (신규) node 런타임에서는 daemon 이 아예 동작하지 않는다 — better-sqlite3 bindings

`bun build --target node` 가 `better-sqlite3` 를 **번들에 인라인**했고, 그 안의 `bindings` 패키지가 네이티브 `.node` 를 **번들 위치 기준**으로 찾는다. 실제 tarball 을 만들어 설치한 뒤 node 로 실행한 결과:

```
Error: Could not locate the bindings file. Tried:
 → /private/tmp/dqi/node_modules/@c-d-cc/reap-daemon/build/better_sqlite3.node
 → ... (13개 경로 모두 패키지 루트 기준)
```

`node_modules/better-sqlite3/build/Release/` 에 정상 설치된 바이너리를 **보지 못한다**. `detectRuntime()` 이 bun 을 선호하기 때문에 bun 사용자에게만 우연히 동작했고, **bun 이 없는 사용자는 node 로 spawn 되어 전부 실패**한다.

실현 가능성 확인: `--external better-sqlite3 --external web-tree-sitter --external tree-sitter-wasms` 로 빌드하면 번들 45KB (기존 182KB) 로 줄고 네이티브 의존은 정상 node 해석 경로를 탄다.

**3 과 4 를 합치면**: S1 을 그대로 수행해 발행하면 *"끊긴 심링크"* 가 *"설치되지만 아무 심볼도 못 뽑는(또는 node 에서 죽는) 패키지"* 로 바뀔 뿐이다. genome 의 *"인과로 묶인 검증 동작 fix 는 본 generation 에서 처리"* 에 따라 3·4 는 본 세대 범위다 — 이것 없이는 S4 의 검증이 통과할 수 없고, 통과시키려면 검증을 무력화해야 한다.

### 5. (신규) 허위 커버리지 주장의 carrier 는 3곳이다

backlog 은 2곳(`scripts/check-self-diagnosis.sh` 헤더, `.reap/environment/summary.md`)을 지목했으나 실제로는 3곳:

- `scripts/check-self-diagnosis.sh:12` — *"gen-074 daemon : `files` omitted daemon/, leaving a broken symlink"*
- `.reap/environment/summary.md` § CI / Release 게이트
- **`.github/workflows/release.yml:44`** — *"Catches what #22 and the gen-074 daemon packaging defect had in common"*

같은 사실을 세 파일이 알고 있으므로 `reap:carrier(...)` 표식 대상이다 (application.md § 여러 곳이 아는 사실).

### 6. 검증 비용은 감당 가능하다

daemon tarball 설치 실측: **~2초** (warm cache, better-sqlite3 prebuild 다운로드). CI 상주가 가능한 수준. 콜드 러너에서는 더 걸리겠으나 자기진단 게이트 전체(현재 OpenCode 설치 포함)에 비해 유의미하지 않다.

### 7. 현재 daemon tarball 은 정리가 안 되어 있다

`files` 부재로 `src/`, `tests/`, `bun.lock`, `scripts/`, `tsconfig.json` 이 전부 포함된다 (73KB). `files: ["dist", "queries"]` 로 좁혀야 한다. `queries/` 는 런타임 자산이므로 **반드시 포함**되어야 한다.

## Backlog

pending 7건 — 전부 본 세대와 무관(0.18 릴리즈 배정 6건 + daemon SCIP 1건). SCIP 검토(`reap-daemon-개선-검토-...`)는 본 세대를 **선행 조건**으로 두므로 gen-084 에서 진행한다.

## Context

- 릴리즈 맥락: 본 작업은 **0.17.5** 로 main 에서 진행. 버전 bump / publish 는 본 세대가 하지 않는다 (유저가 gen-084 이후 `reapdev.versionBump` 실행).
- **npm publish 는 유저 승인 필수**. `@c-d-cc/reap-daemon` 최초 발행은 본 세대가 무단 수행하지 않는다.
- strict merge mode 활성 — `git push` 금지 (로컬 commit 은 정상).
- 테스트 baseline: unit 473 / e2e 278 / scenario 44, 전부 0 fail.
- genome: 본 generation type 은 `embryo` 이나, 팀 리드 지시에 따라 normal 규칙(genome immutable, 변경은 adapt 에서)을 따른다.

## Clarity Level

**HIGH — 단, Open Decisions 5건은 유저 판단 필요.**

근거:
- 문제·원인·해결 방향(C안)이 backlog 에 확정되어 있고 실측으로 재확인됨
- 변경 대상 파일이 명시되어 있음
- 그러나 backlog 의 Open Decisions(버전 정책 / 자동 설치 / `daemon install` 서브커맨드 / 검증 배치 / repo 분리)는 **유저가 명시적으로 열어둔 항목**이므로 추측하지 않는다. planning 단계에서 권고안과 함께 유저에게 제시한다.
- 추가로 발견한 3·4번(queries 경로 / native bindings)은 판단 여지가 없다 — 고치지 않으면 발행이 무의미하므로 본 세대에 포함한다.
