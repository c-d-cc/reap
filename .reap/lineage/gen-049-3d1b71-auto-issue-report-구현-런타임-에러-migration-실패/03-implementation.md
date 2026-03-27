# Implementation Log

## Completed Tasks

### T001: ReapConfig autoIssueReport 필드 추가
- `src/types/index.ts` — `autoIssueReport: boolean` 필드 추가

### T002: CONFIG_DEFAULTS에 autoIssueReport 추가
- `src/cli/commands/update.ts` — `autoIssueReport: true` default 추가
- `src/cli/commands/init/common.ts` — init 시 config에 autoIssueReport 포함

### T003: core/report.ts 신규 생성
- `autoReport(command, error, extraLabels?)` 함수 구현
- `execSync`로 `gh issue create` 호출, `stdio: "ignore"`, timeout 10초
- 에러 메시지 80자 truncation, double quote escaping
- 모든 실패 silent catch (best-effort)

### T004: run/index.ts try-catch + autoReport
- handler 호출을 try-catch로 감싸고, config.autoIssueReport 확인 후 autoReport 호출
- `emitError`로 원래 에러 재전달

### T005: update.ts migration 에러 시 autoReport
- `migrateExecute` 호출을 try-catch로 감싸고 autoReport 호출 (label: "migration")
- 원래 에러 re-throw

### T006: run/report.ts 수동 report 구현
- AI prompt 기반: context 수집, privacy gate, sanitization, 사용자 확인 flow
- v0.15 구조를 v0.16 패턴에 맞게 이식

### T007: STAGE_HANDLERS에 report 등록
- `run/index.ts`에 report handler 추가

### T008: reap.report.md skill 파일
- `src/adapters/claude-code/skills/reap.report.md` 신규 생성

### T009: migrate.ts autoIssueReport 보존
- v16Config에 `autoIssueReport` 필드 추가 (v0.15에서 값 보존)
- migration 설명 prompt에서 "Remove: autoIssueReport" 삭제

### T010: unit tests
- `tests/unit/report.test.ts` — 10개 테스트
- gh issue create 인자, 에러 truncation, extra labels, silent failure, non-Error handling, system info, quote escaping, timeout, stdio 검증

### T011: build + test
- `npm run build` 성공 (0.50MB)
- 전체 테스트 474 pass (unit 290 + e2e 143 + scenario 41)

## Discovered Issues

### init/common.ts config 누락
계획에는 없었으나 init에서 새 프로젝트 생성 시 config에 autoIssueReport가 빠져있었음. 추가.

### tests/unit/prompt-strict.test.ts mock config 누락
mock ReapConfig 객체에 autoIssueReport 필드가 없어 TypeScript strict mode에서 문제 가능. 추가.

### tests/e2e/migrate.test.ts 수정
기존 테스트가 `autoIssueReport`가 migration 시 제거됨을 확인했으나, 이제 보존하므로 기대값 변경 (`undefined` → `false`).
