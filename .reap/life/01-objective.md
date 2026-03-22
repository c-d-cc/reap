# REAP MANAGED — Do not modify directly. Use reap run commands.
# Objective

## Goal
resolveParents() 및 compression의 NaN completedAt 정렬 버그 수정

`resolveParents()`가 `new Date(b.completedAt).getTime()`으로 정렬할 때, compressed .md 세대의 `completedAt`이 `legacy-45` 같은 비 ISO 문자열이면 `NaN`이 되어 정렬이 불안정해진다. 같은 패턴이 `compression.ts`의 `scanLineage()`에도 존재한다.

## Completion Criteria
1. `resolveParents()`에서 NaN completedAt을 가진 세대가 올바르게 정렬된다 (NaN은 가장 오래된 것으로 처리)
2. `scanLineage()`에서도 동일한 안전한 비교가 적용된다
3. `bun test` 통과
4. `bunx tsc --noEmit` 통과
5. `npm run build` 통과

## Requirements

### Functional Requirements
1. FR-1: `resolveParents()`의 completedAt 정렬에서 NaN을 0으로 폴백
2. FR-2: `scanLineage()`의 completedAt 정렬에서 빈 문자열/비 ISO 값을 안전하게 처리
3. FR-3: 공유 유틸리티 함수 `safeCompletedAtTime()` 도입으로 중복 제거

### Non-Functional Requirements
1. NFR-1: 기존 동작에 영향 없음 (정상 ISO 날짜는 그대로 동작)

## Design

### Selected Design
`safeCompletedAtTime(dateStr: string): number` 유틸리티 함수를 도입하여 `new Date(str).getTime()`의 결과가 `NaN`이면 0을 반환한다. `lineage.ts`와 `compression.ts` 모두 이 함수를 사용한다.

## Scope
- **Related Genome Areas**: src/core/lineage.ts, src/core/compression.ts
- **Expected Change Scope**: 2개 파일, 인라인 유틸리티 또는 공유 함수 추가
- **Exclusions**: genome 변경 없음, 새 파일 생성 불필요

## Genome Reference
없음

## Backlog (Genome Modifications Discovered)
None

## Background
gen-045 (compressed)가 항상 parent로 선택되는 현상. `completedAt: legacy-45`가 NaN으로 파싱되어 JS의 NaN 비교가 항상 false를 반환하기 때문.

