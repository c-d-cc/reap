# Objective

## Goal
lineage 아카이빙 시 backlog를 backlog/ 하위 폴더에 저장하도록 명시

## Completion Criteria
1. `reap.next.md`의 backlog 아카이빙 경로가 `.reap/lineage/[gen-id]/backlog/`로 명시된다
2. `bun test`, `bunx tsc --noEmit`, 빌드 통과

## Requirements

### Functional Requirements
- FR-001: `reap.next.md` — backlog 아카이빙 시 `backlog/` 하위 폴더 경로 명시

### Non-Functional Requirements
- 없음

## Scope
- **Related Genome Areas**: domain/lifecycle-rules.md
- **Expected Change Scope**: src/templates/commands/reap.next.md
- **Exclusions**: 기존 lineage 폴더 구조 수정은 이미 수동으로 완료됨

## Genome Reference
- domain/lifecycle-rules.md: Backlog Status Management 섹션

## Backlog (Genome Modifications Discovered)
None

## Background
- gen-016, gen-017에서 backlog 파일이 lineage gen 폴더 루트에 artifact와 섞여 저장되는 문제 발생
