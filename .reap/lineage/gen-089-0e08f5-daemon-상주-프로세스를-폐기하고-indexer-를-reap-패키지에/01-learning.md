# Learning

## Project Overview

REAP 는 자기참조적(dog-fooding) 개발 파이프라인이다. 현재 `@c-d-cc/reap@0.17.5` 가 npm `latest` 이고,
같은 저장소에서 `@c-d-cc/reap-daemon@0.2.0` 이 별도 발행돼 있다 — **다운로드 0회, npm deprecated 처리 완료**.

이번 세대는 그 daemon 을 **폐기**하고, 살릴 부분(tree-sitter 심볼 추출 · CodeGraph · blast radius)을
reap 본체에 내장한다. 인덱싱 주기를 git commit 에 맞추고, 분석을 `reap index` CLI 로 노출한다.

출발점은 GitHub Discussion #10 (aresstokrat) 의 "code-intelligence 를 embedded 기본으로" 제안이고,
그것을 본 저장소에서 **실측으로 검증한 결과**가 source backlog 에 담겨 있다.

## Source Backlog

`daemon-폐기-및-indexer-내장-인덱싱을-git-commit-주기에-맞추고-분석을-cli-tool-로-제공.md`
(382줄, `consumedBy: gen-089-0e08f5`). 전문을 읽었고 **재측정하지 않는다** — 아래는 그 요지다.

### Problem (backlog 원문 요약)

- **P1 — 상주 프로세스가 아무것도 벌지 못한다.** `runIncrementalPipeline` 은 구현돼 있는데 유일한
  호출부(`daemon/src/api/projects.ts:60`)가 `incremental` 인자를 넘기지 않아 **HTTP 로 도달 불가능**하다.
  lifecycle 4개 진입점이 전부 full reindex 를 돈다. 그 6.2초의 92%는 tree-sitter 가 아니라 파일마다 1회
  도는 `git log -1` 서브프로세스(24.5ms × 233 ≈ 5.7초)다. 상주가 준다는 이점 넷(warm 그래프 / 비차단 /
  다중 프로젝트 / HTTP 지연)이 현재 규모에서 전부 0에 수렴한다. 조사 중 **고아 daemon 프로세스**가 실제로
  발견됐다 (PPID 1, `daemon.pid` 미기재, `daemon stop` 이 인지 못함).
- **P2 — blast radius 가 5개월간 항상 0을 반환했고 아무도 몰랐다.** 원인은
  `daemon/src/indexer/import-resolver.ts` 의 후보 목록에 **`.js` specifier → `.ts` 파일 변환이 없는 것**.
  REAP 은 ESM/NodeNext 규약대로 `from "./lifecycle.js"` 라고 쓴다. 문서화된 호출법(`?file=`)도 네 곳 전부
  틀렸다(실제는 `?files=`). **모든 검사가 "인덱싱이 돌았는가"를 물었고 "결과가 말이 되는가"는 아무도 묻지 않았다.**
- **P2-b — edges 가 재인덱싱마다 누적된다.** `edges` 테이블에 PK/UNIQUE 가 없고 `saveEdges` 가 평범한
  `INSERT` 다. 5회 인덱싱 후 총 7,354 / 고유 1,482 (정확히 5배).
- **P3 — 나머지 두 분석이 정보를 주지 않는다.** community detection 은 이름과 달리 Louvain 이 아니라
  연결 컴포넌트(BFS)라 cohesion 이 정의상 상수 1.00. process tracing 은 진입점 휴리스틱이 call
  resolution 품질에 종속돼 해석 실패 함수까지 전부 진입점이 된다.
- **P4 — 유지 비용 약 5,900 lines** 이고 opt-in 주변부가 아니라 `core/` 까지 침투해 있다.
- **P5 — 사용자가 없다.** daemon 30일 다운로드 0회 vs reap 1,546회. **인과의 원천은 P4 가 아니라 이것이다** —
  소비자가 없으니 결과를 검증할 사람도 없었다.

### Solution (backlog 원문 요약)

S1 상주 프로세스·별도 패키지 폐기 / S2 동봉 비용 측정 완료(네이티브 빌드가 사라지는 것이 핵심) /
S3 인덱싱 주기를 git commit 에 맞춤 / S4 인덱스를 `.reap/.index/` 에 두고 gitignore /
S4-2 형식은 JSON+gzip (YAML 은 읽기 122배 느려 탈락) / S4-3 shard 는 v1 제외하되 `manifest.json` 이
배치·`format` 버전의 단일 소유자 / S5 `reap index <verb>` CLI / S6 **import 해석률 지표** /
S7 blast radius 만 v1 포함, community·process 는 별도 backlog / S8 기존 사용자 도달 경로.

## Key Findings

### 이식 대상 — 실제로 읽은 코드

| 파일 | 줄 | 판정 |
|---|---|---|
| `daemon/src/indexer/graph.ts` | 103 | **그대로 이식.** 순수 인메모리 자료구조, 의존 0 |
| `daemon/src/indexer/parser.ts` | 88 | 이식. `web-tree-sitter` 동적 import |
| `daemon/src/indexer/scanner.ts` | 50 | 이식. `git ls-files -z` + `git diff --name-only` |
| `daemon/src/indexer/languages.ts` | 65 | 이식 + **자산 경로 해석 교체** (`require.resolve` → ESM) |
| `daemon/src/indexer/import-resolver.ts` | 87 | 이식 + **`.js`→`.ts` 후보 추가 (P2 근본 원인)** |
| `daemon/src/indexer/call-resolver.ts` | 77 | 그대로 이식 |
| `daemon/src/indexer/impact.ts` | 47 | 그대로 이식 |
| `daemon/src/indexer/pipeline.ts` | 171 | 이식 + **파일별 `git log` 제거** (P1-b) |
| `daemon/src/indexer/storage.ts` | 163 | **폐기 → JSON+gzip 스냅샷으로 교체** (S4-2) |
| `daemon/src/indexer/index.ts` | 99 | 재작성 (community/process 제외, CLI 소비 형태로) |
| `daemon/src/indexer/{community,process-tracer}.ts` | 107 | **v1 제외** (S7) |
| `daemon/src/{server,router,registry,process,paths,index,api/*}.ts` | ~500 | **폐기** |
| `daemon/queries/*.scm` | 15개 | 이식 (텍스트 자산) |

`runFullPipeline` 을 읽고 확인한 것: **`file::` 노드를 만들지 않는다.** `graph.addNode` 는 심볼만 받고
IMPORTS edge 의 양끝(`file::X`)은 노드 없이 edge 로만 존재한다. `analyzeImpact` 는 edge 만 걷으므로
동작에는 문제없고, backlog 의 "`file::` 노드 수 0" 측정과 일치한다.

### 자산 동봉 — 측정으로 결정

```
tree-sitter-wasms 전체(36개 grammar)   tarball unpacked 51.8 MB  /  gzip 4.4 MB
REAP 이 지원하는 15개만                       26.6 MB  /  gzip 2.4 MB   ← backlog S2 의 "약 2.7 MB"
web-tree-sitter                                288 KB  /  gzip ~90 KB   네이티브 없음
```

→ **`tree-sitter-wasms` 를 devDependency 로 두고 `scripts/build.sh` 가 15개만 `dist/grammars/` 로 복사한다.**
런타임 의존은 `web-tree-sitter` 하나만 추가된다. 이유 셋:
(a) 저장소에 27MB 바이너리를 커밋하지 않는다, (b) 발행 tarball 은 정확히 15개만 담는다(backlog 가 승인한 수치),
(c) 버전은 devDependency 로 고정된다.
`cp -r src/templates dist/` 라는 기존 정적 자산 패턴을 그대로 따르는 것이라 새 기계가 0이다.

**node 에서 실제로 도는지 확인했다** [실행]: 저장소 루트에서 `node probe.mjs` —
`createRequire(import.meta.url)` 로 `tree-sitter-wasms` 를 찾고 `Parser.init()` → `Language.load()` →
`parse()` 까지 성공 (`OK rootNode: program children: 1`). 단, **번들에 인라인하면 안 된다** —
gen-083 의 네이티브 결함과 같은 부류이므로 `--external web-tree-sitter` 가 필수다.

### 자산 경로 해석 — 깊이 함정 회피

longterm 의 교훈("번들은 모든 모듈을 한 파일로 접으므로 `__dirname` 깊이가 달라진다")이 그대로 적용된다.
기존 REAP 이 이미 검증한 **한 칸 위** 규칙을 재사용한다:

```
dev  :  src/<any>/x.ts   →  import.meta.url dir = src/<any>   →  join(here, "..", ...)  = src/...
dist :  dist/cli/index.js →  import.meta.url dir = dist/cli    →  join(here, "..", ...)  = dist/...
```

`migrationTemplatesDir()` (`src/core/migration.ts:72`) 와 `copyArtifactTemplate` 이 같은 규칙이다.
- **queries(.scm)** → `src/templates/tree-sitter/` 에 두면 기존 `cp -r src/templates dist/` 가 자동 처리
- **grammars(.wasm)** → `dist/grammars/`, dev 는 존재하지 않으므로 `node_modules/tree-sitter-wasms/out` 으로 폴백

### reap 본체의 daemon 접점 — 전수 조사

```
src/cli/commands/daemon/{client,index,lifecycle}.ts   845 lines   → 삭제
src/types/index.ts            29줄  DaemonAvailability / ReapConfig.daemon / daemonBin / ExplicitDaemonBin
src/cli/commands/uninstall.ts 29줄  DAEMON_PACKAGE, stopDaemonIfRunning, npmRemovalTargets
src/core/prompt.ts            26줄  buildBasePrompt 의 3분기 Code Intelligence 절 (230~288행)
src/cli/commands/run/learning.ts 19줄  daemonEnabled/daemonReady/daemonInstalled emit
src/core/integrity.ts         13줄  checkDaemonAvailability
src/cli/commands/fix.ts       12줄  isDaemonEnabled + 호출
src/cli/commands/load-context.ts 11줄  buildDaemonStaticSection
src/cli/index.ts               6줄  daemon 명령 등록
src/core/dump-state-sync.ts    5줄  buildDaemonStaticSection 재사용
src/cli/commands/run/{start,implementation,completion,early-close,evolve}.ts  각 2~5줄
src/adapters/index.ts          4줄  REAP_HOME_ENTRIES 에 "daemon"
src/core/{semver,migration}.ts 각 1줄 (주석만)
src/adapters/claude-code/install.ts 1줄 (주석만)
```

저장소 밖 접점: `.github/workflows/release.yml` 의 `publish-daemon` job + `daemon-v*` 트리거,
`scripts/check-version-floors.sh` 의 `MIN_DAEMON_VERSION` 절, `scripts/check-self-diagnosis.sh` § 5·§ 5d-bis,
`package.json` 의 `workspaces`, `.gitignore` 의 `daemon/dist/`.

문서 접점 (grep 실측): `README*.md` 5개 = 55줄, `docs/src/i18n/translations/*.ts` 5개 = 122줄,
`reap-guide.md` 2벌 = 47줄, `RELEASE_NOTES.md` 11줄 / `RELEASE_NOTICE.md` 4줄.

테스트 접점: `tests/e2e/daemon-{config,indexing,lifecycle,query}.test.ts` (673줄),
`tests/unit/{daemon-availability,integrity-daemon,prompt-daemon}.test.ts` (912줄),
`tests/helpers/daemon.ts` (164줄), `tests/fixtures/daemon-sample/`.
**`tests/e2e/{uninstall,update}.test.ts` 와 `tests/unit/{uninstall,semver}.test.ts` 는 삭제가 아니라 수정** —
daemon 을 언급하지만 다른 것을 검증한다.

### 측정 — 이번 세대가 뒤집어야 할 숫자

```
git ls-files 중 인덱스 대상 확장자          234개
src/ 의 상대 import (from-절)               357개  — 전부 .js specifier
```

backlog 는 341 이라 적었다. 측정 방식 차이(중복/타입 전용)로 보이며, **Verification 은 절대수 대신
"해석률 100%"로 표현한다** — 하드코딩한 숫자는 다음 커밋에 어긋난다.

## Previous Generation Reference

gen-088 (`reap uninstall`) 은 daemon 정리를 포함해 만들었다 — `stopDaemonIfRunning`,
`npmRemovalTargets`, `~/.reap/daemon/` allowlist 항목. **이번 세대가 그 절반을 없앤다.**
`reap uninstall` 은 남되 daemon 지분만 걷어내야 하고, `~/.reap/daemon/` 은 **구 산출물 정리 대상**으로
성격이 바뀐다 (S4 의 "`reap update` 경로에서도 제거").

fitness 피드백에서 유저가 요구한 것: "plugin 전환 시 `reap uninstall` 이 어떻게 바뀌어야 하는지를
05-completion.md 의 Next Generation Hints 에 기록할 것. backlog 는 만들지 말 것." — **본 세대에서 이행한다.**

gen-088 이 남긴 교훈 중 이번에 직접 걸리는 것:
- **부재만 보는 단언은 두 상태를 구분하지 못한다.** "blast radius 가 0이 아니다"는 자기증명적이지만
  "daemon 프로세스가 0개"는 아니다 — 명령이 실제로 돌았다는 증거를 먼저 요구해야 한다.
- **`~/.reap/` 는 allowlist.** 구 daemon 디렉토리 제거도 이 규율 안에서 한다.

## Backlog Review

pending 7건. **전부 이번 goal 과 무관**하다 — 6건이 0.18 별도 브랜치(plugin 전환 · idea · plan ·
milestone · interview skill · `/reap.plan`)이고, 1건은 auto-update 버전 판정(`auto-update-가-path-의-...`)이다.
`--backlog` 로 소비한 daemon 폐기 건 하나가 이번 세대의 유일한 근거다.

이번 세대가 **새로 만들어야 할 backlog** (S7 이 명시):
- community detection 재설계 (Louvain 등)
- process tracing 재설계

## Technical Deep-Dive

### `.js` → `.ts` 후보 누락의 정확한 형태

```ts
// daemon/src/indexer/import-resolver.ts:55-66
const base = normalize(join(fromDir, specifier));      // "src/core/lifecycle.js"
const candidates = [ base, `${base}.ts`, ... ];        // "…lifecycle.js", "…lifecycle.js.ts" …
```

실제 파일은 `src/core/lifecycle.ts` 다. 후보 어느 것과도 맞지 않는다.
docs/src 는 확장자 없는 React import 라 그 56개만 살아남았다 — **부분 성공이 결함을 가렸다.**

수정 방향: specifier 의 JS 확장자를 TS 대응으로 치환한 후보를 추가한다
(`.js`→`.ts`/`.tsx`, `.mjs`→`.mts`, `.cjs`→`.cts`, `.jsx`→`.tsx`).

### commit 주기 인덱싱이 이미 절반 짜여 있다

`runIncrementalPipeline` 은 `loadMeta("lastCommit")` → `getChangedFiles(root, lastCommit)` →
변경 0이면 즉시 반환까지 갖췄다. **도달만 못 했다.** 이식하면서 호출부를 바로잡는 것이 곧 S3 의 구현이다.

주의점 둘:
1. `getChangedFiles` 는 커밋된 diff 에 더해 **작업 트리·staged diff 도 합친다**. S3 의 "커밋 안 된 변경은
   인덱스에 없다"는 트레이드오프와 어긋난다. 그대로 두면 "변경 없음"이 거의 성립하지 않아
   `filesProcessed: 0` 검증이 불안정해진다 → **커밋 기준만 보도록 좁힌다** (계획 단계에서 확정).
2. incremental 이 `scanFiles` 전체를 다시 돌린다(파일 목록만 필요). 그건 `git ls-files` 1회라 싸다.

### 저장 형식 교체가 P2-b 를 원천 제거한다

그래프 전체를 스냅샷으로 직렬화하면 append 의미 자체가 사라진다. 다만 Verification 에
"총 == 고유"를 남겨 회귀를 막는다 (backlog 명시).

### 위험 — 이번 세대가 스스로 만들 수 있는 결함

1. **번들 인라인**: `web-tree-sitter` 를 external 로 두지 않으면 gen-083 결함 재현. → 자기진단 게이트에서
   **격리 설치 + node 실행 + 관계 검증**으로 확인한다.
2. **검사가 "돌았는가"만 묻는 것**: P2 를 만든 바로 그 형태. → `reap index status` 의 해석률과
   "알려진 관계가 잡히는가"(예: `stage-transition.ts → lifecycle.ts`)를 검사에 넣는다.
3. **먼저 실패시키지 않는 것**: import 해석률 테스트는 **수정 전 상태에서 red 를 확인한 뒤** 고친다.
4. **`reap index` 예시가 실제로 돌지 않는 것**: `?file=` 이 네 곳 다 틀렸던 이유. → prompt/guide 에 적는
   명령을 **테스트가 그대로 실행**하게 한다.

## Context for This Generation

- **Clarity: high.** backlog 가 문제·해법·변경 파일·검증 11항목까지 확정했고 측정도 끝나 있다.
  질문은 최소화하고 실행한다.
- **generation type: embryo** — genome 수정 가능하나 evolution.md 규율대로 **adapt phase 에서** 한다
  ("zero dependency" → "zero *native* dependency", carrier 표식).
- **strictEdit 활성** — 02-planning.md 의 task 목록에 있는 파일만 수정한다. 범위 밖 발견은
  `reap make backlog`.
- **strictMerge 활성** — `git pull/push/merge` 직접 실행 금지.
- **evaluator 활성** — validation 에서 `reap-evaluate` 를 띄우고 concern 을 surface 한다.
- **목표 버전 0.17.6** (gen-088 의 `reap uninstall` 과 함께). **이미 발행된 0.17.5 changelog 는 손대지 않는다.**
- **baseline (이번 세대가 깨면 안 되는 수치)**: unit 600 / e2e 302 / scenario 44, 전부 0 fail.
  daemon 자체 스위트 130 은 패키지와 함께 사라진다.
- **가정**: `reap index` 는 v1 에서 blast radius + 심볼 검색 + status 만 노출한다. community/process 는 제외.
- **가정**: 인덱스는 `.reap/.index/` 단일 위치. shard 는 v1 미구현이되 `manifest.json` 이 배치와
  `format` 버전을 소유해 나중에 무중단 전환할 자리를 남긴다.
