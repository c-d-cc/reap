# Completion

## Summary
- **Goal**: .reap/ 구조적 완전성 검사 도구 + onLifeCompleted hook
- **Period**: 2026-03-22 ~ 2026-03-23
- **Genome Version**: v51 → v51 (변경 없음)
- **Result**: pass
- **Key Changes**:
  - `src/core/integrity.ts` (신규): checkIntegrity() — config/current/lineage/genome/backlog/artifact 구조 검증
  - `src/cli/commands/fix.ts`: checkProject() export 추가
  - `src/cli/index.ts`: fix 커맨드에 --check 옵션 추가
  - `src/templates/hooks/onLifeCompleted.integrity-check.sh` (신규): 완료 시 자동 검사 hook
  - `src/cli/commands/init.ts`: hook 템플릿 자동 설치 로직 추가

## Retrospective

### Lessons Learned
#### What Went Well
- 기존 코드 패턴(fs.ts, paths.ts, lifecycle.ts)을 그대로 활용하여 일관성 유지
- read-only 검사와 repair를 명확히 분리 (integrity vs fix)

#### Areas for Improvement
- lineage 검증에서 epoch.md 내부의 generation을 정밀하게 파싱하지 않고 문자열 포함 여부로 확인 (향후 개선 가능)

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
- Before: v51
- After: v51

### Modified Genome Files
None
