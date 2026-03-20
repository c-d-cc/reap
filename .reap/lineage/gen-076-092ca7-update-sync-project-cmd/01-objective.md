# Objective

## Goal
`reap update`에서 `~/.reap/commands/` 동기화 후 현재 프로젝트의 `.claude/commands/`에도 즉시 복사.
세션 재시작 없이 update 즉시 최신 커맨드 사용 가능하게.

## Completion Criteria
- update.ts에서 프로젝트 레벨 commands 복사 로직 추가
- E2E 테스트 통과
