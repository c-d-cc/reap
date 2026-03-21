# Planning

## Summary
examples/invenio에서 REAP CLI를 실전 사용하여 Script Orchestrator 아키텍처 검증.
subagent가 invenio 폴더 안에서 독립적으로 작업.

## Tasks

### Task 0: Setup
- `rm -rf examples/invenio/.reap`
- `cd examples/invenio && reap init`
- init 결과 확인: config.yml, genome/, hooks/, life/ 생성

### Task 1: Generation 1 — README 개선 (trivial, full lifecycle)
- `reap run start` → goal: "README.md 개선"
- `reap run objective` → work + complete
- `reap run next` → planning
- `reap run planning` → work + complete
- `reap run next` → implementation
- `reap run implementation` → README.md 수정 + complete
- `reap run next` → validation
- `reap run validation` → work + complete
- `reap run next` → completion
- `reap run completion` → retrospective → archive
- `reap run next` → archiving, lineage 확인

### Task 2: Generation 2 — 코드 수정 + back regression
- start → objective → planning → implementation
- `reap run back` → planning으로 regression 테스트
- 다시 implementation → validation → completion → next

### Task 3: Generation 3 — backlog 선택 + abort 테스트
- backlog에 아이템 생성
- start → backlog에서 선택
- objective까지 진행 후 `reap run abort` → 초기화 확인
- 다시 start → evolve로 완료

### Task 4: Merge generation (worktree)
- git branch 생성 → worktree에서 generation 수행
- main에서 merge generation (merge-start → merge-evolve)

## Dependencies
Task 0 → Task 1 → Task 2 → Task 3 → Task 4 (순차)
