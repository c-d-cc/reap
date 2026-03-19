---
type: task
status: pending
priority: high
title: merge.ts git ref 기반 리팩터 + reap merge CLI
---

# merge.ts git ref 기반 리팩터 + reap merge CLI

## 범위
1. merge.ts의 extractGenomeDiff, detectDivergence를 git ref 기반으로 수정
   - `git show {ref}:{path}` 로 상대 branch genome/lineage 읽기
   - temp dir 추출 또는 in-memory 비교
2. `reap merge {branch}` CLI subcommand 구현
   - MergeGenerationManager.create() 호출
   - git ref 기반 detect 실행
3. reap.merge.* slash command 템플릿 7종 작성

## 선행 조건
- domain/collaboration.md, domain/merge-lifecycle.md 명세 확정 (gen-047)
