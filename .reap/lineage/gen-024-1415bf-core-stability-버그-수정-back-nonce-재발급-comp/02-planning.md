# Planning — gen-024-1415bf

## Goal
core stability 버그 2건 수정:
1. `verifyBackNonce()`에서 back nonce 재발급 누락 → 연속 back 불가
2. completion commit phase에서 archive→submodule check 순서 → 실패 시 복구 불가

## Completion Criteria
1. `verifyBackNonce()` 호출 후 back nonce가 재생성되어 연속 back 가능
2. nonce verification 실패 에러 메시지에 현재 phase 상태 포함
3. completion commit phase에서 submodule check가 archive보다 먼저 실행
4. submodule dirty 상태에서 commit 실패 시 current.yml이 보존됨
5. 기존 229 tests 전체 통과
6. 신규 unit test 추가: consecutive back nonce 검증, commit phase 순서 검증

## Approach

### Bug 1: verifyBackNonce 수정
- `verifyBackNonce()` 마지막 부분에서 수동 forward nonce 발급 대신 `setNonce()` 호출
- `setNonce()`는 forward + back nonce를 동시 발급하므로 연속 back 가능
- nonce verification 에러 메시지에 `state.phase` 정보 추가

### Bug 2: completion commit 순서 변경
- `checkSubmoduleDirty()`를 `archiveGeneration()` 이전으로 이동
- 변경 범위가 매우 작음 (코드 블록 순서 교체)

## Tasks
- [ ] T001 `src/core/stage-transition.ts` — verifyBackNonce()에서 setNonce() 호출로 교체
- [ ] T002 `src/core/stage-transition.ts` — verifyNonce() 에러 메시지에 phase 상태 포함
- [ ] T003 `src/cli/commands/run/completion.ts` — commit phase 순서 변경 (submodule check → archive → commit)
- [ ] T004 `tests/unit/stage-transition.test.ts` — consecutive back nonce 검증 테스트
- [ ] T005 `tests/unit/completion-order.test.ts` — commit phase 순서 검증 테스트
- [ ] T006 빌드 및 전체 테스트 실행 (229 + 신규)

## Dependencies
- T001, T002 → 독립적 (동시 수정 가능, 같은 파일)
- T003 → 독립적
- T004 → T001 완료 후
- T005 → T003 완료 후
- T006 → T001~T005 전체 완료 후
