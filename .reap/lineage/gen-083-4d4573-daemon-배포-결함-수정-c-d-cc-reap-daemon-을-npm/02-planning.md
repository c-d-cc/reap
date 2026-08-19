# Planning

## Goal

npm 으로 설치한 사용자가 `daemon: true` 를 켰을 때 **실제로 동작하는 daemon 을 얻거나, 동작하지 않는 이유를 알게 한다.** 그리고 그 상태를 **배포 산출물 기준으로 검사**해 다시 조용히 깨지지 않게 한다.

## Additional Findings

learning 에서 실측으로 확인된 것 중 계획을 바꾼 것 (상세는 `01-learning.md` § Key Findings):

1. **폴백 경로는 dev 에서도 안 맞는다.** dog-fooding 이 되는 이유는 `file:./daemon` 이 만든 npm 심링크다. 따라서 S2 로 dependency 를 제거하면 **우리 자신도 daemon 을 잃는다** — 폴백 경로 수정이 S2 의 필수 동반 작업.
2. **dist 번들은 `queries/` 를 못 찾는다** (`daemon/dist/../../queries` = `<repo>/queries`). 실측 `nodesCreated: 0`.
3. **dist 번들은 node 에서 better-sqlite3 네이티브 바인딩을 못 찾는다.** 번들이 `bindings` 를 인라인해 패키지 루트 기준으로 찾는다. bun 사용자에게만 우연히 동작했다.
4. 허위 커버리지 주장의 carrier 는 **3곳** (backlog 은 2곳으로 파악).

2·3 을 고치지 않고 S1 을 수행하면 *"끊긴 심링크"* 가 *"설치되지만 아무것도 못 하는 패키지"* 로 바뀔 뿐이다. genome § *"인과로 묶인 검증 동작 fix 는 본 generation 에서 처리"* 에 따라 본 세대 범위로 포함한다 — 이것 없이는 S4 의 검증이 통과할 수 없고, 통과시키려면 검증을 무력화해야 한다.

## Approach

backlog 이 확정한 **C안(npm 독립 발행)** 을 따른다. 대안 A(번들) / B(optionalDependencies) 재검토는 하지 않는다 — 근거가 backlog 에 기록되어 있고 실측과 일치한다.

C안 위에서 이번 세대가 정하는 설계는 셋이다.

### (a) 미설치를 사용자에게 알리는 채널 — 억제 장치를 만들지 않는다

backlog 은 *"1회 안내 + 반복 억제 설계 필요"* 라고 적었다. **억제 상태를 만들지 않는 채널을 고르면 억제가 필요 없다.** 상태 파일은 그 자체로 관리 대상이 되고, 언제 초기화할지에 대한 결정을 또 낳는다.

| 채널 | 언제 보이나 | 왜 이 채널인가 |
|---|---|---|
| `reap daemon status` | 사용자가 직접 물을 때 | 진단의 정본 자리. 지금은 미설치도 "not running" 으로 뭉개진다 |
| `reap fix --check` warning | 사용자가 진단할 때 | 설정과 환경의 불일치는 정확히 이 명령이 답할 질문 |
| agent prompt (`prompt.ts`) | 세대마다 1회 | **agent 가 헛수고하는 것을 막는 유일한 지점.** 지금은 없는 daemon 에 curl 하라고 지시한다 |
| lifecycle emit `context.daemonInstalled` | learning 진입 시 1회 | 이미 `daemonEnabled` / `daemonReady` 를 노출하는 자리. 기계 판독 가능 |

**silent-fail 정책은 그대로 유지한다.** 위 넷 중 어느 것도 lifecycle 을 막지 않고, `triggerIndexing` / `ensureRegistered` 는 여전히 `false` 를 조용히 반환한다. 바뀌는 것은 *"물어보면 답한다"* 와 *"agent 에게 헛수고를 시키지 않는다"* 두 가지뿐이다.

### (b) 검증은 배포 산출물에서, 그리고 node 로 한다

지금까지 daemon 이 검증된 유일한 방식은 `bun src/index.ts` 직접 spawn(gen-069 e2e 21개)이다. 이 경로는 번들도 tarball 도 node 도 지나지 않으므로 위 2·3 을 전부 통과시킨다.

새 검사는 **반대편 끝**을 본다: tarball → 설치 → **node** 로 실행 → 실제 소스 파일 인덱싱 → **심볼이 나왔는가**. `check-self-diagnosis.sh` 에 넣어 CI 와 release 양쪽에서 상시 돈다 (설치 실측 ~2초).

**순서 규칙(genome)**: assertion 을 먼저 넣고 **현재 코드에서 fail 하는 것을 확인한 뒤** 고친다.

### (c) reap 쪽 미설치 판정은 주입으로 검사 가능하게

`resolveDaemonBin` 을 `string | null` 로 바꾸고 resolve/exists 를 주입 가능한 seam 으로 둔다. `core/integrity.ts` 는 `adapters` 를 import 하지 않는 gen-076 패턴 그대로 — **`daemonInstalled` 를 boolean 으로 주입받고, 미주입 시 검사를 건너뛴다**.

## Requirements

### FR (기능 요구)

1. `@c-d-cc/reap-daemon` 이 npm 에 발행 가능한 상태가 된다 (`files`, `publishConfig`, `engines`, 라이선스/저장소 메타).
2. daemon 번들이 **node 런타임에서** 동작한다 — 네이티브 의존을 external 로 두어 정상 node_modules 해석을 탄다.
3. daemon 이 **dist 실행 시에도 `queries/` 를 찾는다** (dist/dev 분기).
4. reap 의 `dependencies` 에서 `@c-d-cc/reap-daemon` 이 제거되고 `yaml` 만 남는다.
5. `resolveDaemonBin` 이 3상태를 구분한다 — 설치됨 / 소스 트리(dev) / **미설치(null)**. dev 폴백 경로가 실제로 존재하는 경로를 가리킨다.
6. `daemon: true` + 미설치 시 `reap daemon status` 가 "not running" 이 아니라 **미설치와 설치 명령**을 말한다.
7. `daemon: true` + 미설치 시 `reap fix --check` 가 warning 을 낸다.
8. `daemon: true` + 미설치 시 agent prompt 가 daemon 질의를 지시하지 않고 **설치 안내로 대체**된다.
9. `daemon: false`(또는 미설정) 시 **모든 출력이 기존과 byte-identical** — 회귀 0.
10. 자기진단 게이트가 배포 산출물에서 daemon 이 실제로 심볼을 추출하는지 검사하고, 헤더의 커버리지 주장이 **참이 된다**.

### 완료 기준 (검증 가능)

1. `npm pack` 한 reap tarball 에 `daemon/` 항목 0개 **이고** `dependencies` 에 `@c-d-cc/reap-daemon` 이 없다.
2. `npm pack` 한 daemon tarball 을 설치해 **node** 로 띄우고 실제 소스를 인덱싱하면 **`nodesCreated > 0`** 이며 심볼 질의가 결과를 반환한다.
3. `daemon: true` + 미설치 프로젝트에서 `reap fix --check` 가 daemon warning 을 정확히 1건 낸다. `daemon` 미설정 프로젝트에서는 0건. **버전 미달은 미설치와 다른 메시지**로 1건.
4. `check-self-diagnosis.sh` 의 새 daemon assertion 이 **수정 전 코드에서 fail** 하는 것을 기록으로 남긴다.
5. 허위 커버리지 주장 3곳이 모두 정정되고 `reap:carrier` 표식으로 묶인다.
6. 기존 daemon e2e 21개 포함 전체 스위트가 baseline (unit 473 / e2e 278 / scenario 44) 이상, 0 fail.
7. 소스 트리 dog-fooding 이 유지된다 — `npm ci` 로 심링크가 사라진 상태에서도 `reap daemon status` 가 동작.

## Decisions — 유저 확정 (2026-08-19)

backlog 이 열어둔 5건 + 본 세대에서 발견한 1건. **전부 유저가 결정했다.**

| # | 결정 | 확정 | 근거 |
|---|---|---|---|
| D1 | daemon 버전 정책 | **독립 (연동 안 함) + 최소버전 검사 추가** | 권고안(독립)에서 유저가 확장. 따로 설치하면 버전이 임의로 어긋나고, HTTP API 가 바뀌는 날 "설치는 됐는데 응답이 안 맞는" **새 silent-fail** 이 생긴다 — 지금 고치는 결함과 같은 종류다 |
| D2 | 자동 설치 vs 안내 | **안내만** | 동의 없는 네트워크 + 네이티브 모듈 설치. 폐쇄망에서 더 나쁘다 |
| D3 | `reap daemon install` 서브커맨드 | **만들지 않음** | 전역 prefix / 패키지 매니저를 추정해야 하고 틀리면 사용자 환경을 건드린다. 복사 가능한 명령 한 줄이 더 안전 |
| D4 | tarball 검증 배치 | **CI 상시** (`check-self-diagnosis.sh` 안), **러너 실측 없이 진행** | 게이트가 이미 하는 tarball 설치를 재사용하므로 증분 비용이 작다. release 전용이면 개발 중 회귀를 태그 시점까지 모른다 |
| D5 | daemon repo 분리 | **monorepo 유지, 발행만 분리** | 두 코드가 같은 세대에서 함께 바뀐다 (본 세대가 그 예) |
| D6 | 첫 발행 시점 | **0.17.5 보다 먼저 발행. 본 세대는 경로만 준비, publish 실행 금지** | 0.17.5 가 설치 명령을 안내하는데 패키지가 없으면 결함을 다른 결함으로 바꾸는 것 |

### D4 의 미측정 리스크와 후퇴 조건 — 명시

유저 결정에 따라 **러너에서의 실제 소요를 측정하지 않고** 진행한다. 측정된 것은 로컬(macOS, warm cache) ~2초뿐이다.

- **리스크**: 리눅스 러너에서 `better-sqlite3` prebuilt 를 받지 못하면 소스 컴파일로 떨어져 수십 초~수 분이 될 수 있다. 본 계획은 이 경우를 측정하지 않았다.
- **후퇴 조건**: CI 시간이 문제가 되면 D4 를 release 전용으로 되돌린다.
- **구조적 보장**: 그래서 daemon 절을 `check-self-diagnosis.sh` 안에서 **독립적으로 유지**한다 — 앞 절들과 상태를 공유하지 않고, 환경변수 하나로 건너뛸 수 있게 둔다. 후퇴가 재작성이 아니라 호출부 한 줄 변경이어야 한다.
- 이 한계는 완료 artifact 에 그대로 기록한다 (genome § "검사가 못 잡는 것을 결과와 함께 기록한다").

### D1 설계 — 최소버전을 무엇으로 판정하는가

두 후보가 있고, **서로 다른 질문에 답한다.**

| 후보 | 답하는 질문 | 채택 |
|---|---|---|
| (A) 설치된 패키지의 `package.json` version | "설치된 것이 충분히 새로운가" | **판정 근거로 채택** |
| (B) daemon `/health` 응답의 자기 버전 | "**지금 응답하고 있는 프로세스**가 무엇인가" | 진단 표시용으로 채택 (판정에는 쓰지 않음) |

(A) 를 판정 근거로 삼는 이유:
- **`reap fix --check` 는 프로세스를 띄우면 안 된다.** 진단 명령이 daemon 을 spawn 하는 것은 부작용이다. (A) 는 동기적으로, 데몬 없이 답한다
- **너무 낡은 daemon 은 `/health` 를 제대로 답하지 못할 수 있다.** 판정을 응답에 의존시키면 가장 낡은 경우에 판정이 불가능해진다
- (B) 는 다른 질문에 답한다 — daemon 은 30분 idle 까지 살아 있으므로 **업그레이드 후에도 낡은 프로세스가 계속 응답**할 수 있다. 이건 "설치가 낡았다"와 다른 상태다

(B) 는 버리지 않고 **`reap daemon status` 가 이미 `/health` 를 호출하는 자리에서 표시**한다. 두 숫자(설치본 / 실행본)가 나란히 보이면 낡은 프로세스가 떠 있는 상황을 사용자가 스스로 판별할 수 있다. 별도 분기 로직은 만들지 않는다 — 표시까지가 이번 범위다.

**값의 소유자**: `MIN_DAEMON_VERSION` 상수 **하나**가 소유하고(`src/cli/commands/daemon/client.ts`), 소비자(`daemon/index.ts`, `fix.ts`, 테스트)는 전부 import 한다. genome § *"표식보다 공유가 낫다"* — 값을 공유할 수 있으므로 carrier 표식은 만들지 않는다.

**문서에는 숫자를 적지 않는다.** reap-guide / docs 에 "0.2.0 이상"이라고 쓰면 그 순간 두 번째 소유자가 생기고 어긋날 수 있다. 대신 *"요구 버전에 미달하면 reap 이 필요한 버전을 알려준다"* 로 쓴다.

**상태는 뭉개지 않는다.** `daemon status` / `fix --check` 는 **미설치**와 **설치됨-버전 미달**을 서로 다른 메시지로 보고한다. 뭉개면 지금 고치는 문제("미설치도 not running 으로 뭉개진다")를 형태만 바꿔 재현하는 것이다.

### D1 에 따른 daemon 버전 결정 — 0.1.0 → 0.2.0 [가정]

첫 발행분을 **0.2.0** 으로 올린다. 두 가지 이유:

1. `0.1.0` 은 이미 gen-060/068/069 의 기록에서 in-repo 이름으로 쓰였고, 지금 발행하려는 산출물은 그것과 **실질적으로 다르다**(external 의존, queries 경로 수정, `/health` 버전 필드).
2. `MIN_DAEMON_VERSION = "0.1.0"` 이면 **어떤 발행본도 통과**해 검사가 처음부터 공허하다. `"0.2.0"` 이면 "queries 경로가 고쳐지고 버전을 보고하는 판"을 요구하는 실질적 의미를 갖는다.

**[가정]** 유저 지시의 "버전 bump 금지"는 reap 패키지(0.17.4 → 0.17.5)를 가리킨 것으로 읽었다. daemon 은 발행 경로가 분리된 별도 패키지이고 D1 이 최소버전 검사를 요구하므로 준비 작업에 포함한다. **되돌리기는 한 줄이다** — fitness 에서 유저가 원하면 0.1.0 으로 환원한다.

## Implementation Plan

### Phase 1 — 검사부터 (먼저 실패시킨다)

- [ ] T001 `scripts/check-self-diagnosis.sh` 에 daemon 절 초안 추가 — reap tarball 에 daemon 부재 + daemon tarball 설치 → **node** 실행 → fixture 인덱싱 → `nodesCreated > 0` assert. **현재 코드에서 fail 하는 것을 확인하고 출력을 artifact 에 기록.** (검증: 스크립트 실행, fail 확인)

### Phase 2 — daemon 을 실제로 동작하게

- [ ] T002 `daemon/scripts/build.sh` — `--external better-sqlite3 --external web-tree-sitter --external tree-sitter-wasms`. (검증: T001 의 node 실행 단계가 bindings 에러를 넘어감)
- [ ] T003 `daemon/src/indexer/languages.ts` — `QUERIES_DIR` dist/dev 분기 (`migrationTemplatesDir` 패턴). (검증: T001 의 `nodesCreated > 0`)
- [ ] T004 `daemon/package.json` — `files: ["dist","queries"]`, `publishConfig.access: public`, `engines`, `license`, `repository`, `homepage`. (검증: `npm pack --dry-run` 목록에 dist+queries 만)
- [ ] T005 `daemon/src/api/health.ts` — `/health` 응답에 `version` 추가 (package.json 정적 import → 번들 인라인, 런타임 경로 해석 없음). `daemon/src/types.ts` `HealthData` 확장. (검증: daemon/tests + 자기진단)
- [ ] T006 daemon 자체 테스트 회귀 확인 (`daemon/tests`, 25 파일 130 tests). (검증: `cd daemon && bun test`)

### Phase 3 — reap 쪽 분리와 미설치 UX

- [ ] T007 root `package.json` — `dependencies` 에서 `@c-d-cc/reap-daemon` 제거. (검증: `npm pack --dry-run --json` + reap tarball 의 dependencies)
- [ ] T008 `src/cli/commands/daemon/client.ts` — `resolveDaemonBin(): string | null` 3단계 + dev 폴백 경로 **수정** + 주입 seam. (검증: unit)
- [ ] T009 `client.ts` — `MIN_DAEMON_VERSION` 상수 + `resolveDaemonAvailability()` → `{ installed, bin, version, required, outdated }`. `semverGte`(check-version.ts) 재사용. `DaemonAvailability` 타입은 `src/types/index.ts` 에 두어 core/cli 양쪽이 import (layering 유지). (검증: unit — ok/outdated/missing/version-unknown 4분기)
- [ ] T010 `client.ts` — `ensureDaemon` 미설치 분기 (`DaemonNotInstalledError`). `daemonRequest` 는 기존과 동일하게 throw. (검증: unit + e2e)
- [ ] T011 `src/cli/commands/daemon/index.ts` — `status` / `index` / `query` 가 **미설치 / 버전 미달 / 미실행** 셋을 서로 다른 메시지로 보고. `status` 는 `/health` 의 실행본 버전도 함께 표시. (검증: e2e)
- [ ] T012 `src/cli/commands/daemon/lifecycle.ts` — 미설치 시에도 `false` 조용히 반환(정책 유지) + `isDaemonInstalled()` export. (검증: unit)
- [ ] T013 `src/cli/commands/run/learning.ts` — emit context 에 `daemonInstalled` 추가 (`daemonEnabled` 일 때만). (검증: e2e)
- [ ] T014 `src/core/prompt.ts` — `daemon: true` + 미설치 시 Code Intelligence 절을 설치 안내로 대체. 설치됨/미opt-in 은 무변경. (검증: unit, byte-identical 회귀 포함)
- [ ] T015 `src/core/integrity.ts` + `src/cli/commands/fix.ts` — `DaemonAvailability` 주입형 warning — **미설치와 버전 미달을 별개 메시지로**. 미주입 시 검사 skip (gen-076 패턴). **`fixProject` 에는 대응 코드를 넣지 않는다** (auto-delete 방지 원칙). (검증: unit)

### Phase 4 — 발행 경로와 문서, 그리고 정정

- [ ] T016 `.github/workflows/release.yml` — `daemon-v*` 태그 전용 publish job 추가. **실제 publish 는 유저가 태그를 밀 때만 발생.** (검증: 워크플로 문법 + 트리거 조건 검토)
- [ ] T017 S5 정정 3곳 — `check-self-diagnosis.sh` 헤더 / `.reap/environment/summary.md` / `release.yml` 주석. `reap:carrier(self-diagnosis-covered-incidents)` 표식 부착. 나머지 두 사례(#22 / gen-080)도 **실제로 참인지 확인**. (검증: `bash scripts/list-carriers.sh`, 두 사례 재확인 기록)
- [ ] T018 `src/templates/reap-guide.md` + `.reap/reap-guide.md` § Code Intelligence — **설치 요구사항 명시**. 현재는 "opt-in 하면 동작한다"고만 되어 있어 사실과 다르다. (검증: 두 파일 일치 확인)
- [ ] T019 `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` `daemonPage` — 설치 절 추가. **5개 전부**. (검증: `cd docs && npx vite build` + `scripts/check-docs-version.sh`)

### Phase 5 — 검증

- [ ] T020 신규/수정 테스트 작성 (tests submodule) — `resolveDaemonBin` 3분기 / integrity daemon warning 3케이스 / prompt 3케이스 / daemon status e2e.
- [ ] T021 전체 스위트 회귀 (unit/e2e/scenario) + baseline 갱신. 소스 트리 dog-fooding 확인(`npm ci` 후 심링크 없는 상태에서 `reap daemon status`).
- [ ] T022 `check-self-diagnosis.sh` 전체 통과 확인 + 각 assertion 을 **개별로 깨뜨려 fail 을 확인**(negative test).

## Test Strategy

| 변경 | 테스트 레벨 | 이유 |
|---|---|---|
| `resolveDaemonBin` 3분기 | unit (주입) | 순수 판정 로직. 실제 파일시스템 상태에 의존시키면 dev 트리에서 미설치를 재현할 수 없다 |
| 최소버전 판정 4분기 | unit (주입) | (c) 의 seam 재사용. **negative test 필수** — 버전을 낮춰 warning 이 실제로 뜨는지 확인 |
| integrity daemon warning | unit | 순수 함수. 미설치 / 버전 미달이 **서로 다른 메시지**인지 assert |
| `prompt.ts` 분기 | unit | 문자열 생성. 미opt-in 시 byte-identical 회귀 assert 포함 |
| `daemon status` 미설치 메시지 | e2e | CLI → JSON 출력 |
| learning emit `daemonInstalled` | e2e | 기존 `daemonEnabled`/`daemonReady` 테스트와 같은 자리 |
| **tarball → node → 인덱싱** | **자기진단 스크립트** | bun test 로는 npm 설치를 재현할 수 없다. 이것이 본 세대의 핵심 검증이며 CI 상시 |
| daemon 자체 (queries/external) | daemon/tests + 자기진단 | 소스 트리 테스트는 두 결함을 통과시키므로 자기진단이 실질 검증 |

**영향받는 기존 테스트**: gen-069 daemon e2e 21개는 `bun src/index.ts` spawn 방식이라 T002/T003 의 영향을 받지 않는다(경로 분기의 dev 쪽). 회귀 확인만 한다.

## Risks

| 위험 | 대응 |
|---|---|
| dependency 제거로 dog-fooding 이 끊김 | T007 의 dev 폴백 경로 수정이 선행. T019 에서 `npm ci` 후 실제 확인 |
| daemon 미발행 상태로 0.17.5 가 나가면 안내가 거짓이 됨 | D6 — 발행 경로를 준비하고 유저에게 선발행을 요청. 승인 전에는 publish 하지 않음 |
| `--external` 로 바꾸면 daemon 실행에 `node_modules` 가 필요 | 정상적인 npm 패키지 동작. 소스 트리에도 `daemon/node_modules` 가 이미 있다 |
| 자기진단 게이트가 무거워져 CI 가 느려짐 | 설치 실측 ~2초. 임계치를 넘으면 D4 를 release 전용으로 되돌릴 수 있게 스크립트 내 절을 독립적으로 유지 |
| 5개 로케일 중 일부만 갱신 | `scripts/check-docs-version.sh` 가 로케일 간 집합 동일성을 검사 |

## Out of Scope

- SCIP 도입 검토 — gen-084 (별도 backlog)
- 버전 bump / npm publish 실행 — 유저가 `reapdev.versionBump` 로 수행
- MCP wrapper — 2026-06-28 결정으로 계속 보류
- daemon 의 자동 staleness 감지, `.js` strip 등 기존 잔여 항목 — 본 세대 범위 밖 (완료 artifact 의 hints 로 남긴다)
