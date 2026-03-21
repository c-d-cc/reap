# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T-001 | `RunOutput` 타입 + `emitOutput()`/`emitError()` 유틸 (`src/types/index.ts`, `src/core/run-output.ts`) | Yes |
| T-002 | `reap run` CLI dispatcher (`src/cli/commands/run/index.ts`, `src/cli/index.ts`) | Yes |
| T-003 | `next` command script — 100% deterministic stage 전환, merge type 분기 지원 (`src/cli/commands/run/next.ts`) | Yes |
| T-004 | `back` command script — 2-phase regression (collect → apply), env var 방식 (`src/cli/commands/run/back.ts`) | Yes |
| T-005 | `start` command script — 2-phase (scan → create), backlog consumed 처리 (`src/cli/commands/run/start.ts`) | Yes |
| T-006 | Backlog CRUD 유틸 — `scanBacklog()`, `markBacklogConsumed()` (`src/core/backlog.ts`) | Yes |
| T-007 | `completion` command script — multi-phase (retrospective → genome → consume → archive) (`src/cli/commands/run/completion.ts`) | Yes |
| T-008 | Slash command 4개를 1줄 wrapper로 전환 (`reap.next/back/start/completion.md`) | Yes |
| T-009 | E2E 테스트 업데이트 — 새 아키텍처에 맞게 `command-templates.test.ts` 수정 (203 pass / 0 fail) | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| Phase 3 | Hook 실행 엔진 + commit 로직 통합 | 독립 모듈, 별도 generation 스코프 | type: task |
| Phase 4 | Merge 계열 command script 전환 | Normal 안정화 후 진행 | type: task |
| 나머지 command wrapper 전환 | objective, planning, implementation, validation 등 23개 | Phase 3 이후 순차 진행 | type: task |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| - | constraints.md | CLI subcommand 목록에 `run` 추가 (5개 → 6개) |
| - | source-map.md | `src/cli/commands/run/` 디렉토리 + `src/core/backlog.ts`, `src/core/run-output.ts` 추가 |
| - | conventions.md | Script Orchestrator 패턴 규칙 추가 (1줄 wrapper, phase 기반 재진입) |

## Implementation Notes

### 핵심 설계 결정
- **env var 방식**: AI가 수집한 데이터(goal, reason 등)를 `REAP_START_GOAL`, `REAP_BACK_TARGET` 등 환경변수로 script에 전달
- **phase 기반 재진입**: `reap run <command> --phase <phase>`로 deterministic-creative 교차 구간 처리
- **merge type 분기**: `next.ts`에서 `state.type === "merge"` 체크하여 `MergeLifeCycle.next()` 사용 — `GenerationManager.advance()`는 normal만 지원하므로 직접 분기
- **`emitOutput()` → `process.exit(0)`**: structured JSON 출력 후 즉시 종료하여 이후 로직 실행 방지 (`never` 반환 타입)
- **completion의 `complete()` 재사용**: `GenerationManager.complete()`가 archiving + compression을 이미 수행하므로 그대로 호출

### 파일 변경 목록
- 신규: `src/core/run-output.ts`, `src/core/backlog.ts`, `src/cli/commands/run/{index,next,back,start,completion}.ts`
- 수정: `src/types/index.ts`, `src/cli/index.ts`, `src/templates/commands/reap.{next,back,start,completion}.md`
- 수정: `tests/e2e/command-templates.test.ts`
