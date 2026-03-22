---
type: task
status: pending
---

# resolveParents()에서 NaN completedAt 정렬 버그

## 문제

`resolveParents()`가 `completedAt` 기준 정렬 시 압축된 generation의 `completedAt: legacy-45` 같은 값이 `NaN`을 반환하여 sort가 비정상 동작. 모든 새 generation이 gen-045를 parent로 갖게 됨.

## 원인

- `src/core/lineage.ts:70-72`: `new Date(b.completedAt).getTime()` — invalid date → NaN
- JS에서 NaN 비교는 항상 false → sort 결과가 불안정
- 압축된 .md의 frontmatter에 `completedAt: legacy-45` 같은 placeholder 값 존재

## 영향 범위

1. **resolveParents()** — 모든 새 generation의 parent가 잘못됨 (수동 복구 완료)
2. **compressLineageIfNeeded()** — 동일한 completedAt 정렬 사용. gen-114가 비정상적으로 Level 1 압축됨 (최근인데 보호 대상에서 빠짐)

## 수정 방향

1. `resolveParents()` 정렬 시 invalid date를 0으로 fallback
2. `compressLineageIfNeeded()`의 정렬도 동일하게 수정
3. 압축 시 completedAt을 유효한 ISO 날짜로 보장
4. gen-114 복구 여부 검토 (이미 Level 1 압축되어 원본 artifact 손실)
