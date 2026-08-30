---
id: gen-0035-exec
slug: make-milestone-focus
type: exec
backlog: bk-21931c
title: make milestone에 --focus를 둔다
startedAt: 2026-08-23T05:07:56Z
startCommit: 8c3a2b4
status: closed
closedAt: 2026-08-23T05:09:19Z
endCommit: a6c6c2c
---

## Intent

`bk-21931c`를 소비한다. **`make milestone`이 초점을 붙이지 않아 자른 직후 상태 줄에 그 milestone이 안 나온다.**

## Working Plan — 후보 셋 중 무엇인가

항목이 셋을 적어뒀고, **자르기를 여덟 번 하며 나온 증거가 답을 좁혔다.**

- **(a) `make milestone`이 자동으로 붙인다** → **아니다.** `gen-0032-plan`이 **한 번에 넷을 잘랐다.** 자동이면 마지막에 잘린 `orchestrate`가 초점을 가져가는데, 실제로 다음에 할 것은 첫 번째(plan 축)였다. 자동은 "방금 자른 것 = 지금 할 것"을 전제하는데 그 전제가 틀렸다
- **(b) `pickMilestone`에 "열린 것이 하나뿐이면 그것"을 더한다** → **모자란다.** 지금 열린 milestone이 넷이다. `gen-0033-fix`가 옛 `ms-005`를 지웠을 때 **넷이 다 안 보이는 상태**가 실제로 났다 — (b)는 그 경우를 못 푼다
- **(c) `--focus` 플래그를 `make milestone`에 둔다** → **이것이다.** *"이걸 지금 할 것인가"는 판단이고, 판단은 도구의 것이 아니다.* 도구는 판단을 스탬프한다

**무엇이 되면 끝인가:** `reap make milestone --title "..." --focus`가 초점을 함께 찍는다. `carve-milestone`이 언제 주는지를 말한다.

## Outcome

**`reap make milestone --focus`가 생겼다.** 후보 셋 중 (c)다.

고른 근거가 전부 **실측**이다. (a)를 버린 것은 `gen-0032-plan`이 **한 번에 넷을 잘랐고** 다음에 할 것이 마지막이 아니라 첫 번째였기 때문이고, (b)를 버린 것은 `gen-0033-fix`가 옛 `ms-005`를 지웠을 때 **열린 넷이 다 안 보이는 상태**가 실제로 났기 때문이다.

`carve-milestone`에 **언제 주는지**를 적었다 — 여럿을 잘랐으면 지금 착수할 하나에만, 하나도 안 주면 다음 세션이 그것들의 존재를 모른다. 그리고 **왜 도구가 자동으로 안 붙이는지**도 함께 적었다. 이유 없이 플래그만 두면 다음에 "이거 자동으로 하면 되잖아"가 다시 나온다.

`mark milestone --focus`는 그대로 둔다 — 나중에 초점을 **옮기는** 일은 여전히 있다.

## 검증

- 실패하는 테스트 둘을 먼저 쓰고 확인한 뒤 구현했다. 둘째("`--focus`를 안 주면 안 붙는다")가 (a)를 막는 회귀 방지다
- `bun test` 114 pass / 0 fail · `typecheck` 0
- **빈 임시 프로젝트에서 확인** — `--focus`를 준 것만 `focus: true`이고 상태 줄이 그것을 낸다
