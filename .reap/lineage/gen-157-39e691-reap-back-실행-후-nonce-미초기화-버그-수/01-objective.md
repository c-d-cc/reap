# Objective

## Goal
`reap run back` 실행 후 nonce 토큰이 초기화되지 않아 target stage 재진입 시 `verifyNonce()` 검증 실패하는 버그를 수정한다.

## Completion Criteria
1. `back.ts`의 apply phase에서 nonce 관련 필드(`lastNonce`, `expectedHash`, `phase`)가 초기화된다.
2. 회귀 후 target stage의 work phase 진입 시 nonce 검증이 정상 통과한다.
3. 기존 테스트가 모두 통과한다.
4. back 명령의 nonce 초기화를 검증하는 테스트가 존재한다.

## Requirements

### Functional Requirements
1. `back.ts` apply phase에서 `state.lastNonce`, `state.expectedHash`, `state.phase`를 `undefined`로 초기화하여 첫 진입처럼 처리한다.
2. 초기화 후 `gm.save(state)`로 상태를 저장한다.

### Non-Functional Requirements
1. 기존 stage-transition.ts의 `verifyNonce`, `setNonce` 인터페이스를 변경하지 않는다.

## Design

### Approaches Considered

| Aspect | Approach A: 필드 초기화 | Approach B: setNonce 호출 |
|--------|------------------------|--------------------------|
| Summary | lastNonce/expectedHash/phase를 undefined로 설정 | setNonce(state, targetStage, "entry") 호출 |
| Pros | 단순, 첫 진입과 동일한 상태 | 명시적 nonce 재생성 |
| Cons | 없음 | entry nonce가 불필요하게 생성됨, verifyNonce에서 첫 진입 시 lastNonce 없으면 skip하므로 불필요 |
| Recommendation | **선택** | |

### Selected Design
Approach A: nonce 필드 초기화. `verifyNonce()`는 `lastNonce`가 없으면 첫 진입으로 간주하여 skip하므로, 필드를 undefined로 초기화하면 회귀 후 target stage 진입이 정상 동작한다.

### Design Approval History
- 2026-03-23: Approach A 선택 — 단순하고 기존 로직과 자연스럽게 호환

## Scope
- **Related Genome Areas**: CLI commands, stage-transition nonce system
- **Expected Change Scope**: `src/cli/commands/run/back.ts` (3줄 추가)
- **Exclusions**: stage-transition.ts 변경 없음, merge lifecycle back도 동일 경로이므로 자동 수정

## Genome Reference
- `conventions.md`: 함수 단일 책임, 50줄 이하
- `constraints.md`: 파일 I/O는 fs.ts 유틸 경유

## Backlog (Genome Modifications Discovered)
None

## Background
`back.ts`의 apply phase (라인 60-118)에서 `state.stage = target`만 변경하고 nonce 관련 필드를 초기화하지 않음. 이후 target stage의 work phase 진입 시 `verifyNonce()`가 이전 stage의 토큰으로 검증을 시도하여 실패.
