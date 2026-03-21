# Objective

## Goal
Script Orchestrator Architecture 전체 테스트 커버리지 작성 — run command scripts + 미테스트 core modules

## Completion Criteria
- 모든 `src/cli/commands/run/*.ts` command scripts에 대한 직접 테스트 존재
- 미테스트 core modules (`backlog.ts`, `run-output.ts`, `commit.ts`, `lineage.ts`, `hook-engine.ts` 보강) 테스트 추가
- E2E 시나리오 테스트로 command → core 통합 검증
- `bun test` 전체 통과

## Requirements

### Functional Requirements
- FR1: run command dispatcher (`run/index.ts`) 테스트 — unknown command, valid command routing
- FR2: 각 command script의 gate/phase 로직 테스트 — emitOutput/emitError 호출 검증
- FR3: `backlog.ts` unit tests — scanBacklog, markBacklogConsumed, parseFrontmatter
- FR4: `run-output.ts` unit tests — emitOutput, emitError JSON 포맷 검증
- FR5: `commit.ts` unit tests — checkSubmodules, commitChanges
- FR6: `lineage.ts` unit tests — listMeta, readMeta
- FR7: E2E 시나리오 — start → objective → next → planning 등 lifecycle 흐름

### Non-Functional Requirements
- 테스트는 sandbox(temp dir) 기반, 실제 .reap 프로젝트에 영향 없음
- 기존 286개 테스트 유지 + 신규 추가
- 멀티 세대에 걸쳐 진행 가능 (이번 세대는 가능한 범위까지)

## Design

### Selected Design
- command scripts 테스트: `process.exit` mock + `console.log/error` capture로 emitOutput/emitError 검증
- core module 테스트: 기존 패턴 (temp dir sandbox) 따름
- E2E 테스트: `tests/e2e/` 하위에 시나리오별 파일

## Scope
- **Related Genome Areas**: conventions.md (Testing Conventions), constraints.md (Validation Commands)
- **Expected Change Scope**: `tests/` 디렉토리에 신규 테스트 파일 추가
- **Exclusions**: 소스 코드 변경 없음 (테스트만 추가)

## Genome Reference
- conventions.md: "E2E 테스트: sandbox(temp dir)에서 .reap 프로젝트 셋업 후 실제 동작 검증"

## Backlog (Genome Modifications Discovered)
None

## Background
gen-087~092에서 28개 slash command를 Script Orchestrator 패턴으로 전환 완료. command scripts에 대한 직접 테스트가 없어 커버리지 보강 필요.
