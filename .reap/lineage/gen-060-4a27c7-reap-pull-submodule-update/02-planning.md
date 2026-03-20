# Planning

## Summary
reap.pull 슬래시 커맨드에서 merge/fast-forward 후 git submodule update --init 자동 실행 단계 추가.

## Technical Context
- **Tech Stack**: 슬래시 커맨드 템플릿 (.md)
- **Constraints**: 단일 파일 수정

## Tasks

- [x] T001 `src/templates/commands/reap.pull.md` — fast-forward 및 merge 후 submodule update 단계 추가
- [ ] T002 `bun test` 통과
- [ ] T003 `bunx tsc --noEmit` 통과
- [ ] T004 `npm run build` 성공

## Dependencies
T001 → T002~T004
