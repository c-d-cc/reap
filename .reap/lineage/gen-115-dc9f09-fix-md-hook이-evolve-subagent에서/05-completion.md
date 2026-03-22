# Completion

## Summary
- **Goal**: fix: .md hook이 evolve subagent에서 실행되도록 completion output 개선
- **Period**: 2026-03-22
- **Result**: pass
- **Key Changes**: completion.ts에 `buildMdHookPrompt()` 헬퍼 추가하여 .md hook content를 prompt에 append, evolve.ts subagentPrompt에 Hook Prompt Execution 안내 추가

## Retrospective

### Lessons Learned
#### What Went Well
- 변경 범위가 명확하여 2개 파일만 수정으로 완료
- 기존 hook-engine.ts를 전혀 수정하지 않고 output 레이어에서만 해결

#### Areas for Improvement
- .md hook의 실행 결과를 AI가 실제로 따르는지는 E2E 레벨에서만 검증 가능 — 향후 E2E 테스트 추가 고려

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
없음

### Retrospective Proposals Applied
| Target File | Change Description | Applied |
|-------------|-------------------|---------|
| - | - | - |

### Genome Version
- Before: v115
- After: v115 (genome 파일 변경 없음)

### Modified Genome Files
없음

