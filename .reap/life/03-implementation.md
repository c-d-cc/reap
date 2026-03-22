# REAP MANAGED — Do not modify directly. Use reap run commands.
# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/cli/commands/update-genome.ts` — 신규 파일. 2-phase (scan/apply) 구현 | Yes |
| T002 | `src/cli/index.ts` — `program.command("update-genome")` 등록, --apply 옵션 | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes
- `genomeVersion` 필드를 `ReapConfig` 인터페이스에 추가 (optional, `src/types/index.ts`)
- `BacklogFile` 타입을 `backlog.ts`에서 import하여 사용
- `scanPhase`는 sync 전용이므로 `async` 불필요 (pure function)
- 빌드, 타입체크, 테스트 (600 pass) 모두 통과
