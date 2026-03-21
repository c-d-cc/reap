---
type: task
priority: high
createdBy: gen-087-adc61f
consumed: true
consumedBy: gen-088-86dd81
---

# Hook 실행 엔진 + commit 로직 통합

## 설명
- `.reap/hooks/` 파일 탐색, condition 평가, 실행 로직을 command script 내부에 통합
- submodule check + git commit 로직을 command script에서 직접 수행
- Phase 3 scope (Script Orchestrator Architecture)

## 관련
- gen-087 deferred: Phase 3
- `src/cli/commands/run/completion.ts`에서 hook/commit 호출 지점 추가 필요
