---
name: cleanup
description: Use right after a human confirms fitness to close a milestone in a REAP project, before calling mark milestone --closed - deciding which generations in life/generations/ have lost their reference value and moving those to archive. Trigger on "정리", "cleanup", "archive로 옮겨", or right after the human confirms fitness for a milestone in a repo containing .reap/.
---

# cleanup — sends generations that have lost reference value down to archive

## When to call it

Right after a human states fitness and decides to close a milestone, **before calling `mark milestone --closed`.** Or when a human says "clean it up".

**Order matters.** `mark milestone --closed` moves the whole milestone directory into `archive/milestones/` — `handoff.md` moves with it. Calling this skill after that leaves the `handoff.md` that should record the moved generations already in archive, and since `ctx`'s milestone selection skips closed milestones, the next session has no way to read that `handoff.md`. So the closing order is **human fitness → `cleanup` → `mark milestone --closed`** — this skill runs first and leaves a record in `handoff.md`, and only then does the milestone move to archive.

## What `life/generations/` is

`life/generations/` isn't "a place that only holds open generations." **It's a working set holding generations that still have reference value for current work** — open ones, and closed ones still worth reading. An agent working a milestone references past generations, and since generations keep accumulating, having hundreds in one place means being able to reference them stops meaning anything. So an agent only needs to look at `life/generations/`, and opens `archive/generations/` only when looking for something specific. This skill manages that boundary.

## What it does

The milestone is still at `vision/milestones/<ms-id>-<slug>/` — `mark milestone --closed` is called after this skill. This skill's job is to sweep `.reap/life/generations/`, pick out generations that have lost reference value, and send them down to `.reap/archive/generations/`. **This skill doesn't move the milestone directory itself** — the `mark milestone --closed` called right after does that.

**The reason the move happens when a milestone closes is that at the moment a generation closes, whether it'll be revisited isn't known yet** — that answer only comes once the milestone finishes.

**What to move is a judgment call. The CLI only moves it** — `mark generation --archived` doesn't compute anything, it just moves.

## What to move and what to keep

**There's one question: will this generation ever be looked at again.** It's not about milestone membership. The `milestone` field in frontmatter doesn't decide whether to move it — membership and reference value are different questions.

**Don't move an open generation.** Sending a `status: open` generation to archive means the next session can't find it on the status line — it looks like the session died, and `evolve` opens a new generation on top of it. Open `.reap/life/generations/` and check `status` first.

**An old plan generation (`gen-NNNN-plan`, from before loops) moves down once that plan has actually been reflected.** A plan already reflected into a spec or planning document, where now only the outcome (the reflected spec, the completed milestone) needs to be seen, has nothing left to look at. Keep it if it's still being reflected or if the next work needs to reference that plan directly.

**An exec generation moves down once its work finished along with the milestone.** A milestone finishing means the output an exec belonging to it produced is already reflected in code, spec, or docs — there's no reason to look at the generation record again when the output can be read instead.

**A fix is judged by the same question.** It's unrelated to the milestone, but keep it if the problem it restored or the lesson it left has a reason to be referenced by current work.

**Keep anything holding a still-live decision or dead end, regardless of type.** That's why `life/generations/` exists. **When it's ambiguous, keep it** — leaving something unmoved to archive is cheaper than moving it wrongly.

**But "when ambiguous, keep it" is a rule for when judgment actually diverges, not license to invent reasons to keep something.** That hole has actually been punched through — closing `ms-003`, one generation's lessons, rules, and observations were all graduated into `lessons.md` and the spec, **and the original was still kept "because it's still under observation."** Only when a human asked "why is that one still here when everything's done" did it become clear the grounds couldn't survive scrutiny.

**So if keeping it is the decision, ask one more question: can the situation that would reopen this be stated concretely?** "Might need it later" or "still under observation" isn't a situation. If a sentence can't be written saying **which session, doing what, would come to open this file**, that's not ambiguous — it's a move.

**A graduated item's original isn't a reason to keep it, it's a reason to move it.** It means what was worth taking has already been carried upward.

## Sweep idea by the same question too

The three kinds of `idea/` (research, freememo, files) are working sets too. The question is the same — **will this ever be looked at again.** Move a research item down once its graduation criteria are met and it's gone to a plan source or backlog; keep it while still unresolved. Move a freememo down once the work it pointed at is done. Move a files item down once it's been adopted into `environment/resources/` or dropped. Since the status line reports the count, **not moving them means the count grows forever.**

## Sweep backlog by the same question too

**`life/backlog/` is a working set too.** The norm that `life/` holds "what still has reference value" rather than "what's open" isn't only about generations. But backlog has had no mechanism managing that boundary for a long time, so **once used, it just piled up forever.**

The question is the same as for generations: **will this item ever be looked at again.**

**`status: consumed` is only a default candidate, not the judgment.** Status and location are different questions. Even a consumed item can still have reading value in **what it asked and how the answer got overturned** — that's actually happened (`bk-15780b` asked about a trigger, the answer flipped to "the criterion was wrong", and that story stayed at the top of the body).

**Don't move an `open` item.** It's still work to do, and sending it to archive means the next session can't see it.

**"We decided not to do this" is consumption too.** There's no separate status value for it — it's the same in that the item's question is finished, and the body holds why it was decided against.

```bash
reap mark backlog <bk-id> --archived
reap mark idea <idea-id> --archived      # to archive/idea/<kind>/. status stays as is
```

**Don't touch `status`.** Same as generations — archive is a location, not a status.

## Move them

```bash
reap mark generation <gen-id> --archived
```

**Don't touch `status`.** Archive is a location, not a status, so a generation that's already `closed` stays `closed` after moving. Other records that reference it by id keep finding it after the move — a reference is an id, not a path.

## Record it

Leave the list of moved generations and backlog items in `handoff.md` — what was moved, and if anything that looked like it still had reference value was kept, why (uncertain judgment, still open, etc.).

## Use the tool when there is one

If the `reap` binary is present, `mark generation|backlog --archived` does the moving. Without it, move the files by hand and leave frontmatter untouched.
