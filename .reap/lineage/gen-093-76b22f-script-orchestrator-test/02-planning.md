# Planning

## Summary
Script Orchestrator Architecture 전환 후 모든 command scripts와 미테스트 core modules에 대한 테스트 작성. 작업량이 많으므로 병렬 subagent 위임.

## Technical Context
- **Tech Stack**: Bun test runner, TypeScript
- **Constraints**: tests/ private submodule, sandbox 기반 E2E

## Tasks

### Task 1: Core Module Unit Tests (신규)
- `tests/core/backlog.test.ts` — scanBacklog, markBacklogConsumed, parseFrontmatter
- `tests/core/run-output.test.ts` — emitOutput, emitError JSON 포맷
- `tests/core/commit.test.ts` — checkSubmodules, commitChanges
- `tests/core/lineage.test.ts` — listMeta, readMeta

### Task 2: Run Command Dispatcher Test
- `tests/commands/run.test.ts` — dispatcher routing, unknown command error, valid command loading

### Task 3: Command Script Tests — Lifecycle Commands
- `tests/commands/run/start.test.ts` — gate, phase scan, phase create
- `tests/commands/run/next.test.ts` — stage transitions, hook execution, archive
- `tests/commands/run/back.test.ts` — phase collect, phase apply
- `tests/commands/run/completion.test.ts` — multi-phase (retrospective → genome → consume → archive)
- `tests/commands/run/abort.test.ts` — phase confirm, phase execute
- `tests/commands/run/objective.test.ts` — phase work, phase complete
- `tests/commands/run/planning.test.ts` — phase work, phase complete
- `tests/commands/run/implementation.test.ts` — phase work, phase complete
- `tests/commands/run/validation.test.ts` — phase work, phase complete
- `tests/commands/run/evolve.test.ts` — meta-orchestrator output

### Task 4: Command Script Tests — Utility Commands
- `tests/commands/run/sync.test.ts` — dispatcher
- `tests/commands/run/sync-genome.test.ts` — 2-phase
- `tests/commands/run/sync-environment.test.ts` — 2-phase
- `tests/commands/run/help.test.ts` — contextual help output
- `tests/commands/run/report.test.ts` — system info context
- `tests/commands/run/push.test.ts` — validation + git push

### Task 5: Command Script Tests — Merge Commands
- `tests/commands/run/merge.test.ts` — gate, phase detect, phase check
- `tests/commands/run/merge-start.test.ts` — phase create
- `tests/commands/run/merge-detect.test.ts`
- `tests/commands/run/merge-mate.test.ts`
- `tests/commands/run/merge-merge.test.ts`
- `tests/commands/run/merge-sync.test.ts`
- `tests/commands/run/merge-validation.test.ts`
- `tests/commands/run/merge-completion.test.ts`
- `tests/commands/run/merge-evolve.test.ts`
- `tests/commands/run/pull.test.ts` — fetch + divergence detection

### Task 6: E2E Scenario Tests
- `tests/e2e/run-lifecycle.test.ts` — start → objective → next → planning → ... → completion 전체 흐름
- `tests/e2e/run-merge-lifecycle.test.ts` — merge start → detect → ... → completion

## Dependencies
- Task 1 먼저 (core modules) → Task 2~5 병렬 가능 → Task 6 마지막 (E2E는 통합)
- 이번 세대에서 Task 1~3 완료 목표, Task 4~6은 다음 세대로 이월 가능
