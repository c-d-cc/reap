---
type: task
status: consumed
consumedBy: gen-098-7d39ee
---

# reap update: user-level (~/.claude/commands/) 레거시 slash commands 정리

## 현상
- `reap init`/`reap update`가 과거에 `~/.claude/commands/`에 reap.*.md 설치
- 현재는 project-level (`.claude/commands/`)에만 설치하는 구조
- 양쪽에 중복 존재하면 skills 목록에 user/project 양쪽 다 표시됨

## 기대 동작
- `reap update` 실행 시 `~/.claude/commands/reap.*.md` 레거시 파일 감지 → 자동 삭제
- 또는 `ClaudeCodeAdapter.removeStaleCommands()`에서 user-level도 정리

## 관련 코드
- `src/core/agents/claude-code.ts:13` — `commandsDir`가 `~/.claude/commands/`를 가리킴
- `src/core/agents/claude-code.ts:41` — `removeStaleCommands`가 이미 이 디렉토리를 정리하지만, validNames에 reap 명령이 포함되어 있어 삭제 안 됨
