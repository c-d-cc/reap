---
id: bk-1ebbd3
slug: carve-milestone-skill
type: design
title: milestone을 넷 잘랐는데 자르는 법이 어디에도 안 적혀 있다
createdAt: 2026-08-23T04:59:18Z
status: consumed
consumedBy: gen-0031-exec
---

> **해결됨 — `gen-0031-exec`.** `plugin/skills/carve-milestone/SKILL.md`가 생겼고 skill은 4종이 됐다. **이 항목은 `gen-0033-fix`가 사후에 만든 것이다** — 원래는 `ms-005`라는 milestone으로 잡혔는데, 세대 하나로 끝나는 일에 milestone을 만든 것이 잘못이라 backlog 항목으로 되돌렸다.

## 무엇이 문제인가

**milestone을 넷 잘랐는데 자르는 법이 어디에도 안 적혀 있다.** `06-agent.md:111`이 `carve-milestone` skill이 무엇을 담을지 한 줄로 적어뒀을 뿐, 실제 자르기는 매번 즉흥 판단이었다.

그 넷을 자르며 나온 것들 — 크기 기준, 종료 조건을 검증 가능한 상태로 쓰는 법, `Out of Scope`의 값, 자르기 전에 전제를 검증하는 일, fitness 질문을 미리 쓰는 것, backlog로 충분한 일에 milestone을 만들지 않는 것 — 이 **어디에도 안 적혀 있고 세대 기록과 함께 archive로 내려갔다.**

`ms-003`이 세운 규칙("정해진 것은 그것이 규율할 자리에 반영되어야만 살아남는다")을 적용하면 **그 자리가 이 skill이다.**

## 무엇을 담아야 하는가

- 자르기 전에 그 계획의 전제를 실제 흔적에 대보는 것 — **첫 동작이어야 한다**
- 크기 기준. fitness 세 번이 확인한 숫자가 있다
- `Exit Criteria`를 사람이 판정할 수 있는 상태로 쓰는 법
- `Out of Scope`가 안쪽만큼 중요한 이유
- fitness 질문을 자를 때 미리 쓰는 것
- **부르지 않는 경우** — backlog 항목 하나로 충분하면 자르지 않는다
- milestone 종료 절차(`06-agent.md`가 이 skill의 몫이라고 적어둔 것): fitness → `cleanup` → `mark milestone --closed`

## 함정

- **`evolve`·`complete`·`cleanup`과 겹쳐 적지 않는다.** 겹치면 두 곳에 있게 되고 어긋난다. 실제로 `complete`가 종료 절차 전체를 담고 있었다
- **겪은 것만 적는다.** 자르기를 네 번 한 경험이 근거이고 그 밖은 상상이다

## 근거

- `docs/superpowers/specs/reap/06-agent.md:111` — 이 skill이 무엇을 담을지 적어둔 한 줄
- `docs/superpowers/specs/reap/04-commands.md` — milestone 기록의 어휘
