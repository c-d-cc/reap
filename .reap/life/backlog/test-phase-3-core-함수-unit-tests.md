---
type: task
status: pending
priority: high
createdAt: 2026-03-25T15:41:37.081Z
---

# Test Phase 3: core 함수 unit tests

## Problem
core 모듈 (backlog.ts, archive.ts, generation.ts, nonce.ts, compression.ts 등)에 unit test가 없음.

## Solution
대상 모듈 (우선순위 순):
- backlog.ts — createBacklog, scanBacklog, consumeBacklog, toKebabCase
- archive.ts — archiveGeneration (consumed-only backlog 검증)
- generation.ts — create, countLineage, ID 생성
- nonce.ts — generateToken, verifyToken
- compression.ts — compressLineage (threshold, protected count)
- lifecycle.ts — nextStage, prevStage

## Files to Change
- tests/unit/backlog.test.ts
- tests/unit/archive.test.ts
- tests/unit/generation.test.ts
- tests/unit/nonce.test.ts
- tests/unit/compression.test.ts
- tests/unit/lifecycle.test.ts
