# Objective

## Goal
resolve #7: lastSyncedCommit 기반 genome sync 상태 추적

`reap init` 후 genome이 "synced"로 표시되는 문제 해결. 실제로 sync된 적 없는데도 staleness 감지가 git commit 기반이라 "synced"로 판단됨. `lastSyncedCommit` 필드를 config.yml에 추가하여 정확한 sync 상태를 추적한다.

## Completion Criteria
1. `ReapConfig` 타입에 `lastSyncedCommit?: string` 필드가 존재한다
2. `ConfigManager.backfill()`에서 기존 프로젝트의 `lastSyncedCommit` 기본값을 빈 문자열로 처리한다
3. `reap init` 후 config.yml에 `lastSyncedCommit`이 빈 문자열이거나 미존재한다
4. `reap run sync-genome --phase complete` 실행 시 `lastSyncedCommit`이 현재 HEAD 커밋 해시로 업데이트된다
5. `genome-loader.cjs`의 `detectStaleness()`가 `lastSyncedCommit` 기반으로 동작한다
6. `genome-loader.cjs`의 `buildGenomeHealth()`가 "never synced" 상태를 표시한다
7. `reap run status`에서 lastSyncedCommit 정보가 포함된다
8. 모든 기존 테스트 통과 (`bun test`, `bunx tsc --noEmit`)

## Requirements

### Functional Requirements
1. **FR-01**: `ReapConfig` 타입에 `lastSyncedCommit?: string` optional 필드 추가
2. **FR-02**: `ConfigManager.backfill()`에서 `lastSyncedCommit` 미존재 시 빈 문자열(`""`) 기본값 설정
3. **FR-03**: `reap init`에서 config 생성 시 `lastSyncedCommit` 필드 생략 (backfill이 처리)
4. **FR-04**: `sync-genome --phase complete` 시 `git rev-parse HEAD` 결과를 config.yml의 `lastSyncedCommit`에 저장
5. **FR-05**: `genome-loader.cjs`의 `parseConfig()`에서 `lastSyncedCommit` 파싱
6. **FR-06**: `detectStaleness()`에서 `lastSyncedCommit` 기반 staleness 판단:
   - 빈 문자열/미존재 → "unsynced" (never synced)
   - 값 존재 → 해당 커밋 이후 src/ 변경 카운트로 판단
7. **FR-07**: `buildGenomeHealth()`에서 unsynced 상태 시 경고 표시
8. **FR-08**: `getStatus()`에서 `lastSyncedCommit` 정보 포함

### Non-Functional Requirements
1. 기존 프로젝트 호환성 — backfill로 마이그레이션 자동 처리
2. config.yml 크기 최소 증가 (1줄 추가)

## Design

### Approaches Considered

| Aspect | A: lastSyncedCommit in config.yml | B: Separate sync-state.yml |
|--------|----------------------------------|---------------------------|
| Summary | config.yml에 필드 하나 추가 | 별도 파일로 sync 상태 관리 |
| Pros | 단순, 기존 구조 활용, backfill 용이 | 관심사 분리 |
| Cons | config에 런타임 상태 혼재 | 파일 추가, 코드 복잡도 증가 |
| Recommendation | **선택** | - |

### Selected Design
**Approach A**: config.yml에 `lastSyncedCommit` 필드 추가. 단순하고 기존 ConfigManager 인프라를 활용할 수 있으며, backfill로 기존 프로젝트 자동 마이그레이션 가능.

### Design Approval History
- 2026-03-22: Issue #7에서 이미 설계 확정됨

## Scope
- **Related Genome Areas**: constraints.md (validation commands), source-map.md (config 구조)
- **Expected Change Scope**: `src/types/index.ts`, `src/core/config.ts`, `src/cli/commands/run/sync-genome.ts`, `src/cli/commands/status.ts`, `src/templates/hooks/genome-loader.cjs`
- **Exclusions**: init.ts 변경 불필요 (backfill이 처리), 새 마이그레이션 불필요

## Genome Reference
- conventions.md: 파일 I/O는 `src/core/fs.ts` 유틸 사용
- constraints.md: TypeScript 5.x, Node.js >=18
- source-map.md: config.ts (ConfigManager), types/index.ts (ReapConfig)

## Backlog (Genome Modifications Discovered)
None

## Background
Issue #7: `reap init` 후 genome이 "synced"로 표시됨. 현재 `detectStaleness()`는 `.reap/genome/` 마지막 커밋 이후 src/ 변경 카운트만 확인하므로, init 직후에는 genome 커밋이 최신이라 "synced"로 판단. `lastSyncedCommit`으로 실제 sync 여부를 추적하면 이 문제가 해결된다.
