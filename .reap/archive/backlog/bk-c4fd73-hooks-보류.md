---
id: bk-c4fd73
slug: hooks-보류
type: design
title: REAP hooks — 원하는 지점이 나오면 자른다
from: gen-0032-plan
createdAt: 2026-08-23T04:51:22Z
status: consumed
consumedBy: gen-0036-exec
---

> **해결됨 — `gen-0036-exec`. spec에 남기고 신호를 적었다.** 이 항목이 적어둔 신호 셋을 `07-orchestrate.md`의 "언제 만드는가 — 아직 아니다" 절로 올렸다. **backlog는 소비되면 archive로 내려가므로 신호가 거기 있으면 안 읽힌다** — hooks 규약을 소유한 문서가 그 자리다. `bk-75bafa`(carrier)와 다르게 spec에 남긴 이유는 `.reap/hooks/`가 `init`이 만드는 디렉토리로 **이미 구조에 자리를 갖고 있기** 때문이다. 아래 본문은 고치지 않는다.

## 무엇이 문제인가

**증분 5가 쪼개졌다.** `interview`는 `ms-007`로 잘렸지만 **REAP hooks(`make hook` · 이벤트 발화)는 자르지 않았다.**

로드맵이 hooks를 미룬 이유가 명시적이었다 — *"아무도 훅을 쓰고 싶어 하기 전까지 훅은 순수 YAGNI다. 증분 1~4를 쓰면서 '여기서 뭔가 자동으로 돌았으면' 하는 지점이 나오면 그때 만든다. 나오지 않으면 안 만든다."*

**32세대를 돌았는데 그 지점이 안 나왔다.** `tracks.md`·`lessons.md`·backlog 여섯을 훑어도 훅을 원한 흔적이 없다. 가장 가까운 것이 `bk-21931c`(`make milestone`이 focus를 안 붙인다)인데 **그건 명령 하나를 고칠 일이지 이벤트 훅이 아니다.**

## 무엇이 신호인가

이 항목이 열려 있는 이유는 "언젠가 만들자"가 아니라 **무엇을 보면 만들 때인지를 적어두기 위해서**다. 그게 없으면 영영 판단이 안 된다.

- **같은 수동 동작이 세대마다 반복된다.** `mark`나 `make` 직후에 매번 사람이 같은 것을 치고 있다면 그 경계에 훅이 맞다
- **그 동작이 REAP가 직접 매개하는 지점에 걸린다.** 이벤트는 여섯뿐이다(`gen.made`·`gen.closed`·`milestone.made`·`milestone.closed`·`orch.claimed`·`orch.barrier.released`). 그 밖의 지점을 원한다면 훅이 아니라 다른 것이 필요한 것이다
- **프로젝트마다 달라야 한다.** 모든 프로젝트가 같은 것을 원하면 훅이 아니라 도구가 그것을 하면 된다

셋을 다 만족하는 지점이 나오면 자른다.

## 지금 후보가 하나 있긴 하다

`bk-21931c` — `make milestone` 직후 `mark milestone --focus`를 매번 손으로 친다. **`milestone.made` 이벤트에 걸리고 반복된다.** 다만 세 번째 조건(프로젝트마다 달라야 한다)을 만족하지 않는다 — 모든 프로젝트가 같은 것을 원할 것이므로 **훅이 아니라 `make`가 고쳐야 한다.**

**이것이 신호 목록의 첫 시험이고, 결과는 "훅이 아니다"였다.**

## 근거

- `docs/superpowers/specs/reap/07-orchestrate.md` — hooks 규약과 이벤트 여섯
- `docs/superpowers/specs/reap/04-commands.md` — `make hook`
- `.reap/life/backlog/bk-21931c-자른-직후-focus.md` — 신호 목록의 첫 시험
