## What's New

- **Reflect-phase pruning policy** — the reflect prompt now tells the agent what to *remove*, not only what to write. Memory tiers are classified by content-type (session handoff / ongoing tracks / design lessons) rather than lifespan, with a 4-step decision tree and per-tier pruning: shortterm is replaced every generation, completed midterm tracks are deleted after their lessons are promoted, and longterm drops anything already covered by the genome. `environment/summary.md` gets a matching instruction to remove superseded content instead of accumulating per-generation changelogs.
- **Rules now reach existing projects** — `reap init` seeds the same classification into `genome/evolution.md`, and projects created earlier receive a `v0.17.2` migration note so their genome stops teaching the retired lifespan model. Fixes [#21](https://github.com/c-d-cc/reap/issues/21).
- **Size warnings, with rationale** — `reap fix --check` reports when a genome file, memory tier, or `environment/summary.md` grows past its guideline size. The genome thresholds are now per-file (`invariants` 50 / `application` 250 / `evolution` 300) instead of a shared 100-line limit that the shipped `evolution.md` could not itself meet — every project used to warn the moment `reap init` finished. Each value is derived from what its file holds, and the guidelines are documented in `reap-guide.md`. All size checks are warnings only; `reap fix` never rewrites these files.
- **Docs release gate** — `scripts/check-docs-version.sh` verifies that `RELEASE_NOTICE.md`, `RELEASE_NOTES.md`, and all five reap.cc locales agree with `package.json` before publish, including locale-parity so one language can no longer be left behind. reap.cc itself has been corrected: it no longer teaches the retired lifespan-based memory model, and its `environment/summary.md` size guidance now matches the code.
- **Scenario coverage for the backlog gate** — `run start` has refused to create a generation while a pending backlog is undecided since v0.16, but the multi-generation scenario still assumed the old behaviour and had been failing. It now walks the gate the way a user does — blocked, decided, re-invoked — and covers both exits (`--backlog` and `--no-backlog`).

---

## v0.17.1

- **Migration instruction layer** — `reap update` now detects version gaps and injects per-version migration instructions into the agent's SessionStart context. Agents receive actionable prompts to reorganize existing artifacts/memory when upgrading REAP. Mark migrations complete with `reap update --mark-migrated`.
- **Memory structure improvement** — Vision memory now uses content-type-based classification (session handoff / ongoing tracks / design lessons) instead of time-based tiers. A mandatory pruning policy was added to the reflect phase: shortterm is replaced every generation, midterm is cleaned on track completion, longterm is pruned periodically.

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
