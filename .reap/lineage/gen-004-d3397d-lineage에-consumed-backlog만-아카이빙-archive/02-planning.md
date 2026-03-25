# Planning — gen-004-d3397d

## Goal
lineage에 consumed backlog만 아카이빙 — archive.ts 수정

## Implementation Plan

- [ ] T001: archive.ts — life/ 복사 시 backlog/ 제외, consumed만 별도 복사
- [ ] T002: typecheck + build
- [ ] T003: e2e 테스트 검증 (기존 e2e-lifecycle.sh, e2e-multi-generation.sh)

## Completion Criteria
1. lineage 아카이브에 consumed backlog만 포함
2. pending backlog는 life/backlog/에 유지
3. 기존 e2e 테스트 전부 통과
