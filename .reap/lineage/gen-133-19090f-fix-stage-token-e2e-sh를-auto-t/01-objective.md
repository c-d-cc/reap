# Objective

## Goal
fix: stage-token-e2e.sh를 auto-transition 흐름에 맞게 업데이트

## Background
gen-130에서 도입된 auto-transition 흐름으로 인해 기존 E2E 테스트(`tests/e2e/stage-token-e2e.sh`)가
더 이상 현재 CLI 동작과 일치하지 않음. 기존 테스트는 `reap run next <nonce>` 수동 호출을 기대했으나,
현재는 `--phase complete`가 자동으로 stage를 전환함.

## Requirements

### Functional Requirements
1. `reap run next "$NONCE"` 수동 호출 제거 — `--phase complete`가 자동 전환
2. stage 전환 확인: `--phase complete` 후 `current.yml`의 `stage` 필드 검증
3. phase nonce 검증 테스트: work 없이 `--phase complete` 호출 시 실패 확인
4. `reap run next` fallback 테스트: lastNonce 존재 시 확인 동작 검증
5. 전체 lifecycle chain 테스트 (objective → planning → implementation → validation → completion)

## Completion Criteria
- OpenShell sandbox에서 모든 E2E 테스트 통과 (25/25)
- auto-transition 흐름에 맞는 테스트 시나리오 커버

## Scope
- **Related Genome Areas**: E2E testing, stage-transition
- **Expected Change Scope**: tests/e2e/stage-token-e2e.sh
- **Exclusions**: source code 변경 없음 (테스트만 수정)

## Backlog (Genome Modifications Discovered)
None
