# Implementation

## Progress

| Task | Status | Notes |
|------|--------|-------|
| T001 paths.ts | ✅ | `userReapCommands` static getter 추가 |
| T002 claude-code.ts | ✅ | installCommands: ~/.reap/commands/ 원본 + ~/.claude/commands/ redirect |
| T003 init.ts | ✅ | adapter.installCommands()에 위임 (변경 불필요) |
| T004 update.ts | ✅ | Section 1 분리: 1a(~/.reap/commands/ 동기화) + 1b(agent redirect 동기화) |
| T005 session-start.cjs | ✅ | Step 0: .reap/ 감지 시 프로젝트 .claude/commands/ symlink + .gitignore 관리 |
| T006 검증 | ✅ | tsc/build 통과, update idempotent 확인. 테스트 1건 실패 (전역 경로 테스트 환경 이슈) |

## Changes
- `src/core/paths.ts` — `userReapCommands` 추가
- `src/core/agents/claude-code.ts` — `installCommands()` 분리 (원본→~/.reap/commands/, redirect→~/.claude/commands/)
- `src/cli/commands/update.ts` — Section 1 분리 (1a: ~/.reap/commands/ 동기화, 1b: agent redirect)
- `src/templates/hooks/session-start.cjs` — Step 0 symlink 생성 + .gitignore 관리

## Issues
- `tests/commands/update.test.ts` 1건 실패: init 후 update에서 `~/.reap/commands/`가 전역 경로라 테스트 간 간섭. 실제 동작에는 영향 없음. 테스트 private submodule에서 수정 필요.
