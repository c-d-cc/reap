# Objective

## Goal
Recovery for gen-138-26723a: objective/planning 문서가 `lastSyncedCommit` (commit hash) 기반으로 작성되었으나, 실제 구현은 `lastSyncedGeneration` (generation ID) 기반으로 완료됨. 이 recovery generation은 설계 문서와 구현의 일관성을 검증하고, 코드가 `lastSyncedGeneration`을 올바르게 사용하는지 확인한다.

## Background
gen-138-26723a는 issue #7 (reap init 후 genome이 synced로 표시되는 문제)을 해결하기 위해 시작되었다. 원래 objective와 planning은 `lastSyncedCommit` (git commit hash)을 사용하는 설계로 작성되었으나, 구현 단계에서 설계가 `lastSyncedGeneration` (generation ID)으로 전환되었다.

**전환 이유**: sync와 source 변경이 같은 커밋에 포함될 경우, commit hash 기반으로는 정확한 staleness 판단이 불가능하다. generation ID는 sync 시점을 명확히 식별할 수 있다.

gen-138 completion retrospective에서 이 불일치를 인정: "설계 문서(objective)에서 lastSyncedCommit으로 기술했지만 실제 구현은 lastSyncedGeneration — 용어 일관성 주의 필요"

## Corrected Design (vs gen-138 original)
- **Field name**: `lastSyncedGeneration` (not `lastSyncedCommit`)
- **Value**: generation ID (e.g., `gen-138-26723a`) or `"manual"` (no active generation) or `""` (never synced)
- **Storage**: `config.yml`의 `lastSyncedGeneration` 필드
- **Rationale**: commit hash는 sync와 코드 변경이 동일 커밋에 포함될 때 정확한 staleness 감지 불가

## Completion Criteria
1. `ReapConfig` 타입에 `lastSyncedGeneration?: string` 필드가 존재한다 (not `lastSyncedCommit`)
2. `ConfigManager.backfill()`에서 `lastSyncedGeneration` 기본값 처리 및 legacy `lastSyncedCommit` 마이그레이션이 존재한다
3. `sync-genome --phase complete` 실행 시 `lastSyncedGeneration`이 현재 generation ID로 업데이트된다
4. `genome-loader.cjs`의 `detectStaleness()`가 `lastSyncedGeneration` 기반으로 동작한다
5. `reap run status` 및 CLI 출력에서 `lastSyncedGeneration` 정보가 포함된다
6. 코드에 `lastSyncedCommit`이 primary 용도로 사용되는 곳이 없다 (legacy fallback/migration만 허용)
7. 모든 테스트 통과 (`bun test`, `bunx tsc --noEmit`, `npm run build`)

## Requirements

### Functional Requirements
1. **FR-01**: `ReapConfig` 타입에 `lastSyncedGeneration?: string` 필드 존재
2. **FR-02**: `ConfigManager.backfill()`에서 `lastSyncedGeneration` 기본값(`""`) + legacy `lastSyncedCommit` → `lastSyncedGeneration` 마이그레이션
3. **FR-03**: `sync-genome --phase complete` 시 active generation ID를 `lastSyncedGeneration`에 저장 (없으면 `"manual"`)
4. **FR-04**: `genome-loader.cjs`의 `parseConfig()`에서 `lastSyncedGeneration` 파싱
5. **FR-05**: `detectStaleness()`에서 `lastSyncedGeneration` 기반 staleness 판단 (legacy `lastSyncedCommit` fallback 포함)
6. **FR-06**: `buildGenomeHealth()`에서 unsynced/neverSynced 상태 표시
7. **FR-07**: `getStatus()`에서 `lastSyncedGeneration` 정보 반환
8. **FR-08**: `reap status` CLI 출력에 Genome Sync 정보 포함

### Non-Functional Requirements
1. 기존 프로젝트 호환성 — legacy `lastSyncedCommit` 자동 마이그레이션
2. config.yml 크기 최소 증가

## Design

### Approaches Considered

| Aspect | A: lastSyncedGeneration (generation ID) | B: lastSyncedCommit (commit hash) |
|--------|----------------------------------------|----------------------------------|
| Summary | generation ID로 sync 시점 추적 | git commit hash로 sync 시점 추적 |
| Pros | sync와 코드 변경 동일 커밋 시에도 정확, generation 단위로 추적 가능 | git 네이티브, 추가 조회 불필요 |
| Cons | generation이 없는 경우 "manual" 마커 필요 | 동일 커밋에 sync+코드 변경 시 staleness 오판 |
| Recommendation | **선택** (gen-138에서 구현 완료) | 폐기 |

### Selected Design
**Approach A**: `lastSyncedGeneration` (generation ID) 사용. gen-138에서 이미 이 방식으로 구현 완료. 이 recovery generation은 구현이 올바른지 검증한다.

### Design Approval History
- 2026-03-22: gen-138 implementation에서 설계 전환 결정
- 2026-03-22: gen-140 recovery에서 문서 정정

## Scope
- **Related Genome Areas**: constraints.md, source-map.md
- **Expected Change Scope**: 검증 대상 파일 — `src/types/index.ts`, `src/core/config.ts`, `src/cli/commands/run/sync-genome.ts`, `src/templates/hooks/genome-loader.cjs`, `src/cli/commands/status.ts`, `src/cli/index.ts`
- **Exclusions**: 구현이 올바르면 코드 변경 없음 (recovery = 검증 위주)
- **Recovers**: gen-138-26723a

## Genome Reference
- conventions.md: 파일 I/O는 `src/core/fs.ts` 유틸 사용
- constraints.md: TypeScript 5.x, Node.js >=18
- source-map.md: config.ts (ConfigManager), types/index.ts (ReapConfig)

## Backlog (Genome Modifications Discovered)
None
