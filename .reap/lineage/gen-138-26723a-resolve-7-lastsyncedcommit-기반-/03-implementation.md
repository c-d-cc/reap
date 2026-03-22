# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/types/index.ts` — `ReapConfig`에 `lastSyncedGeneration?: string` 필드 추가 (lastSyncedCommit 대체) | Yes |
| T002 | `src/core/config.ts` — `backfill()` 기본값에 `lastSyncedGeneration: ""` 추가 + legacy 마이그레이션 | Yes |
| T003 | `src/cli/commands/run/sync-genome.ts` — complete 시 generation ID 기록 (no gen → "manual") | Yes |
| T004 | `src/templates/hooks/genome-loader.cjs` — `parseConfig()`에서 `lastSyncedGeneration` 파싱 | Yes |
| T005 | `src/templates/hooks/genome-loader.cjs` — `detectStaleness()`에서 generation 기반 + legacy fallback | Yes |
| T006 | `src/templates/hooks/genome-loader.cjs` — `buildGenomeHealth()` 기존 neverSynced 로직 유지 | Yes |
| T007 | `src/cli/commands/status.ts` — `ProjectStatus`에 `lastSyncedGeneration` 반영 | Yes |
| T008 | `src/cli/index.ts` — status CLI 출력에 Genome Sync 정보 추가 | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes
- `lastSyncedCommit` (commit hash) → `lastSyncedGeneration` (generation ID)로 전환
- sync 시 active generation이 없으면 "manual" 마커 사용
- backward compatibility: `parseConfig()`에서 legacy `lastSyncedCommit`도 파싱, `detectStaleness()`에서 fallback으로 사용
- `backfill()`에서 기존 `lastSyncedCommit` → `lastSyncedGeneration` 자동 마이그레이션 (값이 있으면 "legacy"로 변환)
- session-start.cjs에서 `detectStaleness()` 호출 시 두 필드 모두 전달
