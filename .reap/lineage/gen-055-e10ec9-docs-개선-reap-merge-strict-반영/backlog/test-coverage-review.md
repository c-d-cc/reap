---
type: task
status: pending
priority: high
title: 테스트 커버리지 + E2E 테스트 검토
---

# 테스트 커버리지 + E2E 테스트 검토

## 목표
현재 unit test와 E2E test가 얼마나 꼼꼼하게 코어 로직을 커버하고 있는지 검토하고, 부족한 부분을 보강한다.

## 검토 항목

### Unit Test (bun test)
- 현재 105개 테스트가 어떤 모듈을 커버하는지 분석
- gen-046~054에서 추가된 모듈의 테스트 유무 확인:
  - `src/core/merge-lifecycle.ts` — MergeLifeCycle 테스트?
  - `src/core/merge-generation.ts` — MergeGenerationManager, canFastForward, findCommonAncestor 테스트?
  - `src/core/merge.ts` — extractGenomeDiff, classifyConflicts, detectDivergenceFromRefs 테스트?
  - `src/core/git.ts` — gitShow, gitLsTree, gitRefExists 테스트?
  - `src/core/lineage.ts` — listMeta, readMeta, nextSeq, resolveParents 테스트?
  - `src/core/config.ts` — resolveStrict() 테스트?
- 커버리지 측정 (`bun test --coverage`)

### E2E Test
- 현재 3개 스크립트: migration-e2e.sh, worktree-dag-e2e.sh, merge-e2e.sh
- merge-e2e.sh가 커버하는 시나리오 vs 빠진 시나리오:
  - fast-forward 케이스 미테스트
  - genome conflict (WRITE-WRITE) 케이스 미테스트
  - genome conflict (CROSS-FILE) 케이스 미테스트
  - regression (sync 실패 → source-resolve 회귀) 미테스트
- E2E에서 Claude Code 의존 부분 vs bash/node로 대체 가능한 부분

## 수정 방향
- 부족한 unit test 추가 (private submodule c-d-cc/reap-test)
- E2E 시나리오 확장 (conflict 케이스)
- 커버리지 임계값 설정 여부 검토
