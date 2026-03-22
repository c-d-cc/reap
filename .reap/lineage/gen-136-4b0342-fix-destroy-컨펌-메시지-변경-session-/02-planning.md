# Planning

## Summary
2개 버그 수정: destroy 컨펌 메시지 단순화 + session-start.cjs language 주입 누락 수정.

## Technical Context
- **Tech Stack**: TypeScript 5.x, Node.js >=18, Commander.js CLI
- **Constraints**: 파일 I/O는 src/core/fs.ts 유틸 경유, Validation은 `bun test`, `bunx tsc --noEmit`, `npm run build`

## Tasks

### Phase 1: 코드 수정
- [x] T001 `src/cli/index.ts` -- destroy 컨펌 메시지를 `yes destroy`로 변경 (expectedInput, 프롬프트 메시지, 비교 로직)
- [x] T002 `src/templates/hooks/session-start.cjs` -- parseConfig()에서 language destructure + langSection 변수 생성 + reapContext에 삽입

### Phase 2: 검증
- [ ] T003 Validation -- `bunx tsc --noEmit`, `npm run build`, `bun test` 실행

## Dependencies
- T001, T002는 독립적 (병렬 가능)
- T003은 T001, T002 완료 후 실행

## FR-Task 매핑
- FR-1 -> T001
- FR-2, FR-3 -> T002
- NFR-1 -> T003
