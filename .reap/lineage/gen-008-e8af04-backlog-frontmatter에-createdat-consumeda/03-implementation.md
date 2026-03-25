# Implementation — gen-008-e8af04

## Completed Tasks

| Task | Description | Status |
|------|-------------|--------|
| T001 | BacklogItem에 createdAt?, consumedAt? 추가 | Done |
| T002 | createBacklog() — createdAt ISO timestamp | Done |
| T003 | consumeBacklog() — consumedAt ISO timestamp | Done |
| T004 | scanBacklog() — createdAt, consumedAt 파싱 | Done |
| T005 | typecheck + build + e2e 62/62 + CLI 확인 | Done |

## Changes
- `src/core/backlog.ts` — BacklogItem 인터페이스, createBacklog, consumeBacklog, scanBacklog 수정
