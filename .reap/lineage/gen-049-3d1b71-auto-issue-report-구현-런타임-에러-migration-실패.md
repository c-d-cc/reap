---
id: gen-049-3d1b71
type: embryo
goal: "auto issue report 구현 — 런타임 에러/migration 실패 시 자동 GitHub issue 생성"
parents: ["gen-048-cfbd63"]
---
# gen-049-3d1b71
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