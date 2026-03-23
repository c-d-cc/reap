# Objective

## Goal
completion.ts에서 dead code phase(`consume`, `archive`)를 제거한다.

## Completion Criteria
1. `completion.ts`에서 `consume` phase 코드 블록이 제거되었다.
2. `completion.ts`에서 `archive` phase 코드 블록이 제거되었다.
3. `merge-completion.ts`의 `archive` phase는 변경되지 않았다.
4. 기존 테스트가 모두 통과한다.
5. `consume`/`archive` phase가 없음을 확인하는 테스트가 추가되었다.
6. `bun test`, `bunx tsc --noEmit`, `npm run build` 모두 통과한다.

## Requirements

### Functional Requirements
1. `completion.ts`의 `phase === "consume"` 블록 전체 제거
2. `completion.ts`의 `phase === "archive"` 블록 전체 제거
3. dead code phase 제거 후 해당 phase 호출 시 에러 또는 무응답 확인 테스트 추가

### Non-Functional Requirements
1. 기존 동작(retrospective → feedKnowledge 흐름)에 영향 없음

## Design

### Selected Design
단순 코드 삭제: `if (phase === "consume")` 블록과 `if (phase === "archive")` 블록을 삭제한다. 이 phase들은 nonce token 검증도 없고 진입 경로도 없는 dead code이다. feedKnowledge phase가 이미 consume + archive + compress를 모두 처리한다.

## Scope
- **Related Genome Areas**: source-map.md (completion flow)
- **Expected Change Scope**: `src/cli/commands/run/completion.ts`, `tests/commands/run/completion.test.ts`
- **Exclusions**: `merge-completion.ts`의 `archive` phase는 유지

## Backlog (Genome Modifications Discovered)
None

## Background
Main flow: `retrospective` → `feedKnowledge` (consume + archive + compress 통합 처리). `consume`과 `archive` phase는 feedKnowledge 도입 전 레거시 코드로, 현재 진입 코드 경로가 없다.

