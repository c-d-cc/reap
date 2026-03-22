# Planning

## Summary
refreshKnowledge CLI 커맨드를 추가하여 subagent가 REAP context를 로드할 수 있게 함. session-start.cjs의 context 생성 로직을 TypeScript로 재구현.

## Technical Context
- **Tech Stack**: TypeScript, Commander.js CLI, Node.js fs/promises via fs.ts
- **Constraints**: genome-loader.cjs는 CJS hook 전용. CLI command는 기존 core 모듈(fs.ts, paths.ts, config.ts, generation.ts) 활용

## Tasks

### Phase 1: Core Command 구현
- [x] T001 `src/cli/commands/run/refresh-knowledge.ts` -- refreshKnowledge 커맨드 구현. genome-loader.cjs의 로직을 TypeScript로 재구현. loadGenome(L1+L2 budget), Environment Summary, Generation State, Strict Mode, REAP Guide를 읽어 emitOutput으로 출력.
- [x] T002 `src/cli/commands/run/index.ts` -- COMMANDS에 `refreshKnowledge` 등록 (`"refreshKnowledge": () => import("./refresh-knowledge")`)

### Phase 2: Slash Command 및 init 등록
- [x] T003 `src/templates/commands/reap.refreshKnowledge.md` -- slash command 템플릿 생성
- [x] T004 `src/cli/commands/init.ts` -- COMMAND_NAMES에 `reap.refreshKnowledge` 추가

### Phase 3: evolve.ts 경량화
- [x] T005 `src/cli/commands/run/evolve.ts` -- subagentPrompt에 "먼저 `reap run refreshKnowledge`를 실행하라" 지시 추가

### Phase 4: Validation
- [x] T006 `bunx tsc --noEmit` 통과 확인
- [x] T007 `npm run build` 통과 확인
- [x] T008 `bun test` 통과 확인

## Dependencies
- T002 depends on T001
- T004, T005 are independent of T001-T002
- T006-T008 depend on T001-T005 all complete
