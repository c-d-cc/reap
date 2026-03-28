# Implementation Log

## Completed Tasks

| Task | Description | Status |
|------|-------------|--------|
| T001 | GenerationState 타입 변경: lastNonce/expectedHash/backNonce 등 제거, pendingTransitions 추가 | done |
| T002 | lifecycle.ts에 NORMAL_TRANSITIONS, MERGE_TRANSITIONS graph + getTransitions() 함수 추가 | done |
| T003 | stage-transition.ts: setTransitionNonces(), verifyTransition(), prepareStageEntry() 구현. setNonce/verifyNonce/verifyBackNonce 제거 | done |
| T004 | generation.ts: create/createMerge에서 pendingTransitions로 초기 nonce 발행 | done |
| T005 | learning.ts: verify/set 호출을 새 API로 변경 | done |
| T006 | planning.ts: 동일 | done |
| T007 | implementation.ts: 동일 | done |
| T008 | validation.ts: 동일 | done |
| T009 | completion.ts: reflect/fitness/adapt/commit 모든 phase 변경. fitness self-loop 포함 | done |
| T010 | back.ts: 완전 재작성. prepareStageEntry 사용 | done |
| T011 | detect.ts: merge lifecycle 변경 | done |
| T012 | mate.ts: 동일 | done |
| T013 | merge.ts: 동일 | done |
| T014 | reconcile.ts: 동일 | done |
| T015 | stage-transition.test.ts 전면 재작성 (21 tests) | done |
| T016 | lifecycle.test.ts에 transition graph 테스트 추가 (20 tests) | done |
| T017 | Build + typecheck + 전체 테스트: 487 pass, 8 fail (all pre-existing) | done |

## Discovered Issues

### 1. Back transition 2-step bug 수정
기존 코드에서 setNonce()가 state.stage 기준이 아닌 호출 시점의 stage 기준으로 back target을 계산하여, complete phase 후 back이 2단계 이전으로 점프하는 버그가 있었음. 새 transition graph 기반 시스템에서는 prepareStageEntry()가 정확히 1단계 이전으로만 back을 허용하여 이 버그가 자연스럽게 수정됨. merge scenario test를 이에 맞게 업데이트.

### 2. prepareStageEntry 추가 (계획에 없던 함수)
complete phase 후 next stage entry 전에 back이 가능하려면, entry ticket + back nonce를 동시에 발행해야 함. setTransitionNonces만으로는 불가능하여 prepareStageEntry() 도우미 함수를 추가.

## Architecture Decisions

### verifyTransition 시맨틱
verifyTransition()은 target을 검증하면서 pendingTransitions 전체를 소비(undefined로 설정). 이는 각 전이 시점에서 새로운 nonces가 항상 발행되므로, 부분 소비보다 전체 소비가 더 안전하고 명확함.

### prepareStageEntry vs setTransitionNonces 분리
- setTransitionNonces(state, "X:Y"): X:Y에서 나갈 수 있는 전이에 대한 nonce 발행 (work phase에서 사용)
- prepareStageEntry(state, "X:entry"): X:entry 진입 ticket + X:entry에서의 back nonce 발행 (complete phase, back command, generation create에서 사용)

이 분리가 "enter" vs "continue" 시맨틱을 명확히 구분함.
