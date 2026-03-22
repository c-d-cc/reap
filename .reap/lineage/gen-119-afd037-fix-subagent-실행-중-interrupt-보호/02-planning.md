# Planning

## Summary
subagent interrupt 보호 지시 추가, orchestrator 경고 메시지 추가, completion.ts unused variable 확인/수정

## Technical Context
- **Tech Stack**: TypeScript, Node.js
- **Constraints**: 함수 50줄 이하 권장, 기존 동작 변경 없음

## Tasks
- [ ] T001 `src/cli/commands/run/evolve.ts` -- buildSubagentPrompt()에 Interrupt Protection 섹션 추가
- [ ] T002 `src/templates/commands/reap.evolve.md` -- subagent 실행 중 사용자 메시지 처리 규칙 추가
- [ ] T003 `src/cli/commands/run/completion.ts` -- impactPrompt 사용 확인 및 필요 시 수정 (line 210에서 이미 사용 중이므로 실제 unused 여부 재확인)

## Dependencies
- T001, T002, T003은 독립적, 병렬 가능

