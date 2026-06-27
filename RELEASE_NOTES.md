## What's New

- **Memory structure improvement** — Vision memory now uses content-type-based classification (session handoff / ongoing tracks / design lessons) instead of time-based tiers. A mandatory pruning policy was added to the reflect phase: shortterm is replaced every generation, midterm is cleaned on track completion, longterm is pruned periodically. This prevents memory bloat and misclassification across generations.

---

## v0.17.0

- **Code Intelligence Daemon** (opt-in) — set `daemon: true` in `.reap/config.yml` to activate a local Tree-sitter symbol graph (localhost:17224). REAP auto-indexes at generation start, implementation complete, and completion commit. Agents receive daemon query instructions (symbol search, caller/callee, blast-radius impact) in their prompts. `lastIndexedCommit` exposed on `/projects/:id/status` for staleness checks.
- **Evaluator Agent — fitness phase + cruise auto-abort** — with `evaluator: true`, the evaluator now runs during the fitness phase as well as validation. High-severity concerns recorded via `reap run validation --phase report-evaluator` automatically abort cruise mode, replacing the auto-fitness prompt with a supervised fallback so the user can review before continuing.

## Daemon Setup

```bash
npm install -g @c-d-cc/reap
```

Add to `.reap/config.yml`:

```yaml
daemon: true   # default: false
```

Then start the daemon and register your project:

```bash
reap daemon start
reap daemon status
```

The daemon runs at `localhost:17224`. REAP automatically triggers indexing at key lifecycle points. Agents receive symbol query guidance in their prompts when `daemon: true` is set.

## Evaluator Setup

Add to `.reap/config.yml`:

```yaml
evaluator: true   # default: false — enabling increases token usage
```

Then run `/reap.evolve` as normal. During validation and fitness, the builder launches `reap-evaluate` as an independent subagent (read-only, qualitative assessment). If you use cruise mode, high-severity evaluator concerns automatically pause cruise for human review.
