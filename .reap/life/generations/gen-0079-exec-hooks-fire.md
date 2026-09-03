---
id: gen-0079-exec
slug: hooks-fire
type: exec
milestone: ms-017
title: 훅 발화 여섯 지점·doctor 검사·init 씨앗·spec 갱신
startedAt: 2026-09-03T14:59:23Z
startCommit: 4024a94
status: open
---
## Intent

ms-017 task 2·3 — `make generation`·`mark generation --closed`·`make milestone`·`mark milestone --closed`·`orch claim`·`orch barrier`에서 발화하고 출력을 명령 결과 뒤에 붙인다. doctor가 hooks/ 규약을 검사하고, init이 `hooks/conditions/always.sh`를 놓는다. `detect-version.sh`의 표지가 conditions/ 때문에 mixed로 뒤집히지 않게 좁힌다. spec 07의 "아직 아니다"를 결정으로 갱신하고 map 씨앗을 맞춘다. 끝은 ms-017 Exit Criteria 전부.

보완: 조건 미충족은 failures가 아니라 `skipped`로 구분한다 — 실패가 아니다.

수행: worktree `../reap-wt-hooks`(브랜치 `ms-017-hooks`)에서 subagent.

## Outcome

- `runHooks`가 `skipped: {file, reason}[]`를 낸다. 조건 스크립트가 존재하는데 종료 코드가 0이 아니면 skipped, 조건 스크립트 자체가 없으면 failures — `evaluateCondition`이 `missing` 플래그로 가른다
- 여섯 지점 전부 발화한다: `makeMilestone`→`milestone.made`, `makeGeneration`→`gen.made`, `markGeneration`(`closed`만)→`gen.closed`, `markMilestone`(`closed`만)→`milestone.closed`, `orch.ts`의 `claim`(성공만, 새 claim·갱신·탈취 공통 출구 하나로 리팩터)→`orch.claimed`, `waitBarrier`(`released`를 발견하는 매 호출)→`orch.barrier.released`. 전부 파일 쓰기가 끝난 뒤에 부른다
- `Made`·`Claim`·`waitBarrier`의 반환 타입에 `hooks?: RunHooksResult`를 얹었다. `cli.ts`의 `withHooks()`가 message 뒤에 빈 줄 + `--- hooks ---` + `[file]`/텍스트를 붙이고, failures는 새 `Result.stderr` 필드로 보낸다. skipped는 아무 데도 안 낸다. 훅이 실패해도 `ok`는 그대로 `true`
- `doctor.ts`의 `checkHooks()`: `hooks/` 바로 아래(conditions/·dot 파일 제외) 파일 중 여섯 이벤트 파일명 규약(`{event}.{name}.{md|sh}`)에 안 맞는 것 → "훅 파일명 규약 밖", 규약은 맞는데 이벤트가 모르는 것 → "모르는 훅 이벤트", 훅이 가리키는 조건 스크립트가 `hooks/conditions/`에 없는 것 → "훅 조건 스크립트 없음"
- `init`이 `hooks/conditions/always.sh`를 실행 비트(0o755)와 함께 놓는다. `SEEDS`(지식 씨앗 목록, `init --check`의 비교 대상)에는 넣지 않았다 — 이미 있으면 손대지 않는다
- `detect-version.sh`: hooks 표지를 `hooks/` 바로 아래의 `*.sh`·`*.md`(conditions/ 제외)로 좁히고, 그중 파일명이 v0.17 이벤트 관례(`^on[A-Z]` — onLifeStarted·onCompleted·onMerge* 등 14종 전부 이 꼴)로 시작하는 것만 0.17 표지로 삼는다. v0.18 훅 파일(`gen.*` 등)은 표지가 아니다. 6케이스(v0.17 실물 복사·이 리포의 v0.18·빈·conditions만 있는 v0.18·v0.18 이벤트 훅 파일이 있는 v0.18·혼재) 전부 기대한 판정(v017·v018·none·v018·v018·mixed)이 나왔다. 추가로 v0.17식 훅 파일만 있는 케이스로 v017 표지가 살아있는지도 확인했다
- spec: `07-orchestrate.md`의 "언제 만드는가 — 아직 아니다" 절을 "제공한다 — 결정 (사람, 2026-09-01)"로 갱신했다. 신호 셋은 그대로 남기되 "이벤트를 여섯 밖으로 늘릴 때"의 기준으로 용도를 바꿨다. `04-commands.md`의 `make hook` 줄은 이미 실제 옵션과 같아 손대지 않았다. `src/templates/map.md`·`.reap/map.md`의 `hooks/` 줄에 여섯 이벤트 이름과 `conditions/`·`always.sh` 씨앗을 적었다(두 파일 diff 없음 유지). `.reap/environment/summary.md`의 src 목록에 `hooks.ts` 한 줄을 더했다
- 03-hooks.md "검증할 동작" 4개 전부 테스트에 있다 — 아래 표
- 실물 검증: `./dist/reap make hook --event gen.made --name echo --type sh`로 훅을 만들고 본문에 `echo "hook: $REAP_HOOK_EVENT $REAP_HOOK_ID"`를 넣은 뒤 `./dist/reap make generation --fix --title 훅확인` 실행 결과:

  ```
  generation gen-0080-fix
    .reap/life/generations/gen-0080-fix-훅확인.md

  --- hooks ---
  [gen.made.echo.sh]
  hook: gen.made gen-0080-fix
  ```

  이후 `mark generation gen-0080-fix --aborted`로 지우고 훅 파일도 삭제했다. `.reap/sequence/generation.md`에 `gen-0080-fix` 행은 남았다(정상 — append-only 레지스트리는 abort로 지워지지 않는다)

### 03-hooks.md "검증할 동작" ↔ 테스트

| 검증할 동작 | 테스트 |
|---|---|
| 훅이 `exit 1`해도 `make generation`이 세대 파일과 `.session`을 남긴다 | `tests/hooks.test.ts` "훅이 exit 1이어도 make generation이 세대 파일과 .session을 남긴다" |
| 조건 스크립트가 0이 아니면 훅이 돌지 않고, 조건 파일이 없으면 doctor 결함 | `tests/hooks.test.ts` "runHooks가 조건이 거짓이면 훅을 건너뛰고 skipped에 적는다" + `tests/doctor.test.ts` "hooks — 규약 밖 파일명·모르는 이벤트·없는 조건 스크립트를 결함으로 낸다" |
| `.md` 훅 본문이 `mark generation --closed` 출력 뒤에 그대로 붙는다 | `tests/hooks.test.ts` ".md 훅 본문이 mark generation --closed 출력 뒤에 그대로 붙는다" |
| `tests/hook.test.sh`가 아니라 `bun test`의 새 파일(`hooks.test.ts`)이 위를 덮는다 | 위 세 줄 전부 `tests/hooks.test.ts`에 있다. `tests/hook.test.sh`는 SessionStart 플러그인 훅만 계속 검사한다(별개 대상) |

검증: `bun test` 206 pass·0 fail, `bun run typecheck` 통과, `bash tests/hook.test.sh` 전부 통과, `./dist/reap doctor` 결함 0.

## Dead Ends

- 훅 발화를 `cli.ts`의 호출부(파일 쓰기 성공 뒤)에서 부르는 안을 handoff.md가 권했지만, task 2 문서(`tasks/2-fire-doctor-init.md`)가 `entries.ts`·`orch.ts`를 명시했다. `entries.ts`가 순수 함수여야 한다는 handoff의 우려는, 훅 부작용이 있어도 `root`에 훅 파일이 없으면 `outputs: []`·`failures: []`·`skipped: []`로 부작용이 없는 것과 동일해 실제 테스트에 문제가 안 됐다 — task 문서 쪽을 따랐다
- `claim()`의 세 반환 경로(새 claim·같은 holder 갱신·탈취)를 각각에서 훅을 부르는 대신, `acquired` 플래그로 단일 성공 출구로 리팩터했다 — 세 곳에 `runHooks` 호출을 반복하면 나중에 이벤트 이름이나 ctx가 갈릴 위험이 있었다
- doctor의 "훅 파일명 규약 밖" vs "모르는 훅 이벤트" 판정에 별도 정규식(`^(.+)\.([^.]+)\.(md|sh)$`)을 썼다. `listHooks`가 이미 알려진 이벤트별로 파일을 인식하므로, 여기 걸리지 않은 파일만 이 정규식으로 재분류한다 — 이름에 점이 있는 파일(예: `gen.made.a.b.md`)은 `listHooks`가 먼저 인식하므로 이 정규식의 느슨함(`.+`가 아니라 `[^.]+`로 이름을 제한)이 오탐을 만들지 않는다
