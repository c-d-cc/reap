---
id: bk-394d82
slug: milestone-없는-세대의-decisions
type: design
title: milestone이 열려 있지 않으면 결정을 적을 곳이 없다
from: gen-0021-fix
createdAt: 2026-08-23T03:00:18Z
status: consumed
consumedBy: gen-0025-exec
---

> **해결됨 — `gen-0025-exec`. 자리를 만들어서가 아니라 물음이 사라져서다.** 사람이 결정 로그 제도를 통째로 내리기로 했다 — `decisions.md`도 `reap decide`도 두지 않는다. 그러므로 "milestone 밖 결정은 어디로 가는가"의 답은 **어디로도 가지 않는다**이다. 정해진 것은 그것이 규율할 자리(plan source·`genome/`·`map.md`)에 반영되어야만 살아남고, 반영 안 하면 안 정해진 것이다. 규범은 `docs/superpowers/specs/reap/05-knowledge.md`의 "결정 로그를 두지 않는다" 절에 있다. 아래 본문은 그때 무엇을 물었는지 남기기 위해 고치지 않는다.

## 무엇이 문제인가

**`decisions.md`는 milestone 디렉토리 안에만 산다.** 그런데 plan과 fix 세대는 milestone에 속하지 않으므로, **열린 milestone이 하나도 없는 동안 돌아가는 세대는 결정을 적을 곳이 없다.**

지금까지는 드러나지 않았다. `gen-0004`~`0007-plan`은 milestone에 속하지 않았지만 그때 `ms-001`이 열려 있어서 그쪽 `decisions.md`에 적었다. `gen-0021-fix`가 `ms-002`가 닫힌 뒤 열린 첫 세대이고, 여기서 처음 갈 곳이 없어졌다.

이번 세대가 내린 판단("미룬 Minor 넷 중 되돌아갈 곳이 있는 하나만 fix다")은 앞으로도 되풀이될 종류인데, 세대 기록의 `Notes`에 넣었다. **세대 기록은 archive로 내려가므로 그 판단은 언젠가 안 읽히는 곳에 남는다.**

## 왜 지금 안 고치는가

`reap decide`가 아직 없다(증분 2). 결정을 어디에 쓸지는 그 명령을 설계할 때 함께 정해야 하고, 지금 자리를 하나 급조하면 `decide`가 그것을 또 옮기게 된다.

## 정해야 할 것

- **milestone 밖의 결정은 어디로 가는가.** 후보 셋: (a) `vision/memory/`에 프로젝트 전역 `decisions.md`를 두고 milestone의 것과 둘로 나눈다 — 그러면 "어느 쪽에 적는가"라는 판단이 매번 생긴다. (b) 전부 전역 하나로 합치고 milestone 필드로 구분한다 — milestone을 닫아도 결정이 archive로 안 내려간다. (c) 세대 기록에 남기고 `cleanup`이 내릴 때 졸업시킨다 — 지금 `lessons.md`가 도는 방식과 같다
- **결정과 교훈의 경계.** (c)를 고르면 `decisions.md`와 `lessons.md`가 무엇으로 갈리는지 다시 정의해야 한다
- 이것이 증분 2(`reap decide`)의 것인지, 증분 4(위생)의 것인지

## 근거

- `docs/superpowers/specs/reap/03-storage.md` — `decisions.md`의 자리
- `docs/superpowers/specs/reap/09-roadmap.md` — 증분 2가 `reap decide`를 포함한다
- `.reap/life/backlog/bk-15780b-milestone-없는-세대의-archive-경로.md` — **같은 뿌리의 다른 증상.** milestone 무소속 세대가 구조에서 빠지는 자리가 이것으로 둘째다
