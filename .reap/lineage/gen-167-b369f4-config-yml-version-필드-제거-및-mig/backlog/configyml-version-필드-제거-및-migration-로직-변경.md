---
type: task
status: consumed
priority: medium
consumedBy: gen-167-b369f4
---

# config.yml version 필드 제거 및 migration 로직 변경

config.version 비교 로직 제거. 각 migration의 check()가 이미 idempotent하게 필요 여부를 판단하므로 version 필드 불필요. uncommitted changes 문제 해소.
