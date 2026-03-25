# Planning — gen-003-851a08

## Goal
createBacklog 함수 복원 — v0.15 패턴 기반 표준 backlog 생성

## Spec
backlog 생성을 표준화하여 AI/사용자 모두 일관된 형식으로 backlog를 작성하도록 함.

## Implementation Plan

- [ ] T001: backlog.ts에 `createBacklog()` 함수 추가 (v0.15 패턴)
- [ ] T002: backlog.ts에 `toKebabCase()` 헬퍼 추가
- [ ] T003: CLI command `reap backlog create` 추가 (cli/index.ts)
- [ ] T004: typecheck + build 통과 확인
- [ ] T005: e2e 테스트 — backlog create CLI 검증

## Completion Criteria
1. `createBacklog()` 함수가 표준 템플릿으로 .md 파일 생성
2. `reap backlog create --type task --title "test" --priority high` CLI 동작
3. 생성된 파일이 scanBacklog()로 정상 파싱
4. typecheck + build + 기존 e2e 통과
