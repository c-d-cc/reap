# Objective

## Goal
`reap run back`의 apply 단계에서 nonce를 `undefined`로 초기화하는 대신, `setNonce()`를 사용하여 target stage의 entry 토큰을 생성함으로써 signature-based locking chain을 유지한다.

## Completion Criteria
1. `back.ts`에서 `setNonce(state, target, "entry")`를 호출하여 nonce chain이 유지됨
2. `lastNonce`, `expectedHash`, `phase`가 undefined가 아닌 유효한 값으로 설정됨
3. 기존 테스트가 수정되어 nonce 필드가 존재하는지 검증함
4. `bun test` 통과

## Requirements

### Functional Requirements
1. `back.ts`의 apply 단계에서 `setNonce(state, target, "entry")`를 호출
2. 기존의 `state.lastNonce = undefined; state.expectedHash = undefined; state.phase = undefined;` 제거
3. regression 후 target stage 진입 시 nonce 검증이 정상 동작

### Non-Functional Requirements
1. 기존 stage-transition.ts의 `setNonce` 함수를 재사용 (코드 중복 없음)

## Design

### Approaches Considered

| Aspect | Approach A: setNonce 사용 | Approach B: 수동 토큰 생성 |
|--------|--------------------------|---------------------------|
| Summary | stage-transition.ts의 setNonce 재사용 | back.ts에서 직접 generateToken 호출 |
| Pros | 코드 재사용, 일관성 | 없음 |
| Cons | 없음 | 코드 중복, 로직 분산 |
| Recommendation | 선택 | - |

### Selected Design
`setNonce(state, target, "entry")` 호출로 기존 인프라 재사용.

### Design Approval History
- 2026-03-23: 설계 확정 (단순 수정, brainstorming 불필요)

## Scope
- **Related Genome Areas**: stage-transition nonce 체계
- **Expected Change Scope**: `src/cli/commands/run/back.ts` (1파일), `tests/commands/run/back.test.ts` (1파일)
- **Exclusions**: stage-transition.ts 자체 변경 없음

## Genome Reference
- `constraints.md`: stage locking chain 관련

## Backlog (Genome Modifications Discovered)
None

## Background
gen-157에서 back.ts가 nonce를 undefined로 초기화하도록 변경했으나, 이로 인해 signature-based locking chain이 끊어져 아무 stage나 진입 가능해지는 보안 문제가 발생. `verifyNonce()`는 `lastNonce`가 없으면 검증을 건너뛰기 때문.
