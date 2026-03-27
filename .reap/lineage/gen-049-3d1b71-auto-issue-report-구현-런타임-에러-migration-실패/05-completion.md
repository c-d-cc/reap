# Completion — gen-049-3d1b71

## Summary

auto issue report 기능을 v0.16에 구현했다. 런타임 에러 시 자동 GitHub issue 생성 + AI 기반 수동 report 두 경로 모두 완성.

### 주요 변경
- `src/core/report.ts` — 신규. `autoReport(command, error, extraLabels?)` 함수
- `src/cli/commands/run/index.ts` — handler 호출을 try-catch로 감싸고 autoReport 호출
- `src/cli/commands/update.ts` — migration 에러 시 autoReport, CONFIG_DEFAULTS에 autoIssueReport 추가
- `src/cli/commands/run/report.ts` — 신규. 수동 report prompt (privacy gate 포함)
- `src/adapters/claude-code/skills/reap.report.md` — 신규 skill
- `src/types/index.ts` — ReapConfig에 `autoIssueReport: boolean` 추가
- `src/cli/commands/init/common.ts` — init 시 autoIssueReport 포함
- `src/cli/commands/migrate.ts` — v0.15에서 autoIssueReport 값 보존
- `tests/unit/report.test.ts` — 10개 unit test
- `tests/e2e/migrate.test.ts` — autoIssueReport 보존 테스트 업데이트
- `tests/unit/prompt-strict.test.ts` — mock config 수정

테스트: 474 pass (기존 464 + 10 신규)

## Lessons Learned

- v0.15에서 migration 시 제거된 config 필드를 다시 추가할 때, init/migrate/update 3곳 모두 업데이트해야 함. 하나라도 빠지면 일관성 깨짐.
- `emitError`가 `never` 타입을 반환하므로, try-catch에서 재전달 시 별도 처리 없이 호출만 하면 됨.
- config 필드 추가 시 테스트 코드의 mock 객체도 같이 확인해야 함.

## Next Generation Hints

- `reap.report` skill이 실제로 `reap run report` 호출 후 AI가 지시를 따르는지 수동 검증 필요.
- autoReport의 실제 gh issue 생성은 네트워크 필요하므로 integration test로는 검증 어려움. 실제 에러 발생 시 확인.
- `reap help`에 report 명령 설명 추가 고려.
