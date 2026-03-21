# REAP MANAGED — Do not modify directly. Use reap run commands.
# Planning

## Tasks

### Task 1: auto-report on error (독립)
- `src/cli/commands/run/index.ts` — runCommand의 catch에서 autoIssueReport 시 `gh issue create`
- 의도된 에러(emitError)와 예상치 못한 에러(uncaught exception) 구분
- `src/templates/hooks/reap-guide.md` — AI 감지 규칙 추가
- 테스트

### Task 2: /reap.config 커맨드 (독립)
- `src/cli/commands/run/config.ts` 신규 — config.yml 표시
- `src/cli/commands/run/index.ts` dispatcher 등록
- `src/templates/commands/reap.config.md` 신규 1줄 wrapper
- `src/cli/commands/run/help.ts` — config 라인 제거, "/reap.config" 안내
- 테스트

### Task 3: config 필드 backfill (독립)
- `src/cli/commands/init.ts` — 누락 필드(strict, language, autoSubagent) 추가
- `src/core/config.ts` — ConfigManager.backfill() 유틸
- `src/cli/commands/update.ts` — backfill 호출
- 테스트

## Dependencies
3개 독립, 병렬 실행 가능
