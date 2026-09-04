---
name: interview
description: Use whenever intent is ambiguous in a REAP project and a human must decide - before opening a generation, inside a loop, when carving a milestone, when approaches diverge. Owns how to ask - one question at a time, 2-4 options plus free input, recommendation only with grounds, a visible end. Other skills point here and never copy the rules. Trigger on "모호하다", "물어봐", "interview", "정해달라", or when another skill says to interview first, in a repo containing .reap/.
---

# interview — removes ambiguity

**How to ask has exactly one owner, and it's here.** `evolve`, `loop`, `carve-milestone`, `init` only point to *"if it's ambiguous, interview"* — they never copy this discipline. The norm lives in the `interview` section of `06-agent.md`; this is that norm turned into procedure.

## First: filter out what doesn't need asking

**Cutting the number of questions that go to a human is half of what this skill does.** Before asking, check three things.

1. **Can code or docs answer it.** Whether a file exists, how many times it's used, whether tests pass — a fact settled by one command doesn't get asked. Once confirmed, present *"checked X, assuming Y"* as a **confirm-shaped** statement. A discovery-shaped one (*"is there an X?"*) offloads the exploration onto the human
2. **Has it already been answered.** Check three places — the spec (what's decided is reflected wherever it governs), the *pending* section of an open milestone's `handoff.md`, and **the `Dialogue` of an open or recent loop.** Asking the same thing twice tells the human their earlier answer wasn't read
3. **Is it the human's to decide.** The four things `genome/evolution.md` pins down — the moment for deciding what to do, the answer when it's ambiguous, fitness at milestone close, and `invariants.md`. Everything else that goes to a human is only things code can't answer — preference, priority, business judgment

What's left after filtering is the question list. **Finish the list before asking** — asking while still discovering breaks rule 6 below (the end has to be visible).

## The form of asking

1. **One at a time.** Bundled, only the first gets answered and the rest get skipped. Independent questions can share one message, but each still has to be one question
2. **2 to 4 options plus free input.** Past five, comparing itself becomes a burden. Free input is always open — options aid thinking, they don't cage it
3. **One line per option on "what happens if you pick this".** A name alone doesn't support comparison. Write the cost
4. **A recommendation only with grounds, at the top, with one line of grounds.** Grounds have to come from code, genome, or an existing decision. **Don't attach a recommendation to a question about preference or priority** — that's the human's to decide, and a recommendation makes that decision for them
5. **"I don't know" isn't a dead end.** Adopt the recommendation, record that fact, and move on. Don't ask again
6. **The end has to be visible.** Show how many questions remain. A question with no visible end drives the human away

**Use the client's question tool if there is one. If not, numbered plain text.** The form has to be the same either way — options, cost, recommendation, remaining count.

## Discipline while in progress

| Discipline | What it prevents |
|---|---|
| Look at existing structure and recent commits before asking | Discovery-shaped questions |
| Track the ambiguity ledger in parallel | One sub-topic crowding out the rest. Revisit every few rounds |
| Three self-answered rounds in a row means the next one must go to the human | The agent concluding alone |
| Restate a free-form answer structured and get it confirmed | Misreading an answer that carries scope, constraints, or a decision |
| Present 2-3 approaches with their costs | Getting stuck on the first idea |
| YAGNI | Removing unneeded features from every option |
| Compress to one sentence right before ending and get explicit approval | Ending without approval |

**The recommendation trap.** If every question carries a recommendation, the human just clicks the recommendation and the ambiguity stays. **An output filled entirely with recommendations is a sign interview didn't work.**

## Where the answer goes

**The answer goes to wherever it governs** — spec, `genome/`, `map.md`, milestone body. Leaving it only in a record means it's undecided.

**The divergence point itself goes in the record.** Inside a loop, into that loop's `Dialogue`; inside a generation, into the generation record's `Open Questions`, where it's closed. What goes there is *what diverged, what the options were, what the human picked, and whether it was an adopted recommendation or a different answer*. Without this, the next session either asks the same thing again or reads what the human picked as something the agent decided.

## Exit conditions

**The agent doesn't end this by deciding on its own that "enough has been asked."** It doesn't end unless the below hold.

1. Is the problem statement in **observable form** — repro conditions or grounds
2. Is there a **completion criterion**
3. Is **out of scope** stated
4. Are unresolved decisions **recorded as open items**
5. Is the next generation **ready to start as-is**

If the user says "stop", end immediately. But **don't drop unresolved ambiguity** — leave it in the record's `Open Questions`, or in `idea/research/`. Ending quietly means the guessing starts again.

## What's been experienced

What's actually happened in this repo is the grounds for this discipline.

- **Should have asked, didn't** — one milestone's wrongly drawn boundary only surfaced when a human asked *"why are we making this milestone"*
- **Nearly asked something that didn't need asking** — the spec already had the answer. Rule 2 (has it already been answered) is that spot
- **An answer given before trying got overturned on first use** — *"a closed loop goes straight to archive"* was picked, and the moment the first loop closed, it couldn't be found. That's what happens when an option's cost is written without the real thing. **Whatever can be confirmed with the real thing gets built and shown before asking someone to choose**
- **A human answered outside the options** — A/B were offered, and the third path (splitting the cycle itself) was the answer. That's why free input always has to stay open
