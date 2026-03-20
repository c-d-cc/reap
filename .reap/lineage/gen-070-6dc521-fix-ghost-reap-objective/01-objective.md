# Objective

## Goal
`~/.claude/commands/reap.objective.md` 유령 파일이 계속 재생성되는 원인을 찾아 제거.
내용은 "outdated content"이며, 어딘가에서 글로벌 commands 디렉토리에 이 파일을 쓰는 로직이 남아있음.

## Completion Criteria
- 유령 파일 생성 원인 파악
- 해당 로직 제거 또는 수정
- reap update / reap init 실행 후 ~/.claude/commands/에 reap.objective.md가 생기지 않음
