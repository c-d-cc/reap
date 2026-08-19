# Implementation Log

## Completed Tasks

### T001 `src/core/git.ts` — 버려지던 stderr 를 반환형에 싣는다

- `GitPushResult { success: boolean; error: string | null }` 신설
- `describeExecError(err)` — **stderr → stdout → `err.message`** 순으로 첫 비어있지 않은 문자열을 돌려주고, 셋 다 없으면 `null`
- `gitPush(cwd)` 가 `boolean` → `GitPushResult`
- `pushSubmodules` 원소에 `error: string | null` 추가

`push.ts` / `completion.ts:457` / `early-close.ts:147` 세 호출부를 `grep` 으로 먼저 확인했다. 뒤의 둘은 반환값을 쓰지 않아 필드 추가에 영향받지 않는다.

`null` 을 남겨둔 이유: "원인을 말한다"와 "말할 것이 없다"는 다른 상태이고, 호출부가 그 둘을 구분할 수 있어야 없는 원인을 지어내지 않는다.

### T002 `src/cli/commands/run/push.ts` — 원인을 사용자에게

- main repo: `git push failed:\n<git 의 말>`. 아무것도 못 건졌으면 `git push failed, and git reported no reason.`
- submodule: 실패한 것마다 `<name>: <원인>` 을 줄바꿈으로

**옛 문구 `"Check remote configuration and network."` 를 삭제했다.** 그 문장이 이번 결함의 본체다 — 2026-08-19 실사례에서 remote 도 네트워크도 정상이었는데 사용자를 그리로 보냈고, 추측이 아니라 진단처럼 읽혔다. submodule 쪽의 `"Check remote configuration."` 도 같은 이유로 제거.

### T005 `src/core/lifecycle.ts` — self-loop 1개씩

```
NORMAL "validation:entry": ["validation:complete", "validation:entry", "implementation:entry"]
MERGE  "validation:entry": ["validation:complete", "validation:entry", "reconcile:entry"]
```

`stage-transition.ts` / `validation.ts` 는 **무변경**. `setTransitionNonces` 가 호출마다 목록대로 재발급하므로 self-loop 만으로 재진입이 성립하고, nonce 는 여전히 매번 발급·검증·소비된다.

merge graph 도 고친 이유: 같은 `validation.ts` 가 `isMerge` 로 양쪽을 처리한다. 한쪽만 고치면 같은 결함이 merge 에 남는다.

graph 위쪽 주석에 **self-loop 의 의미와 왜 validation 에 필요한지**를 적었다 — 다음 사람이 "완료 목록에 자기 자신이 있네"를 오타로 읽지 않도록.

### T008 `src/cli/commands/daemon/client.ts` — 위치를 에러에 싣는다

- `missingDaemonRemedy(explicitMiss)` 신설 — `staleDaemonRemedy` 의 정확한 대응물이며 바로 옆에 둔다
- `DaemonNotInstalledError` 생성자가 `installCommand: string` → `explicitMiss: ExplicitDaemonBin | null`. 인자를 넘기는 호출부는 원래 없었다(`grep` 확인). `installCommand` 는 읽기 전용 필드로 남겨 종전 소비 형태를 유지
- `ensureDaemon` 이 `resolveDaemonBin()` → `locateDaemon()`. 전자는 `.bin` 만 남기고 `explicitMiss` 를 버린다 — 그것이 에러가 정보를 못 받던 이유

### T009 `src/cli/commands/daemon/index.ts` — 문구 소유자를 하나로

`requireUsableDaemon` 의 인라인 3항 연산자를 `missingDaemonRemedy` 호출로 교체. 출력 문자열은 **byte-identical** (조립 순서까지 동일). 이제 "미설치" 를 말하는 두 곳이 한 함수를 읽는다.

### T003/T004/T006/T007/T010 — 테스트

| 파일 | 결함 | 수 |
|---|---|---|
| `tests/unit/git-push-error.test.ts` (신규) | 1 | 5 |
| `tests/e2e/push-error.test.ts` (신규) | 1 | 3 |
| `tests/unit/lifecycle.test.ts` (추가) | 2 | 2 |
| `tests/e2e/validation-rerun.test.ts` (신규) | 2 | 5 |
| `tests/unit/daemon-availability.test.ts` (추가) | 3 | 3 |

git 테스트는 **실제 git 바이너리와 임시 repo** 를 쓴다. 검증 대상이 "git 이 실제로 무엇을 어디에 쓰는가"라 stub 을 두면 그 답을 내가 지어내게 된다.

`validation-rerun` 의 artifact-incomplete 케이스는 **emit 된 `nextCommand` 문자열을 파싱해 그대로 실행**한다. 문구를 반복 단언하면 "REAP 이 자기 지시를 지키는가"가 아니라 "문구가 그대로인가"를 재게 된다.

`getTransitions` self-loop 추가로 인해 stage 건너뛰기가 열리지 않았음을 e2e 로 함께 단언했다 (`run completion` 직행이 여전히 error).

### T011 typecheck + build

`npm run typecheck` 통과 (`tsc --noEmit`, 0 error). `npm run build` 통과 (152 modules, 0.60 MB).

### T012 negative — 셋 다 고의로 깨뜨려 fail 을 확인하고 복원

| 깨뜨린 것 | 결과 |
|---|---|
| `describeExecError` 가 항상 `null` | unit 4 fail / e2e 2 fail → 복원 후 0 fail |
| 두 graph 의 self-loop 제거 | unit 2 fail / e2e 3 fail → 복원 후 0 fail |
| `missingDaemonRemedy` 가 `explicitMiss` 무시 | unit 2 fail → 복원 후 0 fail |

## Discovered Issues

### 내가 쓴 검사 하나가 결함을 구분하지 못했다 — 첫 negative 에서 잡혔다

daemon 항목의 첫 negative 실행에서 **fail 이 1건뿐**이었다. "예외가 진단과 같은 답을 낸다" 테스트가 통과했기 때문인데, 그 이유가 둘이었다:

1. 예외 메시지를 `missingDaemonRemedy(miss)` **자신과 대조**하고 있었다 — helper 가 틀리면 둘이 나란히 틀린다
2. 보완으로 넣은 `expect(message).toContain(DAEMON_BIN_ENV)` 가 **무력**했다. `DAEMON_LOCATE_HINT` 가 이미 `export REAP_DAEMON_BIN=…` 을 포함하므로, `explicitMiss` 를 통째로 무시한 메시지도 그 단언을 통과한다

`explicitMiss` 를 존중해야만 나타나는 것 — **경로 문자열** — 로 바꾸니 fail 이 2건이 됐다.

genome 의 *"검사를 만들 때 먼저 실패시켜라"* 가 이 형태를 정확히 겨냥한다. 만들고 바로 green 을 봤다면 그 테스트를 실제보다 신뢰한 채 넘어갔을 것이다.

### 결함 2 의 증거는 evaluator 가 아니라 artifact-incomplete 분기다

learning 에서 재현하며 드러난 것 — validation work 는 artifact 미작성 시 **스스로 `nextCommand: "reap run validation"` 을 내보내고 REAP 이 그것을 거부한다.** evaluator 를 켜지 않은 사용자도 겪는다. backlog 은 evaluator prompt 회수 불가만 적고 있었다.

## Deferred Items

- **`git.ts` 의 다른 `catch { return false }` 래퍼** (`gitFetchAll` / `gitPullFfOnly` / `gitResetHard` / `gitAheadBehind` …). 형태는 같지만 backlog 이 지목한 것도, 실사례가 있는 것도 push 경로뿐이다. 유저가 고정한 범위 밖.
- **learning / planning / implementation work phase 재진입.** 결함 2 는 validation 으로 지목돼 있고 다른 stage 는 재현 사례가 없다. 각 work phase 가 하는 일이 달라(예: learning 이 daemon 인덱싱을 트리거) 재진입 안전성을 따로 논증해야 하는데, 근거 없이 넓히지 않는다.
- **`src/core/integrity.ts` 의 미설치 문구.** 이미 `explicitMiss` 로 갈리고 있어 결함이 아니다. `core` 는 `cli` 를 import 할 수 없으므로 공유하려면 `DaemonAvailability` 에 필드를 늘려야 하는데, 그것은 지목된 수정을 넘어선다. 결과적으로 미설치 문구를 조립하는 곳이 **2 → 1 로 줄었고 integrity 가 세 번째로 남았다.**

**backlog 은 만들지 않았다** (유저 지시). 위 셋은 이 문단이 기록의 전부다.

## Architecture Decisions

**결함 2 에 새 메커니즘을 만들지 않았다.** self-loop 은 `completion:fitness` 에 이미 있었고, 그것이 nonce 무결성을 유지한 채 재진입을 허용하는 확립된 수단이다. backlog 도 "self-loop 은 이미 transition graph 에 있다"고 적어 그쪽을 가리켰다. graph 데이터 2줄 변경으로 끝났고 `stage-transition.ts` 는 손대지 않았다.

**결함 1 의 문구를 유지하지 않고 교체했다.** 원인을 `context` 에만 싣고 문구를 남기는 안은 기각했다 — `emitError` 는 `message` 만 내보내고(`output.ts:33`), 사용자가 읽는 것은 그 문장이다. 그 문장이 틀렸다는 것이 결함의 내용이므로 남기면 고친 것이 아니다.

**소스 5 파일 / 테스트 5 파일.** 유저가 준 상한(~6 소스 파일) 안이며, 셋 다 결함이 지목한 파일에서 끝났다.
