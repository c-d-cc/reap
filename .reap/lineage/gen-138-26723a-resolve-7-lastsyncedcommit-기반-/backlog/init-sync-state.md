---
type: task
status: consumed
source: "GitHub Issue #7"
consumedBy: gen-138-26723a
---

# reap init should track sync state and prompt for initial sync

init 후 genome이 "synced"로 표시되지만 실제로는 sync된 적 없음.
`lastSyncedCommit` 필드를 config.yml에 추가하여 sync 상태를 추적해야 함.

- Issue: https://github.com/c-d-cc/reap/issues/7
- init: lastSyncedCommit 비워둠
- sync 완료 시: lastSyncedCommit = HEAD
- session-start hook: lastSyncedCommit 기반으로 sync 상태 판단
