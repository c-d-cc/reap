# Planning

> gen-085 — daemon 버전 판정. 비교 함수 / 하한의 실재성 / 못 넘었을 때의 안내, 셋을 함께 닫는다.

## Goal + Spec

**Goal**: daemon 버전 판정을 신뢰할 수 있게 만든다.

세 결함이 하나의 인과 사슬을 이룬다:

```
[하한을 올린다]
   ├─ 재는 자가 틀렸다        → semverGte 가 prerelease 를 통과시킨다        (1)
   ├─ 하한이 허구일 수 있다   → 미발행 버전을 하한으로 삼아도 아무도 모른다  (2)
   └─ 못 넘었을 때 오안내     → 명시 경로 사용자에게 전역 업그레이드를 시킨다 (3)
```

`MIN_DAEMON_VERSION` 은 **0.2.0 그대로 둔다.** 미발행 버전을 하한으로 삼는 것이 (2) 가 막으려는 바로 그 결함이다.

### (3) 착수 판단 — 이 세대에서 명시적으로 내린 결정

gen-084 는 (3) 을 **의도적으로 미뤘다**: "도달 불가능한 분기라 어떤 테스트도 실행할 수 없고, 검증되지 않은 코드를 배포하게 된다." 그 추론은 목록에 항목이 있다는 이유로 만료되지 않는다. 그래서 전제를 다시 쟀다.

**전제가 성립하지 않는다 — 착수한다.** 근거 넷 (상세는 01-learning.md § F4):

1. **[실행] `daemon/package.json` 은 오늘 아침까지 `0.1.0` 이었다.** `git log -- daemon/package.json` → 커밋 2개(`2db4870` 0.1.0, `8fc07d6` 0.2.0). gen-083 이전 체크아웃·워크트리를 `daemonBin` 으로 가리키면 **오늘 당장** `outdated` 다.
2. **(1) 을 고치는 순간 도달 가능성이 새로 생긴다.** prerelease 를 semver 정확히 판정하면 `0.2.0-beta.x` 가 하한 미달이 된다. **(1) 만 하고 (3) 을 안 하면 도달 가능해진 분기를 미검증인 채 배포**하게 된다 — gen-084 가 피하려던 바로 그 상태를 우리가 만든다.
3. **[독해] 단위 테스트는 이미 이 분기를 실행한다.** `resolveDaemonAvailability` 는 `deps.readVersion` 주입을 받고 `tests/unit/daemon-availability.test.ts` 가 그것을 쓴다.
4. **end-to-end 검증 수단이 있다.** gen-084 가 수용한 한계(명시 경로는 존재만 보고 신원은 안 봄) 덕에 `{"version":"0.1.0"}` 짜리 가짜 패키지를 만들어 `daemonBin` 으로 가리키면 **하한을 올리지 않고** 자기진단 게이트에서 실제 상태를 만들 수 있다.

**이 판단이 틀렸다면 무엇이 깨지나** (완료 artifact 에도 기록):
- 최악의 경우는 "쓸모없는 코드를 넣었다"이다 — 분기가 실제로는 아무도 밟지 않는 것. 손해는 문구 분기 하나와 테스트 몇 개.
- 반대 방향의 위험이 더 크다: 착수하지 않으면 (1) 수정으로 **도달 가능해진** 분기가 미검증 상태로 배포된다.
- 검증이 가짜일 위험: 게이트가 조작된 `package.json` 을 쓰므로 "진짜 낡은 발행본"과 다르다. 다른 점은 **버전 문자열의 출처뿐**이고, `resolveDaemonAvailability` 는 그 파일만 읽는다. 실제 낡은 발행본이 생기는 날 이 시나리오를 실물로 바꾸면 된다.

### 범위 밖 (명시)

- `MIN_DAEMON_VERSION` 인상 — 하지 않는다.
- 버전 bump / 릴리즈 문서 — 세대 밖, main agent 소관.
- `migration.ts` 의 `semverGte` 외 죽은 코드 정리 — gen-086 (`noUnusedLocals` backlog).
- 게이트를 CI(매 push)에도 넣기 — 네트워크 의존 검사를 매 push 에 넣으면 flake 로 amber SKIP 가 상시 출력돼 **검사가 필터링된다**(genome § "게이트를 무디게 하는 것을 같이 넣지 마라"). release 에만 둔다.

## Requirements

### Functional

- **FR1** — semver 비교 구현은 저장소에 **하나만** 존재한다. 현재 둘(`check-version.ts`, `migration.ts`)이며 5개 입력 중 4개에서 서로 다른 답을 낸다.
- **FR2** — 그 구현은 SemVer 2.0.0 을 따른다: 코어 숫자 비교 → prerelease 있는 쪽이 낮음 → prerelease 식별자 좌→우 비교(숫자는 수치, 숫자 < 비숫자, 많은 쪽이 큼) → build metadata 무시.
- **FR3** — `detectPendingMigrations` 는 **release line(코어)** 으로 비교한다. `0.17.5-alpha.1` 을 돌리는 사람은 0.17.5 의 코드를 돌리므로 v0.17.5 note 를 받아야 한다. 정책은 코드에 명시하고 이름으로 드러낸다.
- **FR4** — `resolveDaemonAvailability` 와 autoUpdate guard 는 semver 정순서를 쓴다. prerelease daemon 은 `outdated`.
- **FR5** — 릴리즈 게이트가 `MIN_DAEMON_VERSION` 이 npm 에 **발행된 버전 목록에 있는지** 검사한다. 값은 소스에서 읽고, 스크립트에 복사하지 않는다.
- **FR6** — 그 검사는 네트워크 실패 시 **amber SKIP + 명시 출력**으로 통과한다. 조용한 통과 금지.
- **FR7** — 낡은 daemon 이 `REAP_DAEMON_BIN` / `daemonBin` 에서 왔으면 안내가 **그 경로와 채널을 지목**한다. `package`/`checkout` 이면 기존 문구 그대로.
- **FR8** — FR7 은 안내가 나가는 3소비처(`fix --check`, agent prompt, `reap daemon`) 전부에 적용된다.
- **FR9** — 자기진단 게이트가 "설치됨 + 낡음 + 명시 경로" 상태를 **실제로 만들어** 실행한다.

### Completion Criteria

각 항목은 명령으로 검증 가능해야 하며, 증거는 `[실행]` / `[negative]` / `[독해]` 로 표기한다.

1. **[실행 + negative]** semver 비교가 SemVer 2.0.0 과 일치한다. 수정 **전**에 현 오판을 고정하는 테스트가 red 임을 확인했다. 구현은 `src/core/semver.ts` 한 곳이고 `grep -rn "split(\".\")" src/` 가 다른 비교 구현을 찾지 못한다.
2. **[실행]** `detectPendingMigrations` 가 패키지 버전 `X.Y.Z-alpha.N` 에서 `vX.Y.Z` note 를 **계속** 노출한다 (통합에 의한 회귀 없음).
3. **[실행 + negative]** `bash scripts/check-daemon-floor.sh` 가 현 하한에서 green 이고, 하한을 미발행 버전으로 바꾸면 **red** 다. 값은 소스에서 읽는다.
4. **[실행 + negative]** 자기진단 게이트 5d-bis (g) 가 조작된 0.1.0 daemon 을 `daemonBin` 으로 물려 `fix --check` 와 `reap daemon status` 양쪽에서 **경로를 지목하는 안내**를 받는다. 분기를 되돌리면 FAIL 한다.
5. **[실행]** unit / e2e / scenario / daemon 네 스위트 전부 0 fail. baseline(523 / 279 / 44 / 130) 이상.
6. **[실행]** `MIN_DAEMON_VERSION` 은 `0.2.0`, `package.json` 은 `0.17.5` 로 **변하지 않았다** (`git diff` 로 확인).
7. **[실행]** `node dist/cli/index.js fix --check` 가 본 저장소에서 경고·에러를 늘리지 않는다.

## Additional Findings

### AF1 — 세 소비처는 `core` 에 있고 `cli` 를 import 하지 않는다

`src/core/integrity.ts` 와 `src/core/prompt.ts` 는 `DaemonAvailability` 를 **주입받는다**. 따라서 "source → 채널 이름" 매핑을 그쪽에서 계산할 수 없다. gen-076 이 세운 패턴 그대로 **값에 실어 보낸다**: `installCommand` / `locateHint` / `explicitMiss.label` 이 이미 그렇게 이동하고 있다.

→ `DaemonAvailability.explicitLabel: string | null` 을 신설한다. `explicitMiss.label` 과 같은 문자열을 만들되 **소유자는 하나**여야 하므로, 라벨 생성을 `explicitBinLabel(source)` 로 뽑고 `readExplicitDaemonBins` 도 그것을 쓰게 한다. 지금은 `readExplicitDaemonBins` 안에 문자열 리터럴이 인라인으로 있어, 그냥 두면 라벨이 두 곳에 생긴다.

### AF2 — `npm view pkg versions --json` 은 버전이 하나면 배열이 아니다

발행본이 1개면 `"0.2.0"` 이라는 **문자열**을 돌려준다. daemon 이 정확히 그 상태다. `Array.isArray` 로 감싸지 않으면 검사가 곧바로 틀린다. `jq -e '. | index("0.2.0")'` 류는 여기서 깨진다 → node 로 파싱한다.

### AF3 — `grep -q` 파이프를 쓰지 않는다

gen-083/084 가 같은 함정에 두 번 걸렸다(`tar | grep -q` 가 `pipefail` 아래에서 매치를 실패로 뒤집음). 신설 스크립트는 **출력을 변수로 먼저 받고** 파싱하며, 파이프 끝에 `grep -q` 를 두지 않는다.

### AF4 — `migration.ts` 의 `semverGte` 는 src 안에서 아무도 쓰지 않는다

`grep -n "semverGt\|semverGte" src/core/migration.ts` → 내부 사용은 `semverGt` 3곳뿐. `semverGte` 는 export 만 되어 있고 소비자는 테스트 1곳. 중복 제거 대상 그 자체이므로 **삭제**한다 (gen-086 의 죽은 코드 backlog 와 겹치지 않는다 — 이건 본 세대가 만든 중복의 잔해다).

## Implementation Plan

### Phase A — 재는 자를 고친다 (FR1~FR4)

- [ ] **T001** 수정 **전에** 현 오판을 고정하는 테스트를 붙이고 **red 를 확인**한다. `tests/unit/semver.test.ts` 신설: prerelease 5케이스(01-learning.md § F1 표). `[negative]` 증거. — *검증: `bun test tests/unit/semver.test.ts` 가 fail*
- [ ] **T002** `src/core/semver.ts` 신설. `semverCompare(a,b): -1|0|1`, `semverGt`, `semverGte`, `semverCore(v)`. SemVer 2.0.0 §9~11. build metadata 절단. — *검증: T001 이 green 으로 전환*
- [ ] **T003** `src/cli/commands/check-version.ts` — 자체 `semverGte` 삭제, `src/core/semver.js` 에서 import. 소비자 2곳(L133 `performAutoUpdate` guard, L192 `checkAutoUpdateGuard`) 로직 무변경. — *검증: unit*
- [ ] **T004** `src/cli/commands/daemon/client.ts` — import 를 `check-version.js` → `core/semver.js` 로 바꾼다. CLI command 가 다른 CLI command 의 helper 를 빌려 쓰던 것을 core 소유로 정리. — *검증: typecheck + unit*
- [ ] **T005** `src/core/migration.ts` — 자체 `semverGt`/`semverGte` 삭제. `releaseLineGt(a,b)` 로 대체하고 내부에서 `semverGt(semverCore(a), semverCore(b))` 를 호출. 이름과 doc 으로 **release line 비교라는 정책**을 드러낸다. — *검증: T006*
- [ ] **T006** 회귀 가드: `detectPendingMigrations` 가 패키지 버전 `0.17.5-alpha.1` 에서 `v0.17.5` note 를 노출하는지 unit 으로 고정. **수정 전에도 통과해야 하는 테스트**(현 동작 보존이 목적). `tests/unit/migration-detection.test.ts` 갱신 — 삭제된 `semverGte` import 도 함께 정리. — *검증: unit*
- [ ] **T007** autoUpdate 소비자의 **의도된 동작 변경**을 테스트로 고정: alpha 설치본이 `autoUpdateMinVersion` 미달로 판정된다. `tests/unit/check-version.test.ts` 갱신(semverGte describe 블록은 `semver.test.ts` 로 이관). — *검증: unit*

### Phase B — 하한이 실재하는지 검사한다 (FR5, FR6)

- [ ] **T008** `scripts/check-daemon-floor.sh` 신설. 소스에서 `MIN_DAEMON_VERSION` 읽기(양쪽에 `reap:carrier(min-daemon-version)` 표식) → `npm view @c-d-cc/reap-daemon versions --json` → node 파싱(AF2) → 발행 목록 포함 여부. 네트워크 실패는 **amber SKIP + 명시 출력**(FR6). 파이프 끝 `grep -q` 없음(AF3). — *검증: 직접 실행*
- [ ] **T009** `src/cli/commands/daemon/client.ts` 의 `MIN_DAEMON_VERSION` 위에 carrier 표식. `bash scripts/list-carriers.sh` 가 2파일로 잡는지 확인(고아 아님). — *검증: `list-carriers.sh`*
- [ ] **T010** `.github/workflows/release.yml` — reap `publish` job, `npm publish` **앞**에 게이트 배치. 왜 CI 가 아니라 여기인지 주석. — *검증: 독해 + yaml 파싱*
- [ ] **T011** **[negative]** 하한을 미발행 버전(`9.9.9`)으로 임시 변경 → 게이트 red 확인 → 복원. — *검증: 직접 실행 2회*

### Phase C — 못 넘었을 때 무엇을 말하는가 (FR7, FR8)

- [ ] **T012** `explicitBinLabel(source)` 신설 + `readExplicitDaemonBins` 가 그것을 쓰게 변경(AF1). `DaemonAvailability.explicitLabel` 을 `src/types/index.ts` 에 추가하고 `resolveDaemonAvailability` 가 채운다. — *검증: unit*
- [ ] **T013** `src/core/integrity.ts:749` `outdated` 분기 — 명시 출처면 경로+채널 지목, 아니면 기존 문구. — *검증: `tests/unit/integrity-daemon.test.ts`*
- [ ] **T014** `src/core/prompt.ts:259` 같은 분기. — *검증: `tests/unit/prompt-daemon.test.ts`*
- [ ] **T015** `src/cli/commands/daemon/index.ts:43` `requireUsableDaemon` 같은 분기. — *검증: 자기진단 게이트 (g)*
- [ ] **T016** 3소비처의 unit 테스트를 `source` 별로 갈라 추가(env / config / package / checkout 4케이스). 전역 명령이 명시 출처 문구에 **나타나지 않는지**도 assert — 오안내의 본체가 그것이므로. — *검증: unit*

### Phase D — 실물로 실행한다 (FR9)

- [ ] **T017** `scripts/check-self-diagnosis.sh` § 5d-bis 에 **(g)** 추가. `$DM_HOME/stale-daemon/` 에 `package.json {"name":"@c-d-cc/reap-daemon","version":"0.1.0"}` + `dist/index.js` 를 만들고 `daemonBin` 으로 지목 → `fix --check` 가 경로를 말하고 전역 명령을 말하지 않는지, `reap daemon status` 가 같은 판정을 내는지. 기존 `dm_fix_verdict`/`dm_require_verdict` 재사용. **5e 앞, config 원복 포함**(기존 (a)~(f) 의 규약). — *검증: 게이트 실행*
- [ ] **T018** **[negative]** T013 의 분기를 일시 되돌려 (g) 가 FAIL 하는지 확인 후 복원. — *검증: 게이트 실행 2회*

### Phase E — 전체 검증

- [ ] **T019** `npm run build` → `npm run typecheck` → unit / e2e / scenario / daemon 네 스위트. baseline 대비 증감 기록. `node dist/cli/index.js fix --check` 로 자기 프로젝트 경고 수 확인. — *검증: 실행*
- [ ] **T020** `git diff` 로 `MIN_DAEMON_VERSION` 과 `package.json` version 무변경 확인. `bash scripts/check-docs-version.sh` 통과 확인(문서 게이트 회귀 없음). — *검증: 실행*

### 의존 순서

```
T001 → T002 → {T003, T004, T005} → {T006, T007}
T009 → T008 → T011 → T010
T012 → {T013, T014, T015} → T016 → T017 → T018
전부 → T019 → T020
```

Phase A 와 B 는 독립. Phase C 는 A 의 semver 수정과 논리적으로만 연결(도달 가능성)되며 코드 의존은 없다. Phase D 는 C 에 의존한다.

## Test Strategy

| 변경 | 레벨 | 근거 (genome § 테스트 레벨 선택 기준) |
|---|---|---|
| `src/core/semver.ts` | **unit** | 외부 의존 없는 pure logic |
| `migration.ts` / `check-version.ts` 소비자 | **unit** | 주입 가능한 순수 판정 |
| `DaemonAvailability` 3소비처 문구 | **unit** | `availability` 를 주입받는 순수 함수 |
| 릴리즈 게이트 스크립트 | **직접 실행 + negative** | 네트워크·npm 의존이라 unit 대상 아님 |
| 낡은 daemon end-to-end | **자기진단 게이트** | 설치된 CLI + 파일시스템 상태 조합 (genome § 외부 도구 e2e 패턴) |

**영향받는 기존 테스트**: `tests/unit/check-version.test.ts`(semverGte describe 이관), `tests/unit/migration-detection.test.ts`(`semverGte` import 제거), `tests/unit/daemon-availability.test.ts`(`explicitLabel` 필드), `tests/unit/integrity-daemon.test.ts` / `tests/unit/prompt-daemon.test.ts`(문구 분기).

`tests/` 는 private submodule — 그 안에서 먼저 커밋하고 `git add tests` 로 pointer 를 stage 한다. **push 하지 않고 보고한다.**

## Risks

| 위험 | 완화 |
|---|---|
| semver 통합이 `detectPendingMigrations` 를 조용히 바꾼다 | T006 이 **수정 전에도 통과해야 하는** 회귀 가드. release line 정책을 이름으로 드러냄 |
| autoUpdate 동작 변경이 alpha 사용자에게 예기치 않게 닿는다 | 의도된 변경으로 T007 에 고정. alpha 는 정식판 이전이며 breaking-change migration 을 못 받은 상태가 맞다. 완료 artifact 에 명시 |
| 게이트가 네트워크로 flaky | amber SKIP + 명시 출력. release 전용이라 상시 노이즈 없음 |
| (3) 분기가 실제로는 도달 불가 | 위 § 착수 판단에 "틀렸을 때 무엇이 깨지나"를 기록. 손해는 문구 분기 하나 |
| 게이트 (g) 의 조작 package.json 이 실물과 다름 | 다른 점은 버전 문자열의 출처뿐이며 `resolveDaemonAvailability` 는 그 파일만 읽는다. 완료 artifact 에 한계로 기록 |
| 한 머신 green | reap-test dispatch(리눅스 러너)까지 확인. 로컬만으로 결론 내지 않음 |

## Human Confirmation

Clarity **HIGH**. 세 backlog 이 파일·해법까지 지목했고 유일한 열린 판단((3) 착수)은 실측으로 닫혔다. 유저에게 되묻지 않고 진행하되, **fitness 앞에서 반드시 복귀**해 (3) 착수 판단과 autoUpdate 동작 변경 2건을 보고한다.
