# Evolution

## Language
Source code is in English. AI responds in user's configured language (config.yml `language` field).

## Clarity-driven Interaction

AI adjusts communication depth based on the current context's clarity level.

| Clarity | State | AI Behavior |
|---------|-------|-------------|
| High | Goal clear, backlog specific | Confirm briefly, then execute. Minimize questions. |
| Medium | Direction exists, details unclear | Present options + tradeoffs |
| Low | Goal ambiguous, next steps unknown | Active interaction — questions, examples, suggestions |

### Clarity Indicators
- vision/goals.md has specific, actionable goals → high
- Backlog has clear tasks → high
- Genome is unstable (embryo, frequent changes) → low
- Short lineage, direction not established → low

## Genome Management Principles

- **Embryo**: Genome can be modified directly. Be intentional about timing — establish early in the generation, then work on top of it.
- **Normal**: Genome is immutable. Changes go to backlog → applied at adapt phase → effective from next generation.
- **Lessons discovered mid-generation go into the completion artifact**. Genome modifications happen at adapt phase. Changing genome mid-generation undermines the foundation of prior work in that generation.

## Code Quality Principles

Before writing new code, always read existing code first to understand established patterns.

- **Pattern-first**: Identify how existing code with the same role is structured. New code must follow that pattern.
- **Consistency over preference**: Codebase consistency takes priority over personal preference. If a better pattern exists, refactor all instances — don't introduce a second pattern alongside the first.
- **No duplication**: The same logic must not exist in two places. Extract and share when duplication is found.
- **Verify before commit**: Before committing, verify new code matches existing patterns and contains no duplication.
- **Enforced conventions in application.md**: Deliberate design decisions that cannot be derived from code alone (especially when violations exist in the codebase) should be recorded in application.md. When stated, application.md conventions take precedence over the current state of the code.

## Testing Principles

### Mandatory Rules
- **New feature = test required**: Every new feature must have corresponding test code. A feature without tests is not complete.
- **Modified feature = update existing tests**: When modifying existing logic, find and update related tests to match the new behavior, then re-run.
- **Fresh execution only**: Never reuse previous test results. Always run tests fresh.

### Test Level Guidelines
- **Unit test**: Verify input/output of isolated functions/modules. Best for pure logic without external dependencies.
- **E2E test**: CLI command → JSON output verification. Confirms full flow works correctly.
- **Scenario test**: Reproduce real usage scenarios in a sandbox environment. Tests multi-command combinations, state transitions, error recovery.

### Test Level Selection
| Change Type | Required Test |
|------------|--------------|
| Core function add/modify | unit test |
| CLI command add/modify | e2e test |
| Lifecycle flow change | e2e + scenario test |
| Init/genome/environment structure change | scenario test (sandbox) |
| Prompt-only change | e2e if functional impact, skip if cosmetic |

### Test Feedback Loop
- Record environment issues or insights discovered during testing in the completion artifact, and reflect in genome if needed.
- If test failures stem from environment differences (OS, Node version, etc.), record in environment.

## Echo Chamber Prevention

- AI autonomous additions are only allowed within the direct cause/impact scope of the current goal
- "Nice to have" items go to backlog for human review
- Tag autonomous additions with `[autonomous]`

## No Workarounds — Root Cause Tracking

When encountering a problem, never work around it and move on. Always track the root cause and create a fix plan.

- **Fixable now**: Fix within the current generation
- **Not fixable now**: Analyze root cause + create backlog (include reproduction conditions, root cause, fix direction)
- **Never do**: Manually bypass an error and move on without mention

Decision rule: "If this problem occurs again, would I have to repeat the same workaround?" → If yes, a root cause fix is required.

## Repeated Omissions Need a Check, Not a Longer Instruction

When the same step is missed twice or more, **writing a more detailed instruction is a method that has already failed.**

Decision rule: **"Does a person have to remember this step every time?"** → If yes, build a check.

- The check must be **executable** (script / test / CI step). A checklist document is not a check.
- Wire it into a path that **cannot be bypassed** (release workflow, phase transition, commit hook).
- Add the check to the instruction, and **record why the instruction alone was insufficient** — otherwise the next person reverts to "let's write it out in more detail".

### When building a check — make it fail first

If you write a check and immediately see it pass, you do not know whether it catches anything. "The check works" and "the check is inert" look identical.

- Run it against the **broken** state first and confirm the failure. That failure is the evidence the check is real.
- Do the same per assertion — break a known-good value, confirm the failure, restore it (negative test).
- **Record what the check cannot see, alongside its results.** Passing means "no problem within the check's scope". Without a stated limit, the next person trusts it further than it goes.

## Architecture Change = Genome Sync

When adding new features/structures or changing architecture, if the change affects how the AI should behave, it MUST be reflected in the genome (evolution.md or application.md).

Decision rule: "If a new agent in the next session doesn't know about this change, can it still work correctly?" → If no, genome update is required.

## Vision

Vision consists of Goals, Memory, and Design.

### Goals (`vision/goals.md`)
Long-term project objectives. During the adapt phase, gap analysis against goals determines the next generation's direction.

Goals cleanup: goals.md is a space for **future** objectives, not an archive of past achievements. When completed items (`[x]`) accumulate and the document loses focus as a forward-looking plan, propose specific items for removal to the human for approval. This is a contextual judgment — recently completed items may still have reference value, while long-stable items can be cleared. Always get human confirmation before removing.

### Design (`vision/design/`)
Space for project design documents. Distinction from Memory:
- **Design** — Documents with a specific scope (architecture designs, feature specs, etc.). Managed as independent documents.
- **Memory** — General-purpose context records (lessons, progress, handoff). Single file per tier.

Decision rule: "Is this content worth documenting as an independent topic?" → Yes = Design, No = Memory.

### Memory (`vision/memory/`)
Free-form space for the AI to record project-related knowledge. The 3-tier structure is classified by **what the content is for** (content-type), NOT by how long it will live (lifespan). Lifespan requires predicting the future, which the AI can't do reliably — that judgment burden leads to misclassification and bloat.

| File | Role | 1-line decision rule |
|------|------|----------------------|
| `shortterm.md` | **Session handoff** — immediate context for the next session | "Is this needed right now?" |
| `midterm.md` | **Ongoing tracks** — multi-generation work in progress | "Is this an incomplete large track?" |
| `longterm.md` | **Design lessons** — recurring lessons worth re-reading | "Does this lesson prevent the next generation from making the same mistake?" |

Memory rules:
- Freely readable/writable at any time — no constraints like genome
- Cross-tier promotion/demotion is encouraged: a shortterm note that grows into a track moves to midterm; a completed track leaves only its lesson in longterm
- **Bloat is a failure signal**: if longterm exceeds ~30~50 lines or midterm exceeds ~50~70 lines, pruning was skipped. Clean up in the next reflect.
- **Empty is normal**: any memory file may be empty — that is a valid state

### Memory Classification Decision Tree (mandatory for AI)

When you have something to write to memory, apply top-to-bottom:

```
1. Is this needed in the next session immediately?
   → Yes: shortterm.md

2. Is this an ongoing, incomplete track or plan?
   → Yes: midterm.md

3. Is this a finished design lesson worth preserving?
   → Yes: longterm.md

4. Is this finished with no special lesson?
   → Do NOT record (lineage and git history preserve it)
```

**Important**: Do not stash "might-be-useful" notes in longterm. If it disappears, it's still in lineage and git history.

### Memory Update Criteria

**Shortterm** — session handoff (update every generation — mandatory):
- Write: summary of this generation, context to hand off, undecided matters, current backlog state
- **Prune: delete previous handoff items that are already acted on, and REPLACE (overwrite) with this generation's handoff. No accumulation.**
- Result: shortterm.md stays within the last 1~2 generations of content

**Midterm** — ongoing tracks (update when a track's state changes):
- Write: flow of large ongoing tasks, multi-generation plans, directions agreed with the user
- **Prune: when a track completes, promote its key decisions to longterm and DELETE the section from midterm. Decision rule: "Does this track have a next step?" — No → delete.**
- Result: midterm.md stays within tracks that are alive right now

**Longterm** — design lessons (update only when a lesson emerges):
- Write: design lessons worth repeating, background behind architecture decisions
- **Prune (periodic — every ~10 generations, or whenever bloat is detected in reflect): if a section is already documented in genome, it is a duplicate → delete. If early transition context is no longer a behavioral guide → delete. Decision rule: "Without this lesson, would the next agent make the same mistake?" — No → delete.**
- Result: longterm.md stays within lessons that still drive behavior today

**Do NOT write**:
- Code change details (environment handles this)
- Test numbers, run logs (artifact handles this)
- Principles already in genome (no duplication)
- Generation-specific debug logs (lineage preserves them)

## Environment Refresh at Completion

Incrementally update environment/summary.md during reflect phase:
- Based on files changed in implementation, update only affected environment sections
- Not a full rewrite — reflect only what changed (file additions/deletions, dependency changes, build changes)
- Primary update targets: Tech Stack, Source Structure, Tests sections

**Remove superseded content — updating is not append-only**:
- Delete statements that are no longer true (removed files/modules, abandoned decisions, stale dependency notes)
- **Do NOT accumulate per-generation changelog entries.** summary.md describes the CURRENT state, not the history of how it got there — lineage and git history own the history
- If a section has become a list of "what changed in gen-NNN" entries, collapse it into a single present-tense description

## Genome vs Environment Boundary

- **genome (application.md)**: prescriptive — "how things should be" (principles, design decisions, conventions, rules). Genome is immutable in normal mode, so do not put frequently changing factual information here.
- **environment (summary.md)**: descriptive — "how things currently are" (tech stack, source structure, build, tests, dependencies). When code changes, only environment is updated.
- Decision rule: "If this information changes, does the genome need updating?" → Yes = genome, No = environment.
