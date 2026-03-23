# Planning

## Summary
`integrity.ts`의 `checkGenome` 함수에서 source-map.md를 줄수 경고 대상에서 제외하고, source-map.md의 줄수 한도 문구를 제거한다.

## Technical Context
- **Tech Stack**: TypeScript, Node.js
- **Constraints**: 파일 I/O는 src/core/fs.ts 유틸 경유

## Tasks
- [x] T001 `src/core/integrity.ts` -- checkGenome 함수에서 source-map.md에 대한 줄수 검사 건너뛰기 (GENOME_LINE_WARNING_THRESHOLD 조건에 파일명 예외 추가)
- [x] T002 `.reap/genome/source-map.md` -- 상단 설명의 "줄 수 한도: ~150줄" 문구 제거
- [x] T003 테스트 실행 -- 기존 테스트 통과 확인

## Dependencies
- T001, T002: 독립적, 병렬 수행 가능
- T003: T001 완료 후 실행

