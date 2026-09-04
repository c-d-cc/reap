---
name: carve-milestone
description: Use when turning plan into an executable milestone in a REAP project, or when closing one - deciding the boundary, exit criteria, and out-of-scope, writing tasks, and running the fitness / cleanup / mark closing sequence. Trigger on "milestone 자르기", "증분을 자른다", "milestone 만들기", "milestone 닫기", or when a loop is about to produce a milestone in a repo containing .reap/.
---

# carve-milestone — carves plan into executable units

## When to call it

**Inside a loop**, when reading a plan source (a roadmap or design document) and carving it into an executable milestone. Once carved, that loop can close — closing is [loop](../loop/SKILL.md)'s job. And **when closing a milestone** — the exit procedure belongs to this skill too.

**When not to call it matters more.**

- **If a single backlog item is enough, don't carve one.** The item already holds the boundary, so making a milestone **writes the boundary in two places, and two places drift.** The criterion for picking grounds is in [evolve](../evolve/SKILL.md)
- **If what to build hasn't been settled yet, don't carve one.** Carving splits an already-settled plan into executable units — it isn't planning itself. If the boundary, exit criteria, or out-of-scope diverge, call [interview](../interview/SKILL.md) first — how to ask lives there

## First: check what's being carved against real traces

**What's written in the plan is imagination before it's tried, and what's actually been tried beats it.**

Before carving a square of the roadmap, **check whether what it assumed is still true.** Checking is usually one command — counting a file's size, seeing how many times it's used, grepping whether related documents agree with each other.

Skipping this **builds tooling for something nobody uses.** It nearly happened: an increment was writing that a skill should manage some document, and that document had been **0 bytes** for two milestones and 21 generations. Nobody had counted a fact one `wc -l` would have shown.

If the assumption is wrong, **stop carving and refill that square instead.** That's also the loop's job. The new content comes not from imagination but from **friction actually hit.**

## Size — around four tasks, six to ten generations

At the end of three milestones the human gave the same answer: **keep it around this size.** The measured counts were ten, nine, and six generations, with four to five tasks.

**The numbers are a benchmark, not a rule.** A milestone that changed a single rule finished in three generations, and that was right too. Still, **a large deviation reads as a signal** — eight tasks means something splittable into two got bundled into one.

**The lower bound isn't a signal, it's a rule. Work that finishes in a single generation isn't a milestone.** One generation is enough for a single backlog item, and making a milestone writes the boundary in two places. **Answer "how many generations is this" before carving** — if the answer is one, make an item with `reap make backlog` and open with the `--backlog` grounds.

This rule exists because **making this very skill broke it.** A milestone was carved for something that would finish in one generation, and that milestone's one task was "build this skill." It surfaced only when a human pointed it out, and the numbering had to be pulled back to correct it (`sequence/milestone.md`). **The rule was broken while applying the size criterion itself, so leaving it as a mere signal means breaking it again.**

**One task targets about one generation's worth of work.** A task spanning multiple generations leaves the task file with no record of how far it got when a session is cut off.

## What to write

The vocabulary is in the milestone section of the [record vocabulary](../shared/references/record-vocabulary.md). **It's a vocabulary, not a template.** Below is what actually had value carving four of these.

**Exit Criteria — write it as a state a human can judge.** "The tests pass" · "this command exists" · "this sentence no longer appears anywhere" are judgeable. "The code is clean" · "it works well" are not. **Don't invent quantitative metrics** — REAP has none, and a human's judgment stands in for that spot.

**Out of Scope — matters as much as what's inside.** A boundary isn't defined by its inside alone. Write especially **why something adjacent isn't being done.** Writing this down means the answer already exists when "should we do this too" comes up mid-work.

**Background — why now.** Write which part of the plan it came from, and **what came out of checking the assumptions.** If it diverges from the plan, what changed needs to be recorded here.

**Plan Items — one line each. Detail goes in `tasks/`.** It's a plan, not a contract. **If there's a reason for the order, write the reason** — like "A comes before B because the principle A settles determines how B is laid out."

**Constraints — only what applies to this milestone.** Project-wide rules belong to `genome/`, not copied here. What actually had value: "this time a human does it directly", "each task moves code and repo together".

**Open Questions — what wasn't settled at carving time.** Write down which task is expected to answer it too. Leave it unwritten and it closes without an answer.

## Write the fitness questions when carving, ahead of time

**Write them after the fact and only regrets from the end get asked.** Writing them at carving time settles what's being tested first, and that re-verifies the milestone's purpose once more.

Put three or four under a `## What to ask when this milestone closes` section. **They have to be questions about whether what changed this time actually got better** — not "did it go well" but "what changed".

## Carve it

```bash
reap make milestone --title "<title>" [--slug <slug>] [--from <loop-id>] [--ref <ps-id>:<path>] [--focus]
```

`--from` is the loop that produced this, `--ref` is the plan document it's grounded on. **Neither is checked** — right now they're notes a human reads, so writing them accurately is on this side.

**Give `--focus` only to "should this be worked on right now".** Without it, the milestone doesn't show up on the status line right after carving. The tool doesn't attach it automatically because **carving several at once would have the last one steal focus** — four were actually carved at once once, and what came next was the first one.

**If several were carved, give it only to the one to start now.** Give it to none and an open milestone stays invisible on the status line, so the next session doesn't know it exists.

Then write the `milestone.md` body and `tasks/<n>-<slug>.md`. **`tasks/` holds interfaces, pitfalls, and the completion judgment** — mapping out what to touch ahead of time in a table means the generation executing it doesn't have to explore again.

## Retire what's carved from the plan

Leaving it in the roadmap **puts the same thing in two places.** Delete the carved square, and if the content diverged from the plan, **note why it diverged in the plan's preamble** — that's what the next reader of the plan needs.

## Close a milestone

**Don't close it yourself.** When the exit criteria look met, tell the human so and **ask fitness with the questions written at carving time.** With no quantitative metrics, a human's natural-language evaluation is the only fitness signal there is.

There's a fixed order.

1. **Get the fitness answer and record it in `milestone.md`.** Write not just the answer but **how it was read** — a deferred answer ("still don't know") has to be asked again by the next milestone, so **move it to `idea/research/`** (`make idea --kind research`). That's exactly the place that keeps it from being searched for again without a conclusion — write down what would let it graduate, too
2. **Call [cleanup](../cleanup/SKILL.md).** `mark milestone --closed` moves the whole milestone directory, so if the order is reversed the next session can't find what `cleanup` left behind
3. **`reap mark milestone <ms-id> --closed`**

Before closing, **check that everything this milestone settled has been reflected.** What isn't reflected goes down to archive along with `handoff.md`, and becomes undecided.
