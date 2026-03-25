# Planning — gen-019-9ec1a6

## Goal
validation에서 submodule dirty check 자동화

## Tasks
- [x] T001: git.ts — checkSubmoduleDirty() 함수 (이미 구현됨)
- [x] T002: completion.ts — commit phase에 dirty check (이미 구현됨)
- [x] T003: push.ts — dirty check (이미 구현됨)
- [x] T004: tests/unit/git-submodule.test.ts — 5 tests (이미 구현됨)
- [x] T005: typecheck + build + 전체 테스트 통과 확인

## Completion Criteria
1. checkSubmoduleDirty() 함수 존재
2. completion commit에서 dirty submodule 차단
3. push에서 dirty submodule 차단
4. 173+ tests 통과
