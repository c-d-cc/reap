# Implementation Log — gen-024-1415bf

## Completed Tasks

### T001: verifyBackNonce()에서 setNonce() 호출로 교체
- **파일**: `src/core/stage-transition.ts`
- **변경**: verifyBackNonce() 마지막 부분에서 수동 forward nonce 발급(3줄) 대신 `setNonce(state, target, targetPhase)` 1줄 호출로 교체
- **효과**: setNonce()가 forward + back nonce를 동시 발급하므로 연속 back 가능

### T002: nonce verification 에러 메시지 개선
- **파일**: `src/core/stage-transition.ts`
- **변경**: verifyNonce()와 verifyBackNonce()의 에러 메시지에 `state.phase` 정보 포함
- verifyNonce: `"Nonce verification failed for {stage}:{phase} (current phase: {phase})"`
- verifyBackNonce: `"Back nonce verification failed (current phase: {phase}). Current stage: {stage}, back target: {target}."`

### T003: completion commit 순서 변경
- **파일**: `src/cli/commands/run/completion.ts`
- **변경**: commit phase 내 실행 순서 교정
  - Before: archiveGeneration() → checkSubmoduleDirty() → gitCommitAll()
  - After: checkSubmoduleDirty() → archiveGeneration() → gitCommitAll()
- **효과**: submodule dirty 검증이 먼저 실행되어, 실패 시 generation 상태(current.yml) 보존

### T004: stage-transition unit tests 추가
- **파일**: `tests/unit/stage-transition.test.ts` (신규)
- 9 tests: setNonce forward/back 발급, verifyBackNonce 후 back nonce 재생성, consecutive back (4-stage, full lifecycle, merge), phase 상태 보존

### T005: completion 순서 검증 테스트 추가
- **파일**: `tests/unit/completion-order.test.ts` (신규)
- 1 test: 소스 코드 파싱으로 checkSubmoduleDirty < archiveGeneration < gitCommitAll 순서 검증

### T006: 빌드 및 전체 테스트
- 빌드 성공 (0.40 MB bundle)
- 전체 239 tests 통과 (unit 126 + e2e 72 + scenario 41)
- 기존 229 tests 모두 통과, 신규 10 tests 추가
