---
type: task
status: consumed
consumedBy: gen-047-c66f55
priority: high
title: Merge generation용 slash command 템플릿 작성
---

# Merge generation용 slash command 템플릿

Merge lifecycle 각 단계를 실행하는 slash command 필요:
- reap.merge-start (merge generation 생성)
- reap.detect (detect 단계 실행)
- reap.genome-resolve (genome resolve 단계 실행)
- reap.source-resolve (source resolve 단계 실행)
- reap.sync-test (sync test 단계 실행)

또는 기존 reap.evolve에서 type: merge일 때 분기하는 방식도 가능.
