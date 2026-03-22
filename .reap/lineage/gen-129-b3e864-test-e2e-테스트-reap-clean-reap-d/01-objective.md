# Objective

## Goal
E2E 테스트 스크립트 작성: `reap clean` 및 `reap destroy` 명령어를 OpenShell 샌드박스에서 검증

## Completion Criteria
1. `tests/e2e/clean-destroy-e2e.sh` 파일이 존재하고 실행 가능
2. destroy 시나리오: init -> session-start -> 확인 실패 취소 -> 확인 성공 삭제 -> .reap/ 및 .claude/skills/reap.* 부재 확인
3. clean 시나리오: init -> backlog 추가 -> interactive clean -> lineage 삭제, genome template, backlog 삭제 확인
4. `openshell run`으로 샌드박스 실행 후 ALL TESTS PASSED 출력

## Requirements

### Functional Requirements
1. FR-01: destroy 테스트 — 잘못된 입력 시 취소 확인
2. FR-02: destroy 테스트 — 올바른 입력 시 .reap/ 및 .claude/skills/reap.* 삭제 확인
3. FR-03: clean 테스트 — lineage delete, hooks reset, genome template, backlog delete 옵션 동작 확인
4. FR-04: 기존 skill-loading-e2e.sh 패턴(fake agent binary, assert 함수) 재사용

### Non-Functional Requirements
1. NFR-01: OpenShell 샌드박스에서만 실행 (로컬 실행 금지)
2. NFR-02: 기존 E2E 테스트 패턴과 일관된 구조

## Design

### Selected Design
기존 `skill-loading-e2e.sh` 패턴을 따라 bash 스크립트로 작성. fake agent binary 설치, assert 헬퍼 함수 사용, 두 테스트 함수(test_destroy, test_clean)로 구성.

- destroy 테스트: `reap init` -> `session-start.cjs` 실행 -> `echo "wrong" | reap destroy` (취소) -> `echo "destroy <name>" | reap destroy` (삭제) -> 결과 검증
- clean 테스트: `reap init` -> backlog 파일 생성 -> `printf "2\n2\n1\n2\n" | reap clean` -> 결과 검증 (lineage 삭제, genome template, backlog 삭제)

## Scope
- **Related Genome Areas**: 없음 (테스트만 추가)
- **Expected Change Scope**: `tests/e2e/clean-destroy-e2e.sh` 신규 파일 1개
- **Exclusions**: clean.ts, destroy.ts 소스 코드 변경 없음

## Genome Reference
없음

## Backlog (Genome Modifications Discovered)
None

## Background
reap clean과 reap destroy 명령어의 E2E 테스트가 아직 없음. OpenShell 샌드박스에서 실제 CLI를 설치하고 실행하여 동작을 검증하는 테스트 필요.

