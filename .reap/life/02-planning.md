# REAP MANAGED — Do not modify directly. Use reap run commands.
# Planning

## Summary
`completedAt` 필드가 비 ISO 문자열(예: `legacy-45`)일 때 `new Date().getTime()`이 NaN을 반환하여 정렬이 불안정해지는 버그를 수정한다. `safeCompletedAtTime()` 유틸리티를 `lineage.ts`에 추가하고 `compression.ts`에서도 import하여 사용한다.

## Technical Context
- **Tech Stack**: TypeScript, Node.js fs/promises
- **Constraints**: 새 파일 생성 불필요, 기존 파일 2개만 수정

## Tasks
- [x] T001 `src/core/lineage.ts` -- `safeCompletedAtTime(dateStr: string): number` 유틸리티 함수 추가. NaN이면 0 반환.
- [x] T002 `src/core/lineage.ts` -- `resolveParents()`의 정렬을 `safeCompletedAtTime()` 사용으로 변경
- [x] T003 `src/core/compression.ts` -- `scanLineage()`의 `completedAt` 정렬에서 `safeCompletedAtTime()` import 및 사용

## Dependencies
- T002, T003은 T001에 의존

