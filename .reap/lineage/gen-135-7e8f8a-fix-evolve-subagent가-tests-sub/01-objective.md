# Objective

## Goal
fix: evolve subagent가 tests submodule 커밋을 누락하는 문제 해결

## Completion Criteria
1. `evolve.ts`의 `buildSubagentPrompt()`에 Submodule Commit Rules 섹션이 포함된다.
2. `merge-evolve.ts`의 prompt에도 동일한 Submodule Commit Rules가 포함된다.
3. 기존 테스트가 통과한다 (`bunx tsc --noEmit`, `bun test`).

## Requirements

### Functional Requirements
1. FR-01: `buildSubagentPrompt()`가 생성하는 prompt에 "## Submodule Commit Rules" 섹션을 추가한다.
2. FR-02: 해당 섹션에 tests/ submodule dirty 확인, 커밋/push, parent ref 업데이트 절차를 명시한다.
3. FR-03: `merge-evolve.ts`의 inline prompt에도 동일한 Submodule Commit Rules를 추가한다.

### Non-Functional Requirements
1. NFR-01: 기존 prompt 구조를 깨뜨리지 않는다.

## Design

### Selected Design
- `evolve.ts`의 `buildSubagentPrompt()` 함수 내 Commit Rules 섹션 뒤에 Submodule Commit Rules 섹션을 추가
- `merge-evolve.ts`의 inline prompt 배열 끝부분(Handling Issues 앞)에 동일한 규칙 추가

## Scope
- **Related Genome Areas**: conventions.md (Git Conventions)
- **Expected Change Scope**: `src/cli/commands/run/evolve.ts`, `src/cli/commands/run/merge-evolve.ts`
- **Exclusions**: 런타임 로직 변경 없음, prompt 텍스트만 추가

## Genome Reference
- conventions.md: Git Conventions — 커밋 메시지 형식, 한 커밋 = 한 논리적 변경

## Backlog (Genome Modifications Discovered)
None

## Background
evolve subagent가 completion 시 tests/ submodule 내부의 변경사항을 별도로 커밋+push하지 않아, "Dirty submodules detected" 경고가 발생해도 무시하는 문제가 있다.

