# Objective

## Goal
Stage Chain Token E2E 테스트 — stage chain token 시스템의 전체 흐름을 검증하는 E2E 테스트 작성

## Completion Criteria
1. `tests/e2e/stage-token-e2e.sh` 셸 스크립트가 token chain 전체 흐름을 검증
2. `tests/e2e/stage-token-e2e.test.ts` bun 테스트가 execute() 함수 직접 호출로 token 검증
3. `bun test` 전체 통과
4. `bunx tsc --noEmit` 타입 체크 통과

## Requirements

### Functional Requirements
1. FR-01: 셸 스크립트 — sandbox 프로젝트 셋업 (git init, reap init)
2. FR-02: 셸 스크립트 — stage complete 후 nonce 추출 및 next 전달 검증
3. FR-03: 셸 스크립트 — nonce 없이 next 호출 시 거부 (exit code != 0)
4. FR-04: 셸 스크립트 — 잘못된 nonce로 next 호출 시 거부
5. FR-05: bun 테스트 — token 생성 검증 (expectedTokenHash in current.yml)
6. FR-06: bun 테스트 — nonce 없이 next 호출 시 blocking
7. FR-07: bun 테스트 — 잘못된 nonce로 next 호출 시 blocking
8. FR-08: bun 테스트 — 올바른 nonce로 next 호출 시 stage advance 성공

### Non-Functional Requirements
1. NFR-01: 기존 E2E 테스트 패턴과 일관된 구조 (execute() 직접 호출, runWithCapture)
2. NFR-02: 셸 스크립트는 PASS/FAIL 출력, exit 0/1 반환

## Design

### Selected Design
- 셸 스크립트: temp dir에 sandbox 프로젝트 생성, `reap` CLI로 전체 lifecycle 실행
- bun 테스트: 기존 `run-lifecycle.test.ts` 패턴 따름 — `createTestProject()`, `runWithCapture()`, `runNextWithNonce()` 활용
- token 흐름: stage complete -> nonce 추출 (message에서 grep) -> next에 전달 -> hash 검증

## Scope
- **Related Genome Areas**: tests/e2e/
- **Expected Change Scope**: 새 테스트 파일 2개 추가
- **Exclusions**: 기존 token 로직 변경 없음

## Genome Reference
- `src/core/generation.ts` — generateStageToken, verifyStageToken
- `src/cli/commands/run/next.ts` — nonce argv 파싱 + verify
- `tests/e2e/run-lifecycle.test.ts` — 기존 E2E 패턴 참조

## Backlog (Genome Modifications Discovered)
None

## Background
gen-107에서 stage chain token 시스템 구현 완료. 이번 generation은 sandbox E2E 테스트로 실제 CLI 환경에서 token 전달이 올바르게 동작하는지 검증.
