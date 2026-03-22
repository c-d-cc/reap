---
type: task
status: consumed
source: "GitHub Issue #6"
consumedBy: gen-137-c8d9b9
---

# reap init이 .claude/skills/에 sub-command를 설치하지 않음

`reap init` 시 `adapter.installCommands()`가 `~/.reap/commands/`에만 복사하고 `.claude/skills/`에는 설치하지 않음.
`reap update`의 step 5 (skills sync) 로직을 init에도 추가해야 함.

- Issue: https://github.com/c-d-cc/reap/issues/6
- 재현: `reap init` → sub-commands (`reap.sync.environment`, `reap.sync.genome`) 누락 → `reap update`로 해결됨
