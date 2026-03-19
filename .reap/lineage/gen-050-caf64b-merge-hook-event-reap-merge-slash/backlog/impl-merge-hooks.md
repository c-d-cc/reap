---
type: task
status: consumed
consumedBy: gen-050-caf64b
priority: low
title: Merge hook event 등록 로직 구현
---

# Merge hook event 등록 로직

## 범위
1. src/types/index.ts의 ReapHookEvent에 onMergeStart, onGenomeResolved, onMergeComplete 추가
2. hook 스캔/실행 로직에서 merge event 지원
3. MergeGenerationManager에서 적절한 시점에 hook 실행

## 설계
- domain/hook-system.md의 Merge Hook Events 명세 참조
