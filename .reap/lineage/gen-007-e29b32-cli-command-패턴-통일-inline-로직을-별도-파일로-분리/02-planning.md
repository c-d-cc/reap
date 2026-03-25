# Planning — gen-007-e29b32

## Goal
CLI command 패턴 통일 — inline 로직을 별도 파일로 분리

## Source Backlog
`cli-command-pattern-refactor.md`

## Completion Criteria
1. index.ts에 비즈니스 로직 inline 없음 — 모든 action은 execute() 호출만
2. backlog create와 make backlog 간 코드 중복 없음
3. 기존 e2e 전부 통과
4. `reap make backlog`, `reap backlog create/list`, `reap cruise`, `reap install-skills` 모두 동작

## Tasks

- [ ] T001: `src/cli/commands/backlog.ts` 생성 — backlog create/list 로직 분리
- [ ] T002: `src/cli/commands/make.ts` 생성 — make 로직 (backlog create 재사용, 중복 제거)
- [ ] T003: `src/cli/commands/cruise.ts` 생성 — cruise 로직 분리
- [ ] T004: `src/cli/commands/install-skills.ts` 생성 — install-skills 로직 분리
- [ ] T005: `src/cli/index.ts` 정리 — inline 로직 전부 제거, top-level import + execute 호출 통일
- [ ] T006: typecheck + build + e2e + 각 command 동작 확인
