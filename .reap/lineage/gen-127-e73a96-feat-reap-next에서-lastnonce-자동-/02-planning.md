# Planning

## Summary
각 stage command의 complete phase에서 nonce를 `state.lastNonce`에 저장하고, `next.ts`에서 argv nonce가 없을 때 fallback으로 사용하도록 구현.

## Technical Context
- **Tech Stack**: TypeScript, Node.js
- **Constraints**: `src/core/fs.ts` 유틸 사용, GenerationState 타입 수정 필요

## Tasks
- [ ] T001 `src/types/index.ts` -- GenerationState 인터페이스에 `lastNonce?: string` 필드 추가
- [ ] T002 `src/cli/commands/run/objective.ts` -- phase complete에서 `state.lastNonce = nonce` 추가
- [ ] T003 `src/cli/commands/run/planning.ts` -- phase complete에서 `state.lastNonce = nonce` 추가
- [ ] T004 `src/cli/commands/run/implementation.ts` -- phase complete에서 `state.lastNonce = nonce` 추가
- [ ] T005 `src/cli/commands/run/validation.ts` -- phase complete에서 `state.lastNonce = nonce` 추가
- [ ] T006 `src/cli/commands/run/next.ts` -- argv nonce 없으면 state.lastNonce fallback, 사용 후 삭제

## Dependencies
- T002~T005는 T001에 의존 (타입 정의 필요)
- T006은 T001에 의존
- T002~T006은 서로 독립
