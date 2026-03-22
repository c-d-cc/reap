# Planning

## Summary
`tests/e2e/clean-destroy-e2e.sh` E2E 테스트 스크립트 신규 작성. 기존 `skill-loading-e2e.sh` 패턴을 참고하여 `reap destroy`와 `reap clean` 명령어의 동작을 OpenShell 샌드박스에서 검증.

## Technical Context
- **Tech Stack**: Bash (E2E 테스트 스크립트), OpenShell 샌드박스
- **Constraints**: 로컬 실행 금지, openshell run으로만 실행

## Tasks
- [ ] T001 `tests/e2e/clean-destroy-e2e.sh` -- 스크립트 작성 (setup, assert 함수, fake agent, tgz 설치)
- [ ] T002 `tests/e2e/clean-destroy-e2e.sh` -- test_destroy 함수: init -> session-start -> 잘못된 입력 취소 -> 올바른 입력 삭제 -> 검증
- [ ] T003 `tests/e2e/clean-destroy-e2e.sh` -- test_clean 함수: init -> backlog 추가 -> interactive clean -> 결과 검증
- [ ] T004 빌드 + openshell 실행 -- `npm run build && npm pack && openshell run tests/e2e/clean-destroy-e2e.sh --upload *.tgz`

## Dependencies
T001 -> T002 -> T003 -> T004 (순차)

