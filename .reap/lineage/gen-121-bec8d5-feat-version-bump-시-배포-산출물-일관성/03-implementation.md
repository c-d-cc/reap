# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/templates/commands/reapdev.versionBump.md` 생성 (기존 `.claude/commands/` 내용 이동) | 2026-03-22 |
| T002 | Step 0 "배포 산출물 일관성 검증" 단계 추가 (4가지 검증: 커맨드↔COMMAND_NAMES, run script, help, guide) | 2026-03-22 |
| T003 | `COMMAND_NAMES` 배열에 `reapdev.versionBump` 추가 | 2026-03-22 |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| - | - | - | - |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| - | - | - |

## Implementation Notes

- `reapdev.versionBump.md`를 `src/templates/commands/`에 생성하여 배포 산출물로 관리되도록 함
- 기존 Steps 1-6은 그대로 유지, Step 0으로 검증 단계만 삽입
- 검증 4가지: (A) 커맨드 파일↔COMMAND_NAMES 양방향, (B) run script 매핑, (C) help 텍스트, (D) reap-guide.md 참조
- `.claude/commands/reapdev.versionBump.md`는 `reap update` 시 자동으로 `src/templates/commands/`의 내용으로 덮어쓰여지므로 별도 삭제 불필요
