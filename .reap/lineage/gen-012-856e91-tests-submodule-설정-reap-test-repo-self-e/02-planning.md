# Planning — gen-012-856e91

## Goal
tests/ submodule 설정 — reap-test repo self-evolve branch

## Tasks

- [ ] T001: reap-test repo clone → self-evolve branch 생성 → 초기 구조 (README + unit/e2e/scenario dirs) → push
- [ ] T002: reap 프로젝트에 `git submodule add -b self-evolve https://github.com/c-d-cc/reap-test.git tests`
- [ ] T003: .npmignore에 tests/ 추가
- [ ] T004: 검증 — submodule init/update 동작 확인, .gitmodules 내용 확인

## Completion Criteria
1. tests/ 디렉토리가 git submodule로 존재
2. .gitmodules에 reap-test repo, self-evolve branch 설정
3. tests/ 내부에 unit/, e2e/, scenario/ 디렉토리 존재
4. .npmignore에 tests/ 포함
5. reap-test repo의 self-evolve branch에 초기 구조 push됨
