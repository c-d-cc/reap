# Planning

## Summary
phase 전환 시 nonce 검증을 추가하여, AI가 work phase를 건너뛰고 바로 complete phase를 호출하는 것을 방지한다. 기존 stage nonce 시스템과 독립적으로 동작하는 phase nonce 시스템을 구축한다.

## Technical Context
- **Tech Stack**: TypeScript, Node.js crypto (randomBytes, createHash)
- **Constraints**: 기존 `generateStageToken`/`verifyStageToken` 패턴을 따름. `current.yml`에 `lastPhaseNonce`/`expectedPhaseTokenHash` 필드 추가.

## Implementation Plan

### Phase 1: Core Infrastructure (T001-T003)

- [ ] T001 `src/types/index.ts` -- `GenerationState`에 `lastPhaseNonce?: string`, `expectedPhaseTokenHash?: string` 필드 추가
- [ ] T002 `src/core/generation.ts` -- `generatePhaseToken(genId, stage, phase)`, `verifyPhaseToken(token, genId, stage, phase, expectedHash)` 함수 추가
- [ ] T003 `src/core/stage-transition.ts` -- `setPhaseNonce(state, stage, phase)`, `verifyPhaseEntry(command, state, stage, phase)` 공통 헬퍼 추가

### Phase 2: Normal Lifecycle (T004-T008)

- [ ] T004 `src/cli/commands/run/objective.ts` -- work phase 끝에 `setPhaseNonce` 호출, complete phase 시작에 `verifyPhaseEntry` 호출
- [ ] T005 `src/cli/commands/run/planning.ts` -- work phase 끝에 `setPhaseNonce` 호출, complete phase 시작에 `verifyPhaseEntry` 호출
- [ ] T006 `src/cli/commands/run/implementation.ts` -- work phase 끝에 `setPhaseNonce` 호출, complete phase 시작에 `verifyPhaseEntry` 호출
- [ ] T007 `src/cli/commands/run/validation.ts` -- work phase 끝에 `setPhaseNonce` 호출, complete phase 시작에 `verifyPhaseEntry` 호출
- [ ] T008 `src/cli/commands/run/completion.ts` -- retrospective phase 끝에 feedKnowledge용 nonce, feedKnowledge phase 시작에 검증 + 끝에 commit용 nonce 생성 (archive phase 시작에 검증은 feedKnowledge에서 archive로 이미 자동 진행되므로 불필요)

### Phase 3: Merge Lifecycle (T009-T014)

- [ ] T009 `src/cli/commands/run/merge-detect.ts` -- review phase 끝에 `setPhaseNonce`, complete phase 시작에 `verifyPhaseEntry`
- [ ] T010 `src/cli/commands/run/merge-mate.ts` -- resolve phase 끝에 `setPhaseNonce`, complete phase 시작에 `verifyPhaseEntry`
- [ ] T011 `src/cli/commands/run/merge-merge.ts` -- work phase 끝에 `setPhaseNonce`, complete phase 시작에 `verifyPhaseEntry`
- [ ] T012 `src/cli/commands/run/merge-sync.ts` -- verify phase 끝에 `setPhaseNonce`, complete phase 시작에 `verifyPhaseEntry`
- [ ] T013 `src/cli/commands/run/merge-validation.ts` -- work phase 끝에 `setPhaseNonce`, complete phase 시작에 `verifyPhaseEntry`
- [ ] T014 `src/cli/commands/run/merge-completion.ts` -- retrospective phase 끝에 archive용 nonce, archive phase 시작에 `verifyPhaseEntry`

## Dependencies
- T002 depends on T001 (타입 필드 정의 후 함수 구현)
- T003 depends on T002 (함수 정의 후 헬퍼 구현)
- T004-T014 depend on T003 (공통 헬퍼 완성 후 적용)
- T004-T008은 병렬 가능
- T009-T014는 병렬 가능

## Key Design Decisions
1. `generatePhaseToken`은 `genId + stage + ":" + phase` 조합으로 해시를 생성하여, stage nonce와 충돌하지 않도록 한다.
2. `setPhaseNonce`는 state에 `lastPhaseNonce`/`expectedPhaseTokenHash`를 설정하고 state를 저장한다.
3. `verifyPhaseEntry`는 검증 후 두 필드를 삭제한다. 검증 실패 시 `emitError`로 에러를 발생시킨다.
4. completion/merge-completion의 마지막 phase(feedKnowledge→commit)에서는 feedKnowledge가 직접 archive를 실행하므로, feedKnowledge 끝에서 nonce를 설정하지 않고 별도의 `--phase archive` 호출에 대해서만 검증한다.

## Self-Verification
- FR-01 → T001
- FR-02 → T002
- FR-03 → T004-T007, T009-T013
- FR-04 → T004-T007, T009-T013
- FR-05 → T008
- FR-06 → T008
- FR-07 → T009-T014
- FR-08 → 독립 필드(`lastPhaseNonce`/`expectedPhaseTokenHash`) 사용으로 보장
