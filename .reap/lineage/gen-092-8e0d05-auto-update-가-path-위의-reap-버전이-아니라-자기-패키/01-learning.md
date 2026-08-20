# Learning

> gen-092 — auto-update 가 어느 버전을 읽고 어디에 설치하는가

## Project Overview

REAP 0.17.6 은 **미발행 상태**이고 커밋 8개가 미푸시다. 이번 세대는 0.17.6 릴리즈 전 마지막 소스
수정이며, 대상은 `src/cli/commands/check-version.ts` — **postinstall 과 SessionStart 양쪽에서
실행되는 유일한 자동 동작**이다. 이 파일의 결함은 시끄럽게 실패하지 않는다. 사용자 머신에
**무엇이 설치되는가**를 바꾼다.

## Source Backlog

`auto-update-가-path-의-reap-버전을-읽는다-설치-중인-그-패키지가-아니다.md` (gen-088 작성, status: consumed).

핵심은 backlog **자신이 스스로를 정정했다**는 점이다. gen-088 은 처음에 "(1)을 고치면 로컬 설치가
전역을 건드리는 경로도 닫힌다"고 적었고, 이후 독자가 그것이 **틀렸음**을 발견해 정정 절을 덧붙였다.
정정의 요지:

- (1)의 수정은 그 경로를 **닫지 않는다. 트리거를 뒤집는다** — "전역이 낡음" → "자기가 낡음".
- 따라서 결함은 **둘**이다: **(1) 어느 버전을 읽는가**, **(2) 어디에 설치하는가**.
- 둘을 한 세대에서 다루되 **근거를 따로 적을 것**. 근거를 합치는 것이 오류가 살아남을 뻔한 이유다.

## Key Findings

### F1. 결함 1 은 지금 이 저장소에서 살아있는 상태로 관측된다

```
$ which reap → /Users/hichoi/.nvm/.../bin/reap
$ reap --version → 0.17.5
$ node -p "require('./package.json').version" → 0.17.6
```

`getInstalledVersion()` (`src/cli/commands/check-version.ts:36`) 는 `execSync("reap --version")` 이므로
지금 이 작업 트리에서 **0.17.5** 를 돌려준다. 이 코드가 속한 패키지는 **0.17.6** 이다. 가정이 아니라
현재 상태다.

### F2. "우리 버전"을 아는 곳이 다섯이다 — #22 의 모양 그대로

| 위치 | 방식 | `+dev` 마커 |
|---|---|---|
| `src/cli/index.ts:8` `readVersion()` | `import.meta.url` 기준 2단계 + 1단계 | **붙임** |
| `src/cli/commands/update.ts:23` | 동일 (2단계 + 1단계) | 안 붙임 |
| `src/cli/commands/load-context.ts:12` | 3단계 + 2단계 + 1단계 | 안 붙임 |
| `src/core/dump-state-sync.ts:11` | 2단계 + 1단계 | 안 붙임 |
| `src/cli/commands/check-version.ts:36` | **`execSync("reap --version")` — PATH** | (PATH 값에 달림) |

뒤 세 곳은 주석에 *"mirrors update.ts helper"* 라고 **스스로 사본임을 적어두고 있다.** genome 의
처방은 명확하다 — 같은 **값**을 여러 코드가 알면 표식이 아니라 **하나가 소유하고 나머지가 import**
한다 (application.md § 표식보다 공유가 낫다).

`src/core/notice.ts:7` 도 패키지 루트를 찾지만 `require.resolve` 기반이고 버전이 아니라
`RELEASE_NOTICE.md` 위치를 찾는 것이므로 별건이다.

### F3. 결함 2 를 판단할 도구가 이미 있다 — gen-090 이 만들었다

`src/cli/commands/uninstall.ts` 의 `detectInstallKind()` 가
`"global" | "npx" | "local" | "checkout" | "unknown"` 을 돌려준다. 주입 seam(`moduleDir`,
`npmGlobalRoot`, `realpath`, `readPackageName`)이 전부 있고 unit test 도 이미 6종(전역/로컬/npx/
checkout/unknown/심볼릭링크)이 있다. `npm uninstall -g` 라는 **머신 단위 파괴 동작**을 위해
보수적으로 설계된 판정이며, `npm install -g` 도 정확히 같은 성질의 동작이다.

**`findPackageRoot` 는 깊이에 의존하지 않는다** — 12단계까지 올라가며 `package.json` 의 `name` 이
`@c-d-cc/reap` 인 디렉토리를 찾는다. 위 F2 표의 고정 깊이 방식보다 강하고, longterm 이 경고하는
번들 깊이 함정(*"bundling collapses every module into one file"*)을 구조적으로 회피한다.

### F4. `.dev-build` 마커는 로컬 pack 된 tarball 에 **들어간다**

측정: `npm pack --dry-run --json` → `dist/.dev-build` 가 86개 파일 목록에 포함됨.
`scripts/build.sh:61` 은 `CI` 와 `npm_config_tag` 가 **둘 다 비었을 때만** 마커를 찍으므로
GitHub Actions 빌드(=발행본)에는 없다.

따라서 결함 1 을 고치면 부수 효과가 하나 생긴다 — 자기진단 게이트가 설치하는 tarball 은
로컬 빌드라 마커를 갖고 있고, 그 설치본은 자기 버전을 `0.17.6+dev.<hash>` 로 읽어
`performAutoUpdate` 가 **2단계(dev-build)에서 skip** 한다. gen-088 이 게이트 쪽에서 우회로 막아둔
것을 **원인 쪽에서도** 막는 셈이다.

### F5. postinstall 과 SessionStart 는 서로 다른 환경이다

- postinstall: `scripts/postinstall.sh` 가 `node "$(dirname $0)/../dist/cli/index.js" check-version`
  을 부른다 — **자기 패키지의 번들**이다. npm 이 `npm_config_prefix` 등을 물려준다.
- SessionStart: `~/.claude/settings.json` 의 `reap check-version 2>/dev/null || true`
  (`src/adapters/claude-code/install.ts:248`) — **PATH 의 reap**.

즉 postinstall 경로에서는 "실행 중인 코드"와 "PATH 의 reap"이 다를 수 있고, 그것이 F1 이다.

## Backlog Review

pending 11건. 전부 이번 goal 과 무관하다 — 0.18 지식축(idea/plan/milestone/interview/plugin 전환) 6건,
indexer 재설계 2건, 게이트/도구 3건. 소비하지 않는다.

## Technical Deep-Dive

### 결함 2 의 판단 재료

`performAutoUpdate` 7단계는 무조건 `npm install -g @c-d-cc/reap@latest` 다. 설치 종류별로 이것이
무엇을 하는지:

| kind | 지금 일어나는 일 | 옳은가 |
|---|---|---|
| `global` | 자기 자신을 올린다 | **옳다** |
| `local` | 사용자가 **건드리지 않은 전역 설치**를 바꾼다. 정작 낡은 로컬은 그대로 | 아니다 |
| `npx` | 일회용 실행이 **전역 설치를 만든다/바꾼다** | 아니다 |
| `checkout` | 소스 트리를 돌리는데 전역이 바뀐다 | 아니다 |
| `unknown` | 무엇인지 모르는 채 머신을 바꾼다 | 아니다 |

`local` 에서 "로컬을 대신 올려주면 되지 않나"도 아니다 — 사용자의 `package.json`/lockfile 과
어긋나고, npm 이 소유한 결정을 REAP 이 뒤에서 뒤집는 것이 된다.

### 이 수정이 **만들어내는** 세 번째 문제

결함 1 을 고치면 `checkAutoUpdateGuard()` 의 경고 문구가 어긋난다. 지금은 **전역** 버전을 재고
`Run: npm install -g ...` 를 권하므로 잰 것과 권하는 것이 일치한다. 수정 후에는 **로컬** 버전을
재고 여전히 전역 설치를 권하게 된다 — 재는 대상과 처방이 갈린다. gen-086 의 교훈
(*"낡은 것을 어떻게 고치는가는 어디서 찾았는가에 달렸다"*) 과 같은 모양이며, 내 변경이
직접 만들어내는 것이므로 회피 대상이 아니라 처리 대상이다.

### 테스트 가능 범위 (미리 정한다)

- **가능**: "PATH 가 아니라 자기 버전을 읽는다" (가짜 `reap` shim 을 PATH 에 놓고 unit),
  "kind 별로 전역 설치를 부르는가/안 부르는가" (주입 seam),
  "kind 별 처방 문구" (순수 함수).
- **불가능(솔직히 적을 것)**: 실제 `npm install -g` 실행, 실제 network `npm view`,
  실제 npm postinstall 환경, 실제 SessionStart hook 발화.

## Context for This Generation

- **Clarity: HIGH.** backlog 가 결함 둘을 분리해 명시했고, 파일·함수·해결 방향까지 지목한다.
  결함 2 의 판단만 이 세대의 몫이며 backlog 이 제안한 방향("로컬은 auto-update 하지 않는다")이
  검토 결과 타당하다 → team lead 가 지정한 에스컬레이션 조건에 해당하지 않는다.
- **버전 0.17.6 유지.** bump 금지. 릴리즈 문서는 기존 0.17.6 항목을 **보강**만 한다.
- **strictEdit / strictMerge 활성.** 02-planning.md 의 파일 목록 밖은 수정 금지, git pull/push/merge 금지.
- **baseline**: unit 585 / e2e 329 / scenario 44, 0 fail. `fix --check` 0 error / 2 warning.
  unit 585 pass 0 fail 을 이번 세대 시작 시점에 **재확인했다**.
- **gen-091 은 4라운드가 걸렸고 매 라운드가 직전 라운드 수정의 이웃에서 났다.** 이 세대는
  "버전을 읽는 곳"을 통합하므로 이웃이 넓다 — update/load-context/dump-state 의 값이
  **바뀌지 않는 것**을 별도로 확인해야 한다 (`+dev` 가 `lastMigratedVersion` 에 새어들면
  사용자 config 가 오염된다).
