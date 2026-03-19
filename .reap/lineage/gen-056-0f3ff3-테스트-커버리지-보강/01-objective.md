# Objective

## Goal
테스트 커버리지 보강 — gen-046~054에서 추가된 merge 관련 모듈의 unit test 추가

## Completion Criteria
1. merge-lifecycle.test.ts — MergeLifeCycle 6단계 전환, labels, isValid
2. merge-generation.test.ts — canFastForward, findCommonAncestor
3. merge.test.ts — extractGenomeDiff, classifyConflicts, parseValidationCommands, readGenomeFilesFromRef
4. git.test.ts — gitShow, gitLsTree, gitRefExists (실제 git repo)
5. config.test.ts 보강 — resolveStrict()
6. bun test 전체 통과, 커버리지 개선

## Scope
- **Expected Change Scope**: tests/ (private submodule)
- **Exclusions**: 코어 로직 변경 없음, E2E 테스트 확장 없음
