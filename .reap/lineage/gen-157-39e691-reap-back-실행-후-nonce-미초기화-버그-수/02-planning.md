# Planning

## Summary
`back.ts`의 apply phase에서 nonce 필드 3개를 undefined로 초기화하는 1줄 변경과, 이를 검증하는 테스트 1개 추가.

## Technical Context
- **Tech Stack**: TypeScript, Bun test
- **Constraints**: stage-transition.ts 인터페이스 변경 없음

## Tasks
- [x] T001 `src/cli/commands/run/back.ts` -- apply phase에서 state.stage 변경 후 lastNonce/expectedHash/phase를 undefined로 초기화
- [x] T002 `tests/commands/run/back.test.ts` -- apply phase 후 저장된 state에서 nonce 필드가 초기화되었는지 검증하는 테스트 추가

## Dependencies
T001 → T002 (구현 후 테스트)

## E2E 시나리오
1. Setup: implementation stage에 lastNonce/expectedHash가 설정된 state 생성
2. Action: `reap run back --phase apply --reason "test"`
3. Assertion: 저장된 state의 lastNonce, expectedHash, phase가 모두 undefined
