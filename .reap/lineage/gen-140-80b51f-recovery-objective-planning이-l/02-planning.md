# Planning

## Summary
gen-138-26723a에서 구현된 `lastSyncedGeneration` 기반 코드를 검증한다. 6개 파일을 검토하여 `lastSyncedGeneration`이 올바르게 사용되고 `lastSyncedCommit`이 primary 용도로 남아있지 않은지 확인한다.

## Technical Context
- **Tech Stack**: TypeScript 5.x, Node.js >=18, Commander.js, YAML
- **Constraints**: 파일 I/O는 `src/core/fs.ts` 유틸 경유, config는 YAML 포맷

## Tasks

### Phase 1: 타입 & 설정 인프라 검증
- [ ] T001 `src/types/index.ts` -- `ReapConfig`에 `lastSyncedGeneration?: string` 필드 존재 확인, `lastSyncedCommit`이 primary가 아닌지 확인 (FR-01)
- [ ] T002 `src/core/config.ts` -- `backfill()`에서 `lastSyncedGeneration` 기본값 + legacy `lastSyncedCommit` 마이그레이션 로직 확인 (FR-02)

### Phase 2: sync-genome 동작 검증
- [ ] T003 `src/cli/commands/run/sync-genome.ts` -- complete 시 generation ID를 `lastSyncedGeneration`에 저장하는지 확인 (FR-03)

### Phase 3: genome-loader hook 검증
- [ ] T004 `src/templates/hooks/genome-loader.cjs` -- `parseConfig()`에서 `lastSyncedGeneration` 파싱 확인 (FR-04)
- [ ] T005 `src/templates/hooks/genome-loader.cjs` -- `detectStaleness()`에서 `lastSyncedGeneration` 기반 로직 확인 (FR-05)
- [ ] T006 `src/templates/hooks/genome-loader.cjs` -- `buildGenomeHealth()`에서 neverSynced 상태 표시 확인 (FR-06)

### Phase 4: status 출력 검증
- [ ] T007 `src/cli/commands/status.ts` -- `getStatus()`에서 `lastSyncedGeneration` 정보 반환 확인 (FR-07)
- [ ] T008 `src/cli/index.ts` -- CLI 출력에 Genome Sync 정보 포함 확인 (FR-08)

## Dependencies
- 모든 task는 독립적 검증 (읽기 전용). 순차 또는 병렬 실행 가능.

## E2E Test Scenarios
해당 없음 — recovery generation으로 코드 변경 예상 없음. validation에서 기존 테스트 통과 확인만 수행.
