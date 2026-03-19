# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T1 | 타입 확장 — MergeStage, MERGE_LIFECYCLE_ORDER, AnyStage, commonAncestor | 2026-03-19 |
| T2 | Lineage 유틸 추출 — lineage.ts 신규, GenerationManager 위임 | 2026-03-19 |
| T3 | MergeLifeCycle 클래스 — merge-lifecycle.ts 신규 | 2026-03-19 |
| T4 | MergeGenerationManager + findCommonAncestor — merge-generation.ts 신규 | 2026-03-19 |
| T5 | Merge 핵심 로직 — merge.ts (genomeDiff, classifyConflicts, detectDivergence, runSyncTest) | 2026-03-19 |
| T6 | Merge artifact 템플릿 5종 — src/templates/artifacts/merge/ | 2026-03-19 |
| T7 | init/update에 merge 템플릿 설치 로직 추가 | 2026-03-19 |
| T8 | 테스트 — tsc, bun test 105 pass, npm build 통과 | 2026-03-19 |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes

- `GenerationState.stage`를 `AnyStage` (= `LifeCycleStage | MergeStage`)로 확장. 기존 코드에서 `LifeCycle.next()`에 넘길 때 `as LifeCycleStage` 단언 추가
- lineage 조회 함수를 `lineage.ts`로 추출, `GenerationManager`는 위임 패턴으로 유지 (외부 API 변경 없음)
- `MergeGenerationManager`는 `GenerationManager`와 완전 독립. `findCommonAncestor`는 BFS로 DAG LCA 탐색
- `merge.ts`의 CROSS-FILE conflict는 양쪽 다 genome을 변경했지만 같은 파일이 아닌 경우에만 플래그
- `parseValidationCommands`는 constraints.md의 테이블에서 백틱으로 감싼 명령어를 추출
