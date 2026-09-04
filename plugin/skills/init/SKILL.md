---
name: init
description: Use once per project, at the very start, to set up the canonical knowledge REAP manages - in a new folder, in an existing codebase, or where .reap/ was created but left as seeds. Runs reap init, explores (brownfield), registers the plan source, fills environment/summary.md and genome/application.md·evolution.md, then hands the first milestone to carve-milestone. Owns the questionnaire; asking itself is interview's. Trigger on "reap 시작", "init", "REAP 셋업", "정본 지식 세우기", or when .reap/ is missing or its genome is still seed text.
---

# init — establishes the canonical knowledge

`reap init` (the CLI) only lays down directories and seeds, and the seeds are **question sentences**. `ctx` injects the whole of `genome/` every session, so if it's left unfilled every session gets an empty prompt — and the assumption that leaving a placeholder gets filled in later has been wrong three times in this repo. **Fill it on day one.** The norm lives in the `init` section of `06-agent.md`; this is the procedure.

**This is the one skill the status line can't point to.** Without `.reap/`, the hook stays silent. A human has to call it.

## What this skill owns and what it doesn't

- **Owns** — what to fill in what order, the split between what code can answer and what must go to a human, which file and which spot an answer goes in
- **Doesn't own** — how to ask. One-at-a-time, options, recommendation-shaped sentences belong to [interview](../interview/SKILL.md). **If you feel the urge to write those sentences here, the boundary is wrong**

## 0. Split the entry condition

```bash
ls .reap 2>/dev/null && reap init --check
```

| State | What this skill does |
|---|---|
| No `.reap/`, no code — **new folder** | Run `reap init`, then asking the human is almost all of it |
| No `.reap/`, code exists — **existing codebase** | Run `reap init`, then explore (2) to draft, and get it confirmed |
| `.reap/` exists, `--check` reports seeds — **left as seeds** | Fill only what's reported. Don't touch a file a human has typed a single character into |
| `.reap/` exists, no seeds left | Not this skill's job. Stop |

## 1. Open the first loop

```bash
reap init                                   # only if missing
reap make loop --type plan --title "establish the canonical knowledge" --slug init
```

**`init` is the first loop.** Establishing the canonical knowledge closes it once the first milestone is carved. If there's nothing to carve yet, it stays open, and that's normal. If it's interrupted, the next session reads this loop's `Question`/`Dialogue` and continues — see [loop](../loop/SKILL.md).

## 2. Explore (for an existing codebase)

**Don't read the source files.** Reading code to learn it is the code index's job. What to read is six things.

| What to read | What it fills |
|---|---|
| Manifests and lockfiles (`package.json` · `pyproject.toml` · `go.mod` · `Cargo.toml` …) | Stack, dependencies |
| Build and test entry points (`Makefile` · `scripts` · CI config) | How to build and test |
| `README` | What it builds |
| Directory tree, one to two levels | Source structure |
| `git log --oneline -50` | Commit conventions, active areas |
| **Existing AI instruction files** (`CLAUDE.md` · `AGENTS.md` · `.cursorrules` · `.github/copilot-instructions.md` …) | The only direct material for `evolution.md` |

**Don't write down what can't be confirmed.** To write *"this project does TDD"*, there has to be grounds that tests actually exist and run. Without grounds, it goes to the question list instead.

**Read existing AI instruction files, but don't edit them.** REAP's hook injects `genome/`, and the client injects `CLAUDE.md`, separately — if they overlap, the same thing gets loaded twice. **Report the overlap to the human** and let them decide whether to move it — quietly tidying someone else's file erases which one is canonical.

Exploration produces two things — a **draft** (what's confirmed by grounds) and a **question list** (what has to go to the human). **Finish confirming the list before asking.** `interview` needs a count to show how many remain, and that count has to exist first. In a new folder the draft is nearly empty and the list is nearly everything — two ends of the same procedure.

## 3. The questionnaire — in order

**Decide where the canon lives first.** That's why plan source comes before genome — `application.md` doesn't copy norms that live in a plan source, so without knowing whether one exists, what to write isn't settled either.

### 3.1 plan source

| Question | Can code answer it | Where the answer goes |
|---|---|---|
| Is there a planning/design document, and where | Exploration finds candidates (`docs/` · `spec/` · `prd/` · `adr/`). **Which one is canonical** is a human call | `reap make plan-source --root <path> --role "<role>"` |
| Where to start reading that source, what's authoritative | Partly — if there's a `README` or an index | `plan/conventions/<ps-id>-<slug>.md` |

If there's none, don't register one. **If `application.md` starts holding planning, that's the signal it needs a plan source** — it's stated in the seed.

### 3.2 `environment/summary.md`

| Question | Can code answer it |
|---|---|
| Stack, language, runtime version | Yes |
| Source structure — what's where | Yes (two-level tree) |
| Build, test, run commands | Usually yes. If not, a human |
| Where the next session should start, knowing nothing | A human |

### 3.3 `genome/application.md`

| Question | Can code answer it |
|---|---|
| What this project is — one paragraph | Draft from `README` if present. Confirmed by a human |
| How many things it builds (binaries, services, libraries…) | Usually yes |
| Working conventions — testing rules, language, commit messages | Confirm-shaped if there's a trace. Otherwise a human |
| If the norm lives in a plan source, **don't copy it here** | — |

### 3.4 `genome/evolution.md` — last

Written after already having gone through this project while filling the previous three.

| Question | Can code answer it |
|---|---|
| Is there an existing AI instruction file — which parts of it are **behavior rules** | Yes. Whether to move it is a human call |
| What to ask the human versus decide alone | A human |
| Are there known mistakes that must not repeat | A human |

### Two things left untouched — for different reasons

- **`genome/invariants.md`** — only a human edits it. Permanent rules. Don't even propose candidates
- **`vision/memory/lessons.md`** — nothing's been experienced yet. It's a fact of this moment, and accumulates once the first milestone closes

## 4. Ask

Take the question list to [interview](../interview/SKILL.md). Write answers into their spot from step 3, and **leave where opinions diverged in this loop's `Dialogue`** — which answer was the human's and which was an adopted recommendation.

## 5. Judge the first milestone

Once the canonical knowledge stands, check **whether there's work to do right now**. If so, carve it with [carve-milestone](../carve-milestone/SKILL.md) — this loop becomes its `--from`. Once carved, close the loop:

```bash
reap mark loop <loop-id> --closed --milestone <ms-id>
```

If not, leave the loop open. Write what got filled in `Outcome`, and why there's nothing to carve yet in `Open Questions`.

## Confirm at the end

```bash
reap init --check     # genome/application·evolution and environment/summary must not be reported. invariants·lessons·map.md staying as seeds is normal
reap ctx               # see directly what the next session will receive
```

Done when `ctx`'s output reads as facts about this project rather than question sentences. Commit — and if the plan source is a separate repo, commit there too.
