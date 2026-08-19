# Learning

> gen-085 — daemon 버전 판정의 신뢰성. floor 를 올리는 순간 발동하는 결함 3건을 한 세대에서 닫는다.

## Project Overview

REAP 0.17.5 는 **커밋됐고 태그만 남았다**. 릴리즈 문서(RELEASE_NOTES / NOTICE / 5 로케일 / `src/templates/migration/v0.17.5.md`)는 이미 작성·커밋됐고, 유저 결정으로 **이 세대의 작업도 0.17.5 안에 들어간다**. 따라서 버전 bump 는 하지 않으며, 릴리즈 문서 보강은 세대 종료 후 main agent 가 한다.

gen-083 이 daemon 을 `@c-d-cc/reap-daemon` 이라는 독립 npm 패키지로 분리했고, gen-084 가 `daemonBin` / `REAP_DAEMON_BIN` 명시 경로를 신설했다. 그 두 세대가 만든 표면에 **버전 판정**이라는 새 축이 생겼다 — `MIN_DAEMON_VERSION` 이라는 하한, 그 하한을 넘는지 재는 비교 함수, 그리고 못 넘었을 때 사용자에게 하는 말. 이 세 가지가 각각 결함을 하나씩 갖고 있으며 **셋 다 "하한을 올리는 순간" 발동한다**. 그것이 본 세대의 범위다.

## Source Backlog

`semvergte-가-prerelease-를-구분하지-못한다-mindaemonversion-판정에-영향.md` (consumed by gen-085-cfbe58)

핵심 주장: `semverGte` (`src/cli/commands/check-version.ts:12`) 가 `.split(".").map(Number)` 로 비교하므로 `"0.2.0-beta.1"` 이 `[0, 2, NaN, 1]` 이 되고, `NaN` 비교가 전부 false 라 **`"0.2.0"` 과 동등하게 취급되어 통과**한다. gen-083 이 이 helper 에 `MIN_DAEMON_VERSION` 판정이라는 새 소비자를 붙였으므로 prerelease daemon 이 정식판과 구분되지 않는다.

제시된 해법은 (A) helper 를 prerelease 인지하게 고친다 / (B) 소비자별 정책. (A) 를 택하되 **먼저 실패시킬 것**을 요구한다.

**실측으로 확인함 (독해 + 계산)**: `"0.17.5-alpha.1"` → `[0, 17, NaN, 1]`, `"0.17.5"` → `[0, 17, 5]`. i=2 에서 `NaN > 5` 도 `NaN < 5` 도 false 라 루프를 빠져나가 `return true`. 즉 **prerelease 가 정식판 이상으로 판정된다.** semver 규격은 정반대다.

## Key Findings

### F1. `semverGte` 가 두 벌 존재한다 — backlog 이 지목하지 않은 사실

| 위치 | 구현 | prerelease 결과 |
|---|---|---|
| `src/cli/commands/check-version.ts:12` | `.split(".").map(Number)` | `"0.2.0-beta.1" >= "0.2.0"` → **true** (오답) |
| `src/core/migration.ts:49,62` | `parseInt(s, 10) \|\| 0` | `"0.2.0-beta.1" >= "0.2.0"` → **false** (정답이지만 우연) |

`migration.ts` 쪽이 맞는 답을 내는 건 `parseInt("0-beta")` 가 `0` 을 돌려주기 때문이지 prerelease 를 이해해서가 아니다.

**[실행] 두 구현을 나란히 돌려 확인했다** (`bun -e` 로 양쪽을 import 해 같은 입력을 먹임):

| a | b | check-version | migration | semver 정답 |
|---|---|---|---|---|
| `0.2.0-beta.1` | `0.2.0` | true | false | **false** |
| `0.17.5-alpha.1` | `0.17.5` | true | false | **false** |
| `1.0.0-beta` | `1.0.0-alpha` | true | false | **true** |
| `0.2.1-beta.1` | `0.2.0` | true | true | **true** |
| `1.0.0+dev` | `1.0.0` | true | false | **true** (build metadata 무시) |

**어느 쪽도 맞지 않는다.** check-version 은 prerelease 를 전부 통과시키고, migration 은 prerelease 끼리의 순서와 build metadata 를 틀린다. 5개 입력 중 두 구현이 **일치하는 것은 1개뿐**이다.

genome § Code Quality Principles 의 **No duplication** 에 정면으로 걸린다. backlog 은 `check-version.ts` 만 지목했으나 그것만 고치면 **두 구현의 답이 서로 달라진 채로 남는다**.

### F2. 소비자는 셋이고 원하는 의미가 갈린다

- `check-version.ts:133` (`performAutoUpdate` 의 breaking-change guard), `:192` (`checkAutoUpdateGuard`) — 설치된 reap 버전 vs `autoUpdateMinVersion`. **이 저장소는 실제로 alpha 를 발행한다** (`scripts/alpha-publish.sh` 가 `X.Y.Z-alpha.<timestamp>` 를 만든다). prerelease 인지가 곧바로 유효하다.
- `daemon/client.ts:415` (`resolveDaemonAvailability`) — 설치된 daemon 버전 vs `MIN_DAEMON_VERSION`. prerelease 인지를 원한다.
- `migration.ts:137,138,147` (`detectPendingMigrations`) — **여기만 다르다.** note 버전(항상 `X.Y.Z`)을 `lastMigratedVersion` / 패키지 버전과 비교한다. 패키지 버전이 alpha 일 수 있는데, `0.17.5-alpha.1` 을 돌리는 사람은 **0.17.5 의 코드를 돌리고 있으므로 v0.17.5 note 를 받아야 한다**. 여기에 semver 정순서를 그대로 적용하면 `semverGt("0.17.5", "0.17.5-alpha.1")` 이 true 가 되어 `continue` 로 **note 가 숨는다**. 지금은 숨지 않는다.

→ 처방: 구현은 하나로 통합하되, migration 은 **core(X.Y.Z)만 비교한다**는 정책을 명시적으로 선택한다. 두 벌 구현이 아니라 한 구현 + 명시된 두 정책.

### F3. `MIN_DAEMON_VERSION` 은 아무도 검증하지 않는다

`src/cli/commands/daemon/client.ts:62` 에 `"0.2.0"` 이 있고, 이 값이 npm 에 실제로 존재하는지 확인하는 것은 **어디에도 없다**. `release.yml` 의 주석(L80)은 "floor 는 manifest 가 아니라 `MIN_DAEMON_VERSION` 에 산다"고만 말한다. 하한을 올리면서 그 버전을 발행하지 않으면 reap 이 전 사용자에게 **존재하지 않는 버전으로 올리라고 지시**한다.

선례가 둘 있다:
- 값을 스크립트가 소스에서 읽어야 한다 — 복사하면 두 번째 소유자가 생긴다. TS↔bash 는 공유가 불가능하므로 **carrier 표식**이 정확히 이 경우다 (genome § "공유 불가 (산문·번역·prompt 문자열)").
- 네트워크 실패 시 조용한 통과는 검사를 무력화한다. `check-self-diagnosis.sh` 의 opencode 부재 시 **amber SKIP + 명시 출력**이 기존 선례다.

### F4. (3)번 backlog 의 "도달 불가능" 전제는 **틀렸다** — 이 세대의 핵심 판단

`낡은-daemon-안내가-명시-경로를-무시한다` 는 "`MIN_DAEMON_VERSION` 이 0.2.0 이고 0.2.0 이 daemon 의 최초 발행본이므로 '설치됨 + 낡음' 상태가 존재할 수 없다"고 적었다. gen-084 는 그 전제 위에서 **의도적으로 고치지 않았다** — 검증할 수 없는 코드를 배포하지 않으려고. 그 판단 자체는 옳다.

**그러나 전제가 성립하지 않는다. 근거 셋:**

1. **[실행] `daemon/package.json` 은 오늘까지 `0.1.0` 이었다.** `git log -- daemon/package.json` 이 커밋 2개를 보여준다 — `2db4870` (2026-03-29) 이 `0.1.0`, `8fc07d6` (오늘, gen-083) 이 `0.2.0`. 즉 **gen-083 이전 커밋의 체크아웃·워크트리는 전부 0.1.0** 이고, `locateDaemon` 의 `checkout` 경로나 `daemonBin` 으로 그것을 가리키면 지금 당장 `outdated` 가 참이 된다.
2. **본 세대의 (1)번 수정이 도달 가능성을 새로 만든다.** `semverGte` 를 semver 정확하게 고치는 순간 `0.2.0-beta.x` 가 `0.2.0` 미만이 되어 `outdated` 로 판정된다. 지금은 통과한다. **즉 (1) 을 고치면서 (3) 을 안 고치면 도달 가능해진 분기를 미검증인 채로 배포하게 된다.**
3. **[독해] 단위 테스트는 이미 이 분기를 실행하고 있다.** `resolveDaemonAvailability` 는 `deps.readVersion` 을 주입받고 `tests/unit/daemon-availability.test.ts:114,336` 이 그것을 쓴다. "어떤 테스트도 그것을 실행할 수 없다"는 서술은 사실이 아니다.

**그리고 end-to-end 검증 수단도 있다.** gen-084 가 **의도적으로 수용한 한계** — 명시 경로는 존재만 보고 신원은 보지 않는다(`locateDaemon` 주석: "Nothing is accidental about a path someone wrote down") — 덕분에, `package.json` 에 `"version": "0.1.0"` 만 적힌 가짜 디렉토리를 만들어 `daemonBin` 으로 가리키면 **하한을 올리지 않고도** 자기진단 게이트에서 "설치됨 + 낡음" 상태를 실제로 만들 수 있다. 수용된 한계가 검증 수단이 됐다.

→ **판단: (3) 은 지금 착수 가능하며, 착수해야 한다.** 근거와 반대 위험은 planning 에서 확정한다.

### F5. 안내 문구가 사는 곳은 셋, 패턴은 이미 있다

`outdated` 분기 3곳 — `src/core/integrity.ts:749`, `src/core/prompt.ts:259`, `src/cli/commands/daemon/index.ts:43` — 이 전부 무조건 `Upgrade with: npm i -g @c-d-cc/reap-daemon` 이라고 말한다. `daemonBin`/`REAP_DAEMON_BIN` 에서 온 daemon 이면 전역 업그레이드는 아무 효과가 없고 사용자는 같은 경고를 무한히 받는다.

**따라 쓸 패턴이 바로 옆에 있다**: 같은 세 파일의 `!installed` 분기가 `explicitMiss` 유무로 문구를 가른다 — 빗나감이면 그 경로를 지목, 아니면 일반 안내. `DaemonAvailability.source` 는 gen-084 가 이미 값에 실어 놨다(`"env" | "config" | "package" | "checkout" | null`). 분기 하나면 된다.

### F6. 자기진단 게이트에 붙일 자리

`scripts/check-self-diagnosis.sh` § 5d-bis 가 (a)~(f) 여섯 개의 명시-경로 시나리오를 이미 갖고 있고, `dm_fix_verdict` / `dm_require_verdict` (침묵을 성공으로 읽지 않게 하는 장치, gen-084) 가 그 안에 있다. 낡은 daemon 시나리오는 **여기에 (g) 로 붙는다** — 새 구조를 만들 필요가 없다. 게이트 확장이지 재구성이 아니다.

## Previous Generation Reference

gen-084 (완료, 유저 평가 "좋음"). 이월되는 것:

- **전제를 실측으로 재라.** gen-084 의 최대 성과는 backlog 의 "원리적으로 불가능" 주장을 설치해서 반증한 것이었다. 본 세대는 같은 절차를 (3)번 backlog 의 "도달 불가능" 주장에 적용했고 **또 반증됐다** (F4).
- **`[실행]` / `[negative]` / `[독해]` 증거 표기** — genome § evolution.md 에 규칙으로 들어갔다. `[실행]` 은 그것을 돌린 명령을 함께 적어야 한다.
- **검사를 먼저 실패시켜라.** 결함 하나당 negative test 하나.
- **결함은 인스턴스가 아니라 부류다.** gen-083 이 `pipefail` 1곳만 고치고 4곳을 남겨 오늘 릴리즈가 막혔다.
- **한 머신의 green 은 표본 1이다.**
- evaluator 는 gen-083·084 연속으로 **모든 검사가 초록인 상태에서** blocking 결함을 냈다. `partial` verdict 를 가볍게 넘기지 말 것.

## Backlog Review

pending 14건. 본 세대가 다루는 것:

| backlog | 상태 |
|---|---|
| `semvergte-가-prerelease-를-구분하지-못한다-…` | **consumed** (source) |
| `mindaemonversion-을-올릴-때-…-검사하는-게이트` | **본 세대에서 처리** — 세 항목이 "floor 인상 시 발동"으로 묶여 있음 |
| `낡은-daemon-안내가-명시-경로를-무시한다-…` | **본 세대에서 처리** — F4 로 전제 반증, 도달 가능 |

세 backlog 이 서로를 명시적으로 지목한다("셋이 전부 floor 를 올릴 때 발동하므로 한 세대에서 함께 닫는 것이 자연스럽다"). midterm memory 의 세대 배분도 gen-085 를 "floor 3건"으로 지정했다.

나머지 11건은 범위 밖 — daemon typecheck / `noUnusedLocals` / e2e daemon 빌드는 gen-086, `reap run push` / validation 재실행은 gen-087, 0.18 지식축 6건은 별도 브랜치.

## Technical Deep-Dive

### semver prerelease 규격 (SemVer 2.0.0 §9~11) 중 실제로 필요한 부분

1. `X.Y.Z` 코어를 숫자로 비교. 다르면 거기서 결정.
2. 코어가 같으면: **prerelease 가 있는 쪽이 낮다.** (`1.0.0-alpha < 1.0.0`)
3. 둘 다 prerelease 면 `.` 으로 나눈 식별자를 왼쪽부터 비교 — 숫자끼리는 수치 비교, 문자 포함은 ASCII 사전순, 숫자 < 비숫자, 식별자가 더 많은 쪽이 크다.
4. build metadata (`+dev`) 는 **비교에서 무시한다.**

(4) 는 실사용에 걸린다 — `performAutoUpdate` 가 `installed.includes("+dev")` 를 별도로 걸러내지만 `checkAutoUpdateGuard` 도 같은 가드를 갖고 있으므로 현재 동작은 유지된다. 그래도 비교 함수 자체는 `+` 이후를 잘라내야 한다.

### 회귀 위험 — 소비자별

| 소비자 | 현재 동작 | 수정 후 | 판단 |
|---|---|---|---|
| `performAutoUpdate` guard | alpha 사용자는 floor 통과 → 자동 업데이트 진행 | alpha 사용자는 floor 미달 → `blocked` + 수동 업그레이드 안내 | **의도된 변경**. alpha 는 정식판 이전이며 breaking-change migration 을 못 받았다 |
| `checkAutoUpdateGuard` | alpha 사용자에게 경고 없음 | alpha 사용자에게 경고 | 위와 동일 |
| `resolveDaemonAvailability` | prerelease daemon 이 정식판과 동급 | prerelease daemon 은 `outdated` | **본 세대의 목적** |
| `detectPendingMigrations` | alpha 패키지에서 note 가 보임 | 정책 미선택 시 **note 가 숨음** | **회귀. core 비교로 막는다** |

마지막 줄이 backlog 이 예상하지 못한 항목이며, 통합 없이 `check-version.ts` 만 고쳤다면 드러나지 않았을 것이다.

### `MIN_DAEMON_VERSION` 발행 검사의 형태

- 값 읽기: `src/cli/commands/daemon/client.ts` 에서 grep. **carrier 표식 필요** — bash 는 TS 상수를 import 할 수 없다.
- 조회: `npm view @c-d-cc/reap-daemon versions --json`.
- 판정: 하한이 발행 목록에 **있으면** pass.
- 네트워크 실패: **amber SKIP + 명시 출력** (조용한 통과 금지).
- 배치: `release.yml` 의 reap `publish` job, `npm publish` 앞. 이미 `check-docs-version.sh` → opencode 설치 → `check-self-diagnosis.sh` → build → publish 순서가 있다.
- **먼저 실패시킬 것**: 하한을 미발행 버전으로 임시 변경 → red 확인 → 복원.

## Context for This Generation

**Clarity: HIGH.** 세 backlog 이 파일 경로와 해법 방향까지 지목했고, 유일하게 열려 있던 판단((3) 착수 여부)은 F4 의 실측으로 닫혔다.

전제·제약:

- `MIN_DAEMON_VERSION` 을 **올리지 않는다**. 미발행 버전을 하한으로 삼는 것이 (2)번 backlog 가 막으려는 바로 그 결함이다. 0.2.0 은 오늘 실제로 발행됐고 동작이 확인됐다.
- 버전 bump 없음. 본 작업은 0.17.5 안에 들어간다.
- `git push` / `npm publish` / 태그 없음. completion commit(로컬)은 정상 절차.
- 테스트 baseline: **unit 523 / e2e 279 / scenario 44 / daemon 130**, 전부 0 fail. 벗어나면 회귀.
- 빌드 후 검증은 `node dist/cli/index.js` 로 한다. 전역 `reap` 은 발행된 0.17.4 이고 이 빌드가 아니다.
- `tests/` 는 private submodule. 움직였으면 그 안에서 먼저 커밋하고 `git add tests` 로 pointer 를 stage. **push 는 하지 않고 보고한다.**
- genome 은 세대 중 immutable. 발견 사항은 backlog 또는 완료 artifact 에.
