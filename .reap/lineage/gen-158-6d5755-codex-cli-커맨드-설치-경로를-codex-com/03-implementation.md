# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/core/agents/codex.ts` — `commandsDir` getter의 `"commands"`를 `"prompts"`로 변경 | Yes |
| T002 | `scripts/postinstall.cjs` — cleanup 대상의 `~/.codex/commands/`를 `~/.codex/prompts/`로 변경 | Yes |
| T003 | `tests/core/agents/codex.test.ts` — 테스트 설명문 및 기대값 업데이트 | Yes |
| T004 | `bunx tsc --noEmit` 통과, `bun test tests/core/agents/codex.test.ts` 7 pass / 0 fail | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| 없음 | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| 없음 | | |

## Implementation Notes
- 변경 범위: 3개 파일에서 각 1줄씩, 총 3줄 변경
- `commandsDir` getter 이름은 유지 (getter 이름 변경은 인터페이스 변경이므로 이번 scope 밖)
- postinstall의 cleanup 배열에서 codex 경로만 변경, claude/opencode 경로는 그대로 유지
