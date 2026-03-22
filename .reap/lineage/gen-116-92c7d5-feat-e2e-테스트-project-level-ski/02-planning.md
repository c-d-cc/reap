# Planning

## Summary
`tests/e2e/skill-loading-e2e.sh`를 v0.13.x 기준으로 전면 재작성. Claude Code skills 설치 검증과 OpenCode plugin 설치 검증을 모두 포함.

## Technical Context
- **Tech Stack**: Bash (E2E 테스트 스크립트), Node.js (session hook 실행)
- **Constraints**: OpenShell sandbox에서 실행, 로컬 빌드 `.tgz` 사용, `claude`/`opencode` CLI는 sandbox에 없으므로 직접 Node.js로 hook 실행

## Tasks

### Phase 1: 스크립트 재작성
- [x] T001 `tests/e2e/skill-loading-e2e.sh` -- helper 함수 유지, 테스트 함수 전면 교체
- [x] T002 `tests/e2e/skill-loading-e2e.sh` -- `test_claude_code_skills()`: reap init 후 커맨드 설치, session-start.cjs로 skills 생성, frontmatter 검증, legacy 정리, .gitignore 확인
- [x] T003 `tests/e2e/skill-loading-e2e.sh` -- `test_opencode_setup()`: reap init 후 커맨드 설치, plugin 설치 경로 확인
- [x] T004 `tests/e2e/skill-loading-e2e.sh` -- `test_non_reap_isolation()`: Non-REAP 프로젝트에서 Claude Code skills 및 OpenCode 커맨드 미생성 확인

### Phase 2: E2E 실행
- [x] T005 빌드 + pack (`npm run build && npm pack`)
- [x] T006 `openshell run tests/e2e/skill-loading-e2e.sh --upload *.tgz` 실행 및 통과 확인

## Dependencies
- T002, T003, T004 → T001 (helper 함수 먼저)
- T005 → T001~T004 완료 후
- T006 → T005 완료 후
