# Migration instructions — 6/8 subagent · 8/8 record and home cleanup

[SKILL.md](../SKILL.md)'s 6/8 and 8/8 point here. **Hand this whole document to the subagent as its instructions.**

## To the subagent (6/8)

The main session doesn't read the migration data — carrying out the below is Task's (subagent's) job. At the start of each mapping, the subagent prints "migration N/10: <target>", and returns a draft record file at the end.

**Shared rules**
- **Run every `reap` command at the target project's root.** reap searches upward through parent directories for `.reap/`, so running it inside another repo **writes into that other store.** Right after the first `make`, check that the output file's path is under the target project, and if not, stop immediately
- **Only read `.reap-v0_17/`.** No writing, editing, or deleting — non-destruction of the original is invariant
- New items' ids must always be issued through `reap make ...` — never stamp an id by hand
- For anything decided not to move, leave "what, and why" in the record file — don't quietly drop it

## Finalized mapping (ps-4b485d's 04-migration-skill.md, confirmed by gen-0066 · gen-0070)

| # | Original (`.reap-v0_17/`) | Where, and how |
|---|---|---|
| 1 | the 3 `genome/` files | **Copy as is** into the new `.reap/genome/`. But don't edit phrasing that assumes v0.17's structure (5-stage lifecycle, stage, cruise, etc.) — just list it in the record file as "needs updating." genome is the user's own norm, so content changes go through the user |
| 2 | `vision/memory/` longterm·midterm·shortterm | **Curate** into `vision/memory/lessons.md`. Passing bar: a lesson that reads as a conclusion from its title alone, passing "would the next session repeat the same mistake without this." **Not a full copy** — shortterm (session handoff) is dropped by default unless it carries in-progress work info, in which case copy that into the record file. midterm's finished tracks are dropped |
| 3 | `life/backlog/` | For each item, reissue with `reap make backlog --type <old type convention> --title <title>` and carry the body over. Put the old id at the end of the body as `original: <old filename>` |
| 4 | **open** `vision/milestones/` | Recreate with `reap make milestone --title ...`, porting the body (Exit Criteria/Out of Scope equivalents) into v0.18 vocabulary. Don't move closed ones (the original is history) |
| 5 | `vision/goals.md` | As a **plan source candidate draft**: pull out only the still-live goal statements into a `docs/plan/goals-v017-migrated.md` draft (anywhere in the repo), and **only guide the user toward registering it** (`make plan-source`) — the goal concept doesn't exist in v0.18 |
| 6 | `vision/design/` | For each document, `reap make idea --kind file --title <title>` into `idea/files/`. Fill in the source (original path), the date pulled in, and the graduation criteria ("once this design is adopted, into a plan source or environment") |
| 7 | `config.yml` | The new config was already set up in 5/8 (language·agentClient carried over). Leave the **list of dropped fields** (autoSubagent, autoUpdate, strictEdit, strictMerge, evaluator, cruiseCount, autoIssueReport, lastMigratedVersion, etc.) in the record file — a setting shouldn't quietly vanish |
| 8 | `lineage/` · `sequence/` · `reap-guide.md` | **Not carried forward.** The original staying whole in `.reap-v0_17/` is the history. v0.18 generations start from 1. `reap-guide.md` is the guidance v0.17 bundled (explaining the whole 5-stage lifecycle) and gets replaced by v0.18's own — it isn't user knowledge, so it isn't moved |
| 9 | `hooks/` · `migration-state.yml` · `.session-state.md` · `.index/` | **Only move hooks that have a matching event** — `onLifeStarted.<name>.{sh,md}`→`.reap/hooks/gen.made.<name>.{sh,md}`, `onLifeCompleted.<name>.*`→`gen.closed.<name>.*` (rename only, keep body and metadata as is; `.sh` keeps its execute bit). The remaining 12 events (`onLifeLearned`·`onLifePlanned`·`onLifeImplemented`·`onLifeValidated`·`onLifeTransited`·8 kinds of `onMerge*`) and `*.example` files aren't moved — note each as "no matching event" in the record file. Copy `conditions/` whole (v0.18 `init`'s placed `always.sh` can be overwritten by the original — same behavior. The original may have one extra comment line, which is harmless). `migration-state.yml`·`.session-state.md`·`.index/` are **dropped** — the mechanism they served is gone. One line each in the record file |
| 10 | `environment/summary.md`·`source-map.md`·`resources/`·`domain/`·`docs/` | `summary.md`→`.reap/environment/summary.md` **as is** — overwriting the seed `init` placed (a seed isn't user knowledge). `source-map.md`→as is (if present). `resources/`→as is. `domain/`·`docs/` have no place in v0.18 — move them to `.reap/environment/resources/domain/`·`resources/docs/` and note it in the record file (don't edit the content). Phrasing assuming v0.17's structure (5-stage lifecycle, etc.) is "needs updating," same as genome |

## Record file (8/8) — `.reap/archive/migration-v0_17.md`

```markdown
---
migratedAt: <ISO, second precision>
from: v0.17 (.reap-v0_17/)
---
## Moved            # by mapping #, original→destination and count — including the environment section (summary, resources, domain/docs move)
## Not moved      # what, and why — including the list of dropped config fields
## Needs updating      # list of v0.17-assuming phrasing in genome and environment
## Verification               # full doctor output
## Home cleanup            # if done, list of what was removed; if not, "not done"
```

**This isn't complete until the output of 7/8's zero-defect doctor run is in this file.** Put the one-line revert command (`rm -rf .reap && mv .reap-v0_17 .reap`) at the top of the file too.

## Home asset cleanup (8/8) — only after showing the list and getting consent

This carries forward the principle from gen-088's `reap uninstall`: **delete only what's on the allowlist. Never touch anything the user owns under `~/.reap/`** (a private key has actually been found there before).

| Asset | What |
|---|---|
| `~/.claude/commands/reap.*.md` | the 19 old slash commands |
| `~/.claude/agents/reap-*.md` | the 2 old agents, plus `reap-upgrade.md` itself once migration is done |
| `~/.claude/settings.json` | only the reap entries in SessionStart (check-version, load-context) and in the marketplace/plugin keys. **Validate-then-write** — if a single value is wrong the client ignores the whole file, so check the edited version by parsing it as JSON and swap it in atomically through a temp file |
| `~/.reap/` | only what reap wrote: `reap-guide.md` · `version-check.json` · `daemon/`. Leave the rest |

Migration is complete even if cleanup is skipped — just note in the record that the user accepts the old slash commands showing up duplicated alongside the new plugin.
