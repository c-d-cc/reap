# Learning

> gen-084 — strict resolver 우회 경로 신설. daemon 위치를 사용자가 명시 지정할 수 있게 한다.

## Project Overview

REAP v0.17.4 는 0.17.5 릴리즈를 앞두고 있다. 직전 세대(gen-083, `8fc07d6`)가 `@c-d-cc/reap-daemon` 을 reap 의 의존에서 **의도적으로 떼어내** 독립 npm 패키지로 만들었다. 이제 reap 은 `require.resolve("@c-d-cc/reap-daemon/dist/index.js")` 로 daemon 을 찾는다.

그 분리가 **한 부류의 사용자에게는 상황을 엄밀히 더 나쁘게 만들었다**. 본 세대는 그 부류를 구제하는 것이 목적이며, 유저 결정으로 **0.17.5 의 하드 선행조건**이다 (릴리즈 순서: gen-083 완료 → 본 세대 → `daemon-v0.2.0` 발행 → 0.17.5).

## Source Backlog

`daemon-위치를-명시-지정하는-우회-경로-strict-resolverpnpm-yarn-pnp에서-daemon-이-원리적으로-resolve-되지-않는다.md` (priority: high, gen-084 소비)

### 요지

daemon 을 reap 의 dependency 에서 제거한 것이 이번 수정의 **요점**인데, pnpm 기본 격리 store 와 Yarn PnP 는 *선언되지 않은 패키지*에 대한 접근을 **설계상** 차단한다. 두 요구가 원리적으로 충돌한다.

그 결과 그 사용자는:

- daemon 을 **정상 설치하고도 영구히 "설치하라"는 안내**를 받는다 — 이미 가진 것을 설치하라는 안내다
- 자기진단 게이트 § 5e 는 `npm i -g --prefix` 레이아웃만 검사하므로 **seam 이 건강하다고 보고한다**
- 이전 결함(끊긴 심링크)은 최소한 조용했다. 지금은 **틀린 안내를 확신을 갖고 한다**

backlog 이 열거한 동일 계열 조합: pnpm/PnP · reap 전역 + daemon 로컬 · 서로 다른 매니저·prefix · nvm 전환 · Windows(전 경로 미검증).

### backlog 이 제시한 해법

`REAP_DAEMON_BIN` env var + `.reap/config.yml` 의 `daemonBin:` 을 `resolveDaemonBin` 의 **1순위**로. 미설치 안내 문구도 함께 바꿀 것. 검증은 pnpm fixture. 게이트 편입 여부는 비용 판단.

### backlog 주장 검증 — 무엇이 맞고 무엇을 바꿨는가

longterm 교훈("backlog 의 주장을 실행만 하지 말고 검증하라")에 따라 확인했다.

| backlog 주장 | 판정 | 근거 |
|---|---|---|
| `require.resolve` 로 찾는다 | **맞다** | `client.ts:150` `resolveId(`${DAEMON_PACKAGE}/dist/index.js`)` |
| `DaemonResolveDeps` seam 이 이미 있어 unit 이 그대로 확장된다 | **맞다** | `client.ts:116-123`, `tests/unit/daemon-availability.test.ts` |
| 검증에 pnpm fixture 가 필요하다 | **부분적으로 틀리다** | 게이트에는 **불필요**. 아래 § 게이트 참조 |
| 안내 문구가 무조건 "설치하라"고 한다 | **맞다** | `integrity.ts:731`, `daemon/index.ts:37`, `prompt.ts:244` 세 곳 모두 |
| `resolveDaemonBin` 1순위에 넣으면 된다 | **불충분** | 아래 § 결함 — 전달 경로가 없다 |

## Key Findings

### 1. 결정적 발견 — 명시 경로를 어디서 읽을 것인가에 backlog 이 답하지 않는다

backlog 은 "`resolveDaemonBin` 의 1순위로 넣는다"고만 적었다. 그런데 **config 값이 그 함수까지 도달하는 경로가 존재하지 않는다.**

`resolveDaemonAvailability()` 는 **다섯 곳에서 전부 인자 없이** 호출된다:

| 호출부 | config 접근 가능? |
|---|---|
| `src/cli/commands/daemon/index.ts:33,50` (`requireUsableDaemon`, `statusCmd`) | 아니오 (읽지 않는다) |
| `src/cli/commands/fix.ts:76` | 예 (`isDaemonEnabled` 가 이미 파싱) |
| `src/cli/commands/run/learning.ts:84` | 예 |
| `src/cli/commands/run/evolve.ts:77` | 예 |

더 중요한 것은 **spawn 경로**다. `ensureDaemon()`(`client.ts:73`)이 `resolveDaemonBin()` 을 인자 없이 부르는데, 이것은 `daemonRequest` → `lifecycle.ts` 의 `ensureRegistered`/`triggerIndexing` → `run/{start,learning,implementation,completion}.ts` 로 이어지는 **가장 깊은 호출 사슬**이다. config 를 인자로 흘리려면 그 사슬 전체의 시그니처를 바꿔야 하고, **한 경로만 놓쳐도 "찾기는 하는데 띄우지는 못한다"는 새로운 반쪽 결함이 생긴다** (gen-065/069 가 반복 지적한 실패 양상).

→ **설계 결론**: 명시 경로는 인자로 흘리지 않고 `resolveDaemonBin` 이 스스로 읽는다. env var 는 `resolvePort()`(`client.ts:43`)가 이미 쓰는 call-time `process.env` 조회 선례를 그대로 따르고, config 는 `process.cwd()/.reap/config.yml` 을 동기 읽기 한다. **REAP 전 명령이 `createPaths(process.cwd())` 를 쓰며 상위 탐색을 하지 않으므로** 이 기준은 코드베이스와 일관된다(`grep createPaths(` 로 20곳 확인). 단, 테스트 격리를 위해 **읽기 자체를 `DaemonResolveDeps` seam 으로 주입 가능하게** 만든다.

### 2. 명시 경로가 빗나갔을 때 — fall-through 여부가 진짜 설계 결정이다

backlog 은 이 경우를 다루지 않는다. 두 선택지:

| 선택 | 장점 | 단점 |
|---|---|---|
| 빗나가면 즉시 null | 명시 지시가 무시되지 않음 | `config.yml` 은 **git 에 커밋된다** — 머신 A 에서 지정한 경로가 머신 B 에 없으면, B 는 daemon 이 정상 설치돼 있어도 죽는다 |
| 빗나가면 자동 탐색으로 진행 | 머신 B 가 살아난다 | 명시 지시가 조용히 무시됨 — 지금 고치는 결함과 같은 부류 |

→ **두 단점을 모두 피하는 제3안**: **fall-through 하되, 빗나간 사실은 결과와 무관하게 항상 보고한다**. 즉 `daemonBin` 이 가리키는 곳에 아무것도 없으면 `installed: true` 로 끝나더라도 그 경고를 낸다. 머신 B 는 동작하고, 머신 A 의 오타는 정확히 지적된다.

### 3. 명시 경로에는 신원 검사를 하지 않는다

체크아웃 후보는 `package.json` 의 `name` 이 `@c-d-cc/reap-daemon` 인지 확인한다(`client.ts:167`). 그 검사가 존재하는 이유는 **`daemon` 이 실제 npm 패키지 이름이라 우연히 남의 것을 띄울 수 있기 때문**이다. 사용자가 파일을 직접 지목한 경우 그 우연은 성립하지 않으며, 반대로 소스 체크아웃(`daemon/src/index.ts`, bun 실행)을 지목하는 정당한 사용을 막게 된다. → 존재 여부만 본다. 이유를 코드 주석에 남긴다.

버전 읽기(`resolveDaemonAvailability:216`)는 `dirname(bin)/../package.json` 이므로 `.../dist/index.js` 와 `.../src/index.ts` 양쪽에서 그대로 성립한다. 읽히지 않으면 `version: null` + `outdated: false` 로 이미 graceful.

### 4. 안내 문구는 세 곳이지만 소유자는 한 곳이어야 한다

`DaemonAvailability` 는 `installCommand` 와 `required` 를 **값에 실어 나른다** — `core` 가 `cli` 를 import 하지 않고도 문장을 만들 수 있게 한 gen-076 패턴이고, 타입 주석에 그 의도가 명시돼 있다(`types/index.ts:196-199`). 새 문구(`daemonBin` 안내)도 **같은 방식으로 실어야** 세 소비처가 각자 문자열을 갖지 않는다. → `DaemonAvailability` 확장.

### 5. 게이트 — pnpm 없이 같은 상태를 이미 만들 수 있다

`scripts/check-self-diagnosis.sh` 의 § 5 흐름:

- **5b** — reap 전역 설치 + `daemon: true`, daemon 은 아직 어디에도 설치 안 됨 → "없다고 보고하는가"
- **5c** — daemon 을 **별도 디렉토리**(`$DM_INSTALL/node_modules/@c-d-cc/reap-daemon/`)에 단독 설치
- **5d** — 그 번들을 node 로 직접 실행, 심볼 추출 확인
- **5e** — 비로소 daemon 을 reap 과 **같은 prefix 에 전역 설치**하고 seam 검증 (bun / bun 은닉 두 조합)

**5d 와 5e 사이의 상태가 정확히 우리가 원하는 것이다**: daemon 이 디스크에 존재하고 정상 동작하지만 reap 의 조회 경로에는 없다. pnpm/PnP 와 **동일한 메커니즘**(`require.resolve` 실패 + 체크아웃 후보 부재)이며, pnpm 설치 비용이 0 이다.

→ pnpm 은 게이트에 넣지 않는다. 대신 **로컬 validation 에서 실제 pnpm 프로젝트로 1회 실증**한다(pnpm 10.28.1 로컬 확인됨). 게이트 신설 절은 5d 와 5e 사이(`5d-bis`) — `5a-bis` 라는 기존 명명 관례를 따르고 기존 절 번호를 건드리지 않는다.

### 6. 두 런타임 비대칭 — 반복하지 않는다

`detectRuntime()`(`client.ts:228`)은 bun 을 선호한다. 인라인된 네이티브 바인딩이 bun 에서만 동작해 **세 세대 동안 결함이 숨은** 원인이 이것이었고, gen-083 이 5e 에 `bun` / `bun 은닉`(PATH 앞에 exit 127 스텁) 두 조합을 넣어 닫았다. 신설 경로도 **같은 두 조합**으로 검증해야 한다. 그렇지 않으면 같은 비대칭을 한 층 위에서 재생산한다.

## Previous Generation Reference

gen-083 완료 artifact + fitness 에서 본 세대에 직접 적용되는 것:

1. **검사를 먼저 만들고 결함마다 개별로 실패시켜라.** 5a-bis 의 첫 구현이 `pipefail` 때문에 무력했고 **negative test 만이** 그것을 잡았다.
2. **부재를 주장하는 assertion 은 먼저 자신이 실행됐음을 증명해야 한다.** 5e 는 `fix --check` 가 비 JSON 을 뱉었을 때 조용히 통과했다 — `catch {}` 가 "불평 없음"과 "실행 안 됨"을 같게 만들었다. 그래서 지금 5e 는 `status` + 숫자 `warningCount` 를 먼저 요구한다.
3. **근거 종류를 구분해 기록하라** — `[실행]` / `[negative]` / `[독해]`. gen-083 의 결정적 실패는 미검증 항목을 충족으로 적은 것이었다.
4. **evaluator 지적은 전부 초록인 상태에서 나온다.** 두 라운드 네 건 모두 그랬다.

fitness 유저 결정 3건 중 본 세대와 직결: **"strict resolver 우회를 0.17.5 에 포함한다 — 그 상태로 릴리즈하지 않는다."**

## Backlog Review

pending 10건. 본 세대와의 관계:

| 항목 | 관계 |
|---|---|
| `semverGte 가 prerelease 를 구분하지 못한다` | **인접하나 별개**. `resolveDaemonAvailability` 가 쓰지만 본 세대는 판정 로직을 건드리지 않는다 → 유지 |
| `MIN_DAEMON_VERSION 발행 검사 게이트` | 인접. 게이트 § 5 를 건드리므로 충돌 가능성만 확인 → 유지 |
| `daemon typecheck 상시 red` | daemon 패키지 내부. 본 세대는 daemon 소스를 건드리지 않음 → 유지 |
| `daemon SCIP 설계` | 0.17.5 릴리즈와 순서 무관(코드 미배출) → 유지 |
| 나머지 5건 (plugin 전환 / interview / milestone / idea / plan / `/reap.plan`) | 0.18 배정 → 유지 |

소비할 추가 backlog 없음.

## Technical Deep-Dive

### 변경 대상 파일과 이유

| 파일 | 무엇을 |
|---|---|
| `src/cli/commands/daemon/client.ts` | `resolveDaemonBin` 명시 후보 1순위, 후보 리더 + seam, `DaemonAvailability` 신규 필드 채우기, 안내 문구 상수 |
| `src/types/index.ts` | `ReapConfig.daemonBin?: string`, `DaemonAvailability` 확장 |
| `src/core/integrity.ts` | `checkDaemonAvailability` — 미설치 문구에 위치 지정 안내 추가 + 빗나간 명시 경로 경고 |
| `src/core/prompt.ts` | agent prompt 미설치 절에 같은 안내 |
| `src/cli/commands/daemon/index.ts` | `daemon status` 미설치 문구 |
| `scripts/check-self-diagnosis.sh` | § 5d-bis 신설 |
| `tests/unit/daemon-availability.test.ts` | 우선순위·fall-through·빗나감 케이스 |
| `src/templates/reap-guide.md` + `.reap/reap-guide.md` | § Code Intelligence 에 "설치했는데도 못 찾을 때" 절 |
| `README.md`, `README.ko.md` | 같은 안내 |
| `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` | **5개 로케일 전부** (누락 시 `check-docs-version.sh` 가 잡는다) |

### CONFIG_DEFAULTS 에 넣지 않는다

environment 의 명시 규칙: optional tracking 필드를 `CONFIG_DEFAULTS` 에 넣으면 spurious config diff 를 유발한다(`lastMigratedVersion` 선례). `daemonBin` 도 optional 이므로 동일하게 제외한다.

### `~/.reap/reap-guide.md` 동기화

dog-fooding 규칙상 `src/templates/reap-guide.md` 와 프로젝트 사본이 함께 가야 한다. 사용자 홈의 `~/.reap/reap-guide.md` 는 `install-skills` 가 배포하므로 소스만 고치면 된다.

## Context for This Generation

### Clarity: HIGH

goal 이 구체적이고 backlog 이 파일 목록까지 지목한다. 다만 위 § Key Findings 1·2 는 backlog 이 답하지 않은 설계 결정이므로 planning 에서 명시적으로 확정한다.

### 가정

1. **`process.cwd()` = 프로젝트 루트**. 코드베이스 전체가 이 가정 위에 있으므로 새로 도입하는 가정이 아니다.
2. **`daemonBin` 은 파일 경로**(디렉토리가 아님). 런타임에 그대로 `spawn(runtime, [bin])` 으로 넘어간다.
3. **명시 경로는 신원 검사 없이 신뢰한다** (§ 3).
4. **@c-d-cc/reap-daemon 은 여전히 미발행(404)** — 모든 검증은 gen-083 과 마찬가지로 `npm pack` 산출물 기준.

### 제약

- **`git push` / `npm publish` 금지.** commit phase 의 로컬 커밋만 허용.
- genome immutable — 발견 사항은 backlog, 적용은 adapt.
- 소스 변경 후 반드시 `npm run build` (stale binary 상습 함정).
- `tests/` 는 private submodule — 포인터 이동 시 `git add tests`.
- 테스트 baseline: **unit 493 / e2e 278 / scenario 44 / daemon 130**, 전부 0 fail. 이탈은 조사 대상이지 수용 대상이 아니다.
  - 착수 전 `npm run test:unit` 실측: **493 pass / 0 fail** `[실행]`. 인수인계 메모의 "492" 는 1건 어긋났고, shortterm memory 의 493 이 맞다. 이후 판정은 실측값 493 을 기준으로 한다.
