# Planning

## Summary
completion.ts에서 dead code phase(`consume`, `archive`)를 제거하고 테스트를 업데이트한다.

## Technical Context
- **Tech Stack**: TypeScript, Bun
- **Constraints**: merge-completion.ts의 archive phase는 유지

## Tasks
- [x] T001 `src/cli/commands/run/completion.ts` -- `if (phase === "consume")` 블록 제거 (L228-L248)
- [x] T002 `src/cli/commands/run/completion.ts` -- `if (phase === "archive")` 블록 제거 (L250-L278)
- [x] T003 `tests/commands/run/completion.test.ts` -- consume/archive 테스트를 "phase가 없음을 확인하는" 테스트로 교체
- [x] T004 빌드/타입체크/테스트 검증

## Dependencies
T001 → T002 → T003 → T004 (순차)

