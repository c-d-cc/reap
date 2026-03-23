# Planning

## Summary
`back.ts`의 apply 단계에서 nonce를 undefined로 초기화하는 코드를 `setNonce()` 호출로 교체하여 signature-based locking chain을 유지한다. 테스트도 함께 수정.

## Technical Context
- **Tech Stack**: TypeScript, Bun (테스트)
- **Constraints**: stage-transition.ts의 기존 `setNonce` 함수 재사용

## Tasks
- [x] T001 `src/cli/commands/run/back.ts` -- setNonce import 추가, undefined 초기화를 setNonce(state, target, "entry") 호출로 교체
- [x] T002 `tests/commands/run/back.test.ts` -- "clears nonce fields after regression" 테스트에서 undefined 검증을 유효한 nonce 값 존재 검증으로 변경

## Dependencies
- T002는 T001 완료 후 실행 (코드 변경이 테스트 기대값에 영향)

## E2E Test Scenarios
1. **Regression nonce chain 유지**: implementation stage에서 back apply → saved state의 lastNonce, expectedHash가 존재하고 phase가 "entry"
