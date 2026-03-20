---
type: task
status: consumed
consumedBy: gen-076-092ca7
priority: high
---

# reap update에서 현재 프로젝트 .claude/commands/ 즉시 동기화

## 문제
`reap update`가 `~/.reap/commands/`만 동기화하고, 현재 프로젝트의 `.claude/commands/`는 건드리지 않음.
프로젝트 레벨 복사는 session-start 훅에서만 실행되므로, update 후 세션 재시작이 필요.

## 해결
`reap update` (update.ts)에서 `~/.reap/commands/` 동기화 후,
현재 프로젝트가 REAP 프로젝트이면 `.claude/commands/`에도 즉시 복사 (session-start.cjs의 Step 0 로직과 동일).
