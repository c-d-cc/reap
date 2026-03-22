# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T1 | Run command 파일 생성 (`src/cli/commands/run/update-genome.ts`) | Yes |
| T2 | CLI subcommand 제거 (`src/cli/index.ts`) | Yes |
| T3 | Dispatcher 등록 (`src/cli/commands/run/index.ts`) | Yes |
| T4 | Slash command 템플릿 생성 (`src/templates/commands/reap.update-genome.md`) | Yes |
| T5 | COMMAND_NAMES 등록 (`src/cli/commands/init.ts`) | Yes |
| T6 | Genome 업데이트 | Deferred to completion |
| T7 | Docs 업데이트 (CLIPage, translations 4개) | Yes |
| T8 | 기존 파일 삭제 (`src/cli/commands/update-genome.ts`) | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| T6 | Genome 업데이트 (constraints.md, source-map.md) | Completion 단계에서 수정 | N/A |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| N/A | constraints.md | CLI Subcommands 9→8, Slash Commands Normal 18→19 |
| N/A | source-map.md | update-genome을 CLI에서 run scripts로 이동, 카운트 업데이트 |

## Implementation Notes
- `execute(paths, phase, argv)` 시그니처 적용 — phase 없음/"scan" → scan, "apply" → apply
- `isReapProject` 체크는 run/index.ts dispatcher가 이미 수행하므로 제거
- `nextCommand`를 `reap run update-genome --phase apply`로 변경
- 빌드 + 타입체크 통과 확인
- active generation 게이트 정상 동작 확인
