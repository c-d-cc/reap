# Planning

## Summary
Codex CLI 커스텀 명령어 경로를 `~/.codex/commands/`에서 `~/.codex/prompts/`로 수정. 3개 파일의 경로 문자열만 변경하는 단순 작업.

## Technical Context
- **Tech Stack**: TypeScript, Node.js, Bun (테스트)
- **Constraints**: AgentAdapter가 에이전트별 경로에 설치. postinstall이 자동 설치.

## Tasks
- [x] T001 `src/core/agents/codex.ts` -- `commandsDir` getter의 `"commands"`를 `"prompts"`로 변경
- [x] T002 `scripts/postinstall.cjs` -- cleanup 대상 배열의 `~/.codex/commands/`를 `~/.codex/prompts/`로 변경
- [x] T003 `tests/core/agents/codex.test.ts` -- 테스트 설명문 및 기대값의 `commands`를 `prompts`로 변경
- [x] T004 타입체크 및 테스트 실행 -- `bunx tsc --noEmit` + `bun test tests/core/agents/codex.test.ts`

## Dependencies
- T001, T002: 독립 (병렬 가능)
- T003: T001 이후 (변경된 경로를 테스트에 반영)
- T004: T001, T002, T003 완료 후
