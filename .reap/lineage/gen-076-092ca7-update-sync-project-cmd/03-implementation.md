# Implementation

## Changes
- `src/cli/commands/update.ts`: 프로젝트 레벨 `.claude/commands/` 즉시 동기화 로직 추가
  - `~/.reap/commands/reap.*.md` → `.claude/commands/reap.*.md` 복사
  - 내용 동일하면 스킵, stale symlink 대응
