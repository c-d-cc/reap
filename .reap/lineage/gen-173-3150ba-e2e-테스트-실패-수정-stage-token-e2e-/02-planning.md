# Planning

## Summary
E2E 테스트 2개 파일 수정: stage-token-e2e.sh Test 8 기대값 수정, migration-e2e.sh sandbox 환경 감지 + skip 처리

## Technical Context
- **Tech Stack**: Bash E2E 테스트 스크립트
- **Constraints**: 프로덕션 코드 변경 없음, 테스트 스크립트만 수정

## Tasks
- [ ] T001 `tests/e2e/stage-token-e2e.sh` -- Test 8 기대값 수정: assert_neq → assert_eq (exit 0), assert_match 패턴을 auto-transition 성공 메시지로 변경
- [ ] T002 `tests/e2e/migration-e2e.sh` -- 스크립트 상단에 sandbox tarball 존재 여부 체크 추가, 미존재 시 skip 메시지 출력 + exit 0
- [ ] T003 version bump -- package.json 0.15.16 → 0.15.17
- [ ] T004 validation -- stage-token-e2e.sh 실행 전체 pass 확인
- [ ] T005 validation -- migration-e2e.sh 로컬 실행 시 skip 확인
- [ ] T006 validation -- bun test 전체 통과 확인
- [ ] T007 validation -- bunx tsc --noEmit 타입체크 통과 확인

## Dependencies
- T001, T002: 독립 (병렬 가능)
- T003: T001, T002 완료 후
- T004~T007: T001~T003 완료 후
