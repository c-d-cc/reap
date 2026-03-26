# Completion — gen-024-1415bf

## Summary

core stability 버그 2건 수정 완료:

1. **back nonce 재발급**: `verifyBackNonce()`에서 `setNonce()` 호출로 교체하여 연속 back 가능하게 수정. 기존에는 forward nonce만 발급하여 한 번 back 후 다시 back 불가능했음.
2. **completion commit 순서 교정**: `checkSubmoduleDirty()` → `archiveGeneration()` → `gitCommitAll()` 순서로 변경. 기존에는 archive 후 submodule check 실패 시 generation 상태 복구 불가.
3. **에러 메시지 개선**: nonce verification 실패 시 현재 phase 상태를 에러 메시지에 포함하여 디버깅 용이하게 개선.

### Changes
- `src/core/stage-transition.ts` — verifyBackNonce()에서 setNonce() 호출, 에러 메시지 개선
- `src/cli/commands/run/completion.ts` — commit phase 실행 순서 교정
- `tests/unit/stage-transition.test.ts` (신규) — 9 tests
- `tests/unit/completion-order.test.ts` (신규) — 1 test

### Test Results
- 239 tests 전체 통과 (unit 126 + e2e 72 + scenario 41)
- 신규 테스트 10개 추가 (기존 229 → 239)

## Lessons Learned

- `setNonce()` 함수가 이미 forward + back nonce를 동시 발급하는 완전한 구현이었음. `verifyBackNonce()`에서 이를 활용하지 않고 수동으로 forward만 발급한 것이 버그의 원인. 기존 유틸 함수를 재활용하면 코드 중복과 버그를 동시에 줄일 수 있음.
- completion commit phase의 실행 순서는 "되돌릴 수 없는 작업(archive)을 나중에" 원칙을 따라야 함. 검증을 먼저, 파괴적 작업은 나중에.

## Next Generation Hints

- 나머지 스킬 파일들(reap.start, reap.evolve, reap.back 등)의 CLI script 이전 축소 작업이 남아있음.
- environment/summary.md에 테스트 수 업데이트 반영 필요 (229 → 239).
