# REAP MANAGED — Do not modify directly. Use reap run commands.
# Completion

## Summary
- **Goal**: help topic 모드에서 reap-guide.md를 context로 포함
- **Period**: 2026-03-21
- **Genome Version**: v104 (변경 없음)
- **Result**: pass
- **Key Changes**: help.ts topic 분기에서 reap-guide.md를 읽어 emitOutput context에 포함

## Retrospective

### Lessons Learned
#### What Went Well
- 단순 변경이라 1파일 수정으로 완료
- readTextFile의 null-safe 패턴으로 graceful fallback 자연스럽게 구현
- ReapPaths 정적 메서드로 경로 해석이 깔끔

#### Areas for Improvement
- 없음 (단순 변경)

### Genome Change Proposals
| Target File | Change Description | Reason |
|-------------|-------------------|--------|

### Deferred Task Handoff
| Task | Description | Related Backlog | Backlog File |
|------|-------------|-----------------|-------------|

### Next Generation Backlog


---

## Genome Changelog

### Genome-Change Backlog Applied
| Backlog File | Target | Change Description | Applied |
|-------------|--------|-------------------|---------|

### Retrospective Proposals Applied
| Target File | Change Description | Applied |
|-------------|-------------------|---------|

### Genome Version
- Before: 104
- After: 104

### Modified Genome Files
없음
