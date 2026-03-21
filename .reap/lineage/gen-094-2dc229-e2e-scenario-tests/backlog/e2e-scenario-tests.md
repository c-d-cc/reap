---
type: task
status: consumed
consumedBy: gen-094-2dc229
---

# E2E Scenario Tests for Script Orchestrator

- `tests/e2e/run-lifecycle.test.ts` — start → objective → next → planning → ... → completion 전체 흐름
- `tests/e2e/run-merge-lifecycle.test.ts` — merge start → detect → ... → completion
- sandbox에서 실제 `reap run` CLI 호출로 end-to-end 검증
