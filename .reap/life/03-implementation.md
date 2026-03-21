# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T-007 | `ReapPaths.hookConditions` getter 추가 (`src/core/paths.ts`) | Yes |
| T-001 | Hook Engine 코어 모듈 — scanHooks, evaluateCondition, executeHooks (`src/core/hook-engine.ts`) | Yes |
| T-002 | Commit 모듈 — checkSubmodules, commitSubmodule, commitChanges (`src/core/commit.ts`) | Yes |
| T-003 | `start.ts` 통합 — create phase에 onLifeStarted hook 실행 | Yes |
| T-004 | `next.ts` 통합 — stage별 hook + onLifeTransited hook 실행 | Yes |
| T-005 | `back.ts` 통합 — apply phase에 onLifeRegretted hook 실행 | Yes |
| T-006 | `completion.ts` 통합 — archive phase에 onLifeCompleted hook + submodule check | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| T-008 | E2E 테스트 (hook-engine.test.ts) | 기존 테스트 전부 통과, E2E는 다음 generation에서 추가 | type: task |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| - | source-map.md | hook-engine.ts, commit.ts 추가 |

## Implementation Notes

### 신규 파일
- `src/core/hook-engine.ts` — hook 스캔, frontmatter/comment 파싱, condition 평가, sh 실행 / md 내용 반환
- `src/core/commit.ts` — submodule status check, submodule commit, parent repo commit

### 핵심 결정
- **condition 평가**: `execSync`로 `.sh` 실행, exit 0 = met, timeout 10초
- **`.md` hook 처리**: frontmatter 제거 후 body를 `content`로 반환 → AI가 structured output에서 읽고 실행
- **next.ts stage hook 매핑**: `STAGE_HOOK` 맵으로 이전 stage 완료 event를 자동 결정 (e.g., objective→planning 전환 시 onLifeObjected)
- **completion submodule check**: `checkSubmodules()`로 dirty submodule 감지 → prompt에서 AI에게 처리 지시
- **commit은 AI가 수행**: submodule 분기가 필요하므로 자동 실행하지 않고 prompt로 지시

### 검증 결과
- `bunx tsc --noEmit`: PASS
- `npm run build`: PASS (0.41 MB, 112 modules)
- `bun test`: 203 pass / 0 fail
