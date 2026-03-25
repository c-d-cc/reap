# Planning — gen-008-e8af04

## Goal
backlog frontmatter에 createdAt/consumedAt 타임스탬프 추가

## Tasks
- [ ] T001: `BacklogItem` 인터페이스에 `createdAt?`, `consumedAt?` 추가
- [ ] T002: `createBacklog()` — frontmatter에 `createdAt` ISO timestamp 추가
- [ ] T003: `consumeBacklog()` — frontmatter에 `consumedAt` ISO timestamp 추가
- [ ] T004: `scanBacklog()` — createdAt, consumedAt 파싱
- [ ] T005: typecheck + build + e2e + CLI 동작 확인

## Completion Criteria
1. `reap make backlog`으로 생성한 파일에 createdAt 포함
2. `reap run start --backlog`으로 consume된 파일에 consumedAt 포함
3. `reap backlog list`에서 createdAt/consumedAt 표시
4. 기존 e2e 통과
