---
id: idea-524b20
slug: ralph-loop-harness
kind: research
title: ralph loop — 다른 harness는 무한 반복을 어떻게 정의하고 구현하는가
createdAt: 2026-09-11T22:06:12Z
status: open
---

## 무엇이 미정인가

`bk-5baff2`가 ralph를 REAP에 들이려 한다. 그 전에 **다른 harness가 이 개념을 무엇으로 정의하고 어떻게 구현하는지**를 확인했다. 아직 결론은 없다 — REAP가 무엇을, 어떤 표면(CLI인가 skill인가)으로 들일지는 정해지지 않았고, 사람이 아직 안 정했다.

## 확인한 것

### 가장 순수한 형태는 bash 한 줄이다

```bash
while :; do cat PROMPT.md | claude-code ; done
```

- **매 반복이 새 컨텍스트 창으로 시작한다.** 대화 이력이 아니라 **파일 시스템이 기억**이다
- 상태는 셋에 남는다 — 코드베이스 자체, TODO 파일, git 히스토리
- *"deterministically allocate the stack the same way every loop"* — 매번 같은 것을 같은 순서로 읽는다. 쌓지 않는다

### 파일 (발명자 쪽)

| 파일 | 무엇 |
|---|---|
| `PROMPT.md` | 매 반복 그대로 먹이는 지시 |
| `@fix_plan.md` | 남은 일의 우선순위 목록 |
| `@AGENT.md` | 빌드·실행법. *"keep it brief"* |
| `@specs/*` | 명세. 컨텍스트를 아끼려 **매 반복 다시 읽는다** |

### 규율

- **"one item per loop"** — 저자가 세 번 반복해 강조한다. 한 반복은 한 항목이다
- **backpressure가 품질을 만든다** — 테스트·타입 시스템·정적 분석기. *"It's the speed of the wheel turning that matters, balanced against the axis of correctness"*
- **실패는 프롬프트를 조율해 고친다** — *"Each time Ralph does something bad, Ralph gets tuned—like a guitar."*
- 알려진 실패 셋: 구현된 것을 안 됐다고 가정, placeholder 구현, 검색 비결정성

### 멈춤이 약하다

저자가 드는 멈춤은 셋뿐이다 — 사람의 개입(`git reset --hard` 후 재시작), TODO 소진, 사람의 판단. **스스로 멈추는 조건이 형식화돼 있지 않다.**

구현체 하나는 그것을 조인다 — `ralph.sh [--tool amp|claude] [max_iterations]`, 기본 10회. `prd.json`의 항목이 전부 통과하면 완료 표식을 낸다. 즉 **반복 상한 + 완료 판정 둘**을 둔다.

### 저자 본인의 한계 고백

- greenfield에서 잘 된다
- **기존 코드베이스에는 못 쓴다** — *"There's no way in heck would I use Ralph in an existing code base"*
- 명세가 모호하거나 모순되면 실패한다
- 컴파일 에러가 연쇄하면 컨텍스트를 채우고 무너진다

### 이 harness에도 이미 있다

Claude Code에 `/loop`이 있다. 간격을 주거나(`/loop 5m /foo`), 빼면 모델이 스스로 속도를 정한다. 그 모드에서 모델이 다음 깨어날 시각과 이유를 직접 정하고 스스로 끝낸다.

**다른 점이 결정적이다** — 프로세스를 죽였다 살리는 것이 아니라 **같은 세션을 깨운다.** 컨텍스트가 이어진다. ralph의 핵심인 "매 반복 새 컨텍스트"가 아니다.

## REAP에 걸리는 것 (관측이지 결론이 아니다)

- ralph의 `@fix_plan.md`·`prd.json`은 REAP의 **backlog·milestone tasks**와 같은 자리다. 새로 만들 이유가 약하다
- ralph의 `@AGENT.md`는 REAP의 **genome + environment/summary**다. 이미 매 세션 주입된다
- ralph의 "매 반복 spec을 다시 읽는다"는 REAP의 **ctx 상태 줄 + 지도**와 같은 사고다
- **비는 것은 멈춤과 상한이다.** REAP에는 반복 상한도 완료 판정도 없다
- `#34`의 선이 걸린다 — **REAP는 상태를 적을 뿐 턴을 만들지 않는다.** ralph는 정의상 턴을 만든다. REAP가 들인다면 턴을 만드는 쪽이 아니라 **턴이 매번 읽을 것을 정하는 쪽**이어야 할 수 있다

## 무엇이 정해지면 졸업하는가

**`bk-5baff2`가 설계를 내고 사람이 표면(CLI인가 skill인가)을 정하면 졸업한다.**

- 설계가 서면 → `ps-4f2a91`의 spec으로 간다. 이 문서는 지운다
- "REAP는 안 들인다"로 결론 나면 → 그 판정과 이유를 `02-flow.md`의 *무엇이 강제되지 않는가* 옆에 적고 이 문서를 지운다
- 둘 다 아니면 열어 둔다. **다만 `/loop`으로 대체 가능한지를 먼저 답해야 한다** — 이미 있는 것을 다시 만드는 것이 가장 비싼 실패다

## 출처

- Geoffrey Huntley, "Ralph Wiggum as a software engineer" — <https://ghuntley.com/ralph/> (**1차** — 발명자 본인 · 확인 2026-09-12)
- snarktank/ralph — <https://github.com/snarktank/ralph> (**1차** — 구현체 · 확인 2026-09-12)
- Claude Code의 `/loop` skill과 `ScheduleWakeup` 도구 (**1차** — 이 세션이 도는 harness의 문서 · 확인 2026-09-12)
