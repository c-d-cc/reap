# Implementation

> gen-085 — 재는 자 / 하한의 실재성 / 못 넘었을 때의 안내.

## Completed Tasks

| # | Task | 결과 | 증거 |
|---|---|---|---|
| T001 | 수정 전 오판 고정 테스트 (`tests/unit/semver.test.ts`) | 완료 | **[negative]** SemVer §11 순서 예제 인접쌍 **7개 중 check-version 7 오답 / migration 7 오답** |
| T002 | `src/core/semver.ts` 신설 (정본) | 완료 | **[실행]** `bun test tests/unit/semver.test.ts` → 13 pass |
| T003 | `check-version.ts` 자체 구현 삭제 → core import | 완료 | **[독해]** `grep -n semverGte` 로 소비 2곳 유지 확인 |
| T004 | `daemon/client.ts` import 를 core 로 | 완료 | **[실행]** `npm run typecheck` |
| T005 | `migration.ts` 중복 삭제 → `releaseLineGt` | 완료 | **[실행]** unit |
| T006 | migration 회귀 가드 (alpha 에서 note 유지) | 완료 | **[negative]** strict semver 로 되돌리면 **3건 red** |
| T007 | autoUpdate floor 동작 변경 고정 | 완료 | **[실행]** `bun test tests/unit/check-version.test.ts` → 6 pass |
| T008 | `scripts/check-daemon-floor.sh` 신설 | 완료 | **[실행]** `bash scripts/check-daemon-floor.sh` → ok |
| T009 | `reap:carrier(min-daemon-version)` 표식 | 완료 | **[실행]** `list-carriers.sh` → 2 files, orphan 0 |
| T010 | `release.yml` 배선 (`npm publish` 앞) | 완료 | **[실행]** YAML 파싱 + step 순서 확인 |
| T011 | 게이트 negative | 완료 | **[negative]** 4경로 전부 확인 (아래 표) |
| T012 | `explicitBinLabel` + `DaemonAvailability.explicitLabel` | 완료 | **[실행]** `bun test tests/unit/daemon-availability.test.ts` → 34 pass |
| T013 | `integrity.ts` outdated 분기 | 완료 | **[negative]** 되돌리면 red |
| T014 | `prompt.ts` outdated 분기 | 완료 | **[negative]** 되돌리면 red |
| T015 | `daemon/index.ts` outdated 분기 | 완료 | **[negative]** 게이트가 잡음 |
| T016 | 3소비처 unit 을 `source` 별로 분기 | 완료 | **[negative]** 분기 제거 시 2건 red |
| T017 | 자기진단 게이트 5d-bis **(g)** | 완료 | **[실행]** `bash scripts/check-self-diagnosis.sh` → passed |
| T018 | (g) negative | 완료 | **[negative]** 2 소비처 독립 검출 (아래) |
| T019 | 전체 빌드·검증 | 아래 § 검증 | |
| T020 | 무변경 확인 | 아래 § 검증 | |

## 변경 파일

**신규**
- `src/core/semver.ts` — SemVer 2.0.0 §9~11 정본 비교 (`semverCompare` / `semverGt` / `semverGte` / `semverCore`)
- `scripts/check-daemon-floor.sh` — `MIN_DAEMON_VERSION` 이 발행된 릴리즈를 가리키는지 검사
- `tests/unit/semver.test.ts`

**수정**
- `src/cli/commands/check-version.ts` — 자체 `semverGte` 삭제, core import. 소비 2곳 로직 무변경
- `src/cli/commands/daemon/client.ts` — import 를 core 로, `explicitBinLabel` 신설, `explicitLabel` 채움, carrier 표식
- `src/core/migration.ts` — 중복 구현 삭제, `releaseLineGt` 로 정책 명시
- `src/types/index.ts` — `DaemonAvailability.explicitLabel`
- `src/core/integrity.ts` / `src/core/prompt.ts` / `src/cli/commands/daemon/index.ts` — outdated 안내 분기
- `.github/workflows/release.yml` — 게이트 배선
- `scripts/check-self-diagnosis.sh` — § 5d-bis **(g)**
- `tests/unit/{check-version,migration-detection,daemon-availability,integrity-daemon,prompt-daemon}.test.ts`

## 핵심 결정

### D1. 정본 비교기를 `src/core/semver.ts` 에 둔다

backlog 은 `check-version.ts` 만 지목했으나 **구현이 두 벌**이었다(`migration.ts` 에도). 그것만 고쳤다면 **두 구현이 서로 다른 답을 내는 상태가 남았다.**

**[negative] 둘 다 틀렸다** — SemVer 2.0.0 §11 의 공식 순서 예제(`1.0.0-alpha < … < 1.0.0`) 인접쌍 7개에 대해 `gte(작은쪽, 큰쪽)` 이 false 여야 하는데:

```
SemVer §11 인접쌍 7개 중 오답: check-version 7 / migration 7
```

즉 어느 쪽도 "기존 구현이 맞으니 그대로 둔다"의 후보가 아니었다.

### D2. migration 은 **release line(코어)** 으로 비교한다 — `releaseLineGt`

정본을 그대로 적용하면 `semverGt("0.17.6", "0.17.6-alpha.3")` 이 true 가 되어 `detectPendingMigrations` 의 "아직 배포 안 됨" 필터에 걸린다. → **alpha 를 테스트하는 사람에게 그 릴리즈의 migration note 가 숨는다.** 새 관례를 가장 먼저 만나는 사람이 유일하게 안내받지 못한다.

`releaseLineGt(a,b) = semverGt(semverCore(a), semverCore(b))` — 1줄 함수. 구현은 여전히 `core/semver.ts` 하나다.

**[negative]** strict semver 로 되돌리면 3건 red.

**이 항목은 상위 지시가 두 번 바뀌었다** (§ 지시 변경 이력). 최종 지시는 유지이며, **판단 근거는 "유저가 `reapdev.alphaPublish` 로 실제 alpha 를 내고 그것을 깔아 테스트한다"** — 즉 note 은닉은 가상이 아니라 실재하는 시나리오다. 주석은 "왜 코어만 비교하는가" 4줄로 줄였다(미래 정비공을 향한 방어 문구는 뺐다).

### D3. autoUpdate 동작이 바뀐다 — 의도된 변경

`semverGte` 는 daemon 전용이 아니다. `performAutoUpdate` 의 breaking-change guard 와 `checkAutoUpdateGuard` 가 같이 쓴다.

- 전: `0.17.5-alpha.<ts> >= 0.17.5` → **true** (alpha 가 floor 통과 → 자동 업데이트 진행)
- 후: **false** (floor 미달 → `blocked` + 수동 업그레이드 안내)

guard 의 목적은 breaking change 를 건너뛰는 자동 업데이트를 막는 것인데, **그 릴리즈의 migration 을 못 받은 유일한 집단**이 통과하고 있었다. `scripts/alpha-publish.sh` 가 실제로 그 버전을 만든다. `+dev` 는 양쪽 caller 가 비교 전에 early-return 하므로 무관하지만, 비교기 자체도 build metadata 를 무시한다(§10).

**유저 확인 대기 항목**(fitness 전 보고).

### D4. `explicitLabel` 을 값에 실어 보낸다

`integrity.ts` / `prompt.ts` 는 `core` 에 있고 `cli` 를 import 하지 않는다 — `DaemonAvailability` 를 **주입받는다**. 따라서 "source → 채널 이름" 매핑을 그쪽에서 계산할 수 없다. `installCommand` / `locateHint` / `explicitMiss.label` 이 이미 같은 이유로 값에 실려 이동한다(gen-076 패턴).

라벨 문자열이 두 곳에 생기지 않도록 `explicitBinLabel(source)` 을 소유자로 두고 `readExplicitDaemonBins` 도 그것을 쓰게 했다 — 그러지 않았으면 **hit 과 miss 가 같은 설정을 서로 다른 이름으로 부르게** 된다.

### D5. 게이트를 CI 에 넣지 않는다

`check-daemon-floor.sh` 는 네트워크가 필요하다. 매 push 에 넣으면 registry flake 마다 amber SKIP 이 뜨고, **코드와 무관한 이유로 주기적으로 뭔가를 보고하는 검사는 사람들이 스크롤로 넘긴다** (genome § "게이트를 무디게 하는 것을 같이 넣지 마라"). release.yml 의 `npm publish` 앞에만 둔다.

## 검증 증거

### 게이트 negative — 4 경로

| 조작 | 결과 |
|---|---|
| `MIN_DAEMON_VERSION = "9.9.9"` (미발행) | **FAIL** exit=1, 발행 목록(`0.2.0`) 과 처방 2가지 출력 |
| 선언부 형태 변경 (`: string =`) | **FAIL** exit=1 — **조용한 통과가 아니다**. 선언이 옮겨가면 검사가 무력화되는 대신 red |
| `npm` 이 exit 1 (네트워크 실패) | **SKIP** exit=0, amber + "아무것도 검증되지 않았다" 명시 |
| `npm` 이 JSON 아닌 것을 출력 | **SKIP** exit=0, `BAD_JSON` 명시 |

### 자기진단 (g) negative — 소비처 독립 검출

| 조작 | 게이트 반응 |
|---|---|
| `integrity.ts` 분기 제거 | `FAIL a stale daemon is reported without saying which copy is stale` — 실제 경고 전문 출력 |
| `daemon/index.ts` 분기 제거 | `FAIL 'reap daemon status' sends the user after a global upgrade that cannot help` |
| 복원 | `Self-diagnosis passed for v0.17.5.` |

두 소비처가 **독립적으로** 잡힌다 — 한쪽만 고치고 넘어가는 것이 불가능하다.

### AF2 정정 — 전제가 실측과 달랐다

planning 의 AF2 는 "발행본이 1개면 `npm view` 가 **문자열**을 돌려주므로 daemon 이 정확히 그 상태"라고 적었다. **npm 10.9.4 는 `["0.2.0"]` 배열을 돌려준다.** 방어 코드는 유지하되 — release workflow 가 `npm@latest` 를 설치하므로 응답 형태는 패키지가 아니라 그때의 npm 에 달렸다 — **주석에서 "daemon 이 그 상태다"라는 거짓 서술을 지웠다.** 파서에 네 형태를 직접 먹여 확인:

```
"0.2.0"           → FOUND      ["0.2.0"]         → FOUND
["0.1.0","0.2.0"] → FOUND      []                → EMPTY
```

**[negative] 로 확인하지 않았으면 잘못된 서술이 주석으로 남았을 것이다.**

## Discovered Tasks

### DT1 — `semverGte` 중복 (T005 로 흡수)

계획에 있었으나 **backlog 에는 없던 사실**. `src/core/migration.ts` 가 두 번째 구현을 갖고 있었고, 그 export 중 `semverGte` 는 **src 안에서 아무도 쓰지 않았다**(테스트 1곳만). 삭제했다.

### DT2 — (3) 착수 판단을 뒤집을 근거를 실측으로 확보

`git log -- daemon/package.json` 이 커밋 2개만 보여준다: `2db4870`(2026-03-29) = **0.1.0**, `8fc07d6`(오늘) = 0.2.0. gen-084 의 "0.2.0 이 최초 발행본이므로 낡은 daemon 이 존재할 수 없다"는 **발행 이력에는 맞지만 디스크 위의 daemon 에는 틀리다** — 체크아웃·워크트리는 발행되지 않는다.

## 범위 밖으로 남긴 것

- `MIN_DAEMON_VERSION` 인상 — 하지 않음 (미발행 하한이 곧 (2)가 막으려는 결함)
- 버전 bump / 릴리즈 문서 보강 — 세대 밖
- `daemon/` typecheck / `noUnusedLocals` / e2e daemon 빌드 — gen-086
- `reap run push` 원인 삼킴 / validation 재실행 불가 — gen-087

## 최종 검증 (T019 / T020)

### 테스트 — 전 스위트 0 fail

| 스위트 | baseline | 이번 | 차이 |
|---|---|---|---|
| unit | 523 | **545** | +22 (semver 13 신규, migration 5, daemon 계열 4) |
| e2e | 279 | **279** | 0 |
| scenario | 44 | **44** | 0 |
| daemon | 130 | **130** | 0 |

`npm run typecheck` 통과. `[실행]` 명령: `npm run typecheck` / `npm run test:unit` / `npm run test:e2e` / `npm run test:scenario` / `cd daemon && bun test tests/`.

### 게이트

- `bash scripts/check-daemon-floor.sh` → **ok** (`@c-d-cc/reap-daemon@0.2.0 is published`)
- `bash scripts/check-self-diagnosis.sh` → **passed for v0.17.5** (daemon 7 항목 + OpenCode 2 항목)
- `bash scripts/check-docs-version.sh` → **All document checks passed for v0.17.5** (회귀 없음)
- `bash scripts/list-carriers.sh --orphans` → **고아 0**

### 무변경 확인

- `MIN_DAEMON_VERSION` = `0.2.0` — **값 변경 없음** (`git diff` 로 확인, 주석과 carrier 표식만 추가)
- `package.json` version = `0.17.5`, `daemon/package.json` = `0.2.0` — **둘 다 무변경**

### `fix --check` — 경고 5건, **전부 기존 항목**

```
lineage gen-052 parent 미발견 ×2   (기존)
longterm.md 52줄 / midterm.md 73줄 / environment 276줄   (기존, gen-084 에서 이미 초과 상태)
```

본 세대가 **늘린 경고 0건**. 크기 초과 3건은 reflect 의 pruning 대상이다.
