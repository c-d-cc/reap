## What's New
- session-start 훅에서 프로젝트 커맨드 설치 시 symlink 대신 파일 복사 사용 (Claude Code symlink 미지원 대응)
- reap update가 session-start 훅이 설치한 커맨드 파일을 삭제하지 않도록 수정

## Generations
- **gen-067-42f419**: session-start.cjs symlink → copy for Claude Code project commands
- **gen-068-d71a5d**: update.ts remove legacy .claude/commands cleanup
