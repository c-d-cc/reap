# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/core/generation.ts` backlog 복사 로직에 `if (isConsumed)` 조건 추가 | 2026-03-23 |
| T001-1 | `tests/e2e/run-lifecycle.test.ts` S8 테스트를 수정된 동작에 맞게 업데이트 | 2026-03-23 |
| T002 | 빌드 성공 확인 (`npm run build`) | 2026-03-23 |
| T003 | 타입체크 성공 확인 (`bunx tsc --noEmit`) | 2026-03-23 |
| T004 | 전체 테스트 통과 확인 (`bun test` — 619 pass, 0 fail) | 2026-03-23 |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| 없음 | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| 없음 | | |

## Implementation Notes
- `src/core/generation.ts` 237-242줄: `// Always copy to lineage` 주석과 무조건적 `writeTextFile` 호출을 `if (isConsumed)` 블록 안으로 이동
- E2E 테스트 `S8: pending backlog items survive completion`이 이전 버그 동작(모든 backlog를 lineage에 복사)을 기대하고 있었으므로, `pending-task.md`가 lineage에 없어야 하는 것으로 수정
- 빈 backlog 디렉토리가 lineage에 생성될 수 있으나, 이는 `mkdir(backlogDir, { recursive: true })`가 루프 전에 호출되기 때문. consumed 항목이 없으면 빈 디렉토리가 남지만, 기존 동작과 동일하므로 별도 처리 불필요
