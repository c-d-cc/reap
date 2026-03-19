# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `paths.ts` — 프로젝트 레벨 경로 제거, user-level static 경로 + package 경로 추가, legacy 경로 보존 | 2026-03-17 |
| T002 | `init.ts` — commands/templates/hooks 프로젝트 복사 제거, `~/.claude/commands/` + `~/.claude/hooks.json` 설치 | 2026-03-17 |
| T003 | `update.ts` — 동기화 대상을 `~/.claude/` user-level로 변경 + legacy 파일 migration 정리 | 2026-03-17 |
| T004 | `hooks.ts` — user-level `~/.claude/hooks.json` 등록, 패키지 내부 session-start.sh 직접 실행 | 2026-03-17 |
| T005 | `session-start.sh` — cwd 기반 `.reap/` 탐색, guide는 패키지 내부 SCRIPT_DIR에서 참조 | 2026-03-17 |
| T006 | `update.ts`에 migration 로직 추가 (legacy commands/templates/hooks/claude 정리) | 2026-03-17 |
| T007 | 테스트 수정 — init.test.ts, update.test.ts, paths.test.ts를 새 구조에 맞게 수정 | 2026-03-17 |
| — | `fix.ts` — required dirs에서 commands/templates 제거 | 2026-03-17 |
| — | `reap.implementation.md` command — Step 3b (out-of-scope issue backlog 기록 지침) 추가 | 2026-03-17 |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| — | Old 7-stage lifecycle 테스트 17개 실패 수정 | 이번 세대 scope 밖 (이전 세대에서 발생한 기존 문제) | backlog/01-old-lifecycle-test-cleanup.md |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| (objective에서 식별) | conventions.md | Template Conventions 섹션 — commands/templates 복사 → user-level 설치로 변경 |
| (objective에서 식별) | constraints.md | "런타임에 복사" 제약 → 복사 대상 축소 반영 |

## Implementation Notes
- `paths.ts`: legacy 경로를 `@deprecated`로 보존하여 migration 코드에서 참조 가능
- `hooks.ts`: `getReapHookEntry()`에서 `import.meta.dir` 기반 절대 경로로 session-start.sh 참조 — 패키지 위치가 바뀌면 `reap update`로 hooks.json 자동 갱신
- `update.ts`: migration 시 `.claude/hooks.json`에서 `.reap/hooks/` 참조 hook만 선별 제거, 다른 hook은 보존
- `session-start.sh`: `SCRIPT_DIR`로 guide 참조, `pwd`로 프로젝트 탐색 — 패키지 어디에 설치되든 동작
- src/ 코드 타입 에러 0건, 변경 관련 테스트 29개 전부 통과
- 기존 테스트 17개 실패는 old lifecycle 문제로 backlog 등록
