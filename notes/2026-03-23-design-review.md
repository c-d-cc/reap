# Design Review Notes (2026-03-23)

## 1. Git Worktree 병렬 작업 (검토 중)

### 실익
- 여러 backlog를 병렬 브랜치에서 동시 작업 → 시간 단축
- Claude Code의 `isolation: "worktree"` Agent 옵션 활용 가능

### 잠재적 문제
- `.reap/life/current.yml` 단일 active generation 제약 → worktree별 독립 `.reap/` 생성 시 lineage DAG 충돌
- Genome 분기: 각 worktree에서 genome-change 발생 시 merge 복잡도 급증
- Backlog 배분 로직 부재 ("이 backlog는 이 branch에서 처리" 기능 없음)
- 2-parent merge만 지원 → 순차 merge 필요

### 현실적 방안
- Genome 변경 없는 독립 작업(bugfix, chore)만 worktree로 분산
- Genome 변경이 필요한 작업은 순차 처리
- REAP에 "backlog 배분 + worktree generation" 기능 추가는 별도 설계 필요

**Status: 추가 검토 필요**

