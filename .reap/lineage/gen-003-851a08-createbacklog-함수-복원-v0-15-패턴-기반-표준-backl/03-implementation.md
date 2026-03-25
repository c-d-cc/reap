# Implementation — gen-003-851a08

## Goal
createBacklog 함수 복원 — v0.15 패턴 기반 표준 backlog 생성

## Completed Tasks

| Task | Description | Status |
|------|-------------|--------|
| T001 | backlog.ts — createBacklog() 함수 추가 | Done |
| T002 | backlog.ts — toKebabCase() 헬퍼 추가 | Done |
| T003 | cli/index.ts — `reap backlog create/list` CLI command 추가 | Done |
| T004 | typecheck + build 통과 | Done |
| T005 | CLI 동작 검증 + e2e-init.sh 62/62 통과 | Done |

## Changes
- `src/core/backlog.ts` — createBacklog(), toKebabCase(), CreateBacklogOptions 추가
- `src/cli/index.ts` — `reap backlog <action>` command 추가 (create, list)
