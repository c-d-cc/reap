---
type: task
status: consumed
priority: medium
---

# Merge completion이 pending backlog를 carry forward하지 않는 버그

`merge-completion --phase archive`가 pending backlog 항목을 lineage로만 복사하고 `.reap/life/backlog/`에 carry forward하지 않음.

## 관련
- issue #9 (merge artifact 미생성 버그와 동일 버전에서 발견)
- gen-150-76c3fa에서 발견
