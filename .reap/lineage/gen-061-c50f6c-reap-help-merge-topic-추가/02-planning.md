# Planning

## Summary
reap.help.md에 collaboration topic 추가 + docs-update hook에 help 최신화 체크 추가.

## Technical Context
- **Tech Stack**: 슬래시 커맨드 템플릿 (.md), hook 파일 (.md)
- **Constraints**: 프롬프트 템플릿만 수정

## Tasks

- [ ] T001 `src/templates/commands/reap.help.md` — topic 목록에 merge/pull/push/collaboration 추가, 커맨드 테이블에 collaboration 커맨드 추가
- [ ] T002 `.reap/hooks/onGenerationComplete.docs-update.md` — help topic 최신화 체크 항목 추가
- [ ] T003 검증 (bun test + tsc + build)

## Dependencies
T001, T002 병렬 → T003
