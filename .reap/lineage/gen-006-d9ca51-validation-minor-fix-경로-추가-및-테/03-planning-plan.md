# Implementation Plan

## Summary
소규모 세대. 템플릿 1개 수정 + 테스트 1개 수정 + export 추가.

## Tasks

### Phase 1: 구현
- [x] T001 `src/templates/commands/reap.validation.md` 판정 기준에 minor fix partial 경로 추가
- [x] T002 `src/cli/commands/init.ts`에서 COMMAND_NAMES export
- [x] T003 `tests/commands/init.test.ts`에서 하드코딩 제거, COMMAND_NAMES.length 사용
- [x] T004 `.reap/commands/reap.validation.md`, `.claude/commands/reap.validation.md` 동기화

### Phase 2: 검증
- [x] T005 `bun test` 통과
- [x] T006 `bunx tsc --noEmit` 통과
