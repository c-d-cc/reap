# Objective

## Goal
E2E Scenario Tests — `reap run` CLI 실행 기반 lifecycle 전체 흐름 검증

## Completion Criteria
- `tests/e2e/run-lifecycle.test.ts` — normal lifecycle E2E (start → objective → ... → completion → archiving)
- `tests/e2e/run-merge-lifecycle.test.ts` — merge lifecycle E2E (merge-start → detect → ... → completion)
- sandbox에서 실제 `reap run <cmd>` 실행, stdout JSON 파싱으로 검증
- backlog carry forward, compression trigger 등 edge case 포함
- `bun test` 전체 통과

## Requirements

### Functional Requirements
- FR1: Normal lifecycle E2E — start(gate+create), objective(work+complete), next(transition), planning, implementation, validation, completion(archive), backlog carry forward
- FR2: Merge lifecycle E2E — merge-start, merge-detect, merge-mate, merge-merge, merge-sync, merge-validation, merge-completion
- FR3: Edge cases — abort mid-lifecycle, back regression, evolve meta-orchestrator

### Non-Functional Requirements
- sandbox 기반 (temp dir), 실제 .reap 프로젝트에 영향 없음
- 기존 472개 테스트 유지 + 신규 추가

## Scope
- **Expected Change Scope**: `tests/e2e/` 신규 파일 2개
- **Exclusions**: 소스 코드 변경 없음
