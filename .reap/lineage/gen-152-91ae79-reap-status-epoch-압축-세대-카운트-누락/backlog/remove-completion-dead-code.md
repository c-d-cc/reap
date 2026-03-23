---
type: task
status: pending
priority: low
---

# completion.ts의 dead code phase 제거

`src/cli/commands/run/completion.ts`의 `consume`과 `archive` phase는 dead code.

## 현황
- 메인 플로우: `retrospective` → `feedKnowledge` (consume + archive + compress 한 번에 처리)
- `consume` / `archive` phase로 진입하는 코드 경로 없음
- phase 토큰 검증도 없어 nonce locking 체인에서 빠져 있음

## 작업
- `completion.ts`에서 `if (phase === "consume")` ~ `if (phase === "archive")` 블록 제거
- merge-completion의 `archive` phase는 실제 메인 플로우이므로 유지
