---
name: handoff
description: Use when a work session is ending and the next one should be able to pick up - writing, replacing, or clearing this session's section of .reap/life/handoff.md. Trigger on "handoff", "인계", "세션 종료", "여기까지", "다음 세션이 이어받게", or when a person says they're stopping for now in a repo containing .reap/.
---

# handoff — leaves the next session a place to start

## What this owns

`.reap/life/handoff.md` is **one file for the whole project**, with a section per session. This skill owns **the procedure**: when to write one, what goes in it, and when to delete one.

**The norm is not here.** Why the handoff sits outside the milestone, how sections are keyed, and why deleting is what consuming means all live in `03-storage.md` of the plan source. Read it if the procedure below looks arbitrary.

## Called two ways

**A person calls it** when they're stopping — that's the case this skill exists for. A session that never opened a generation, or one that's ending before `complete` runs, has no other way to leave anything behind.

**[complete](../complete/SKILL.md) calls it** after closing a generation, but **only once it has decided to stop.** While items remain it keeps going and writes nothing.

Either way the procedure is the same, and it starts with a question that is allowed to end it.

## First: is a handoff warranted

**Ask: would the next session be stuck without this?**

- **No → write nothing.** This is the common case, and it is a real answer, not a skipped step. Finished work is in the commits and the generation records; the status line already names the open milestone, the open generation and any open flux. Copying those into the handoff buries whatever is genuinely unresolved
- **Yes → write your section**, below

Say which one you chose. A person who asked for a handoff and got silence can't tell whether it was judged unnecessary or forgotten.

## Then: clear what you owe

**Delete a section you picked up from.** If this session continued work that another section described, that section is spent — remove it. **Deleting is what consuming means.** Marking it "done" leaves a judgment for the next reader and turns the file into a log.

Delete only what you actually took over. **Never delete another session's open work** — if you're unsure whether a section is still live, leave it.

**Delete your own stale section** when you have nothing to hand off. An empty file is the correct state, and it is what tells the next session that nothing is waiting.

## Writing the section

Replace your own; never append a second one.

```markdown
## <session key> · <generation id, if there is one> · <time, ISO seconds>

- How far things have gotten
- Where to look first next
- What's pending — unresolved questions, things waiting on a human's answer
```

**The session key comes from the status line** (`This session: sess-…`) — don't invent one. If the status line isn't in this session, `reap ctx` prints it.

**Name a generation only if one exists.** A session that never opened one writes the time alone.

**Don't put in what might be needed.** That belongs to `idea/freememo/`. Once that distinction breaks down the handoff becomes a file nobody reads.

**Don't restate what the status line already says.** "ms-022 is the focus milestone" is not a handoff; "ms-022's last 10 pages are waiting on a human's review, and the reviewer should start from /docs/claim-barrier" is.

## If a generation is still open

The status line reports it, so the next session will see it either way. What it can't see is what you were in the middle of.

- **Closing is cleaner** — hand over to [complete](../complete/SKILL.md), which runs the commit rule and then comes back here
- **Leaving it open is allowed.** Then say in your section what the generation was mid-way through and whether anything is uncommitted. `doctor` will report a long-open generation as a note, which is the intended signal, not a failure

**Don't close a generation just to write a handoff.** The commit rule exists for a reason and this skill doesn't own it.

## Reading it back

[evolve](../evolve/SKILL.md) is what reads this file at the start of a session, and it reads **every** section, not just its own — the work being picked up may have been left by a different session.
