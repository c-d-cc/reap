# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/types/index.ts` — GenerationType에 "recovery" 추가, GenerationState/GenerationMeta에 recovers 필드 추가 | 2026-03-22 |
| T002 | `src/core/generation.ts` — createRecoveryGeneration() 메서드 추가 | 2026-03-22 |
| T003 | `src/cli/commands/run/evolve-recovery.ts` — 신규 파일. review/create 2-phase 구조 | 2026-03-22 |
| T004 | `src/cli/commands/run/index.ts` — evolve-recovery 명령어 등록 | 2026-03-22 |
| T005 | `src/templates/commands/reap.evolve.recovery.md` — 슬래시 커맨드 템플릿 생성 | 2026-03-22 |
| T006 | `src/cli/commands/init.ts` — COMMAND_NAMES에 reap.evolve.recovery 추가 | 2026-03-22 |
| T007 | `src/core/generation.ts` — complete()에서 recovery type일 때 meta.yml에 recovers 포함 | 2026-03-22 |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes
[Notable items, decisions made, and reference material from implementation]
