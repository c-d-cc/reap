# Objective

## Goal
E2E 테스트 실패 수정: stage-token-e2e.sh Test 8 기대값 수정 + migration-e2e.sh sandbox 환경 미비 시 skip 처리

## Completion Criteria
1. `bash tests/e2e/stage-token-e2e.sh` 전체 25/25 pass
2. `bash tests/e2e/migration-e2e.sh` 로컬 환경에서 graceful skip 처리 (exit 0)
3. `bun test` 전체 통과
4. `bunx tsc --noEmit` 타입체크 통과
5. version bump v0.15.17

## Requirements

### Functional Requirements
1. stage-token-e2e.sh Test 8: auto-transition 후 `reap run next`가 exit 0 반환하는 현재 동작에 맞게 테스트 기대값 수정
2. migration-e2e.sh: OpenShell sandbox 환경(/sandbox/ tarball) 미비 시 전체 테스트를 graceful skip 처리

### Non-Functional Requirements
1. 기존 테스트 로직 변경 최소화
2. skip 시 명확한 안내 메시지 출력

## Design

### Approaches Considered

| Aspect | Approach A: 테스트 기대값 수정 | Approach B: next 로직 수정 |
|--------|-----------|-----------|
| Summary | Test 8의 assert를 현재 동작(exit 0)에 맞게 수정 | next가 fresh generation에서 실패하도록 로직 변경 |
| Pros | 현재 올바른 동작을 존중, 최소 변경 | 테스트 변경 불필요 |
| Cons | 없음 | auto-transition 설계 의도 위배 |
| Recommendation | 선택 | 비선택 |

### Selected Design
- **Test 8**: `start --phase create`가 `lastNonce`를 설정하므로 `next`는 auto-transition을 감지하고 exit 0 반환. 이것이 올바른 동작이므로 테스트 기대값을 exit 0 + 성공 메시지 매칭으로 수정
- **migration-e2e.sh**: 스크립트 상단에 `/sandbox/c-d-cc-reap-*.tgz` 존재 여부 체크 추가. 미존재 시 "sandbox 환경 미비, skip" 메시지 출력 후 exit 0

### Design Approval History
- 2026-03-25: GOAL에서 수정 방향 명시됨, 추가 brainstorming 불필요

## Scope
- **Related Genome Areas**: E2E 테스트 인프라
- **Expected Change Scope**: tests/e2e/stage-token-e2e.sh, tests/e2e/migration-e2e.sh
- **Exclusions**: 프로덕션 코드 변경 없음

## Genome Reference
- conventions.md: 테스트 파일은 tests/ submodule

## Backlog (Genome Modifications Discovered)
None

## Background
- stage-token-e2e.sh Test 8: `setup_project`가 `reap run start --phase create`를 호출하면 `lastNonce`가 설정됨. `next`는 `lastNonce` 존재 시 auto-transition 감지로 exit 0 반환. 테스트는 exit !=0 기대 → 불일치
- migration-e2e.sh: `upgrade_and_migrate` 함수가 `/sandbox/c-d-cc-reap-0.4.0.tgz`를 직접 참조. 로컬에는 해당 파일 없음
