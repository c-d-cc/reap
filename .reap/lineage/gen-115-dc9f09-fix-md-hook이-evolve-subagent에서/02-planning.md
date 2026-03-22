# Planning

## Summary
completion.ts의 hookResults에서 .md hook content를 추출하여 output prompt에 append하고, evolve.ts의 subagentPrompt에 hook prompt 실행 안내를 추가한다.

## Technical Context
- **Tech Stack**: TypeScript 5.x, Node.js >=18 호환
- **Constraints**: strict mode, async/await, Validation: bun test + bunx tsc --noEmit + npm run build

## Tasks

### Phase 1: completion.ts 수정
- [x] T001 `src/cli/commands/run/completion.ts` -- buildMdHookPrompt() 헬퍼 함수 추가. hookResults에서 type=md, status=executed, content 있는 항목을 수집하여 prompt 문자열 생성
- [x] T002 `src/cli/commands/run/completion.ts` -- phase "genome"의 prompt에 buildMdHookPrompt() 결과 append
- [x] T003 `src/cli/commands/run/completion.ts` -- phase "archive"의 prompt에 buildMdHookPrompt() 결과 append

### Phase 2: evolve.ts 수정
- [x] T004 `src/cli/commands/run/evolve.ts` -- buildSubagentPrompt()에 "completion output의 prompt에 hook 지시가 있으면 반드시 따르라" 안내 추가

### Phase 3: Validation
- [ ] T005 `bunx tsc --noEmit` 통과 확인
- [ ] T006 `bun test` 통과 확인
- [ ] T007 `npm run build` 통과 확인

## Dependencies
- T002, T003은 T001에 의존 (헬퍼 함수 필요)
- T004는 독립적
- T005-T007은 T001-T004 완료 후

