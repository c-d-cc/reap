# Implementation — gen-007-e29b32

## Completed Tasks

| Task | Description | Status |
|------|-------------|--------|
| T001 | `commands/backlog.ts` — backlog create/list 로직 분리 | Done |
| T002 | `commands/make.ts` — make 로직, createBacklog 재사용 | Done |
| T003 | `commands/cruise.ts` — cruise 로직 분리 | Done |
| T004 | `commands/install-skills.ts` — install-skills 로직 분리 | Done |
| T005 | `index.ts` — inline 로직 전부 제거, top-level import 통일 | Done |
| T006 | typecheck + build + e2e 62/62 + 각 command 동작 확인 | Done |

## Changes
- `src/cli/commands/backlog.ts` — 신규
- `src/cli/commands/make.ts` — 신규
- `src/cli/commands/cruise.ts` — 신규
- `src/cli/commands/install-skills.ts` — 신규
- `src/cli/index.ts` — inline 로직 제거, 7개 command 모두 top-level import + execute 패턴

## Discovered Issues
- `dist/templates/templates/` 중복 디렉토리 — build script의 `cp -r src/templates dist/templates`가 이미 dist/templates에 있는 templates를 중첩 복사. 별도 backlog 대상.
