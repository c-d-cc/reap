# Planning

## Summary
skill-loading-e2e.sh를 검토하여 소스 코드와의 일치성을 확인하고, 필요시 수정한 뒤 OpenShell sandbox에서 실제 실행하여 통과를 확인한다.

## Technical Context
- **Tech Stack**: Bash (E2E 테스트), Node.js (session-start.cjs), OpenShell (sandbox 실행)
- **Constraints**: E2E는 반드시 `openshell run`으로 sandbox에서 실행

## Regression
gen-116에서 E2E를 재작성했으나 실제 실행 검증 미확인. 이번에 실행 + 수정.

## Tasks

### Phase 1: 검토 및 수정
- [x] T001 `tests/e2e/skill-loading-e2e.sh` -- 소스 코드(session-start.cjs, opencode-session-start.js, opencode.ts)와 테스트의 일치성 검토
- [x] T002 `tests/e2e/skill-loading-e2e.sh` -- 불일치 발견 시 수정

### Phase 2: 빌드 및 실행
- [x] T003 빌드: `npm run build`
- [x] T004 패키지: `npm pack`
- [x] T005 OpenShell에서 E2E 실행: `openshell run tests/e2e/skill-loading-e2e.sh --upload *.tgz`
- [x] T006 실패 시 수정 → 재빌드 → 재실행 반복

## Dependencies
- T002 → T001 (검토 후 수정)
- T003 → T002 (수정 후 빌드)
- T004 → T003
- T005 → T004
- T006 → T005

