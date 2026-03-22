# Completion

## Summary
- **Goal**: feat: reap.next가 다음 stage command를 자동 실행
- **Period**: 2026-03-22
- **Result**: pass
- **Key Changes**: `next.ts`의 emitOutput 호출 후, nextStage가 completion이 아닌 경우 해당 stage module을 dynamic import하여 execute(paths)를 자동 호출. normal lifecycle은 `./${nextStage}`, merge lifecycle은 `./merge-${nextStage}` 경로 사용.

## Retrospective

### Lessons Learned
#### What Went Well
- 6줄 추가만으로 기능 구현 완료, 기존 595 테스트 전체 통과
- dynamic import로 런타임 의존성을 최소화

#### Areas for Improvement
- 없음

### Genome Change Proposals
| Target File | Change Description | Reason |
|-------------|-------------------|--------|
| - | - | - |

### Deferred Task Handoff
| Task | Description | Related Backlog | Backlog File |
|------|-------------|-----------------|-------------|
| - | - | - | - |

### Next Generation Backlog
없음

---

## Genome Changelog

### Genome-Change Backlog Applied
| Backlog File | Target | Change Description | Applied |
|-------------|--------|-------------------|---------|
| - | - | - | - |

### Retrospective Proposals Applied
| Target File | Change Description | Applied |
|-------------|-------------------|---------|
| - | - | - |

### Genome Version
- Before: v36
- After: v36

### Modified Genome Files
- 없음

