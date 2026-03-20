# Objective

## Goal
`reap update`에 npm 패키지 자체 업그레이드 로직 추가. 새 버전이 있으면 `npm update -g @c-d-cc/reap` 실행 후 프로젝트 동기화.

## Completion Criteria
- `reap update` 실행 시 npm registry에서 최신 버전 확인
- 새 버전이 있으면 자동 업그레이드 후 프로젝트 동기화
- 이미 최신이면 기존처럼 프로젝트 동기화만 수행
