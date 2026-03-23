# Planning

## Summary
Nonce 토큰 구조를 receiver-based `stage:phase` 단일 형식으로 통일한다. `verifyStageEntry`/`setPhaseNonce`/`verifyPhaseEntry` 3개 함수를 `verifyNonce`/`setNonce` 2개 함수로 교체하고, 14개 stage command 파일의 보일러플레이트를 정리한다.

## Technical Context
- **Tech Stack**: TypeScript 5.x, Node.js >=18, Bun (개발/테스트)
- **Constraints**: strict mode, 함수 50줄 이하, `src/core/fs.ts` 유틸 사용

## Implementation Approach

### Phase 1: Core 함수 변경
1. `generation.ts`의 `generateToken`/`verifyToken`에서 `phase` 파라미터를 필수로 변경
2. `stage-transition.ts`에서 `verifyNonce`/`setNonce` 구현, 기존 3개 함수 제거

### Phase 2: Command 파일 일괄 수정
모든 stage command에서 통일된 패턴 적용:
- work phase 진입: `verifyNonce(cmd, state, stage, "entry")` → `setNonce(state, stage, "complete")`
- complete phase 진입: `verifyNonce(cmd, state, stage, "complete")` → `setNonce(state, nextStage, "entry")`

### Phase 3: 테스트 수정 및 검증

## Tasks

### Phase 1: Core 변경
- [ ] T001 `src/core/generation.ts` -- `generateToken`의 `phase` 파라미터 필수화, 해시 형식 항상 `stage:phase`
- [ ] T002 `src/core/generation.ts` -- `verifyToken`의 `phase` 파라미터 필수화
- [ ] T003 `src/core/stage-transition.ts` -- `verifyNonce(command, state, stage, phase)` 함수 구현 (verifyStageEntry + verifyPhaseEntry 통합)
- [ ] T004 `src/core/stage-transition.ts` -- `setNonce(state, stage, phase)` 함수 구현 (setPhaseNonce 대체 + stage token 생성 통합)
- [ ] T005 `src/core/stage-transition.ts` -- `verifyStageEntry`, `setPhaseNonce`, `verifyPhaseEntry` 제거

### Phase 2: Normal lifecycle command 수정
- [ ] T006 `src/cli/commands/run/start.ts` -- `generateToken(id, stage)` → `setNonce(state, "objective", "entry")`
- [ ] T007 `src/cli/commands/run/objective.ts` -- work: `verifyNonce + setNonce(complete)`, complete: `verifyNonce + setNonce(planning, entry)`
- [ ] T008 `src/cli/commands/run/planning.ts` -- 동일 패턴 적용
- [ ] T009 `src/cli/commands/run/implementation.ts` -- 동일 패턴 적용
- [ ] T010 `src/cli/commands/run/validation.ts` -- 동일 패턴 적용
- [ ] T011 `src/cli/commands/run/completion.ts` -- retrospective: `verifyNonce(entry) + setNonce(complete)`, feedKnowledge: `verifyNonce(complete)`, setNonce 불필요 (마지막)
- [ ] T012 `src/cli/commands/run/evolve-recovery.ts` -- `generateToken` → `setNonce`

### Phase 3: Merge lifecycle command 수정
- [ ] T013 `src/cli/commands/run/merge-detect.ts` -- 동일 패턴 적용 (첫 stage이므로 work에서 entry verify skip)
- [ ] T014 `src/cli/commands/run/merge-mate.ts` -- 동일 패턴
- [ ] T015 `src/cli/commands/run/merge-merge.ts` -- 동일 패턴
- [ ] T016 `src/cli/commands/run/merge-sync.ts` -- 동일 패턴
- [ ] T017 `src/cli/commands/run/merge-validation.ts` -- 동일 패턴
- [ ] T018 `src/cli/commands/run/merge-completion.ts` -- 동일 패턴 (마지막이므로 archive에서 setNonce 불필요)

### Phase 4: 테스트 수정 및 검증
- [ ] T019 `tests/` -- 기존 `generateToken`/`verifyToken`/`verifyStageEntry`/`setPhaseNonce`/`verifyPhaseEntry` 호출 테스트 수정
- [ ] T020 검증: `bun test`, `bunx tsc --noEmit`, `npm run build` 통과 확인

## Dependencies
- T001, T002 → T003, T004 (generation.ts 변경 선행)
- T003, T004 → T005 (새 함수 구현 후 구 함수 제거)
- T005 → T006~T018 (core 변경 완료 후 command 파일 수정)
- T006~T018 → T019 (command 수정 후 테스트 수정)
- T019 → T020 (테스트 수정 후 검증)

## E2E Test Scenarios
이 변경은 내부 리팩토링이므로 기존 E2E 테스트가 통과하면 충분하다.
- **Scenario 1**: start → objective → planning → implementation → validation → completion 전체 라이프사이클 - 각 단계의 token chain이 정상 동작하는지 검증
- **Scenario 2**: stage skip 시도 (work phase 없이 --phase complete) - 여전히 차단되는지 검증
