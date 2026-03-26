# REAP MANAGED — DO NOT EDIT MANUALLY

# Completion — gen-027-d96aec

## Summary

`reap fix` CLI 명령 구현 완료. v0.15의 integrity.ts를 v16 구조에 맞게 포팅.

### Changes
- `src/core/integrity.ts` — 신규. checkIntegrity(), checkUserLevelArtifacts() 구현 (~350줄)
- `src/cli/commands/fix.ts` — 신규. checkProject(), fixProject(), execute() 구현 (~145줄)
- `src/cli/index.ts` — `reap fix` 명령 등록 (import + command 정의)
- `tests/unit/integrity.test.ts` — 신규. 22개 단위 테스트
- `tests/e2e/fix.test.ts` — 신규. 6개 E2E 테스트

### Test Results
- 232 tests 전체 통과 (unit 148 + e2e 84)

## Lessons Learned

- v15 코드를 그대로 가져오면 v16과 맞지 않는 부분이 있었음 (lineage meta의 startedAt/completedAt vs timeline). 실제 데이터를 확인한 후 수정하는 것이 중요.
- warnings와 errors의 구분이 CI 연동 시 중요. warnings만 있을 때 error status를 반환하면 사용성이 떨어짐.
- v16의 paths가 interface + 함수 패턴이라 v15의 class 패턴보다 테스트 작성이 쉬움.

## Next Generation Hints

- artifact 검증 (이전 stage의 artifact 존재 여부)은 scope에서 제외함. 후속 작업으로 추가 가능.
- genome 파일 자동 복원은 init --repair로 안내만 하고 있음. fix에서 직접 복원하려면 template 경로 관리 필요.
- `reap fix --fix-user` 같은 옵션으로 레거시 사용자 레벨 파일 자동 제거도 고려 가능.
