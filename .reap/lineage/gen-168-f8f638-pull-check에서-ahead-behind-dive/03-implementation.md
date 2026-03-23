# Implementation Log

## Completed Tasks
| Task | Description | Completed |
|------|-------------|-----------|
| T001 | `git rev-list --left-right --count HEAD...{target}` 파싱하는 `getAheadBehind()` 함수 추가 | 2026-03-24 |
| T002 | ahead/behind 카운트 기반 4분기 분류: up-to-date, ahead, behind(fast-forward), diverged(start-merge) | 2026-03-24 |
| T003 | 기존 lineage meta 비교 + canFastForward 로직 제거, 미사용 import 정리 (lineageUtils, canFastForward, MergeGenerationManager) | 2026-03-24 |
| T004 | 타입체크 (`bunx tsc --noEmit`) 통과, 테스트 620개 전체 통과 (`bun test`) | 2026-03-24 |

## Deferred Tasks
| Task | Description | Reason | Related Backlog |
|------|-------------|--------|-----------------|
| - | - | - | - |

## Genome-Change Backlog Items
| Backlog File | Target | Description |
|-------------|--------|-------------|
| - | - | - |

## Implementation Notes
- `getAheadBehind()` 헬퍼 함수를 파일 상단에 추가하여 `execSync`로 `git rev-list --left-right --count HEAD...{target}` 실행
- 기존 lineage meta 비교(localMetas, remoteMetasRaw, canFastForward) 로직 전체 제거
- 미사용 import 제거: `MergeGenerationManager`, `lineageUtils`, `canFastForward`
- 4가지 출력 분기: up-to-date(ok), ahead(ok + push 안내), fast-forward(prompt), start-merge(prompt + merge 안내)
- 각 출력에 ahead/behind 카운트를 context에 포함하여 디버깅 용이
