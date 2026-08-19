# Planning

## Goal

REAP 이 자기 사용자에게 잘못 말하거나 자기 문서를 못 지키는 결함 **3건**을 고친다.

완료 후 달라지는 것:

1. `reap run push` 가 실패하면 **git 이 한 말**이 사용자에게 도달한다 (지금은 버려지고 무관한 일반론만 남는다)
2. `reap run validation` (work phase) 을 **다시 실행할 수 있다** — REAP 이 스스로 내보낸 `nextCommand` 를 스스로 거부하지 않는다
3. `DaemonNotInstalledError` 가 **사용자가 지정한 위치**를 안다 — 이미 그렇게 하는 다른 두 소비처와 짝이 맞는다

## Background

gen-083~085 의 daemon 작업이 파생시킨 backlog 11건을 유저가 1건으로 합쳤고, 그 1건이 본 세대의 source 다. 남긴 기준은 **"지금 존재하는 사용자에게 실제로 일어나는가"** 하나이며, 버려진 8건은 backlog 의 표에 이유와 함께 남아 있다.

gen-085 fitness 지시가 본 세대에 직접 걸린다 — *"검증을 강화하는 일 자체가 새 작업을 낳는 순환"*. 따라서 **backlog 신설 금지 / 게이트·스크립트 신설 금지 / 인접 갭은 완료 artifact 한 줄**.

## Scope

**대상 소스 5 파일** (유저가 준 상한 ~6 이내):

| 파일 | 결함 | 변경 성격 |
|---|---|---|
| `src/core/git.ts` | 1 | `gitPush` / `pushSubmodules` 반환형 확장 + `execSync` 에러 서술 helper |
| `src/cli/commands/run/push.ts` | 1 | 받은 원인을 `emitError` 로 |
| `src/core/lifecycle.ts` | 2 | 두 graph 의 `validation:entry` 에 self-loop 1개씩 |
| `src/cli/commands/daemon/client.ts` | 3 | `missingDaemonRemedy` 신설 + 에러가 `explicitMiss` 를 받음 |
| `src/cli/commands/daemon/index.ts` | 3 | 인라인 문구를 그 helper 로 교체 (문구 소유자 1개 유지) |

**명시적 out of scope**:

- `git.ts` 의 다른 `catch { return false }` 래퍼(`gitFetchAll` / `gitPullFfOnly` / `gitResetHard` / `gitAheadBehind` …). 같은 형태지만 backlog 이 지목한 것도, 실사례가 있는 것도 push 경로뿐이다.
- learning / planning / implementation 의 work phase 재진입. **결함 2 는 validation 으로 지목돼 있다.** 다른 stage 는 재현 사례가 없고, 각각 work phase 가 하는 일이 달라(예: learning 이 daemon 인덱싱을 트리거) 안전성을 따로 논증해야 한다 — 근거 없이 넓히지 않는다.
- `src/core/integrity.ts` 의 미설치 문구. 이미 `explicitMiss` 로 갈리고 있어 **결함이 아니다.** `core` 는 `cli` 를 import 할 수 없으므로 helper 공유는 `DaemonAvailability` 에 필드 신설을 요구하는데, 그것은 지목된 수정을 넘어선다. 완료 artifact 에 한 줄로 남긴다.
- 버전 bump, 릴리즈 문서, 태그, push, publish.

## Approach

### 결함 1 — 버려지는 stderr 를 반환형에 싣는다

`execSync` 는 실패 시 `.stderr` / `.stdout` 를 가진 에러를 던진다(`encoding: "utf-8"` 이므로 문자열). 정보는 이미 손 안에 있고 `catch { return false }` 가 버릴 뿐이다.

- `gitPush(cwd): GitPushResult` — `{ success: boolean; error: string | null }`
- `pushSubmodules` 의 원소에 `error: string | null` 추가
- 추출은 `describeExecError(err)` 하나로: **stderr → stdout → `err.message`** 순. git 이 stdout 에 쓰는 경우와 spawn 자체가 실패하는 경우를 모두 덮는다
- `push.ts` 는 받은 문자열을 메시지에 싣는다

**문구 방침**: 기존 `"Check remote configuration and network."` 는 **삭제**한다. 그 문장이 이번 결함의 본체다 — 실사례에서 두 가지 모두 정상이었는데 사용자를 그리로 보냈다. 대신 git 의 말을 그대로 옮긴다.

대안(원인을 `context` 에만 싣고 문구는 유지)은 기각 — `emitError` 는 `message` 만 내보내고(`output.ts:33`), 사용자가 읽는 것은 그 문장이다.

### 결함 2 — 이미 있는 수단(self-loop)을 쓴다

`lifecycle.ts` 두 graph 의 `"validation:entry"` 목록에 `"validation:entry"` 를 추가한다.

`completion:fitness` 가 이미 같은 형태의 self-loop 을 갖고 있고(`lifecycle.ts:17`), `setTransitionNonces` 는 호출될 때마다 목록대로 nonce 를 **재발급**한다. 따라서 새 메커니즘도, `stage-transition.ts` 변경도, `validation.ts` 변경도 필요 없다. **nonce 는 여전히 매번 검증·소비된다** — 위조나 stage 건너뛰기는 그대로 막힌다.

재진입 안전성 확인(learning 에서 독해):

- `copyArtifactTemplate` 은 파일이 있으면 즉시 return → 작성 중인 `04-validation.md` 를 덮지 않는다
- `prepareStageEntry` 는 back 후보에서 **같은 stage 를 제외**한다(`stage-transition.ts:127~130`) → 그 경로 무영향
- `back.ts` 도 `targetStage !== fromStage` 로 거른다(`back.ts:23~26`) → self-loop 이 back 후보로 잡히지 않는다

merge graph 도 같이 고친다. 같은 `validation.ts` 코드가 `isMerge` 로 양쪽을 처리하므로 **한쪽만 고치면 같은 결함이 merge 에 남는다.**

### 결함 3 — 위치를 에러에 싣고, 문구 소유자를 하나로

- `ensureDaemon` 이 `resolveDaemonBin()`(= `.bin` 만) 대신 `locateDaemon()` 을 호출해 `explicitMiss` 를 얻는다
- `missingDaemonRemedy(explicitMiss)` 를 `client.ts` 에 신설 — **`staleDaemonRemedy` 의 정확한 대응물**이며 바로 옆에 둔다
- `DaemonNotInstalledError` 가 `explicitMiss` 를 받아 그 helper 로 메시지를 만든다
- `daemon/index.ts:38~40` 의 인라인 3항 연산자를 helper 호출로 교체 → 미설치 문구의 소유자가 1개가 된다 (genome: "표식보다 공유가 낫다")

**정직한 값어치 서술**: learning 에서 `daemonRequest` 의 모든 소비처를 훑은 결과 이 에러 메시지가 **오늘 사용자 화면에 뜨는 경로는 없다** — 셋은 앞서 걸러지고, 나머지는 의도적 silent-fail 이다. 전역 catch 도 없으므로 새 소비처 하나면 그대로 노출된다. 즉 **오늘의 증상이 아니라 짝이 맞지 않는 상태의 교정**이다. 이 항목의 검증에는 `[실행]` 태그를 쓰지 않고 unit 수준 `[실행]` + 도달 범위 `[독해]` 로 적는다.

## Risk Assessment

| 위험 | 판단 |
|---|---|
| `gitPush` 반환형 변경이 호출부를 깨뜨린다 | 호출부는 2곳뿐(`push.ts`, `pushSubmodules`). `grep -rn "gitPush"` 로 확인 후 착수. typecheck 가 잡는다 |
| stderr 에 자격증명/토큰이 섞여 출력된다 | git 은 자격증명을 stderr 에 쓰지 않는다(URL 에 토큰을 박아둔 remote 라면 이미 `git remote -v` 에 노출). 사용자가 직접 `git push` 를 쳐서 보는 것과 같은 문자열이며, 그것이 이 수정의 목적이다 |
| self-loop 이 무한 재진입을 허용한다 | 이미 `completion:fitness` 가 그 성질을 갖는다. work phase 는 상태를 변형하지 않으므로(nonce 재발급뿐) 반복 호출은 무해하다. 전진은 여전히 `--phase complete` + artifact 검증을 통과해야 한다 |
| self-loop 이 기존 e2e 를 깨뜨린다 | `pendingTransitions` 목록을 문자열로 단언하는 테스트가 있으면 깨진다. 착수 전 `grep` 으로 확인 |
| 결함 3 의 값어치가 과장된다 | 위 § 정직한 값어치 서술대로 태그를 구분해 적는다 |

## Completion Criteria

1. **[실행]** upstream 미설정 remote 에서 `reap run push` 의 `message` 에 git 이 낸 `no upstream branch` 문구가 포함된다. 옛 문구 `"Check remote configuration and network."` 는 나오지 않는다
2. **[실행]** `reap run validation` 을 연속 두 번 호출하면 두 번 다 `status: "prompt"` / `phase: "work"` 이고, `evaluator: true` 일 때 두 번 다 `context.evaluator.prompt` 가 비어 있지 않다
3. **[실행]** artifact 미작성 상태에서 `reap run validation` 이 낸 `nextCommand` 를 그대로 실행하면 error 가 아니다
4. **[실행]** `daemonBin` 이 빈 자리를 가리킬 때 `DaemonNotInstalledError.message` 가 그 채널명과 경로를 말한다. 아무도 지정하지 않았을 때는 종전 문구를 유지한다
5. **[negative]** 1·2·4 각각에 대해 수정을 되돌린 상태에서 새 테스트가 **fail** 하는 것을 확인하고 복원한다
6. **모든 스위트 0 fail** — unit / e2e / scenario. 기준선 대비 감소 없음 (기준선은 착수 시 실측한 값)
7. `npm run typecheck` + `npm run build` 통과. **버전 무변경**, backlog 신설 0건

## Tasks

- [ ] T001 `src/core/git.ts` — `describeExecError` helper + `gitPush` 가 `{ success, error }` 반환 + `pushSubmodules` 원소에 `error`
- [ ] T002 `src/cli/commands/run/push.ts` — 받은 원인을 `emitError` 메시지에 싣기 (main repo + submodule 양쪽)
- [ ] T003 `tests/unit/git-push-error.test.ts` — 실제 임시 repo 로 `gitPush` 실패 시 stderr 반환 확인 + 성공 시 `error: null`
- [ ] T004 `tests/e2e/push-error.test.ts` — `reap run push` 출력에 실제 원인이 실리고 옛 일반론이 사라졌는지
- [ ] T005 `src/core/lifecycle.ts` — NORMAL/MERGE 두 graph 의 `validation:entry` 에 self-loop
- [ ] T006 `tests/unit/lifecycle.test.ts` — `getTransitions` 가 normal/merge 양쪽에서 self-loop 을 포함하는지 (기존 파일에 추가)
- [ ] T007 `tests/e2e/validation-rerun.test.ts` — 연속 2회 호출 동일 출력 + evaluator prompt 회수 + artifact-incomplete 의 `nextCommand` 가 실행 가능한지
- [ ] T008 `src/cli/commands/daemon/client.ts` — `missingDaemonRemedy` 신설, `ensureDaemon` 이 `locateDaemon` 사용, 에러가 `explicitMiss` 를 받음
- [ ] T009 `src/cli/commands/daemon/index.ts` — 인라인 미설치 문구를 helper 로 교체
- [ ] T010 `tests/unit/daemon-availability.test.ts` — `missingDaemonRemedy` 와 에러 메시지 분기 (기존 파일에 추가)
- [ ] T011 `npm run typecheck` + `npm run build`
- [ ] T012 negative 확인 — T003/T004/T007/T010 각각 수정을 되돌려 fail 을 눈으로 본 뒤 복원
- [ ] T013 전체 스위트 실행 (unit / e2e / scenario) 후 기준선과 대조

## Dependencies

- T001 → T002 → T004 (반환형이 먼저)
- T005 → T006, T007
- T008 → T009 → T010
- T011 은 T001~T009 이후
- T012 는 각 테스트가 존재한 뒤, T013 은 마지막

세 결함은 서로 독립이므로 1 → 2 → 3 순으로 처리하되 어느 하나가 막혀도 나머지는 진행한다.

## Additional Findings

- **baseline 실측 확정 — unit 545 / e2e 279 / scenario 44, 전부 0 fail** (착수 전 실행). 상위 지시가 준 unit 538 은 낡은 값이고 shortterm memory 의 545 가 맞다. gen-085 의 교훈대로 **기준선을 적어두지 않으면 fail 이 회귀인지 원래 그런지 판정할 수 없다.**
- **기존 테스트 중 `validation:entry` 의 전이 목록을 통째로 단언하는 것은 없다** (`grep -rn "validation:entry" tests/`). 단언되는 것은 `completion:fitness` 의 목록(그 안에 back 대상으로 등장)뿐이라 self-loop 추가에 영향받지 않는다.
- `getTransitions` 의 소비처는 `stage-transition.ts` 두 곳뿐이다 — graph 변경의 파급이 좁다는 근거.
- 결함 2 의 가장 강한 증거는 evaluator 가 아니라 **artifact 미작성 분기**다. 그 분기는 스스로 `nextCommand: "reap run validation"` 을 내보내고 REAP 이 그것을 거부한다 — evaluator 를 쓰지 않는 사용자도 겪는다.
