---
type: task
status: pending
priority: medium
---

# reap.next가 다음 stage command를 자동 실행

## 문제

현재 stage 전환 시 3단계 호출 필요:
1. `/reap.objective` (작업)
2. `reap run objective --phase complete` (검증)
3. `/reap.next <token>` (전환)
4. `/reap.planning` (다음 stage 수동 호출 — 불필요)

유저가 `/reap.next` 후 다시 다음 stage command를 호출해야 하는 것은 불필요한 단계.

## 개선 방향

`reap.next`가 stage 전환 후 자동으로 다음 stage의 `reap run <stage>` 를 실행하여 output을 반환.

흐름 변경:
- 기존: `/reap.next` → (유저/agent가 수동으로) `/reap.planning`
- 변경: `/reap.next` → 자동으로 `reap run planning` 실행 → planning context 반환

이렇게 하면:
- 수동 모드: `/reap.objective` → `/reap.next` → (planning 자동 시작) → `/reap.next` → ...
- evolve subagentPrompt가 단순해짐 (stage command 개별 호출 불필요)
