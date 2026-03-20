# Objective

## Goal
update.ts에서 프로젝트 `.claude/commands/reap.*` 파일을 삭제하는 레거시 클린업 로직 제거.
session-start 훅이 프로젝트 레벨에 복사한 커맨드 파일을 reap update가 지워버리는 충돌 해결.

## Completion Criteria
- update.ts의 157~167행 삭제 로직 제거
- reap update 실행 시 .claude/commands/ 파일이 유지됨
- 빌드/테스트 통과
