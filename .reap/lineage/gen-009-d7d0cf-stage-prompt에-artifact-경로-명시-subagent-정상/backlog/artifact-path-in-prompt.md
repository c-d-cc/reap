---
type: task
status: consumed
consumedBy: gen-009-d7d0cf
consumedAt: 2026-03-25T15:11:25.951Z
priority: high
---

# Stage prompt에 artifact 경로 명시

## Problem
v0.16의 각 stage prompt가 artifact 파일명만 언급하고 경로를 명시하지 않음 (e.g., "Write 01-learning.md").
subagent가 경로를 추측하여 `.reap/life/gen-003-bbbd52/01-learning.md` 같은 잘못된 위치에 artifact를 생성.

## Root Cause
v0.15에서는 2중으로 경로를 전달했으나 v0.16 rewrite에서 누락됨:
1. `context.artifactPath` — full absolute path
2. prompt 텍스트 — `.reap/life/{NN}-{stage}.md` 명시 (e.g., "Update `.reap/life/02-planning.md` progressively")

## Solution
v0.15 패턴을 복원:
1. 각 stage handler (learning.ts, planning.ts, implementation.ts, validation.ts, completion.ts)의 `emitOutput`에 `context.artifactPath` 추가
2. prompt 텍스트에 `### Artifact: Write .reap/life/{NN}-{stage}.md` 명시
3. evolve.ts의 subagent prompt에도 artifact 경로 규칙 명시: "All artifacts are at `.reap/life/{NN}-{stage}.md`"

## Reference
- v0.15 objective.ts line 108: `context: { artifactPath, ... }`
- v0.15 objective.ts line 137: `"### Artifact: Update '.reap/life/01-objective.md' progressively"`
- v0.15 planning.ts line 107: `"### Artifact: Update '.reap/life/02-planning.md' progressively"`

## Files to Change
- src/cli/commands/run/learning.ts
- src/cli/commands/run/planning.ts
- src/cli/commands/run/implementation.ts
- src/cli/commands/run/validation.ts
- src/cli/commands/run/completion.ts
- src/cli/commands/run/evolve.ts (subagent prompt)
- merge stage handlers (detect.ts, mate.ts, merge.ts, reconcile.ts)
