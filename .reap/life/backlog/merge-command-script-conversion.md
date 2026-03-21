---
type: task
priority: medium
createdBy: gen-087-adc61f
consumed: false
---

# Merge command script 전환

## 설명
- merge 계열 slash command를 Script Orchestrator 패턴으로 전환
- `reap run merge.start`, `reap run merge.detect` 등 구현
- Normal lifecycle 안정화 후 진행 (Phase 4 scope)

## 관련
- gen-087 deferred: Phase 4
- `src/core/merge-generation.ts`, `src/core/merge-lifecycle.ts` 재사용
