---
type: task
status: consumed
consumedBy: gen-074-de21ad
priority: high
---

# /reap.abort 커맨드 추가

진행 중인 generation을 중단하고 초기 상태로 돌아가는 커맨드.

## 설계

### Gate
- active generation 확인

### Steps
1. 현재 상태 표시 (id, goal, stage)
2. abort 사유 질문

3. 코드 변경 처리 — 3가지 선택:
   - **rollback**: `git checkout .` (변경 revert)
   - **stash**: `git stash push -m "reap-abort: {gen-id}"`
   - **hold**: 코드 그대로 유지 (working tree에 남김)

4. backlog 저장 질문 (yes/no):
   - yes → type: task, aborted 메타 포함
   - backlog frontmatter:
     - `aborted: true`
     - `abortedFrom: {gen-id}`
     - `abortReason: "{사유}"`
     - `stage: {중단된 stage}`
     - `sourceAction: rollback|stash|hold`
     - `stashRef: "reap-abort: {gen-id}"` (stash인 경우)
     - `changedFiles: [...]` (hold/stash인 경우)
   - body: original goal + progress 요약 + resume guide

5. artifact 삭제 (01~05-*.md)
6. current.yml 비우기
7. "Generation {id} aborted."

### 규칙
- lineage에 기록하지 않음 (미완료)
- backlog에만 선택적으로 남김
- E2E 테스트 필수
