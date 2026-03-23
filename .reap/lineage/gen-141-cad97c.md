---
id: gen-141-cad97c
type: normal
parents:
  - gen-140-80b51f
goal: "fix: resolveParents 및 compression의 NaN completedAt 정렬 버그 수정"
genomeHash: c8d4e1e4
startedAt: 2026-03-22T14:58:55.702Z
completedAt: 2026-03-22T15:03:47.427Z
---

# gen-141-cad97c
- **Goal**: resolveParents 및 compression의 NaN completedAt 정렬 버그 수정
- **Period**: 2026-03-22 ~ 2026-03-23
- **Genome Version**: v50 → v50 (변경 없음)
- **Result**: pass
- **Key Changes**:
  - `src/core/lineage.ts`: `safeCompletedAtTime()` 유틸리티 추가, `resolveParents()` 정렬 수정
  - `src/core/compression.ts`: `safeCompletedAtTime()` inline 추가, `scanLineage()` 정렬 수정

## Objective
resolveParents() 및 compression의 NaN completedAt 정렬 버그 수정

`resolveParents()`가 `new Date(b.completedAt).getTime()`으로 정렬할 때, compressed .md 세대의 `completedAt`이 `legacy-45` 같은 비 ISO 문자열이면 `NaN`이 되어 정렬이 불안정해진다. 같은 패턴이 `compression.ts`의 `scanLineage()`에도 존재한다.

## Completion Conditions
1. `resolveParents()`에서 NaN completedAt을 가진 세대가 올바르게 정렬된다 (NaN은 가장 오래된 것으로 처리)
2. `scanLineage()`에서도 동일한 안전한 비교가 적용된다
3. `bun test` 통과
4. `bunx tsc --noEmit` 통과
5. `npm run build` 통과

## Result: pass

## Lessons
#### What Went Well
- 버그 원인이 명확하여 빠르게 수정 완료
- 순환 의존성 문제를 사전에 감지하여 inline 방식으로 해결

[...truncated]