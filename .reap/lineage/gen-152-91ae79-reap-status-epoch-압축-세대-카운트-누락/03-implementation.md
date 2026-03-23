# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `src/core/lineage.ts` — `listEpochGenerations()` 함수 추가 | Yes |
| T002 | `src/core/lineage.ts` — `countAllCompleted()` 함수 추가 | Yes |
| T003 | `src/cli/commands/status.ts` — `totalGenerations`에 `countAllCompleted()` 사용 | Yes |
| T004 | `src/core/lineage.ts` — `nextSeq()`가 epoch 세대도 고려하도록 수정 | Yes |
| T005 | `tests/core/lineage.test.ts` — epoch 관련 단위 테스트 4개 그룹 추가 | Yes |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| | | | |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| | | |

## Implementation Notes
- `listEpochGenerations()`: epoch.md의 YAML frontmatter에서 `generations` 배열을 파싱하여 ID 목록 반환. `parseFrontmatter()`는 `GenerationMeta` 타입을 반환하므로 직접 YAML.parse 사용.
- `countAllCompleted()`: `listCompleted()` + `listEpochGenerations()` 합산. 기존 `listCompleted()` 시그니처 불변.
- `nextSeq()`: epoch 세대의 시퀀스 번호도 maxSeq 계산에 포함하도록 수정.
- `GenerationManager`에 `countAllCompleted()` 메서드 추가하여 `status.ts`에서 사용.
- 전체 테스트 613개 통과 확인.
