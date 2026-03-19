# Objective

## Goal

merge.ts git ref 기반 리팩터 + reap merge CLI subcommand 구현

## Completion Criteria

1. merge.ts의 genome 읽기가 git ref 기반으로 동작 (`git show {ref}:{path}`)
2. `reap merge {branch}` CLI subcommand 동작
3. merge generation 생성 시 상대 branch의 genome/lineage를 git ref로 읽어 detect 수행
4. `bunx tsc --noEmit` 통과, `bun test` 통과, `npm run build` 통과

## Requirements

### Functional Requirements

- **FR-001**: `src/core/git.ts` 신규 — git ref 기반 파일 읽기 유틸 (`gitShow`, `gitLsTree`)
- **FR-002**: merge.ts 리팩터 — `extractGenomeDiff`, `detectDivergence`가 git ref 지원
- **FR-003**: `reap merge {branch}` CLI — Commander.js subcommand, MergeGenerationManager.create() 호출
- **FR-004**: detect 단계에서 git ref로 상대 branch genome 읽기 + 공통 조상 탐색 + 01-detect.md 생성

### Non-Functional Requirements

- 기존 normal lifecycle에 영향 없음
- git 명령 실패 시 명확한 에러 메시지

## Scope
- **Related Genome Areas**: domain/collaboration.md, domain/merge-lifecycle.md
- **Expected Change Scope**: src/core/git.ts (신규), src/core/merge.ts (수정), src/cli/commands/merge.ts (신규), src/cli/index.ts (subcommand 등록)
- **Exclusions**: reap.merge.* slash command 템플릿, reap pull/push, merge hooks, docs

## Genome Reference

- domain/collaboration.md: git ref 기반 읽기 (`git show`, `git ls-tree`)
- domain/merge-lifecycle.md: Detect 단계 명세

## Backlog (Genome Modifications Discovered)
None

## Background

gen-046에서 merge.ts를 파일시스템 기반으로 구현했으나, 실제 분산 환경에서는 git ref 기반으로 상대 branch의 genome/lineage를 읽어야 함. gen-047에서 워크플로우를 확정했으므로 이번에 구현한다.
