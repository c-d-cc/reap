---
id: bk-15780b
slug: milestone-없는-세대의-archive-경로
type: design
title: milestone 없는 세대는 archive로 갈 경로가 없다
from: gen-0016-exec
createdAt: 2026-08-23T01:22:34Z
status: consumed
consumedBy: gen-0020-exec
---

> **해결됨 — `gen-0019-plan`·`gen-0020-exec`.** 이 항목이 물은 "트리거를 무엇으로 하는가"는 답이 트리거가 아니라 **기준**이 틀렸다는 것으로 드러났다. `cleanup`이 옮길지 말지를 milestone 소속으로 판단하는 한 plan·fix는 구조적으로 예외가 되어 `life/`에 영영 남는다 — 그래서 기준을 "이 세대를 앞으로 볼 일이 있는가"(참고 가치)로 바꿨다. 지금 규범은 `docs/superpowers/specs/reap/03-storage.md`의 "`life/generations/`는 작업 세트다" 절에 있다. 아래 본문은 그때 무엇을 물었는지 남기기 위해 고치지 않는다.

## 무엇이 문제인가

**archive의 트리거가 "milestone이 닫힐 때" 하나뿐이다.**

`cleanup` skill은 milestone을 닫은 뒤 agent가 부르고, 그 milestone과 관련된 닫힌 세대를 `archive/generations/`로 내린다. 그런데 **plan·fix 세대는 milestone에 속하지 않는다.** 그래서 그 트리거에 영영 걸리지 않고 `life/generations/`에 무한히 쌓인다.

`03-storage.md`는 `life/`를 **하는 중인 것**, `archive/`를 **끝난 것**이라고 규정한다. 닫힌 plan 세대가 `life/`에 영영 남는 것은 그 규정과 어긋난다.

지금 이 리포만 봐도 닫힌 plan 세대가 다섯이고, 앞으로 계속 는다.

## 왜 바로 안 고치는가

`ms-002`의 Task 2.3이 `cleanup`을 막 만드는 중이다. 트리거를 늘리는 것은 **어느 시점에 무엇이 "끝난 것"인가**를 다시 정하는 일이라 설계 판단이 필요하고, 그것은 plan 축이다.

## 정해야 할 것

- **트리거를 무엇으로 하는가.** 후보 셋: (a) 닫히는 즉시 — 그러면 `life/generations/`에 열린 것만 남아 `archive/` 개념이 단순해지지만 파일 이동이 매 세대 일어난다. (b) `cleanup`을 milestone 종료와 무관하게도 부를 수 있게 한다 — 사람이 정리하고 싶을 때 부른다. (c) 시간·개수 기준 — `doctor`가 "닫힌 지 오래된 세대가 N개"를 보고하고 사람이 `cleanup`을 부른다
- **`cleanup`이 milestone 종료 전용인가 아닌가.** 지금 skill 문서는 전용으로 읽힌다
- 이것이 **증분 4(위생)**의 것인지, 그전에 필요한지

## 근거

- `docs/superpowers/specs/reap/03-storage.md` — "최상위를 가르는 것은 유형이 아니라 시간이다", "archive는 milestone에 매달리지 않는다"
- `.reap/vision/milestones/ms-002-저장-구조와-세대-유형/tasks/2-3-fix-유형과-cleanup.md` — 지금의 `cleanup` 명세
