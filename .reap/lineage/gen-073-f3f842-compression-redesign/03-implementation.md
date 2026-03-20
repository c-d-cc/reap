# Implementation

## Changes

### `src/core/git.ts`
- `gitAllBranches(cwd)` 함수 추가: local + remote branch 목록 반환

### `src/core/paths.ts`
- `projectRoot`를 `readonly`로 변경 (외부 접근 허용)

### `src/core/compression.ts`
- 상수: `LEVEL2_BATCH_SIZE` 삭제, `LEVEL2_MIN_LEVEL1_COUNT=100`, `LEVEL2_PROTECTED_COUNT=9` 추가
- `findForkedByOtherBranches()`: 모든 branch의 lineage를 git ref로 스캔, fork point 탐지
- `isInEpoch()`: generation ID가 epoch.md에 포함되어 있는지 확인 (export)
- `compressLevel2Single()`: 싱글 epoch.md 파일로 압축, frontmatter에 generations hash chain 보존, 기존 epoch.md가 있으면 append
- main entry point: Level 2 트리거 100개 초과, fork cutoff + 최근 9개 보호

### `src/core/generation.ts`
- `compressLineageIfNeeded` 호출 시 `projectRoot` 전달

### `src/templates/commands/reap.completion.md`
- Phase 6: Lineage Compression 단계 추가

### `src/templates/commands/reap.merge.start.md`
- Gate에 epoch 차단 조건 추가
