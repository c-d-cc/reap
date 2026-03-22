# Completion

## Summary
- **Goal**: checkIntegrity를 status, session-init, update 후에 호출
- **Period**: 2026-03-22 ~ 2026-03-23
- **Genome Version**: v62 → v62 (변경 없음)
- **Result**: pass
- **Key Changes**:
  - `src/cli/commands/status.ts`: `ProjectStatus`에 `integrity` 필드 추가, `getStatus()`에서 `checkIntegrity()` 호출
  - `src/cli/index.ts`: status 핸들러에 integrity 출력, update 핸들러에 integrity 검사 추가
  - `src/templates/hooks/session-start.cjs`: `reap fix --check` 서브프로세스로 integrity 상태 session init에 표시

## Retrospective

### Lessons Learned
#### What Went Well
- `checkProject()`가 이미 fix.ts에서 export되어 있어 update 핸들러에서 재사용 가능했음
- session-start.cjs에서 서브프로세스 방식이 SSOT를 유지하면서도 간단하게 구현됨

#### Areas for Improvement
- 없음

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
- Before: v62
- After: v62

### Modified Genome Files
없음
