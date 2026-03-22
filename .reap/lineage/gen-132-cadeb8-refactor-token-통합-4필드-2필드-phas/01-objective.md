# Objective

## Goal
token 관련 필드를 4개(expectedTokenHash, lastPhaseNonce, expectedPhaseTokenHash, lastNonce)에서 3개(expectedHash, lastNonce, phase)로 통합하고, stage/phase token 생성·검증 함수를 각각 하나로 통합한다.

## Completion Criteria
1. GenerationState 타입에서 expectedTokenHash, lastPhaseNonce, expectedPhaseTokenHash 필드가 제거되고 expectedHash, phase 필드가 추가됨
2. generateStageToken/verifyStageToken/generatePhaseToken/verifyPhaseToken 4개 함수가 generateToken/verifyToken 2개로 통합됨
3. 모든 stage command 파일이 통합된 함수와 필드명을 사용
4. stage-transition.ts의 setPhaseNonce/verifyPhaseEntry가 통합된 token 함수를 사용
5. 모든 테스트가 새 필드명과 함수를 사용하며 통과
6. 빌드 에러 없음

## Requirements

### Functional Requirements
1. FR-1: GenerationState 타입에서 expectedTokenHash → expectedHash 리네이밍
2. FR-2: lastPhaseNonce, expectedPhaseTokenHash 필드 제거
3. FR-3: phase 필드 추가 (현재 phase 추적)
4. FR-4: generateStageToken + generatePhaseToken → generateToken 통합
5. FR-5: verifyStageToken + verifyPhaseToken → verifyToken 통합
6. FR-6: stage-transition.ts의 setPhaseNonce/verifyPhaseEntry가 통합 함수 사용
7. FR-7: 모든 stage command에서 expectedTokenHash → expectedHash
8. FR-8: 테스트 코드 업데이트

### Non-Functional Requirements
1. NFR-1: 기존 token 보안 수준 유지 (SHA256 + random nonce)
2. NFR-2: 하위 호환성 불필요 (내부 state 파일이므로)

## Design

### Selected Design
- 단일 generateToken(genId, stage, phase?) 함수로 통합. phase 유무에 따라 input 문자열 형식 결정
- state에 lastNonce + expectedHash 2개만 유지 (stage/phase 공용)
- state.phase로 현재 phase 추적

## Scope
- **Related Genome Areas**: source-map.md (core/generation, core/stage-transition)
- **Expected Change Scope**: src/types/index.ts, src/core/generation.ts, src/core/stage-transition.ts, src/cli/commands/run/*.ts, tests/
- **Exclusions**: 외부 API 변경 없음, config 변경 없음

## Genome Reference
source-map.md — core layer

## Backlog (Genome Modifications Discovered)
None

## Background
현재 stage token과 phase token이 별도 필드(4개)와 별도 함수(4개)로 관리되어 중복이 많다. 이를 통합하여 코드 복잡도를 줄인다.

