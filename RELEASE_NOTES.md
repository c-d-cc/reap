## What's New

- **`fix --check` and `install-skills` no longer contradict each other** — the installer wrote 19 slash commands to `~/.claude/commands/` while the checker reported that exact path as a v0.15 leftover. No supported command could clear the warnings: reinstalling put the files straight back, and `reap fix` never touches the user-level directory. The path now has one owner (the adapter) and reaches the checker by injection, so the two can no longer drift apart. Fixes [#22](https://github.com/c-d-cc/reap/issues/22).
- **A release now has to install cleanly before it ships** — `scripts/check-self-diagnosis.sh` unpacks the actual publish tarball into a throwaway HOME, initialises a project and requires `fix --check` to report nothing. A fresh install complaining about itself means the installer and the checker disagree, which is what #22 was. Runs in CI on every push and again before publish.
- **And an agent has to be able to drive it** — `scripts/check-agent-integration.sh` starts a headless agent and checks that `/reap.start` actually creates a generation, judging by what appears on disk rather than what the agent says. Files can be perfectly installed and still never surface as commands; that shipped once and a user found it. Pre-release only (~$0.25 per run).
- **Shared facts declare themselves** — a value known in several places now carries a `reap:carrier(id)` marker, so finding every place that knows it is a grep rather than a memory exercise. `scripts/list-carriers.sh` lists them and flags any recorded in only one file. Both #21 and #22 were one place going stale while the others moved on.
- Two smaller fixes surfaced by the new gates: a freshly initialised project reported its own shipped `invariants.md` as placeholder-only, and `init --repair` reported a CLAUDE.md it had just rewritten as "already present".

---

## v0.17.2

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
