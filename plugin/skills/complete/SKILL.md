---
name: complete
description: Use when finishing work in a REAP project - verifying the commit rule, writing the outcome, updating the handoff for the next session, and closing the generation record. Trigger on "세대 닫기", "작업 마무리", "완료", or when substantive work in a repo containing .reap/ is done.
---

# complete — closes the generation

## First: know what's being closed

What's injected when a session opens is `genome/`, `environment/summary.md`, and **the status line** — nothing else. If this session didn't open a generation, neither `handoff.md` nor the generation record is **in the session yet.**

Read the record of **the open generation** the status line reports. Without knowing what the generation was trying to do, the outcome can't be written. If there's no status line, call `reap ctx` directly.

`handoff.md` is going to be **replaced**, so look at what's currently written first.

## Review first if this was a delegated generation

If the generation record's Intent says something like "a subagent does this" or "delegated", this generation ran through [evolve's delegation procedure](../evolve/SKILL.md). This section comes before checking the commit rule.

- Read the **Outcome** and **Dead Ends** the subagent wrote
- Look directly at what changed with `git diff <startCommit>..HEAD --stat`
- **The main session runs the tests itself** — don't just trust the subagent's report
- Look for traces of the brief's discipline being broken: a row issued by the subagent in the registry, `.session` switched to the subagent's generation, the generation already closed as `closed`

**A trace of it being broken is a hole in the brief.** Don't blame the subagent — it means the discipline was missing or weak in the `delegate-brief.md` template, so fix the template.

## Next: check the commit rule

**Don't close a generation with uncommitted state.** This is REAP's only rule, and **the tool doesn't check it.** Checking happens here.

```bash
git status --porcelain        # must be empty
git log <startCommit>..HEAD --oneline   # must have at least one new commit
```

`startCommit` is in the generation record's frontmatter, and also shows on the status line.

**Commits can be split into several.** That's better than one giant commit — they become the unit for reverting later.

**If the rule isn't met, stop here.**

- There's uncommitted change → sort out with the human what to commit and what to drop. Don't commit arbitrarily
- There's not a single new commit → this generation changed nothing. Confirm with the human whether it should be **aborted instead of closed**

## Finish the record

Refer to the [record vocabulary](../shared/references/record-vocabulary.md) to tidy up the generation record's body.

At minimum, leave **what was done and what's left.** Delete an in-progress plan or fold it into the outcome — a live plan left in a finished generation reads to the next session as work still to do.

**Write down any folded approach.** The biggest value of this record is keeping the next session from walking the same path again.

## Update the handoff (only for a generation belonging to a milestone)

**Only exec generations belong to a milestone.** A fix generation has no `milestone` field, so there's no `handoff.md` or milestone plan item to update either — skip this whole section. What a fix leaves instead is the generation record's body (what was done, what's left) and, if it's a global lesson, `vision/memory/lessons.md`. **This skill doesn't close a loop** — [loop](../loop/SKILL.md) closes it with `mark loop --closed` once the output has found its place.

For an exec generation, `milestone/handoff.md` holds **only what the next session needs.** Replace it, don't accumulate.

- How far things have gotten
- Where to look first next
- What's pending (unresolved questions, things waiting on a human's answer)

**Don't put in what might be needed.** That belongs to `idea/freememo/`. If this distinction breaks down, handoff becomes a file nobody reads.

Update the milestone's plan items to match progress. Items can grow, split, or disappear.

## Move over what carries forward

What came out of this generation but isn't being done now:
- Something to do → `backlog/`
- Investigation or observation with no conclusion → `idea/`

**Don't carry forward what's settled.** If this generation settled something, it should **already be reflected** where it governs (a plan source, `genome/`, `map.md`). If it isn't, reflect it before closing, or leave it as undecided. REAP keeps no decision log — there's deliberately no place to note "reflect this later."

## Close the record

Update the frontmatter.

```yaml
status: closed
closedAt: 2026-08-23T13:20:00Z
endCommit: 9f8e7d6        # current HEAD
```

## Has the milestone finished

After closing the generation, **if the milestone's exit criteria now read as met, stop there.** Don't close it yourself.

**The closing procedure belongs to [carve-milestone](../carve-milestone/SKILL.md)** — how to ask fitness, how to read the answer, and in what order to call `cleanup` and `mark milestone --closed` all live there. Not copied here.

## Use the tool when there is one

If the `reap` binary is present, `reap mark generation <id> --closed` handles the frontmatter update. **`mark` doesn't check anything** — the commit check was already done above. Without the binary, do it by hand.
