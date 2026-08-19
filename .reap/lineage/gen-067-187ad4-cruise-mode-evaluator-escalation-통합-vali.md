---
id: gen-067-187ad4
type: embryo
goal: "cruise mode + evaluator escalation 통합 — validation/fitness 연결, cruise 자동 중단, state 채널"
parents: ["gen-066-567761"]
---
# gen-067-187ad4
Goal: cruise mode + evaluator escalation 통합 — validation/fitness 연결, cruise 자동 중단, state 채널.

Result: **pass**. All 7 completion criteria met, design fully implemented as specified in 02-planning.md (no scope changes mid-stream). The validation→fitness signalling channel (`GenerationState.evaluatorConcerns`) shipped along with two CLI surfaces: `reap run validation --phase report-evaluator` (side-channel write, nonce-graph external) and the cruise auto-abort branch in `reap run completion --phase fitness`. Both fitness sub-prompts (cruise + supervised) now optionally invoke the `reap-evaluate` subagent identically to gen-066's validation wiring, with `context.evaluator.{enabled, prompt}` and `context.evaluatorConcerns` emitted for the builder.

Key changes (5 source files, 2 new test files, 1 backlog consumed):
- `src/types/index.ts` — `EvaluatorConcern` interface + optional `GenerationState.evaluatorConcerns`
- `src/cli/index.ts` + `src/cli/commands/run/index.ts` — `--severity` / `--summary` options, forward via JSON-encoded `extra` for the new phase only
- `src/cli/commands/run/validation.ts` — `report-evaluator` phase (severity high/low/none with strict input validation, state append, no nonce touch) + 8 extra prompt lines instructing the builder to call this CLI after the evaluator replies
- `src/cli/commands/run/completion.ts` — fitness phase rewrite: evaluator opt-in invocation + `priorConcernsSection` + `cruiseAborted` branch (`clearCruise()` + dedicated fallback prompt + `previousCruiseCount` context)
- 11 new tests: 5 unit (yaml round-trip with edge cases) + 7 e2e (report-evaluator CLI matrix) + 4 e2e (cruise abort matrix). All pass.

Self-referential dog-fooding evidence: this generation's own `reap run validation` invocation emitted the new prompt sections, confirming the wiring runs against the same binary the tests exercise.