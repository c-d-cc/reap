# Planning

## Goal

런타임 에러 및 migration 실패 시 자동 GitHub issue 생성 기능과, AI 기반 수동 report 기능을 v0.16에 구현한다.

## Completion Criteria

1. `reap run <command>`에서 unexpected error 발생 시 `gh issue create`로 자동 report 시도
2. `reap update` 중 migration 에러 시 자동 report 시도
3. gh CLI 미설치 시 silent skip (에러 없이 원래 에러만 전달)
4. 자동 report 실패해도 원래 에러가 정상 전달됨
5. issue 본문에 REAP 버전, 명령어, 에러 메시지, OS, Node 버전 포함
6. `reap run report` 명령으로 수동 report prompt 반환
7. `reap.report.md` skill 파일 존재
8. `autoIssueReport` config 필드 추가 (default: true)
9. 기존 464 tests 통과 + 신규 unit tests 통과
10. `npm run build` 성공

## Approach

### 자동 report

`src/core/report.ts`에 `autoReport(command, error, extraLabels?)` 함수를 구현. `execSync`로 `gh issue create`를 호출하며, 실패 시 silent catch. `run/index.ts`의 handler 호출을 try-catch로 감싸고, `update.ts`의 migration 에러 경로에서도 호출.

config에 `autoIssueReport: boolean` 필드를 추가하여 유저가 off 할 수 있게 함. default true.

### 수동 report

v0.15의 prompt 기반 패턴을 그대로 이식. `run/report.ts`에서 `emitOutput`으로 AI 지시 prompt를 반환. Privacy gate, sanitization 규칙 포함.

## Scope

변경 파일:
- `src/types/index.ts` — ReapConfig에 autoIssueReport 추가
- `src/core/report.ts` — 신규 (autoReport 함수)
- `src/cli/commands/run/index.ts` — try-catch + autoReport + report handler 등록
- `src/cli/commands/update.ts` — migration 에러 시 autoReport
- `src/cli/commands/run/report.ts` — 신규 (수동 report)
- `src/adapters/claude-code/skills/reap.report.md` — 신규 skill
- `tests/unit/report.test.ts` — 신규 unit test

config 관련:
- `src/cli/commands/update.ts` — CONFIG_DEFAULTS에 autoIssueReport 추가
- `src/cli/commands/migrate.ts` — autoIssueReport 필드 제거 로직 확인 (migration 시 제거하지 않도록 수정 필요할 수 있음)

## Tasks

- [ ] T001 `src/types/index.ts` — ReapConfig에 `autoIssueReport: boolean` 필드 추가
- [ ] T002 `src/cli/commands/update.ts` — CONFIG_DEFAULTS에 `autoIssueReport: true` 추가
- [ ] T003 `src/core/report.ts` — autoReport 함수 구현 (gh issue create wrapper, best-effort)
- [ ] T004 `src/cli/commands/run/index.ts` — handler 호출을 try-catch로 감싸고 autoReport 호출
- [ ] T005 `src/cli/commands/update.ts` — migration 에러 경로에 autoReport 호출 추가
- [ ] T006 `src/cli/commands/run/report.ts` — 수동 report prompt 구현
- [ ] T007 `src/cli/commands/run/index.ts` — STAGE_HANDLERS에 report 추가
- [ ] T008 `src/adapters/claude-code/skills/reap.report.md` — 신규 skill 파일
- [ ] T009 `src/cli/commands/migrate.ts` — autoIssueReport 필드 migration 시 보존 확인/수정
- [ ] T010 `tests/unit/report.test.ts` — autoReport unit tests
- [ ] T011 build + 전체 test 실행

## Dependencies

- T001 → T002, T003, T004, T005
- T003 → T004, T005
- T006 → T007
- T001~T009 → T010 → T011
