---
type: task
priority: medium
createdBy: gen-088-86dd81
consumed: false
---

# E2E 테스트 — hook-engine + commit 통합

## 설명
- hook-engine의 scanHooks, evaluateCondition, executeHooks 흐름을 E2E로 검증
- commit 모듈의 checkSubmodules, commitChanges 검증
- `reap run next/start/back/completion`에서 hookResults가 output에 포함되는지 검증
- Planning의 T-008에 정의된 10개 시나리오 구현

## 관련
- gen-088 deferred: T-008
- `tests/e2e/hook-engine.test.ts` (신규)
