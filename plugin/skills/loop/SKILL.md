---
name: loop
description: Use when making new intent in a REAP project - planning, designing, shaping UI/UX, or holding an idea that has no home yet. Opens or continues a loop (the plan-axis cycle, separate from generations), writes to the plan source, records the dialogue, and closes the loop by carving a milestone. Trigger on "기획", "설계", "loop 열기", "무엇을 만들지 정하자", "plan을 쓰자", or whenever evolve finds the work is making intent rather than realizing it, in a repo containing .reap/.
---

# loop — makes new intent

## When to call it

**Anything that makes new intent belongs here.** Planning (`plan`), design (`design`), screens and flows (`uiux`), anything with no home yet (`idea`). `evolve` splits between "realizing" and "restoring", and if it's neither — **it's a loop, not a generation.** There's no `make generation --plan`.

A loop is a **different cycle** from a generation. It isn't bound to a session, spanning several sessions is normal, and several can be open side by side. The norm is owned by the spec (`02-flow.md`'s "the plan axis's unit is the loop", and the `loop` section of `06-agent.md`) — this is procedure.

## First: look at open loops

The status line lists `Open loop:` one per line. If not, look at `.reap/life/loops/` directly — closed ones stay there too, up to the 10 most recent.

**If a loop already open covers the same question, continue there.** Opening a new one splits the discussion into two records. Read that record's `Question` and `Dialogue`, learn how far it's gotten, then continue.

**A closed loop is worth reading too.** The current question may already have been dealt with by an earlier loop, and `Dead Ends` says so — the plan arc has flipped twice in this repo, and the same spot got filled wrong three times. Not reading the earlier ones makes a fourth.

## Open it

```bash
reap make loop --type plan|design|uiux|idea --title "<title>" [--slug <s>] [--from <id>] [--ref <ps-id>:<path>]
```

**Type is decided by where the output will go.** `plan` for a planning document, `design` for a design document, `uiux` for a screen or flow, `idea` if where it goes isn't known yet. The type decides *what it takes to close it*.

**`--from` is a source, not authority.** An execute generation stuck for lack of planning (`gen-0043-exec`), a prior loop, a plan source document (`ps-xxx:path`) — write it if there is one, fine if not. The tool doesn't check it.

**The body starts empty.** Write `Question` first — what this is trying to decide. That's the only thing making the record useful while the loop spans several sessions.

## Then discuss

REAP stops being involved from here. Explore, run thought experiments, stand up approaches and fold them back down. If there's a divergence point with the human, **ask — how to ask belongs to [interview](../interview/SKILL.md).** This skill owns neither what to ask nor how.

**Record `Dialogue` in the record.** One row per divergence point — what diverged, what the options were, what the human picked, and whether it adopted the recommendation or gave a different answer. It's the divergence points, not a transcript. Without this, the next session either asks the same thing again or reads what the human picked as something the agent decided.

**Before writing, check whether that source is still alive.** If the convention's (`conventions/<ps-id>-*.md`) `Lifespan` section says "consumption complete", or this loop's question **extends that source's topic rather than broadening it**, don't write there. It nearly happened — trying to write the homecoming campaign (loop-0003) into a design spec whose consumption was already complete, and a human blocked it. There are two paths: **extend** the existing source, or **found** a new document set and register it with `make plan-source`. Which document system to use is a business judgment, so **when it's ambiguous, ask the human** (interview) — when it's clear, decide it and leave the grounds in `Dialogue`. When a source's consumption completes (its last milestone closes), update that convention's `Lifespan` section — that's the marker the next loop reads.

**Write to the plan source.** That's this loop's output. The judgment calls in writing are the spec's six — which source to write to, read the convention (`conventions/`) first, write new or revise existing, **update the convention itself**, don't write anything unresolved into the plan, and whether the commit rule applies to that source. Each reason is in `06-agent.md`; not copied here.

**Don't put norms in the loop record.** What's decided goes to the plan source, `genome/`, or `map.md`. The record holds only *why it was decided that way* and *paths that were folded*. A decision that lives only in the record is undecided.

## Close it — once the output has found its place

| Type | Finding its place means |
|---|---|
| `plan` · `design` · `uiux` | Written to the plan source. If there's something to execute: **several generations' worth → carved with [carve-milestone](../carve-milestone/SKILL.md); one generation's worth → a backlog item** (`reap make backlog --type <t> --from <loop-id>`). A loop that settled a small change doesn't need a milestone to leave one item behind |
| `idea` | Left in `idea/research/`, or graduated into a loop of another type |

```bash
reap mark loop <loop-id> --closed [--milestone <ms-id>]...
```

Write the milestone this loop produced under `--milestone`. The milestone's `from:` has to point back to this loop too — `carve-milestone` writes it via `--from <loop-id>`. If the output was a backlog item instead, close with no `--milestone` and name the item in `Outcome` — its `from:` already points here.

**Before closing, write `Dead Ends` and `Outcome` faithfully.** A closed loop stays in `life/loops/` for the generation executing that milestone to read. Past 10, the tool sends the oldest down to archive — nothing to decide here.

**If it hasn't found its place, leave it open.** That's normal. The next session reads `Question` and `Dialogue` and continues. If the direction itself has died, clear it with `--aborted`, but send why it was folded to `idea/research/` — a cleared record can't be read by anyone.

**The commit rule is the same.** It doesn't close until what was written to the plan source is committed. If the source is outside this repo, check there, and if it's not git, don't apply the rule and **say it wasn't applied.**

## Without the binary, do it by hand

That's how `loop-0001` opened. Append a row to `sequence/loop.md` and stamp the frontmatter by hand — what ends up in the files should be the same. Record the friction with `make backlog`.
