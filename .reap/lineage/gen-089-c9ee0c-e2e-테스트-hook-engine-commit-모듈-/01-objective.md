# Objective

## Goal
hook-engine + commit 모듈의 E2E 테스트 구현

## Completion Criteria
- `tests/e2e/hook-engine.test.ts` 10개 시나리오 전체 통과
- `bunx tsc --noEmit` 통과
- `npm run build` 통과

## Requirements

### Functional Requirements
- hook-engine의 scanHooks, evaluateCondition, executeHooks 흐름을 E2E로 검증
- `.md` hook 및 `.sh` hook 실행 검증
- condition 평가 로직 (always, script, not-found) 검증
- hook order 정렬 검증
- `reap run next/start/back` 명령에서 hookResults 포함 검증

### Non-Functional Requirements
- bun:test 사용
- temp dir 기반 격리 테스트

## Design

### Selected Design
- `executeHooks()` core 함수를 직접 호출하여 테스트
- `reap run` CLI는 process.exit() 호출로 직접 테스트 불가 -> core 함수 수준에서 검증
- temp dir에 `.reap/hooks/` 구조 생성 후 검증

## Scope
- **Related Genome Areas**: 없음 (테스트만 추가)
- **Expected Change Scope**: `tests/e2e/hook-engine.test.ts` 신규
- **Exclusions**: 프로덕션 코드 변경 없음

## Genome Reference
없음

## Backlog (Genome Modifications Discovered)
None

## Background
gen-088에서 hook-engine + commit 모듈 통합 완료. T-008 (E2E 테스트)이 deferred됨.
