# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/cli/commands/init.ts` — auto-sync 미실행 시 `/reap.sync` 안내 메시지 출력 코드 추가 | 2026-03-22 |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| - | - | - | - |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| - | - | - |

## Implementation Notes
- `initProject()` 함수의 return 직전에 4줄 추가
- `autoSynced` 변수로 auto-sync 실행 여부를 판별 (adoption/migration + no preset)
- auto-sync가 실행되지 않은 경우에만 `/reap.sync` 안내 메시지 출력
