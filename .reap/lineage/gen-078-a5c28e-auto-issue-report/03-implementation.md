# Implementation

## Changes
- `src/templates/commands/reap.report.md` — 신규. 자동/수동 모드, PRIVACY_GATE + post-format sanitization 이중 검사, 유저 confirm 필수
- `src/types/index.ts` — ReapConfig에 `autoIssueReport` 필드 추가
- `src/cli/commands/init.ts` — gh CLI 감지 + autoIssueReport 설정 + COMMAND_NAMES에 reap.report 추가
- `src/templates/hooks/reap-guide.md` — Critical Rules에 malfunction 시 /reap.report 제안 규칙 추가
- `.reap/genome/constraints.md` — slash command 17개로 업데이트
