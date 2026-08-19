---
type: task
status: pending
priority: medium
createdAt: 2026-08-19T04:13:13.044Z
---

# validation work phase 를 재실행할 수 없다 — 중단 복구 절차와 evaluator prompt 가 함께 막힌다

## Problem

`reap run validation` 을 두 번째로 호출하면 진행이 막힌다:

```
No pending transition for validation:entry (current phase: entry).
Available: [validation:complete, implementation:entry]. Re-run the previous phase.
```

work phase 의 entry ticket 이 **일회용**이라 재발급되지 않는다. learning / planning 은 self-loop 이 있어 재호출이 가능한데 validation 만 그렇지 않다.

**두 가지가 함께 막힌다**:

1. **중단 복구 절차와 모순된다.** `genome/evolution.md` § "중단된 Generation 복구" 는 *"중단된 시점의 phase 부터 다시 실행"* 하라고 지시한다. validation 에서 세션이 끊기면 그 지시를 따를 수 없고, 안내 문구는 "Re-run the previous phase"(= implementation 으로 회귀)라고 말한다 — 작업이 멀쩡히 끝난 상태에서 회귀는 과한 처방이다.

2. **evaluator prompt 가 소실된다.** `evaluator: true` 일 때 `buildEvaluatorPrompt` 의 산출물은 **오직 work phase emit 에만** 실린다. 그것을 놓치면 다시 얻을 방법이 없다. gen-084 에서 실제로 발생했고, evaluator 를 손으로 재구성한 브리프로 호출해야 했다 — 즉 **CLI 가 소유해야 할 지시문이 agent 의 기억에 의존**하게 된다.

## Solution

세 갈래가 있다. 첫 번째를 권한다.

1. **validation:work 에 self-loop 전이를 추가한다** (`NORMAL_TRANSITIONS`). learning/planning 과 같은 형태가 되어 특례가 사라진다. 재호출이 prompt 를 다시 낸다.
2. **읽기 전용 재출력 경로를 만든다** — 예: `reap run validation --phase prompt` 가 nonce 를 소비·발급하지 않고 prompt 만 다시 낸다. transition graph 밖의 side-channel 이며 `report-evaluator` 선례가 있다.
3. **evaluator prompt 만 따로 얻는 경로** — 범위가 가장 좁지만 (1)의 중단 복구 문제는 남는다.

어느 쪽이든 **에러 메시지도 함께 고칠 것**: "Re-run the previous phase" 는 validation 에서는 implementation 회귀를 뜻해 오해를 부른다.

**검증**: e2e 로 `reap run validation` 을 연달아 두 번 호출해 두 번째도 prompt 를 내는지 확인. `evaluator: true` 인 경우 두 번째 호출에도 `context.evaluator.prompt` 가 실리는지 확인 — 그것이 이 항목의 요점이다.

## Files to Change

- `src/core/lifecycle.ts` — `NORMAL_TRANSITIONS` 의 validation 항목
- `src/cli/commands/run/validation.ts` — phase 분기
- `src/core/stage-transition.ts` — 안내 문구
- `tests/e2e/` — validation 재호출 e2e (신규)
