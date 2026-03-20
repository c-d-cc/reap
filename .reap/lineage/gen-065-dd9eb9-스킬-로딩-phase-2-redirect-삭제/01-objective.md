# Objective

## Goal
스킬 로딩 최적화 Phase 2 — ~/.claude/commands/ redirect 삭제

## Completion Criteria
1. `reap update` 시 `~/.reap/commands/`가 존재하면 `~/.claude/commands/reap.*.md` redirect 파일을 삭제한다
2. `ClaudeCodeAdapter.installCommands()`에서 redirect 생성 로직을 제거한다
3. `update.ts`에서 redirect 동기화를 삭제 마이그레이션으로 교체한다
4. v0.7.0 미만에서 올라온 유저는 Phase 1(redirect 생성) → 다음 update에서 Phase 2(삭제) 순서로 동작
5. bun test, tsc, build 통과

## Requirements
### Functional Requirements
- **FR-001**: `ClaudeCodeAdapter.installCommands()` — redirect 생성 제거, `~/.reap/commands/` 원본만 설치
- **FR-002**: `update.ts` — Section 1b를 redirect 동기화 → redirect 삭제 마이그레이션으로 교체
- **FR-003**: 삭제 조건: `~/.reap/commands/`가 존재하고 원본 파일이 있을 때만 redirect 삭제

## Scope
- **Expected Change Scope**: `src/core/agents/claude-code.ts`, `src/core/agents/opencode.ts`, `src/cli/commands/update.ts`
