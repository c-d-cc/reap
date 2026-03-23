# Planning

## Summary
`src/core/compression.ts`의 상수 2개를 변경하고, 테스트의 기대값을 업데이트한다.
- `LEVEL1_PROTECTED_COUNT`: 3 → 20
- `LINEAGE_MAX_LINES`: 5,000 → 10,000
- `source-map.md`의 LINEAGE_MAX_LINES 문서값도 업데이트

## Technical Context
- **Tech Stack**: TypeScript, Bun (테스트)
- **Constraints**: 로직 변경 없이 상수값만 변경. 기존 테스트 전부 통과 필수.

## Tasks
- [x] T001 `src/core/compression.ts` -- `LEVEL1_PROTECTED_COUNT`를 3에서 20으로 변경
- [x] T002 `src/core/compression.ts` -- `LINEAGE_MAX_LINES`를 5,000에서 10,000으로 변경
- [x] T003 `tests/core/compression.test.ts` -- 테스트 기대값 업데이트 (6개 generation → 25개 등 LEVEL1_PROTECTED_COUNT=20에 맞게)
- [x] T004 `.reap/genome/source-map.md` -- LINEAGE_MAX_LINES 문서값 10,000으로 업데이트 (genome-change backlog)
- [x] T005 전체 테스트 실행 (`bun test`) 후 통과 확인 (619 pass, 0 fail)

## Dependencies
- T001, T002: 독립 실행 가능 (동일 파일이므로 순차)
- T003: T001 완료 후 진행
- T004: T002 완료 후 진행
- T005: T001~T004 모두 완료 후 진행

