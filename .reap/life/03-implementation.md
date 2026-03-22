# REAP MANAGED — Do not modify directly. Use reap run commands.
# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/core/skills.ts` — `syncSkillsToProject()` 공통 함수 생성 | Yes |
| T002 | `src/cli/commands/update.ts` — step 5를 `syncSkillsToProject()` 호출로 교체 | Yes |
| T003 | `src/cli/commands/init.ts` — step 6b에 `syncSkillsToProject()` 호출 추가 | Yes |
| T004 | `tests/core/skills.test.ts` — 단위 테스트 4건 (sync, skip unchanged, dryRun, frontmatter parse) | Yes |
| T004b | `tests/commands/init.test.ts` — init 후 skills 생성 검증 테스트 추가 | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes
- `syncSkillsToProject()` 함수는 `update.ts` lines 182-215의 로직을 그대로 추출
- 반환값 `{ installed, total }`로 호출자가 결과를 로깅할 수 있게 설계
- `init.ts`에서는 step 6 agent 설치 루프 이후, step 7 이전에 호출
- 기존 `update.ts` import에서 `readTextFile`, `readTextFileOrThrow`는 더 이상 step 5에서 직접 사용하지 않지만, 다른 곳에서 여전히 사용중이므로 import 유지
