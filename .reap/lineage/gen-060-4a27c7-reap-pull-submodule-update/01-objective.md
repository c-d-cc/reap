# Objective

## Goal
reap.pull submodule update 자동화

## Completion Criteria
1. `reap.pull` 슬래시 커맨드에서 merge/fast-forward 후 `git submodule update --init` 실행 단계가 포함된다
2. `bun test` 전체 통과
3. `bunx tsc --noEmit` 통과
4. `npm run build` 성공

## Requirements

### Functional Requirements
- **FR-001**: `reap.pull.md`의 Phase 1.5 (fast-forward) 및 Phase 2 (merge) 후에 `git submodule update --init` 실행 단계 추가

### Non-Functional Requirements
없음

## Scope
- **Related Genome Areas**: constraints.md (Slash Commands)
- **Expected Change Scope**: `src/templates/commands/reap.pull.md`
- **Exclusions**: reap.merge.* 커맨드 변경 없음

## Genome Reference
- `constraints.md` — Slash Commands 목록

## Backlog (Genome Modifications Discovered)
None

## Background
- reap.pull 실전 테스트 중 발견: merge 후 submodule 포인터만 업데이트되고 working tree는 이전 커밋을 가리킴
