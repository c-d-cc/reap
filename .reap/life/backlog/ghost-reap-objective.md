---
type: task
status: pending
priority: medium
---

# ~/.claude/commands/reap.objective.md 유령 파일 문제

`~/.claude/commands/`에 `reap.objective.md` 파일이 계속 재생성됨.
어딘가에서 글로벌 commands 디렉토리에 이 파일을 쓰는 로직이 남아있음.
원인을 찾아서 제거해야 함.

## 재현
- reap update 또는 세션 시작 후 `~/.claude/commands/reap.objective.md` 확인
- 내용은 "outdated content"

## 조사 방향
- postinstall.cjs
- init.ts
- 다른 설치 경로
