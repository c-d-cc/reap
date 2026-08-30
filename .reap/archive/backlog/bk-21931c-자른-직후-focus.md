---
id: bk-21931c
slug: 자른-직후-focus
type: design
title: make milestone이 focus를 붙이지 않아 자른 직후 상태 줄에 안 보인다
createdAt: 2026-08-23T04:41:11Z
status: consumed
consumedBy: gen-0035-exec
---

> **해결됨 — `gen-0035-exec`. 후보 (c)를 골랐다.** `reap make milestone ... --focus`가 초점을 함께 찍는다. (a)(자동)는 **넷을 한 번에 자른 실측**이 반증했다 — 자동이면 마지막에 잘린 것이 초점을 가져가는데 다음에 할 것은 첫 번째였다. (b)(열린 것이 하나뿐이면 그것)는 열린 milestone이 넷인 지금 상태를 못 푼다. *"이걸 지금 할 것인가"는 판단이고 도구는 그 판단을 스탬프한다.* `carve-milestone`이 언제 주는지를 말한다. 아래 본문은 고치지 않는다.

## 무엇이 문제인가

**`make milestone`은 `focus`를 붙이지도 세션을 바인딩하지도 않는다.** 그래서 milestone을 자른 직후 `reap ctx`의 상태 줄에 그것이 나오지 않는다 — 열린 milestone이 그것 하나뿐이어도 그렇다.

`pickMilestone`(`src/ctx.ts`)의 우선순위가 **바인딩 > `--milestone` > `focus`**인데, `make milestone`이 셋 중 아무것도 만들지 않기 때문이다.

지금까지 자른 milestone 여덟 전부에서 사람이 `reap mark milestone <id> --focus`를 따로 쳤다.

## 이력 — 절반만 해소된 것을 다 해소된 걸로 읽었다

`tracks.md`에 *"갓 자른 milestone은 상태 줄에 안 나오고, focus를 붙일 도구도 없다"*가 있었다. 둘 중 **뒤의 것만** `ms-002`에서 해소됐다(`mark milestone --focus` 구현). `gen-0027-exec`이 `ms-003`을 정리하며 그 트랙을 통째로 지웠는데, **앞의 것은 그대로였다.**

## 정해야 할 것

- **`make milestone`이 자동으로 `focus`를 붙이는가.** 붙이면 여러 milestone이 열려 있을 때 마지막에 자른 것이 항상 초점을 뺏는다. 자를 때는 그게 맞는 경우가 많지만 항상은 아니다
- **아니면 `pickMilestone`에 "열린 것이 하나뿐이면 그것"을 더하는가.** 그러면 `make`는 그대로 두고 조회 쪽만 관대해진다. 다만 열린 것이 둘이 되는 순간 다시 안 보인다
- **아니면 `--focus` 플래그를 `make milestone`에 두는가.** 명시적이지만 사람이 매번 기억해야 한다

## 근거

- `src/entries.ts`의 `makeMilestone` — `focus`도 `bindSession`도 없다
- `src/ctx.ts`의 `pickMilestone` — 바인딩 > `--milestone` > `focus`
- `.reap/archive/generations/gen-0027-exec-*.md` — 트랙을 지운 세대
