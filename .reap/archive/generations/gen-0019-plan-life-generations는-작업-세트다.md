---
id: gen-0019-plan
slug: life-generations는-작업-세트다
type: plan
title: life/generations는 작업 세트다 — gen-0018을 되돌린다
startedAt: 2026-08-23T01:58:01Z
startCommit: 818b160
status: closed
closedAt: 2026-08-23T02:00:33Z
endCommit: 6363d24
---

## Intent

`gen-0018-plan`을 되돌리고, `life/generations/`가 무엇인지 spec에 처음으로 적는다.

## Outcome

**`gen-0018-plan`의 설계가 틀렸다.** "세대는 닫히는 즉시 archive로 내려간다"는 `life/generations/`를 열린 세대만 담는 곳으로 만드는데, **그것이 그 디렉토리의 목적이 아니다.**

사람이 정정했다:

> life 에서 generations 를 목록으로 갖고 있는 이유는, milestone 을 진행할 때 전체 archive generation 을 다 보는게 아니라, 현재 life/generations 에 있는, close 되어있지만 여전히 참고가치가 높은 generation 들을 남겨두기 위해서다

**`life/generations/`는 작업 세트다.** 지금 일에 참고할 값이 남은 세대만 둔다 — 열린 것과, 닫혔지만 아직 읽을 이유가 있는 것. 세대는 프로젝트가 사는 동안 계속 늘고, 수백 개가 한 곳에 있으면 **참고할 수 있다는 것이 참고할 수 없다는 뜻이 된다.**

그러므로:
- **archive 시점은 milestone 종료다.** 세대를 닫는 순간에는 그것을 다시 볼지 아직 모른다 — milestone이 끝나야 답이 나온다
- **기준은 소속이 아니라 참고 가치다.** "이 세대를 앞으로 볼 일이 있는가." plan 세대는 그 plan이 반영됐으면 내린다
- **이것은 frontmatter로 답할 수 없다.** "이 plan이 반영됐는가"는 어느 필드에도 없다. 그래서 판단이고 skill의 것이다

`03-storage.md`에 **"`life/generations/`는 작업 세트다"** 절을 새로 넣었다. `02-flow.md`·`04-commands.md`·`06-agent.md`는 `gen-0018-plan` 이전으로 돌리되 `cleanup`의 설명을 새 기준으로 바꿨다. skill은 다시 **8종**이다.

ms-002의 Task 2.5를 **"`cleanup`의 기준을 참고 가치로 바꾼다"**로 다시 정의했다. **코드는 안 바뀐다** — `--closed`도 `--archived`도 지금이 맞다.

## Dead Ends — 왜 틀렸나

**`life/generations/`의 목적이 spec 어디에도 없었다.** `03-storage.md`는 `life/`를 "하는 중"이라고만 적었고, 나는 그것을 "열린 것만"으로 읽었다. 그 오독 위에 설계를 얹었고, 사람에게 선택지를 내밀 때도 그 전제를 그대로 실었다.

**적히지 않은 것은 다음 세대가 지어낸다.** 이 문서가 그것을 다시 겪지 않게 하는 유일한 수단이다.

두 번째 실수: `gen-0018-plan`은 `cleanup`이 **실제로 실패하는 것을 보고** 고치려 한 것이라 방향이 옳아 보였다. 그러나 실패의 원인을 잘못 짚었다 — 문제는 *트리거가 milestone 종료라는 것*이 아니라 *기준이 소속이라는 것*이었다. **증상이 맞았어도 원인이 틀리면 고친 것이 더 나빠진다.**

## Notes

`impl-2-5`가 `gen-0018-plan`의 설계를 구현하던 중이었고 커밋 직전에 멈췄다. 작업 트리를 되돌려 잃은 것은 없다. 발급됐다 버려진 `gen-0019-exec`는 커밋된 적이 없다.

`gen-0018-plan`의 기록은 **고치지 않는다.** 그때의 판단이고, 그것이 틀렸다는 것은 이 기록이 말한다.
