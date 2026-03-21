# REAP MANAGED — Do not modify directly. Use reap run commands.
# Planning

## Tasks

### Task 1: CLAUDE.md REAP 섹션 추가 (독립)
- ClaudeCodeAdapter에 setupClaudeMd() 메서드 추가
- .claude/CLAUDE.md에 REAP 섹션 삽입 (기존 내용 보존, 이미 있으면 업데이트)
- init.ts + update.ts에서 호출
- 내용: "This project uses REAP. Session-start hook loads project knowledge. If context was compacted and REAP knowledge is lost, re-run the session-start hook."
- 테스트

### Task 2: README + docs 갱신 (독립)
- gen-100~101 변경사항 반영:
  - auto-report on error
  - /reap.config 커맨드
  - config backfill (init/update)
  - AI migration agent (detectMigrationGaps)
  - REAP MANAGED 헤더 strip
- README 4개 + docs translations + pages

## Dependencies
Task 1, 2 독립, 병렬 실행
