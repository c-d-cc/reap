---
id: gen-0005-plan
slug: ctx의-스코프와-훅-skill-경계
type: plan
title: ctx의 스코프와 훅·skill 경계
startedAt: 2026-08-22T16:20:01Z
startCommit: e2569d7
status: closed
closedAt: 2026-08-22T16:23:14Z
endCommit: 1d54f2e
---

## Intent

`ctx`를 **스코프 둘**로 가른다. 훅은 어떤 작업에도 적용되는 것만 넣고, milestone 맥락은 세대를 여는 skill이 부른다.

gen-0004-plan이 "무엇을 싣는가"를 세 등급으로 정했다면, 이 세대는 **"언제 싣는가"**를 정한다. 남은 문제가 그것이었다 — 등급을 나눠도 여전히 매 세션 전부 주입되고, REAP 작업이 아닌 세션에는 milestone 맥락 전부가 낭비다.

**끝나면:** `ps-4f2a91`에 스코프 둘과 상태 줄이 규정되고, ms-001의 `tasks/1-3`·`1-4`가 그에 맞게 갱신된다. 코드는 exec 세대가 한다.

## 정해야 할 것 셋

1. 두 스코프의 경계 — 무엇이 훅이고 무엇이 skill인가
2. **상태 줄**에 무엇이 들어가는가
3. 이 거래의 대가를 어디에 적는가 — skill이 안 불리는 세션은 milestone 맥락 없이 일한다

## 가르는 기준

정적이냐 동적이냐가 아니다. `decisions.md`도 `handoff.md`도 세션 중에 변하지 않는다.

**어떤 작업에도 적용되는가, REAP 흐름에 들어갈 때만 필요한가.**

`genome/`의 행동 규칙과 제약은 질문에 답할 때도 적용된다. `environment/summary.md`는 코드를 건드리면 무조건 필요하다. 반면 `handoff.md`는 세대를 열 때 필요하고, `tasks/`의 상세는 그 task를 시작할 때 필요하다.

그리고 **`evolve` skill은 이미 그렇게 하고 있다** — "milestone의 계획 항목, `handoff.md`, 사람의 요청 순으로 본다"가 첫머리에 있다. 훅이 그것을 또 주입하는 것은 중복이었다.

## Outcome

### 규범 (`ps-4f2a91`)

[agent 층](../../../docs/superpowers/specs/reap/06-agent.md)에 스코프 둘을 규정했다.

- **세션 스코프** (`ctx --hook`) — `genome/` · `environment/summary.md` · `memory/` · 상태 줄. 훅이 부른다
- **작업 스코프** (`ctx`) — 위 전부 + milestone 넷 + `tasks/` 목록 + 열린 세대 기록 + (나중에) idea 목록·plan 규약 색인·orchestrate 상태. skill이 부른다

**상태 줄**을 새로 규정했다. 본문 없는 사실 몇 줄 — focus/바인딩된 milestone, **열린 세대**, 흐름의 입구. 열린 세대를 알리는 것이 핵심이다: 세션이 중간에 죽고 다음 세션이 그걸 모르면 `evolve`가 새 세대를 열어버리고 그 잘못은 아무 데서도 드러나지 않는다.

상태를 도구가 확정하는 이유도 적었다 — skill에 맡기면 agent가 매번 `.session`을 정확히 읽고 해석할 것을 기대하게 되고, 그것은 바인딩을 도구에 둔 이유와 정면으로 어긋난다.

skill 표의 `evolve`·`complete` 행과 [배포](../../../docs/superpowers/specs/reap/08-delivery.md)의 훅 선언도 맞췄다.

### milestone (ms-001)

`tasks/1-3-ctx.md`를 스코프 둘 기준으로 다시 썼고(증명해야 할 동작 13개), `tasks/1-4`에 훅이 부르는 것이 `ctx --hook`뿐임과 skill이 작업 스코프를 부른다는 것을 넣었다.

## 대가를 문서에 적었다

이 설계는 **skill이 불릴 확률에 건다.** `evolve`를 부르지 않는 세션은 `decisions.md`를 모른 채 일한다.

받는 이유는 두 실패의 성질이 다르기 때문이다 — 매 세션 전부 주입하는 낭비는 **매번 확실히** 발생하고 사람이 느낀다. 맥락 없이 일하는 실패는 **가끔** 발생하고 조용하다. 그러나 조용한 쪽을 상태 줄이 매 세션 가리키고, `genome/evolution.md`가 규칙으로 못박을 수 있다. 규범에 이 거래를 명시적으로 남겼다 — **나중에 이것이 틀렸다고 판정될 때 무엇을 뒤집어야 하는지가 분명해야 한다.**

## Notes

코드는 건드리지 않았다. gen-0008-exec가 gen-0004-plan과 gen-0005-plan를 함께 구현한다.
