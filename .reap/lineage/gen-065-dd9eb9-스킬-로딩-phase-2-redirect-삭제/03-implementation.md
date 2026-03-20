# Implementation
## Progress
| Task | Status | Notes |
|------|--------|-------|
| T001 claude-code.ts | ✅ | redirect 생성 로직 제거 |
| T002 opencode.ts | ✅ | redirect 생성 로직 제거 |
| T003 update.ts | ✅ | Section 1b → redirect 삭제 마이그레이션 |
| T004 검증 | ✅ | 159 pass, Phase 2 삭제 동작 확인 |
## Changes
- `src/core/agents/claude-code.ts` — redirect 생성 제거
- `src/core/agents/opencode.ts` — redirect 생성 제거
- `src/cli/commands/update.ts` — redirect 동기화 → 삭제 마이그레이션
