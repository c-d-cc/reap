## What's New
- Hook system 전면 개편 — 16개 stage-level events (Normal 8 + Merge 8)
  - Normal: `onLifeStarted`, `onLifeObjected`, `onLifePlanned`, `onLifeImplemented`, `onLifeValidated`, `onLifeCompleted`, `onLifeTransited`, `onLifeRegretted`
  - Merge: `onMergeStarted`, `onMergeDetected`, `onMergeMated`, `onMergeMerged`, `onMergeSynced`, `onMergeValidated`, `onMergeCompleted`, `onMergeTransited`
- docs 사이트 4-axis 페이지 분리 — Genome, Environment, Lifecycle, Lineage, Backlog, Hooks
- README 4개 언어 대규모 갱신 + docs 링크 추가

## Generations
- **gen-079-9dd0f7**: README + docs 대규모 갱신 — 4-axis 페이지 분리
- **gen-080-96807d**: update.test.ts 수정 + hook 이벤트 이름 변경
- **gen-081-ce4de9**: hook system 전면 개편 — 16개 stage-level events

## Breaking Changes
- Hook event 이름 변경: 기존 `.reap/hooks/` 파일의 이벤트명을 새 이름으로 리네임 필요
  - `onGenerationStart` → `onLifeStarted`
  - `onStageTransition` → `onLifeTransited`
  - `onGenerationComplete` → `onLifeCompleted`
  - `onRegression` → `onLifeRegretted`
  - `onMergeStart` → `onMergeStarted`
  - `onMergeComplete` → `onMergeCompleted`
