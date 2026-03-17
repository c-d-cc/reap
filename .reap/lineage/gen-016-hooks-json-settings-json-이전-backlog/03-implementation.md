# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/core/paths.ts` — `userClaudeSettingsJson` static getter 추가 | ✅ |
| T002 | `src/core/hooks.ts` — `registerClaudeHook()` settings.json 대상으로 수정 | ✅ |
| T003 | `src/core/hooks.ts` — `syncHookRegistration()` settings.json 대상으로 수정 | ✅ |
| T004 | `src/core/hooks.ts` — `migrateHooksJsonToSettings()` 함수 추가 | ✅ |
| T005 | `src/cli/commands/update.ts` — migration 호출 추가 | ✅ |
| T006 | `src/cli/commands/update.ts` — result 메시지 settings.json으로 변경 | ✅ |
| T007 | `src/templates/commands/reap.start.md` — backlog 스캔 단계 추가 | ✅ |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| (기존) | conventions.md | "hooks.json에 등록" → "settings.json에 등록" |
| (기존) | domain/hook-system.md | SessionStart Hook 섹션 업데이트 |

## Implementation Notes
- init.ts의 registerClaudeHook 호출 주석도 hooks.json → settings.json으로 수정
- hooks.ts에서 readSettingsJson/writeSettingsJson 헬퍼 추출하여 settings 보존 로직 중앙화
- migrateHooksJsonToSettings는 hooks.json이 비면 파일 자체를 삭제
