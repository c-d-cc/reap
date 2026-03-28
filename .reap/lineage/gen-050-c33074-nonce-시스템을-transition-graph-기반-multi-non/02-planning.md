# Planning

## Goal

Nonce 시스템을 transition graph 기반 multi-nonce 발행으로 리팩토링. 현재 forward nonce 1개 + back nonce 1개 구조를 `pendingTransitions` map 기반으로 교체하여, 각 phase에서 허용된 모든 전이에 대해 nonce를 동시 발행.

## Completion Criteria

1. `lifecycle.ts`에 Normal + Merge transition graph가 선언적으로 정의됨
2. `GenerationState`의 nonce 관련 필드가 `pendingTransitions` map으로 교체됨
3. `stage-transition.ts`의 `setNonce()`가 graph를 참조하여 다중 nonce 발행
4. `verifyNonce()`가 `pendingTransitions`에서 해당 전이를 찾아 검증/소비
5. `verifyBackNonce()`가 `pendingTransitions` 통합 검증으로 대체 (별도 함수 제거)
6. 모든 13개 stage command가 새 API에 맞게 수정됨
7. `generation.ts`의 `create()` / `createMerge()`가 새 형식으로 초기 nonce 발행
8. 기존 테스트 전면 수정 + 새 transition graph 테스트 추가
9. 전체 테스트 통과 (기존 474개 기준)
10. `current.yml`에 `pendingTransitions` 구조가 올바르게 직렬화됨

## Approach

### Transition Graph 설계

`lifecycle.ts`에 선언적 graph 정의. 키는 현재 `stage:phase`, 값은 허용된 다음 `stage:phase` 배열.

```typescript
// Normal lifecycle
const NORMAL_TRANSITIONS: Record<string, string[]> = {
  "learning:entry":           ["learning:complete"],
  "learning:complete":        ["planning:entry"],
  "planning:entry":           ["planning:complete"],
  "planning:complete":        ["implementation:entry"],
  "implementation:entry":     ["implementation:complete"],
  "implementation:complete":  ["validation:entry"],
  "validation:entry":         ["validation:complete"],
  "validation:complete":      ["completion:entry"],
  "completion:entry":         ["completion:fitness"],
  "completion:fitness":       ["completion:adapt", "completion:fitness"],
  "completion:adapt":         ["completion:commit"],
  "completion:commit":        [],
};
```

Back transition은 graph에 명시적으로 포함:
```typescript
// 각 stage:entry에서 이전 stage:entry로의 전이 추가
"planning:entry":           ["planning:complete", "learning:entry"],
"implementation:entry":     ["implementation:complete", "planning:entry"],
"validation:entry":         ["validation:complete", "implementation:entry"],
"completion:entry":         ["completion:fitness", "validation:entry"],
```

### State 변경

```typescript
// Before
interface GenerationState {
  lastNonce?: string;
  expectedHash?: string;
  phase?: string;
  backNonce?: string;
  backExpectedHash?: string;
  backTarget?: string;
  backTargetPhase?: string;
}

// After
interface GenerationState {
  phase?: string;  // 유지 — 현재 phase 표시용
  pendingTransitions?: Record<string, { nonce: string; hash: string }>;
  // key: "planning:entry", "learning:entry" 등
}
```

### API 변경

```typescript
// Before
setNonce(state, stage, phase)  // forward 1개 + back 1개
verifyNonce(command, state, stage, phase)  // forward 소비
verifyBackNonce(command, state)  // back 소비

// After
setTransitionNonces(state, currentStagePhase)  // graph lookup → 다중 nonce 발행
verifyTransition(command, state, targetStagePhase)  // 통합 검증/소비
// verifyBackNonce 제거 — verifyTransition으로 통합
```

## Risk Assessment

- **범위 과대**: 13개 command 파일 수정 + core 모듈 3개. 한 곳이라도 빠지면 nonce 오류. 체계적으로 각 command의 verify/set 패턴을 변환해야 함.
- **Completion fitness self-loop**: 현재 workaround(같은 nonce 재발행)를 graph에서 자연스럽게 표현 가능. `completion:fitness` → `completion:fitness` 전이 허용.
- **current.yml 직렬화**: YAML의 nested map 직렬화가 정상적인지 검증 필요.

## Scope

### 변경 대상
- `src/types/index.ts` — GenerationState 타입 변경
- `src/core/lifecycle.ts` — transition graph 정의 + lookup 함수
- `src/core/nonce.ts` — 변경 없음 (순수 함수 유지)
- `src/core/stage-transition.ts` — setNonce/verifyNonce/verifyBackNonce → setTransitionNonces/verifyTransition
- `src/core/generation.ts` — create/createMerge 초기 nonce 발행
- `src/cli/commands/run/learning.ts` — verify/set 호출 변경
- `src/cli/commands/run/planning.ts` — 동일
- `src/cli/commands/run/implementation.ts` — 동일
- `src/cli/commands/run/validation.ts` — 동일
- `src/cli/commands/run/completion.ts` — 동일 (fitness self-loop 포함)
- `src/cli/commands/run/back.ts` — verifyBackNonce → verifyTransition
- `src/cli/commands/run/detect.ts` — merge lifecycle
- `src/cli/commands/run/mate.ts` — 동일
- `src/cli/commands/run/merge.ts` — 동일
- `src/cli/commands/run/reconcile.ts` — 동일
- `tests/unit/stage-transition.test.ts` — 전면 재작성
- `tests/unit/nonce.test.ts` — 변경 불필요

### Scope 외
- Evaluator agent 구현
- 새 transition 경로 추가 (validation → implementation 등 micro-loop — 향후 별도 generation)

## Tasks

- [ ] T001 `src/types/index.ts` — GenerationState 타입 변경: lastNonce/expectedHash/backNonce 등 제거, pendingTransitions 추가
- [ ] T002 `src/core/lifecycle.ts` — NORMAL_TRANSITIONS, MERGE_TRANSITIONS graph 정의 + `getTransitions(type, stagePhase)` lookup 함수
- [ ] T003 `src/core/stage-transition.ts` — `setTransitionNonces()`, `verifyTransition()` 구현. 기존 `setNonce`, `verifyNonce`, `verifyBackNonce` 대체
- [ ] T004 `src/core/generation.ts` — `create()`, `createMerge()`에서 새 API로 초기 nonce 발행
- [ ] T005 `src/cli/commands/run/learning.ts` — verify/set 호출을 새 API로 변경
- [ ] T006 `src/cli/commands/run/planning.ts` — 동일
- [ ] T007 `src/cli/commands/run/implementation.ts` — 동일
- [ ] T008 `src/cli/commands/run/validation.ts` — 동일
- [ ] T009 `src/cli/commands/run/completion.ts` — 동일 (fitness self-loop 처리 포함)
- [ ] T010 `src/cli/commands/run/back.ts` — verifyBackNonce 제거, verifyTransition 사용
- [ ] T011 `src/cli/commands/run/detect.ts` — merge lifecycle 변경
- [ ] T012 `src/cli/commands/run/mate.ts` — 동일
- [ ] T013 `src/cli/commands/run/merge.ts` — 동일
- [ ] T014 `src/cli/commands/run/reconcile.ts` — 동일
- [ ] T015 `tests/unit/stage-transition.test.ts` — 전면 재작성 (새 API 테스트)
- [ ] T016 `tests/unit/lifecycle.test.ts` — transition graph 테스트 (새 파일)
- [ ] T017 Build + typecheck + 전체 테스트 실행

## Dependencies

- T001 선행 → T002, T003 (타입이 먼저 정의되어야 함)
- T002 선행 → T003 (graph가 있어야 transition 함수 구현 가능)
- T003 선행 → T004~T014 (core API가 있어야 command 수정 가능)
- T004~T014 완료 → T015, T016 (전체 API 확정 후 테스트)
- T015, T016 완료 → T017 (전체 검증)
