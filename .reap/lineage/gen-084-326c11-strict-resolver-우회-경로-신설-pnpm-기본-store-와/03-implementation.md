# Implementation Log

> gen-084 — daemon 위치 명시 지정 경로. 계획은 `02-planning.md`, 인간 승인 완료.

## Completed Tasks

| Task | 상태 | 요약 |
|---|---|---|
| T001 types | 완료 | `DaemonBinSource` / `ExplicitDaemonBin` 신설, `DaemonAvailability` +3필드, `ReapConfig.daemonBin?` |
| T001b `VALID_CONFIG_FIELDS` | 완료 | **발견 과제** — 아래 § Discovered Issues D1 |
| T002 client.ts | 완료 | `readExplicitDaemonBins` / `locateDaemon` / `resolveDaemonBin` 래퍼 / `DAEMON_LOCATE_HINT` |
| T003 integrity.ts | 완료 | 빗나감 경고(판정 독립) + 미설치 문구에 조건부 hint |
| T004 prompt.ts | 완료 | 미설치 절 분기 — 빗나감이면 그 경로를 지목, 아니면 hint |
| T005 daemon/index.ts | 완료 | `requireUsableDaemon` 문구 + `status` context 에 `bin`/`binSource`/`explicitMiss` `[autonomous]` |
| T006 unit tests | 완료 | 우선순위 5단계 + `readExplicitDaemonBins` + 3 fixture 보강. **버그 1건을 테스트가 잡았다** (아래) |
| T006b `daemonBin` 보존 e2e | 완료 | D1 회귀 방지. stale dist 에서 FAIL 하는 것을 먼저 확인 |
| T007 전체 스위트 | 완료 | unit **521** / e2e **279** / scenario 44 / daemon 130, 전부 0 fail |
| T008 게이트 5d-bis | 완료 | 5 sub-check (a~e), 기존 절 번호 무변경 |
| T009 negative test | 완료 | N1~N6 여섯 건 전부 FAIL 확인 후 복원 |
| T010 실패 레이아웃 재측정 | 완료 | 두 파손 레이아웃이 구제됨 + pnpm 전역 무회귀 확인 |
| T011~T013 문서 | 완료 | reap-guide 2, README 2, 로케일 5, DaemonPage.tsx |
| T014 문서 게이트 + 정주행 | 완료 | `check-docs-version.sh` / `vite build` / 자기진단 전체 통과 |

### T001 — 타입

- `DaemonBinSource = "env" | "config" | "package" | "checkout"`. 앞 둘은 **사용자가 지목한 것**, 뒤 둘은 **REAP 이 스스로 찾은 것**이라는 구분이 의미를 가진다 — 틀렸다고 불평할 수 있는 것은 앞 둘뿐이다.
- `ExplicitDaemonBin` 에 `label` 을 함께 실었다. `core` 가 문장을 만들되 변수명·config 키를 철자하지 않게 하기 위함이다 (`installCommand` 와 같은 gen-076 근거). `source` 는 기계 판별용, `label` 은 문장용으로 역할이 다르다.
- `ReapConfig.daemonBin?: string` — **`CONFIG_DEFAULTS` 에는 넣지 않았다**. optional 필드를 default 로 주입하면 기존 프로젝트 전부에 허위 config diff 가 생긴다 (`lastMigratedVersion` 선례).

### T002 — 조회 로직

- `locateDaemon(deps): { bin, source, explicitMiss }` 를 신설하고 `resolveDaemonBin` 은 `.bin` 만 돌려주는 얇은 래퍼로 남겼다. **기존 시그니처를 좁히지 않았으므로 `ensureDaemon` 을 포함한 모든 호출부가 무변경**이다 — 그리고 그것이 핵심이다. 기동 경로(`ensureDaemon` → `daemonRequest` → `lifecycle.ts` → `run/*.ts`)에 config 를 흘렸다면 시그니처 5단을 고쳐야 했고, 한 곳만 놓치면 "찾기는 하는데 띄우지는 못한다"가 됐다.
- 우선순위: **env > config > package > checkout > null**.
- `readExplicitDaemonBins(env, cwd)` — 둘 다 매개변수. `process` 를 직접 읽지 않는다.
- `~` 전개 + 상대경로를 프로젝트 루트 기준으로 해석. 공백만 있는 값은 미설정 취급 — 셸 프로필의 `REAP_DAEMON_BIN=` 은 "안 쓴다"는 뜻이지 "빈 문자열에서 찾아라"가 아니다.
- 명시 경로에는 **존재 검사만** 하고 신원(package name) 검사를 하지 않는다. 그 검사는 `daemon` 이 실제 npm 이름이라 *우연히* 남의 것을 띄우는 걸 막으려는 것인데, 사람이 적어둔 경로에 우연은 없고 소스 체크아웃 지목이라는 정당한 사용만 막힌다.
- 빗나가도 **탐색을 멈추지 않는다**. `config.yml` 은 커밋되므로 머신 A 의 경로가 머신 B 에 없을 수 있고, 거기서 멈추면 정상 설치된 B 를 죽인다. 대신 `explicitMiss` 로 보고한다. **첫 번째 빗나감만** 보관한다 — REAP 이 따르려던 지시가 그것이고, 하위 우선순위에 대한 두 번째 줄이 그것을 묻는다.

### T003~T005 — 안내 문구 3소비처

세 곳 모두 **빗나감이 있으면 그 경로를 지목하고, 없을 때만 위치 지정 방법을 안내**한다. 반대로 하면 "당신이 적은 경로가 비었다" 고 말한 직후에 "경로를 적으세요" 라고 말하게 된다.

명령어는 **항상 문장 끝**에 온다. 뒤에 무언가 붙으면 그것이 명령의 일부로 읽힌다.

`DAEMON_LOCATE_HINT` 는 **매니저 이름이 아니라 조건**으로 쓰여 있다. 근거는 planning 의 실측(§ Additional Findings) — pnpm 과 Yarn PnP 는 정상 동작하므로 그것을 파손 사례로 적으면 거짓 서술이 된다. 그 판단 근거를 상수 주석에 남겼다.

### T006 — 테스트가 잡은 실제 버그

`locateDaemon` 이 **상위 우선순위 경로가 빗나가고 하위가 적중하면 빗나감 보고를 버리고 있었다**. 적중 분기가 `explicitMiss: null` 을 반환했기 때문이다. 주석에는 "첫 빗나감을 보관한다"고 써 있었는데 코드가 그렇게 하지 않았다 — 주석과 코드가 어긋난 전형이다.

증상: `REAP_DAEMON_BIN` 이 낡은 경로를 가리키는데 config 가 올바르면, **env 설정이 썩어가는 것을 아무도 말해주지 않는다**. D2 의 원칙("빗나감은 최종 판정과 무관하게 보고")을 절반만 지킨 상태였다.

`an empty environment variable falls through to config` 테스트가 이것을 잡았다. 테스트를 고치지 않고 코드를 고쳤다.

### T008/T009 — 게이트 § 5d-bis 와 그 유효성

5d 와 5e **사이**에 넣었다. 그 지점의 환경이 정확히 목표 상태이기 때문이다 — 5c 가 daemon 을 별도 디렉토리에 설치했고, 5d 가 그 사본이 동작함을 증명했으며, 5b 가 reap 이 그것을 "미설치"라 부름을 증명했다. **5e 보다 먼저 돌아야 한다**: 5e 가 daemon 을 reap 이 찾을 수 있는 곳에 설치하고 나면 이 질문 자체가 성립하지 않는다. 나갈 때 config 를 원복하므로 5e 는 이전과 동일한 상태에서 시작한다.

sub-check: (a) 명시 경로가 쓰이고 불평이 멎는다 / (b) 실제로 **기동**되고 `binSource: config` 를 보고한다 / (c) **bun 을 숨긴 채(node)** 같은 것 / (d) `REAP_DAEMON_BIN` 단독 / (e) 빈 경로가 **이름으로** 보고된다.

**negative test 6건 — 전부 소스나 스크립트를 실제로 깨뜨려 FAIL 을 확인한 뒤 복원했다**:

| # | 무엇을 깨뜨렸나 | 결과 |
|---|---|---|
| N1 | `locateDaemon` 이 `explicit` 를 무시 (기능 자체 제거) | **FAIL (a)** — "told where it is" |
| N2 | `daemon status` 에서 `binSource` 제거 | **FAIL (b)** — 기동은 됐으나 출처 미보고 |
| N3 | env 채널만 무력화 (config 는 유지) | **FAIL (d)** — a/b/c 는 통과, d 만 실패 |
| N4 | integrity 의 `explicitMiss` 억제 | **FAIL (e)** — 빈 경로가 보고되지 않음 |
| N5 | `detectRuntime` 을 bun 고정 (node 폴백 제거) | **FAIL (c)** — b 는 통과, c 만 실패 |
| N6 | (a) 의 입력을 비 JSON 으로 교체 | **FAIL BAD_JSON** — 침묵이 성공으로 읽히지 않음 |

N3 과 N5 가 특히 중요하다: **각 sub-check 가 서로 독립적으로 살아있음**을 보였다. 하나가 다른 것을 가려주고 있었다면 이 둘은 전부 통과했을 것이다. N6 은 gen-083 의 결정적 결함(부재 주장이 조용히 green)이 여기서 재발하지 않음을 보인다.

**계획의 T009 절차 하나는 실행 불가였다.** "구현 전 dist 로 게이트를 먼저 돌린다"고 적었으나 게이트는 **스스로 `npm run build` 를 한다**(`check-self-diagnosis.sh:82`). `npm pack` 에 `prepack` 이 없다는 관찰은 맞았지만 무관했다. 위 6건이 그 자리를 대신하며, 소스를 실제로 깨뜨리므로 더 강한 근거다.

우연히도 그 잘못된 계획이 하나를 잡았다 — `daemonBin` 보존 e2e 를 stale dist 에서 먼저 돌렸고 FAIL 했다. 그것이 D1 의 negative test 다.

## Discovered Issues

### D1 — `reap update` 가 `daemonBin` 을 조용히 지웠을 것이다 (본 세대에서 수정)

`src/cli/commands/update.ts` 의 `backfillConfig` 는 `VALID_CONFIG_FIELDS` 에 없는 키를 **삭제**한다. 새 필드를 그 집합에 넣지 않았다면, 사용자가 `daemonBin` 을 설정한 뒤 `reap update` 를 한 번만 돌려도 **daemon 을 쓸 수 있게 해주던 유일한 설정이 사라지고**, 출력은 "deprecated 필드를 제거했다"고만 말했을 것이다.

- 계획에 없던 항목이다. `evaluator` / `daemon` / `lastMigratedVersion` 이 모두 그 집합에 있는 것을 보고 발견했다.
- **본 세대에서 고친 이유**: 인과로 묶여 있다. 이것 없이는 본 세대의 산출물이 `reap update` 한 번에 무효화되므로 분리하면 우회 자체가 의미를 잃는다 (genome § "인과로 묶인 검증 동작 fix 는 본 generation 에서 처리").
- 수정: `VALID_CONFIG_FIELDS` 에 `"daemonBin"` 추가 + 근거 주석. 검증은 T006 의 unit.

### D2 — 계획의 검증 방법 하나가 틀렸다 (정정)

`02-planning.md` T001 은 "`npm run typecheck` 가 기존 fixture 3곳의 누락을 잡는다" 고 적었다. **틀렸다** — `tsconfig.json` 의 `include` 는 `src/**/*.ts` 뿐이고 `tests/` 는 대상이 아니다. 게다가 bun 은 실행 시 타입을 벗기므로 fixture 에 필수 필드가 빠져도 런타임 오류가 나지 않고 `undefined` 가 될 뿐이다.

→ **fixture 는 손으로 채우고, 새 필드를 실제로 읽는 assertion 을 함께 넣어야** 검증된다. T006 에서 그렇게 한다. (교훈: "검사가 잡아줄 것"이라는 계획상의 가정도 검사 대상이다.)

### T010 — 파손 레이아웃 재측정 (구현 후)

planning 에서 측정한 5개 레이아웃 중 **실제로 깨지던 두 개**를 새 빌드로 다시 쟀다 `[실행]`.

| 레이아웃 | 우회 없음 | `daemonBin` 지정 후 |
|---|---|---|
| reap=prefixA / daemon=prefixB | 미설치 경고 (+ 위치 지정 안내) | **경고 0**, `daemon status` = ok, `binSource: config`, running/installed 0.2.0/0.2.0 |
| reap 전역 + daemon 프로젝트 로컬 | 미설치 경고 | **ok**, `binSource: config`. 경로는 `./node_modules/...` **상대 경로**로 적었고 절대 경로로 해석됨 |

무회귀 확인 `[실행]`: pnpm 전역에 둘 다 설치한 프로젝트에서 **우회를 설정하지 않은 채** `fix --check` 경고 0, `daemon status` ok, `binSource: package`. 명시 경로가 없을 때의 동작은 그대로다.

### T011~T014 — 문서

reap-guide(템플릿 + 프로젝트 사본, HEAD 에서도 동일했으므로 동일하게 유지) / README 2종(본문 + config 예시 주석) / 로케일 **5개 전부** + `DaemonPage.tsx` 렌더링 4줄.

문구는 전부 **조건 기반**이다 — "reap 과 daemon 이 서로 다른 resolution root 에 있으면". 매니저 이름을 파손 사례로 적지 않았다. 그 판단의 근거는 planning 의 실측이며, unit 테스트 `the hint names a condition, not a package manager` 가 `DAEMON_LOCATE_HINT` 에 "pnpm"/"PnP" 가 들어가지 않는 것을 **강제**한다. 다음 사람이 무심코 되돌리면 red 가 된다.

`check-docs-version.sh` 통과(로케일 5종 22항목 동일), `vite build` 성공, 자기진단 게이트 전체 통과.

## Deferred Items

- **Windows 경로 검증** — backlog 표가 "전 경로 미검증"으로 적은 항목. 본 세대는 `~` 전개와 `isAbsolute`/`resolve` 로 플랫폼 중립적으로 처리했으나 **Windows 에서 실행해 확인하지는 않았다**. 확인할 수단이 없다(개발·CI 모두 non-Windows). 완료 artifact 의 hints 에 남긴다.
- **`daemonBin` 이 디렉토리를 가리키는 경우** — 파일만 지원한다. 디렉토리 지원은 "있으면 좋겠다" 수준이고 잘못 지목했을 때의 오진단을 늘린다. 하지 않는다.

## Architecture Decisions

### 왜 config 를 인자로 흘리지 않고 조회 지점이 스스로 읽는가

이 저장소의 지배적 패턴은 DI(gen-076)다. 그런데 여기서는 **주입 경로가 다섯 단계이고 그중 넷이 daemon 과 무관한 lifecycle 코드**다. 그 넷의 시그니처를 daemon 설정 때문에 바꾸면, 다음에 daemon 관련 값이 하나 더 생길 때 같은 일을 반복해야 한다.

대신 **조회 지점이 하나**라는 성질을 이용했다 — `locateDaemon` 하나만 읽으면 조회와 기동이 모두 같은 답을 얻는다. 테스트 격리는 DI 로 확보했다(`deps.explicit`). 즉 **값의 출처는 함수가 소유하되, 테스트는 그것을 대체할 수 있다**.

`resolvePort()` 가 `REAP_DAEMON_PORT` 를 call-time 에 직접 읽는 것이 같은 파일의 선례다.

### `resolveDaemonBin` 시그니처를 유지한 것

`locateDaemon` 을 새로 만들고 기존 함수를 래퍼로 둔 것은 gen-077 교훈("반환값 union 을 넓혔더니 기존 분기가 오분류")의 반대 방향 적용이다. **기존 소비처가 필요로 하는 것이 정확히 `bin` 하나뿐**이므로, 반환 타입을 넓혀 모든 호출부가 새 모양을 알게 하는 대신 넓은 함수를 새로 만들고 좁은 것을 남겼다. 호출부 변경 0.
