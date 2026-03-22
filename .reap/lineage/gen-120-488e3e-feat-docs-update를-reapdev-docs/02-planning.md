# Planning

## Summary
기존 `onLifeCompleted.docs-update.md` hook body를 `reapdev.docsUpdate` 스킬로 추출하고, hook은 1줄 wrapper로 변경, COMMAND_NAMES에 등록.

## Technical Context
- **Tech Stack**: Markdown 스킬 파일, TypeScript (init.ts)
- **Constraints**: frontmatter 형식 준수, COMMAND_NAMES 배열 순서

## Tasks
- [x] T001 `src/templates/commands/reapdev.docsUpdate.md` -- 새 스킬 파일 생성 (기존 hook body + description frontmatter)
- [x] T002 `.reap/hooks/onLifeCompleted.docs-update.md` -- body를 스킬 호출 1줄로 변경 (frontmatter 유지)
- [x] T003 `src/cli/commands/init.ts` -- COMMAND_NAMES에 "reapdev.docsUpdate" 추가

## Dependencies
T001 → T002 (스킬이 먼저 생성되어야 hook이 참조 가능)
T003은 독립 (T001/T002와 병렬 가능)
