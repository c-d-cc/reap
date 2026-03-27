---
type: task
status: consumed
consumedBy: gen-039-a7a1ea
consumedAt: 2026-03-27T09:37:45.922Z
priority: high
createdAt: 2026-03-27T08:35:29.219Z
---

# migration 중단/재개 지원 — 진행 상태 저장 + 복구

## Problem

현재 `reap init --migrate`는 multi-phase로 진행되는데 (confirm → execute → genome-convert → vision → complete), 중간에 API 에러나 세션 중단이 발생하면 어디까지 진행했는지 알 수 없어 처음부터 다시 시작해야 함. execute phase에서 파일 복사/변환이 일부만 완료된 상태에서 끊기면 프로젝트가 불완전한 상태에 놓임.

## Solution

1. **진행 상태 저장**: `.reap/migration-state.yml`에 현재 phase, 완료된 step 목록, 타임스탬프 기록
2. **재개 감지**: `reap init --migrate` 시작 시 migration-state.yml 존재 여부 확인 → 중단 지점에서 재개
3. **멱등성 보장**: 각 step이 이미 완료되었으면 skip (파일 존재 체크 등)
4. **완료 시 정리**: migration 성공 후 migration-state.yml 삭제

## Files to Change

- `src/cli/commands/migrate.ts` — phase/step 상태 저장/로드, 재개 로직
- `src/types/index.ts` — MigrationState 타입 추가 (선택)
- `.reap/migration-state.yml` — 런타임 생성/삭제되는 상태 파일
