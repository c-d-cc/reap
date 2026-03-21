# Planning

## Summary
E2E scenario tests 2개 작성. 실제 command script의 execute() 함수를 호출하여 전체 lifecycle 흐름 검증.

## Tasks

### Task 1: tests/e2e/run-lifecycle.test.ts
Normal lifecycle E2E:
- S1: start gate (active gen 있으면 error)
- S2: start scan + create (generation 생성)
- S3: objective work + complete
- S4: next transition (objective → planning)
- S5: full lifecycle flow (start → ... → completion archive phase)
- S6: abort mid-lifecycle
- S7: back regression
- S8: backlog carry forward (pending items survive completion)

### Task 2: tests/e2e/run-merge-lifecycle.test.ts
Merge lifecycle E2E:
- S1: merge gate (active gen 있으면 error)
- S2: merge-start create
- S3: merge-detect → merge-mate → merge-merge → merge-sync → merge-validation → merge-completion flow
- S4: merge-evolve meta-orchestrator output

## Dependencies
Task 1, Task 2 병렬 실행 가능
