---
type: task
status: pending
priority: medium
---

# Backlog frontmatter에 createdAt/consumedAt 타임스탬프 추가

## Problem
backlog 항목에 생성/소비 시점 기록이 없음. 추후 분석이나 정리 시 시간 정보 필요.

## Solution
1. `createBacklog()` — frontmatter에 `createdAt: ISO timestamp` 추가
2. `consumeBacklog()` — frontmatter에 `consumedAt: ISO timestamp` 추가
3. `BacklogItem` 타입에 `createdAt?`, `consumedAt?` 필드 추가
4. `scanBacklog()`에서 파싱

## Files to Change
- src/core/backlog.ts — createBacklog, consumeBacklog, scanBacklog, BacklogItem
