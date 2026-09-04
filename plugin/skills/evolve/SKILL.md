---
name: evolve
description: Use when starting new work in a REAP project - deciding whether this is a loop (making intent) or a generation (realizing or restoring it), choosing the ground, and opening a generation record. Trigger on "작업 시작", "새 세대", "다음 뭐 하지", or any request to begin substantive work in a repo containing .reap/.
---

# evolve — opens a generation

## First: follow the map and read

What's injected when a session opens is `genome/`, `environment/summary.md`, and **the status line** — nothing else. Neither `handoff.md` nor `milestone.md` is in the session **yet**. They're just paths the status line points to; reading them happens here.

If there's no status line (injection didn't happen, or this isn't a REAP project), call `reap ctx` directly.

The usual reading order is below. **It doesn't mean read all of it** — what's actually needed is decided by the work at hand.

1. **`handoff.md`** — what the previous session left behind. Where to start next is here
2. **`milestone.md`** — the boundary, exit criteria, and the branch of work
3. **`tasks/<what to work on now>.md`** — **only** the one being touched this time. Don't open a finished task or one not yet started
4. **The record of an already-open generation, if any** — what it was in the middle of doing

**To find something already decided, look at the spec.** REAP keeps no decision log — what's decided is reflected wherever it governs (a plan source, `genome/`, `map.md`), and whatever isn't reflected there isn't decided.

**A file the status line doesn't name is empty.** Don't open it.

## If a generation is already open

If the status line reports an open generation, **stop before opening a new one.** Either the session was cut off mid-work, or another session is working on it.

Read that record's Intent and judge — if it's a continuation, don't open a new one, just carry on. If it's abandoned, confirm with the human, clear it with `reap mark generation <id> --aborted`, then open a new one.

**Conversely, if a generation is open but the status line doesn't show it**, its binding has been lost (after an abort, or opened from a different directory). `doctor` reports it as "generation open but unbound", and if it's mine, `reap bind <gen-id>` rebinds it.

## Next: is it worth opening a generation

**Ask this before picking an axis. Work that finishes in one edit and one commit isn't a generation** — a commit is enough.

The boundary sits there because of why the record exists. As the [record vocabulary](../shared/references/record-vocabulary.md) pins down, what a generation record does is **hold onto "what was in progress" while the work is running.** That's exactly what's needed when a session dies mid-work or hands off to another session, and **work that finishes in one shot has no "while it's running".**

Opening one with nothing at stake leaves only cost — one record file, one registry row, one commit to close it with `mark`. It's actually happened that opening a generation for **deleting two comment blocks** turned into three commits.

**Three things that are a generation even when small.**

- **Consuming a backlog item** — `mark backlog --consumed` stamps `consumedBy` with the bound generation. Without a generation, **who consumed it doesn't get recorded.** The structure demands it regardless of size
- **There's a folded-up approach** — a commit holds **what was done** and not **what wasn't**. `Dead Ends` lives only in the generation record
- **Another session is running alongside** — the status line's "open generation" is the only way to signal it's in progress

**What's counted isn't file count or line count.** Mechanically fixing ten files is one commit; fixing one file while folding up three approaches is a generation.

**When it's ambiguous, don't open one.** A generation can be opened mid-work too — open it once it grows long, and a commit already made just sits ahead of `startCommit`. Conversely, undoing one that was opened means either clearing it with `--aborted` or closing an empty record.

## Next: loop or generation

**Decide what the work is trying to do, first.** One branch falls away first — **if it's making new intent, it's a loop, not a generation.** Planning, design, screens, anything with no home yet. Then this skill stops here and hands off to [loop](../loop/SKILL.md). There's no `make generation --plan`.

| This work | Goes to | Grounds |
|---|---|---|
| **Makes** new intent | **loop** — outside this skill | optional. Just a source |
| **Realizes** new intent | exec generation | **required — a milestone or backlog item** |
| **Restores** an existing intent | fix generation | none |

**exec's grounds are its authority** — it's evidence someone already decided what to build, and without it a generation can't open. loop is **the act of deciding itself**, so it has no grounds to require.

**The default between loop and exec:** if there are grounds to start right now (remaining work in an open milestone, or a backlog item), it's exec; without one, it's loop. That's a default, not a rule — even with grounds, if they don't match what's needed right now, loop is still right. **fix is unrelated to this default.**

**Signals pointing to loop**

- What to build hasn't been settled yet. The request is closer to "what's needed" than "what to do"
- There's no open milestone, or what's left doesn't match the current need
- `idea/research/` has unresolved investigation piling up and blocking direction — that's the `idea` loop's place
- The prior execute generation got stuck for "lack of planning" — open a loop with that generation as `--from`
- **A loop is already open and this can push it forward**

**Signals for picking the execute axis**

- There's a startable milestone with clear remaining work
- **A single backlog item already fully specifies what to do**
- The judgment needed is already reflected in the spec

### If exec is chosen, pick the grounds

**What the rule requires isn't a milestone — it's a boundary.** A backlog item is a boundary too — one item defines one piece of work, and consuming it ends it.

| This work | Grounds |
|---|---|
| Not written down anywhere yet. What "done" means has to be decided now | **milestone** |
| Already written in a backlog item. Consuming that item ends it | **backlog** |
| Splits into several branches, spans multiple sessions | **milestone.** A single item can't hold branches |
| One branch of a milestone, and that branch's work is written in a backlog item | **both** |

**The two grounds aren't exclusive.** Give both `--milestone` and `--backlog`. Writing only one leaves the other connection living only in prose, and prose isn't searchable.

**If two items touch the same thing, consume them together in one generation.** The principle is one item, one boundary — but if two items need **the same command or the same file**, splitting them leaves a half-finished state the moment one closes. In that case, give `--backlog` one of them and **write the rest in the record's Intent.** That's different from bundling non-overlapping items for convenience.

**Don't create a milestone just to consume a backlog item.** That writes the boundary in two places, and two places drift. Even with an open milestone, if this work isn't one of its branches, open with the backlog grounds alone.

**An already-`consumed` item can't be grounds.** The tool refuses it. If consumption was incomplete, make a new item **holding what's left.**

**Signals for picking the fix axis**

- Something already built isn't running as intended — a bug, a broken build, a stale dependency, a typo
- There's a place to point back to as what it's restoring. If nothing can be pointed to, it isn't a fix. **Refactoring isn't a fix either** — if the behavior already runs as intended and only the structure changes, there's nothing to restore. That's new intent, it's exec, and it needs grounds

**Watch for three antipatterns.**

*Pushing ahead knowing the plan is thin* — on the execute axis, "we'll figure it out as we go" is usually a sign a loop should have opened instead. A wrong assumption flows all the way to implementation and only surfaces at the end.

*Using planning as an excuse to defer execution* — planning can be refined indefinitely. A loop can stay open, but **if loops just pile up without ever producing a milestone**, that's the signal.

*Building a small new feature as a fix because it's small* — fix's criterion isn't size, it's **whether it restores something.** A small new feature is exec, not fix, and needs grounds. Grounds only cost one backlog item, so **it isn't expensive** — there's no reason to dodge into fix over size. Leave that hole open and fix becomes a back door around the boundary discipline.

**If it's ambiguous, call [interview](../interview/SKILL.md) first.** Picking the wrong axis wastes an entire generation, and the two or three questions that prevent it are cheap. How to ask lives there — it isn't copied here.

## Next: what to do

Decide based on what's been read and what the human asked for. **Plan items aren't a contract** — reorder, split, or drop them freely.

If scope is vague, narrow it here. A generation has one intent.

## Open the generation record

**Generations pile up in one place regardless of type** → `.reap/life/generations/<gen-id>-<slug>.md`

Milestone membership is stated by the `milestone` field in frontmatter, not by directory.

Frontmatter holds only mechanical facts.

```yaml
id: gen-0001-exec            # the next number in sequence/generation.md. one series across types. an issued number is never reused
slug: token-rotation
type: exec              # exec | fix
milestone: ms-004       # exec's grounds. can come with `backlog: bk-a1b2c3`. fix has neither
title: implement session token rotation
startedAt: 2026-08-23T10:00:00Z
startCommit: 1a2b3c4    # current HEAD
status: open
```

Add a row to `sequence/generation.md`. **It's append-only, and a deleted number is never reused.**

**Start with the body empty.** What to write is guided by the [record vocabulary](../shared/references/record-vocabulary.md) — it's a vocabulary, not a template.

Write the intent — why open this generation, what makes it done. **This is the only thing that makes the record useful while the generation is running** — exactly what's needed when a session dies mid-work or hands off to another.

**A fix record needs one more thing.** It's not pinned in frontmatter — what's being restored doesn't always have an id (a broken build or a stale dependency has no generation to point to). Instead, **write in `References` what intent is being restored** — if there's nothing to point back to, that's a sign this wasn't a fix to begin with.

## Do it yourself, or delegate

**The default is doing it yourself** — this same session does the work. Consider delegating if one of the signals below holds.

- This generation looks likely to fill the main session's context with many files and long exploration
- A human asked for delegation
- Two or more are running in parallel — if parallel, split by worktree and let the main tree issue ids ([orchestrate](../orchestrate/SKILL.md))

Once delegation is decided, the procedure is five lines.

1. **Write the Intent** — in the generation record, before delegating
2. Fill in [`references/delegate-brief.md`](references/delegate-brief.md) and hand it to the subagent
3. The subagent works — **in the same working tree.** The `.session` binding belongs to the main session, and the subagent never calls `make`/`mark`, so there's no conflict
4. The main session **reviews** — reads the diff, runs the tests itself, reads the Outcome the subagent wrote
5. `complete`

**"REAP stops being involved from here" still holds after delegation.** Delegation is a choice of execution shape, not involvement.

## And then work

REAP stops being involved from here. When code knowledge is needed, there's `reap index search|impact|callers|callees` — it only knows what's committed (use `grep` for what isn't). If `status`'s resolution rate is low, an empty result means "unknown". Explore, plan, write, fix, restore. Neither the order nor the count is fixed.

If something needs to be left behind midway:
- Something decided → **reflect it where it governs** (a plan source, `genome/`, `map.md`). There's no path of logging it now and reflecting it later — unreflected means undecided
- Not doing it now → `backlog/`
- Not solid yet → `idea/`

When it's time to close, `complete`.

## Use the tool when there is one

If the `reap` binary is on PATH, it handles the id issuance, frontmatter stamping, path placement, and session binding described above.

```bash
reap make generation --milestone <ms-id> --title "<title>" [--slug <slug>]   # exec — a milestone is the grounds
reap make generation --backlog  <bk-id> --title "<title>" [--slug <slug>]   # exec — a backlog item is the grounds
reap make generation --fix  --title "<title>" [--slug <slug>]                # the fix axis
```

`--fix` comes with **no grounds**. exec needs **at least one** of `--milestone`/`--backlog`, and **both together is fine too.** Without a type or grounds, it's refused. **`--plan` is refused** — that's `make loop`.

Without `--slug`, it's built from the title. **The body starts empty; writing the intent comes next.**

**Without the binary, do it by hand.** The plugin and the binary install separately, so this is a normal state to be in. Either way, what ends up in the files should be the same.
