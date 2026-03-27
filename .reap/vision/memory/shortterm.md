# Shortterm Memory

## 세션 요약 (2026-03-28)

### gen-049: auto issue report 구현
- `src/core/report.ts` 신규: autoReport(command, error, extraLabels?) — gh issue create wrapper
- `src/cli/commands/run/index.ts`: handler try-catch + autoReport 호출
- `src/cli/commands/update.ts`: migration 에러 시 autoReport + CONFIG_DEFAULTS에 autoIssueReport
- `src/cli/commands/run/report.ts` 신규: 수동 report prompt (privacy gate 포함)
- `src/adapters/claude-code/skills/reap.report.md` 신규 skill
- ReapConfig에 `autoIssueReport: boolean` 추가 (init, migrate, update 모두 반영)
- 474 pass (기존 464 + 10 신규)

### 다음 세션에서 할 것
- `reap help`에 report 명령 설명 추가
- reap.report skill 실제 동작 수동 검증
- update 명령의 strict 변환 e2e 테스트
- README v0.16 재작성

### Backlog 상태
- auto issue report task: 이번 generation에서 처리 완료
- pending backlog 없음

### 미결정 사항
- Embryo -> Normal 전환 시점
- 다국어 맵의 공통 i18n 모듈 분리 시점
