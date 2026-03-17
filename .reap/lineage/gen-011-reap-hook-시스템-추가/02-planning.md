# Planning

## Summary
config.yml에 hooks 스키마 추가, slash command에 hook 실행 지시 삽입, reap-wf에 실제 hook 등록.

## Tasks

- [ ] T001 `src/types/index.ts` — ReapConfig에 hooks 타입 추가
- [ ] T002 `src/templates/commands/reap.start.md` — onGenerationStart hook 실행 지시
- [ ] T003 `src/templates/commands/reap.next.md` — onStageTransition + onGenerationComplete hook 실행 지시
- [ ] T004 `src/templates/commands/reap.back.md` — onRegression hook 실행 지시
- [ ] T005 `src/templates/hooks/reap-guide.md` — hook 시스템 설명 추가
- [ ] T006 reap-wf `.reap/config.yml` — onGenerationComplete hook 등록
- [ ] T007 reap-wf `.claude/hooks.json` — 기존 Bash hook 제거
- [ ] T008 검증
