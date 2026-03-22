# Planning

## Summary
reapdev.* 커맨드를 src/templates/commands/에서 삭제하고 COMMAND_NAMES 배열에서 제거. 로컬 설치된 파일도 정리.

## Technical Context
- **Tech Stack**: TypeScript, Node.js
- **Constraints**: Genome immutability — constraints.md/conventions.md의 reapdev 관련 내용은 backlog로 기록

## Tasks
- [x] T001 `src/templates/commands/reapdev.docsUpdate.md` — 파일 삭제
- [x] T002 `src/templates/commands/reapdev.versionBump.md` — 파일 삭제
- [x] T003 `src/cli/commands/init.ts` — COMMAND_NAMES에서 reapdev 항목 2개 제거
- [x] T004 `~/.reap/commands/reapdev.*.md` — 로컬 설치된 파일 2개 삭제

## Dependencies
T001, T002, T003, T004 — 모두 독립적, 병렬 실행 가능

## Regression
re-entry. 기존 planning artifact 비어있었으므로 새로 작성.

