---
type: task
status: pending
---

# abort 시 consumed backlog가 pending으로 복원되지 않음

## 현상
generation start 시 backlog 아이템을 consumed로 마킹하고 consumedBy에 gen ID를 기록하는데,
해당 generation을 abort하면 backlog의 status가 consumed로 남아있음.

## 기대 동작
abort 시 해당 generation의 consumedBy를 가진 backlog 아이템을 pending으로 복원해야 함.

## 관련 코드
- `src/cli/commands/run/abort.ts` — abort execute phase에서 backlog 복원 로직 필요
- `src/core/backlog.ts:47` — markBacklogConsumed의 역연산 필요
