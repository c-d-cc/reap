# Planning

## Summary
`listCompleted()`는 gen-* 엔트리만 카운트하여 epoch 압축 세대를 누락. `listEpochGenerations()` 함수를 추가하고, `status.ts`와 `nextSeq()`에서 epoch 세대를 포함한 정확한 카운트/시퀀스 계산.

## Technical Context
- **Tech Stack**: TypeScript, Node.js fs/promises, YAML
- **Constraints**: 파일 I/O는 `src/core/fs.ts` 유틸 경유. `parseFrontmatter`는 `compression.ts`에서 이미 export.

## Tasks

- [x] T001 `src/core/lineage.ts` -- `listEpochGenerations()` 함수 추가: epoch.md 파싱하여 세대 ID 배열 반환
- [x] T002 `src/core/lineage.ts` -- `countAllCompleted()` 함수 추가: gen-* 목록 + epoch 세대 수 합산 반환
- [x] T003 `src/cli/commands/status.ts` -- `totalGenerations`에 `countAllCompleted()` 사용
- [x] T004 `src/core/lineage.ts` -- `nextSeq()`가 epoch 세대도 고려하도록 수정
- [x] T005 `tests/` -- 단위 테스트: epoch.md + gen-* 혼합 시나리오

## Dependencies
- T002 → T001 (listEpochGenerations 필요)
- T003 → T002 (countAllCompleted 필요)
- T004 → T001 (listEpochGenerations 필요)
- T005 → T001~T004 완료 후
