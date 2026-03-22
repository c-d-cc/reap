# Planning

## Summary
token 관련 필드 4개→3개 통합, 함수 4개→2개 통합, 전체 사용처 업데이트

## Technical Context
- **Tech Stack**: TypeScript, Bun
- **Constraints**: 내부 state 변경이므로 하위 호환성 불필요

## Tasks

### Task 1: GenerationState 타입 변경
- 파일: `src/types/index.ts`
- expectedTokenHash → expectedHash 리네이밍
- lastPhaseNonce, expectedPhaseTokenHash 제거
- phase?: string 추가

### Task 2: token 함수 통합
- 파일: `src/core/generation.ts`
- generateStageToken + generatePhaseToken → generateToken
- verifyStageToken + verifyPhaseToken → verifyToken

### Task 3: stage-transition.ts 업데이트
- 파일: `src/core/stage-transition.ts`
- import 변경, verifyStageEntry에서 expectedHash 사용
- setPhaseNonce/verifyPhaseEntry에서 통합 함수 + 필드 사용

### Task 4: 모든 stage command 업데이트
- 대상: objective.ts, planning.ts, implementation.ts, validation.ts, completion.ts
- 대상: merge-detect.ts, merge-mate.ts, merge-merge.ts, merge-sync.ts, merge-validation.ts, merge-completion.ts
- 대상: next.ts, back.ts, start.ts
- import 변경: generateStageToken → generateToken
- 필드명 변경: expectedTokenHash → expectedHash
- phase 전환 시 state.phase 업데이트

### Task 5: 테스트 업데이트
- generation.test.ts: generateStageToken/verifyStageToken → generateToken/verifyToken
- _helpers.ts: withPhaseNonce에서 generatePhaseToken → generateToken, 필드명 변경
- 기타 테스트: expectedTokenHash → expectedHash 참조 변경

## Dependencies
- Task 1 → Task 2, 3, 4, 5 (타입 변경이 먼저)
- Task 2 → Task 3, 4 (함수 통합이 먼저)
- Task 3, 4 → Task 5 (구현 후 테스트)

