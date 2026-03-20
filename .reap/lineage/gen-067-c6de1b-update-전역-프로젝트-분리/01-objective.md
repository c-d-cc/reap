# Objective

## Goal
reap update 전역/프로젝트 분리 + brainstorm 서버 파일 복사 제거

## Completion Criteria
1. `reap update`가 프로젝트 밖에서도 전역 동기화(commands, templates, session hook) 실행
2. `.reap/brainstorm/`에 서버 파일 복사 제거 (init, update 모두)
3. 프로젝트 레벨 작업(legacy 정리, lineage 마이그레이션)은 .reap/ 존재 시에만 실행
4. bun test, tsc, build 통과
