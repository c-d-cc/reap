# Objective

## Goal
1. onGenerationComplete.version-bump.md 훅 삭제
2. 프로젝트 레벨 `.claude/commands/reapdev.versionBump.md` 커맨드 생성
   - 수동으로 호출하여 version bump 수행
   - patch/minor/major 판단 로직 포함

## Completion Criteria
- version-bump 훅 파일 삭제
- reapdev.versionBump 커맨드 동작 확인
- onGenerationComplete 훅에서 version-bump 관련 로직 없음
