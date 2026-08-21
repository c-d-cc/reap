# REAP Guide

## What is REAP

REAP (Recursive Evolutionary Autonomous Pipeline) is a development pipeline where AI and humans collaborate to incrementally evolve an Application across successive Generations.

## REAP Architecture

REAP consists of four interconnected layers:

- **Vision** — Long-term goals and direction stored in `.reap/vision/`. Vision is the primary driver of each Generation — it determines what goal to pursue next. During the adapt phase, the AI analyzes gaps between vision and current state to suggest the next generation's goal. Vision also includes Memory — a 3-tier free-form recording system for AI to persist context across sessions.
- **Knowledge** — The project's accumulated understanding, split into two layers. Genome (`.reap/genome/`) is prescriptive — architecture decisions, conventions, and constraints that define how the project should be built. Environment (`.reap/environment/`) is descriptive — current tech stack, source structure, build configuration, and test setup. Knowledge serves as the basis for each Generation's work.
- **Generation** — A single evolution cycle driven by Vision and grounded in Knowledge. Each Generation follows a structured lifecycle (Learning → Planning → Implementation → Validation → Completion), evolves Civilization, and feeds lessons back into Knowledge. Artifacts are archived in Lineage.
- **Civilization** — The source code and all project artifacts outside `.reap/`. This is what Generations evolve. After each Generation completes, lessons from the code feed back into Knowledge (environment updates, genome adaptations).

## Principles

- **Genome Immutability**: The genome is never modified during a normal generation. Issues are logged in the backlog and applied at completion's adapt phase. (Embryo generations allow free genome modification.)
- **Environment Immutability**: The environment is never modified directly during a generation. Changes are recorded in the backlog and applied at completion's reflect phase.
- **Human Judges Fitness**: No quantitative metrics. The human's natural language feedback is the only fitness signal.
- **Self-fitness Prohibited**: The AI never scores its own success. Only self-assessment (metacognition) is allowed.

## Memory

Memory is a free-form recording system under `.reap/vision/memory/` where AI can persist project context across sessions and generations. Unlike Genome (which has modification constraints) or Lineage (which gets compressed), Memory is always accessible and freely writable.

<!-- reap:carrier(memory-tier-classification) -->
### 3-Tier Structure — content-type based

Tiers are classified by **what the content is for** (content-type), NOT by how long it will live (lifespan). Lifespan requires predicting the future, which the AI can't reliably do — that judgment burden has historically led to misclassification and bloat.

| File | Role | 1-line decision rule |
|------|------|----------------------|
| `shortterm.md` | **Session handoff** — immediate context to pass to the next session | "Is this needed right now?" |
| `midterm.md` | **Ongoing tracks** — multi-generation work in progress | "Is this an incomplete large track?" |
| `longterm.md` | **Design lessons** — recurring lessons worth re-reading | "Does this lesson prevent the next generation from making the same mistake?" |

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
   → Do NOT record (memory keeps no junk; lineage/git history preserves it)
```

**Important**: Do not stash "might-be-useful" notes in longterm. If it disappears, it's still in lineage and git history.

### Memory Pruning Policy — mandatory in reflect phase

During `reap run completion --phase reflect`, the AI **must** perform cleanup:

**Shortterm — every generation, mandatory**:
- Delete previous handoff items that are "already acted on"
- **Replace** (overwrite) with the new generation's handoff. No accumulation.
- Result: shortterm.md stays within "last 1~2 generations of content".

**Midterm — at track completion**:
- When a track completes, **promote** its key decisions to longterm and **delete** the section from midterm
- Decision rule: "Does this track have a next step?" — No → delete
- Result: midterm.md stays within "tracks that are alive right now".

**Longterm — periodic (every ~10 generations or when bloat is detected in reflect)**:
- If a section is already documented in genome (application.md / evolution.md), it's a **duplicate → delete**
- If early project transition context (e.g., v0.X → v0.Y differences) is no longer a behavioral guide → **delete**
- Decision rule: "Without this lesson, would the next agent make the same mistake?" — No → delete
- Result: longterm.md stays within "lessons that still drive behavior today".

### Do NOT write to memory

- Code change details (`environment/summary.md` handles this)
- Test numbers, run logs (artifact handles this)
- Principles already stated in genome (no duplication)
- Generation-specific debug logs (lineage preserves them; don't crowd memory)

### Memory Usage — freedom with responsibility

- **Free access**: Read and write at any time — no permission needed
- **Cross-tier promotion/demotion is encouraged**: a shortterm note that evolves into a track moves to midterm; a midterm track that completes leaves only its lesson in longterm
- **Architecture changes must propagate**: when adding new features/structure, update evolution.md / application.md / memory together
- **Bloat is a failure signal**: if longterm exceeds ~30~50 lines or midterm exceeds ~50~70 lines, pruning was skipped. Clean up in the next reflect.
- **Empty is normal**: any memory file may be empty — that is a valid state

## Verifying a Release

Two checks answer different questions, and the second cannot be inferred from the first.

| | Question | Cost | When |
|---|---|---|---|
| `scripts/check-self-diagnosis.sh` | Do the files land in the right places with the right contents? | free, seconds | CI on every push + before publish |
| `scripts/check-agent-integration.sh` | Does the client actually surface them to the agent? | ~$0.25, tens of seconds | before tagging a release |

The first installs the real tarball into a throwaway HOME and asks REAP to diagnose itself — a fresh install reporting anything about itself means the installer and the checker disagree.

The second drives a headless agent against your current installation and judges by what appears on disk, never by what the agent said. Files can be perfectly placed and still never reach the user: an adapter once passed every file-level test while its slash commands stayed invisible, and only a person trying it noticed.

It reads your installation rather than a throwaway one, because a client keeps its login beside its commands — isolating one discards the other. Run `reap install-skills` first so it sees your current sources.

<!-- reap:carrier(agent-integration-gate-verdicts) -->
It answers three ways, not two. Alongside pass and fail there is an amber skip, for when the client refused the `reap run` command /reap.start issues, stopping the agent before it ever reached REAP — the check measured nothing, and saying so is not the same as saying REAP is broken. It reported one such run as a missing slash command once, and $0.26 of the release's $0.53 went on a defect that was not there. A missing generation now names every cause that produces it rather than picking one.

What a pass establishes is narrower than it used to claim, and the two halves do not rest on the same thing. That the CLI works is proved by the generation itself. That the client surfaced the slash command is not — a slash command wraps the CLI, so an agent that could not find it and ran `reap run start` by hand leaves an identical file behind, which is what happened the first time this check was built. That half rests on the agent obeying an instruction not to bypass. And neither half says CLAUDE.md's `@` imports loaded or the SessionStart hook fired: `/reap.start` needs neither to succeed.

## Carrier Markers

Some facts are known in more than one place — an install path known by both the installer and the checker, a rule stated in the guide, the genome template, a phase prompt and five locale files. When one of them changes and the others do not, the tool starts contradicting itself. That is what issues #21 and #22 were.

Files that know such a fact say so:

```ts
// reap:carrier(claude-code-commands-path)
export function claudeCodeCommandsDir(home = homedir()): string { ... }
```

```markdown
<!-- reap:carrier(memory-tier-classification) -->
```

Before changing a shared fact, find everywhere that knows it:

```bash
grep -rn "reap:carrier(claude-code-commands-path)" .
bash scripts/list-carriers.sh            # every ID and where it lives
bash scripts/list-carriers.sh --orphans  # IDs recorded in one file only
```

The marker sits next to the value, so whoever edits the value sees it. A list kept elsewhere only helps the person who remembers to go read it — REAP kept such a list and #22 still slipped through it, because every entry was a document and #22 was code disagreeing with code.

**Prefer sharing over marking.** If two pieces of code need the same *value*, give it one owner and inject or import it — then there is nothing to keep in sync. Markers are for what cannot be shared: prose, translations, prompt strings, the set of values a function can return.

An orphan (an ID in exactly one file) means either the marker is unnecessary, or the other places that know the fact were never marked. The second is the state #21 and #22 were in.

## File Size Guidelines

`reap fix --check` warns when a knowledge file grows past the size below. Each value comes from what the file is for, not from a uniform rule:

| File | Guideline | Why |
|---|---|---|
| `genome/invariants.md` | ~50 lines | Absolute constraints, human-edit only. Past this it has become a rulebook — that belongs in evolution.md |
| `genome/evolution.md` | ~300 lines | AI behaviour rules. Ships at ~230 lines and a maturing project adds its own; past 300 the rules are usually duplicated or carry descriptive content that belongs in environment/ |
| `genome/application.md` | ~250 lines | Project identity and architecture — scales with the project |
| `vision/memory/longterm.md` | ~50 lines | Design lessons only. Past this, pruning was skipped |
| `vision/memory/midterm.md` | ~70 lines | Live tracks only. Past this, completed tracks were not removed |
| `vision/memory/shortterm.md` | ~60 lines | The last 1~2 generations of handoff |
| `environment/summary.md` | ~250 lines | Current state, not a per-generation changelog |
| the **main** `vision/milestones/*.md` | ~80 lines | A boundary and a generation list. Past this it is a design document — that belongs in `vision/design/`. Only the main one is measured; a completed milestone is a record |

**These are warnings, never automatic edits.** All of these files are user-authored; `reap fix` will not rewrite or truncate them. Resolve memory and environment bloat through the mandatory pruning step in `completion --phase reflect`, and genome bloat by moving misplaced content to where it belongs — do not hand-delete to silence a warning.

## .reap/ Structure

```
.reap/
├── config.yml                 # Project configuration (language, agentClient, etc.)
├── genome/                    # Prescriptive knowledge (how to build)
│   ├── application.md         #   Project identity, architecture, conventions
│   ├── evolution.md           #   AI behavior guide, interaction principles, code quality rules
│   └── invariants.md          #   Absolute constraints (human-only modification)
├── environment/               # Descriptive knowledge (what exists now)
│   ├── summary.md             #   Always loaded — tech stack, source structure, build, tests
│   ├── domain/                #   Domain knowledge (on-demand)
│   ├── resources/             #   External reference documents — API docs, SDK specs (on-demand)
│   ├── docs/                  #   Project reference documents — design docs, specs (on-demand)
│   └── source-map.md          #   Code structure + dependencies (on-demand)
├── sequence/                  # Identity registry — one file per kind, append-only
│   └── <type>.md              #   id | title | createdAt. A number is never reused
├── vision/                    # Long-term goals and direction
│   ├── goals.md               #   North star objectives
│   ├── milestones/            #   Plans between a goal and its generations (opt-in)
│   │   └── <slug>.md          #     Exit criteria, out of scope, planned generations
│   ├── design/                #   Design documents for future features
│   └── memory/                #   AI memory (3-tier free-form recording)
│       ├── longterm.md        #     Project lifetime — lasting lessons, patterns, decision rationale
│       ├── midterm.md         #     Multi-generation — ongoing work context, multi-gen plans
│       └── shortterm.md       #     1-2 sessions — next session handoff, immediate context
├── life/                      # Current generation's life cycle
│   ├── current.yml            #   Active generation state (REAP managed, never edit manually)
│   ├── 01-learning.md ~ 05-completion.md  # Stage artifacts
│   └── backlog/               #   Items to carry forward
├── lineage/                   # Archive of completed generations (2-level compression)
└── hooks/                     # Lifecycle event handlers (.md prompts, .sh scripts)
    └── conditions/            # Condition scripts for conditional hook execution
```

## Life Cycle (A Single Generation's Lifespan)

```
Learning → Planning → Implementation ⟷ Validation → Completion
```

| Stage              | Description                    | What it does                                                                                    | Artifact               |
| ------------------ | ------------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------- |
| **Learning**       | Exploration + context building | Explore code, genome, environment, lineage. Assess clarity level. Build context for the goal    | `01-learning.md`       |
| **Planning**       | Plan formulation               | Task decomposition, dependencies, implementation approach, test strategy                        | `02-planning.md`       |
| **Implementation** | Code implementation            | AI+Human collaboration to write code. Record genome defects in backlog when found               | `03-implementation.md` |
| **Validation**     | Verification                   | Run tests, check completion criteria. Can regress to Implementation on failure                  | `04-validation.md`     |
| **Completion**     | Finalization                   | Retrospective (reflect) + human feedback (fitness) + genome review (adapt) + archiving (commit) | `05-completion.md`     |

## Key Concepts

### Generation

A single generation. Carries one goal through the Life Cycle. State is tracked in `life/current.yml`.

**Generation types**:

- `embryo` — Early-stage project. Genome modifications are freely allowed during any stage.
- `normal` — Stable project. Genome is immutable during the generation.
- `merge` — Distributed merge lifecycle (detect → mate → merge → reconcile → validation → completion).

**Generation ID format**: `gen-{NNN}-{hash}` (e.g. `gen-042-a3f8c2`)

### Identity and references

Anything one item may point at carries a **REAP-assigned id**, in one of two families:

| | Kinds | Form | Registry |
|---|---|---|---|
| **Numbered** | goal · milestone · design | `goal-004` | `.reap/sequence/<type>.md` |
| **Hashed** | backlog · idea · memory | `bklog-a3f8c2` | none |

Which family a kind belongs to is a question about **how long its items are cited**. A goal is named
for years. A backlog is consumed and removed; an idea in `freememo/` is written to be thrown away or
promoted; a memory entry is pruned every reflect. Nothing names those afterwards, so spending a
permanent number on one would leave the registry growing a dead row per item. Uniqueness comes from
the hash instead, and there is nothing to keep in sync.

A prefix belongs to exactly one family, which is what keeps `goal-123456` and `mem-123456` from both
parsing two ways — six digits are also six hex characters.

The hash is random, not derived from the title: an id derived from wording changes when the wording
does, which is the thing ids exist to escape.

A generation is outside both — it already has `gen-097-e3ae8e`, and `lineage/` is its registry.

**References cite the id, never the title.** A title changes: a project that records the completing
generation in a goal's wording rewrites it as a matter of routine, and a title reference breaks
every time that happens.

```yaml
# vision/milestones/v018-….md
id: ms-001
goal: goal-004        # not the wording
```

**A reference is recorded where the item is, not in a separate index.** A backlog names its cause in
its own frontmatter:

```yaml
id: bklog-a3f8c2
from: gen-098-99c09a
```

**`from` is one id: the thing that most directly caused this item.** Usually a generation — the one
that ran into the problem — but never only that. A design document whose conclusion produced the
work, a goal, a milestone, a backlog that split in two: any of them can be the cause, and the kind
is read off the prefix.

It is not a list of what the item relates to. Naming the surrounding context alongside the cause
makes the field mean "related to", and a field that means that answers nothing.

`reap make backlog --from <id>` refuses anything that is not an id, so a typo cannot become a link
that points nowhere. What `fix --check` resolves afterwards is only what has an authoritative source
right now: goal ids against `goals.md`, milestone ids against the milestone files. A generation may
have been compressed out of lineage, and `ds-`/`idea-`/`mem-` are reserved but not yet assigned, so
demanding those resolve would report REAP working as intended.

**The registry is `.reap/sequence/<type>.md`, one file per kind, and it is append-only.**

```markdown
<!-- reap:sequence(goal) — append only. A number handed out is never handed out again. -->
| id | title | createdAt |
|---|---|---|
| goal-004 | Make the distribution look like one tool | 2026-08-21 |
```

Deleting an item leaves its row behind, and that is the point: the number stays spoken for, so an
old reference to it can never come to mean something else. There is no counter field — the highest
row *is* the counter.

It is a committed markdown table rather than a database because it has to **merge**. Two branches
that both add items produce a conflict a person can read and resolve; a binary file produces one
nobody can.

- `reap make goal --title "<t>" --section "<s>"` — the one path where REAP writes into
  `vision/goals.md`. It appends a line and touches nothing else.
- `reap make milestone` / `reap make backlog` — assign an id and record it.
- `reap sequence [type|id]` — read the registry. `reap sequence ds-007` answers "what is that?",
  which is what keeps an opaque reference legible. A hashed id has no row; it says so and points at
  `life/backlog/` or `lineage/`, where the item itself carries it.

**Ids add a check rather than removing one.** Two branches each appending a row at the end of the
same registry file produce no git conflict — both lines land, and two items answer to one id.
`reap fix --check` reports that, plus items with no id and references to ids that are not there. For
the hashed family there is no registry to disagree with, so what it checks instead is that each item
has an id of the right shape and that no two live items share one — which happens when a file is
copied.
All three are warnings: these files are user-authored, and `reap fix` will not rewrite them.

### Milestone

The planning unit between a vision goal and the generations that realise it. **Several generations run inside one milestone**, and it is opt-in — goal → generation directly is enough for many projects.

A milestone lives at `vision/milestones/<slug>.md` and needs three things before it can do anything:

| Part | Where | Why |
|---|---|---|
| owning goal | `goal:` frontmatter | must name an item or section in `vision/goals.md` |
| `## Exit Criteria` | body | what makes it over. **Verifiable facts, not quantitative metrics** — the human makes the final call |
| `## Out of Scope` | body | a boundary is not defined by its inside alone |

`## Generations` holds the planned generations as a checklist. It is a plan, not a contract: add, split and drop entries as the work turns out.

**Main is the focus, not a restriction.** Exactly one milestone carries `main: true`, and `reap milestone main <slug>` moves it — refusing any milestone whose boundary is unfilled, whose goal matches nothing in `goals.md`, or that is already completed. But goal candidates come from **every valid open milestone**, main first. Pulling an item forward from a later plan is ordinary; name it with `reap run start --phase create --milestone <slug>`.

**Where it shows up.** Once a milestone exists you see it in three places, and each replaces a guess with a plan:

- **Every session** — the dynamic context carries the milestone this generation serves (or main, when it serves none), with its boundary and remaining work.
- **`reap run start --phase scan`** — remaining generations become the goal candidates, main first.
- **`completion --phase adapt`** — the "Next Generation Candidates" block comes from the milestone instead of keyword overlap between goal and backlog titles.

**Closing is the human's call.** In reflect, the agent checks off what this generation finished and, if the exit criteria now read as met, says so and proposes `reap milestone close <slug>`. It never closes one itself. A closed milestone stays in `vision/milestones/` as `status: completed` — the record of why the goal could be checked — and stops offering candidates.

**Milestone vs. midterm memory.** Whatever belongs to the plan — what happens in what order, what is out of scope, how much is left — lives in the milestone file. Midterm keeps only the ongoing context a plan does not hold: deferred judgments, agreed directions, tracks with no milestone yet. Never both.

### Backlog

Items to be carried forward are stored in `.reap/life/backlog/`. Each item uses markdown + frontmatter format:

- `type: genome-change` — Applied to genome during completion adapt phase
- `type: environment-change` — Applied to environment during completion reflect phase
- `type: task` — Referenced as goal candidates in the next generation

Each item carries a `status` field:

- `status: pending` — Not yet processed (default)
- `status: consumed` — Processed in the current generation (requires `consumedBy: gen-XXX-{hash}`)

**Create backlog items using CLI only**: `reap make backlog --type <type> --title <title> [--body <body>] [--priority <priority>]`. Never create backlog files directly — `reap make backlog` injects the required `status: pending` frontmatter field. Files created via Write tool (no `status:` field) will be silently skipped by archive in older REAP versions; gen-065 fixes this with explicit warning + auto-append, but `reap make backlog` remains the only supported creation path.

### Starting a Generation — Backlog Selection (Issue #18)

`reap run start --phase create --goal "<goal>"` requires an explicit decision about pending backlog when pending items exist:

- `--backlog <filename>` — Consume the named backlog as the source of this generation. The file's frontmatter is marked `status: consumed` + `consumedBy: <gen-id>`.
- `--no-backlog` — Explicitly declare that no pending backlog is relevant to this goal. Proceeds without consuming any.
- (neither flag, pending exists) → REAP returns `status: "prompt"` with the pending list and stops without creating a generation. The AI must review the list against the goal and re-call with one of the two flags. This is **idempotent** — re-calling with a flag advances; the prompt never loops.
- (neither flag, no pending) → Proceeds silently (backward-compatible).

**AI behavior**: When you receive the `select-backlog` prompt, read each pending item title against the current goal. If any item directly supports the goal, choose `--backlog <filename>` (must match `b.filename` exactly). If none is relevant, choose `--no-backlog`. Do not ask the human a second time once the judgment is clear — the human's goal was already explicit.

### Task Deferral

Tasks that depend on genome changes cannot be completed in the current generation. Mark as `[deferred]` and add to backlog as `type: task`. Partial completion is normal.

### Termination Paths — abort / early-close / completion

Generation은 세 가지 방식으로 종료된다. 사용자가 "그만", "중단", "포기", "취소", "스코프 줄이고 싶어"(영: stop, abort, give up, reduce scope, cancel) 같은 의도를 표명하면, agent는 **자동으로 다음 세 선택지를 제시하고 사용자가 선택하게 한다**.

| 항목 | abort | early-close | completion |
|---|---|---|---|
| 의미 | 실패/취소 | 부분 완성 종료 | 정상 완료 |
| artifacts | 삭제 | lineage에 보존 | lineage에 보존 |
| consumed backlog | pending으로 복귀 | consumed 유지 | consumed 유지 |
| lineage 기록 | X | `status: partial` | `status: completed` |
| reflect | X | 사용자 interactive | 자동 + 사용자 |
| fitness | X | **skip** | O |
| adapt | X | **skip** | O |
| git commit | X | `[early-close]` 표기 | 정상 표기 |
| 다음 generation hint | (없음) | deferred backlog 안내 | gap-driven 제안 |
| 사용 가능 단계 | 모든 stage | implementation, validation | validation 자연 흐름 |

**Agent behavior — 중단 의도 표명 시 절차**:

1. 사용자 의도 확인: "정말 중단하시려는 건가요, scope를 줄이려는 건가요?"
2. 세 선택지 제시:
   - **abort**: 이번 generation 자체를 취소 (실패 처리, 부분 진행은 선택적으로 backlog 저장 가능). `/reap.abort`.
   - **early-close**: 지금까지 한 만큼만 lineage에 반영하고 다음 세대로 (부분 가치 보존). `/reap.early-close --reason "<r>"`.
   - **continue completion**: 끝까지 가서 정식 완료.
3. 사용자가 선택하면 그에 맞는 CLI를 실행.

**early-close 사용 시 reflect는 사용자 interactive로 진행한다**. 자동 판단 금지 — agent가 다음을 사용자에게 묻고 응답 기반으로 정리:
- 어디까지 진행됐는가? (completed tasks)
- 무엇이 가치 있었는가? (value preserved)
- 무엇이 남았는가? (deferred — backlog 본문 보강)
- 왜 닫는가? (close reason)

**early-close 후 다음 generation `reap run start` 시** scan phase가 직전 lineage entry의 `status: partial`을 감지하면 prompt에 deferred backlog hint를 자동 노출한다. 사용자가 그 deferred backlog를 source backlog로 선택하면 자연스럽게 이어진다.

### Stage Regression (Micro Loop)

Any stage can regress to a previous stage using `reap run back`. Artifact handling:

- **Before target stage**: Preserved
- **Target stage**: Overwritten (implementation only appends)
- **After target stage**: Preserved, overwritten upon re-entry

### Minor Fix

Trivial issues (typos, lint errors, etc.) are fixed directly in the current stage without a stage transition. Judgment criterion: resolvable within 5 minutes without design changes.

### Lineage Compression

As generations accumulate, lineage grows. Auto-compression triggers when thresholds are met:

- **Level 1**: Generation folder → single .md. Only goal + result + notable items preserved.
- **Level 2**: Multiple Level 1 entries → epoch .md. Only key flow preserved.

### Maturity System

Project maturity affects AI behavior:

| Level     | Type            | AI Tone                                     |
| --------- | --------------- | ------------------------------------------- |
| Bootstrap | embryo          | Collaborator — 60% questions, 40% proposals |
| Growth    | normal          | Driver — 30% questions, 70% proposals       |
| Cruise    | normal + cruise | Autonomous — 10% questions, 90% proposals   |

Embryo → Normal transition is proposed during adapt phase and requires human approval.

## REAP Hooks

Hooks are defined as individual files in `.reap/hooks/` with the naming convention `{event}.{name}.{md|sh}`:

```
.reap/hooks/
├── onLifeCompleted.reap-update.sh
├── onLifeCompleted.docs-update.md
├── onLifeImplemented.lint-check.sh
└── onMergeMated.notify.md
```

### File Types

- `.md` — AI prompt: read and follow the instructions
- `.sh` — Shell script: run in project root directory

### Metadata

- `condition` — Condition script name (default: `always`). Scripts live in `.reap/hooks/conditions/`
- `order` — Execution order (default: 50, lower runs first)

For `.md` files, metadata is in YAML frontmatter. For `.sh` files, in comment headers.

### Events

Normal: `onLifeStarted`, `onLifeLearned`, `onLifePlanned`, `onLifeImplemented`, `onLifeValidated`, `onLifeCompleted`, `onLifeTransited`
Merge: `onMergeStarted`, `onMergeDetected`, `onMergeMated`, `onMergeMerged`, `onMergeReconciled`, `onMergeValidated`, `onMergeCompleted`, `onMergeTransited`

### Conditions

Conditions are executable scripts in `.reap/hooks/conditions/`. Exit code 0 = condition met, non-zero = skip. If no condition is specified, the hook always runs (default: `always`).

Default conditions (installed by `reap init`):
- `always` — Always true
- `has-code-changes` — True if the last commit changed `src/`
- `version-bumped` — True if `package.json` version differs from the last git tag

### Creating Hooks

**Always use the CLI to create hooks**: `reap make hook --event <event> --name <name> [--type md|sh] [--condition <condition>] [--order <order>]`. Never create hook files directly — the CLI ensures correct filename convention and frontmatter format.

After creating a hook, fill in the TODO placeholder with your hook logic (for `.sh`) or prompt (for `.md`).

## Slash Commands

All REAP interactions go through `/reap.*` slash commands. These are the primary interface for both users and AI agents.

### Lifecycle Commands
- `/reap.evolve` — Run an entire generation lifecycle (recommended for most work)
- `/reap.start` — Start a new generation
- `/reap.next` — Advance to the next stage
- `/reap.back [--reason "<reason>"]` — Return to a previous stage
- `/reap.abort [--phase execute] [--reason "<reason>"] [--source-action <rollback|stash|hold|none>] [--save-backlog]` — Abort current generation (2-phase: confirm → execute)
- `/reap.early-close [--phase execute] [--reason "<reason>"] [--source-action <hold|stash|none>] [--defer-tasks <true|false>]` — Close current generation as a partial save. Lightweight: skips fitness/adapt, preserves artifacts to lineage, auto-defers unchecked tasks to a new backlog. Only callable in implementation/validation stages.

### Knowledge Commands
- `/reap.knowledge [reload|genome|environment]` — Manage genome, environment, and context knowledge. No argument shows options.
- `/reap.init [project-name] [--mode <greenfield|adoption>]` — Initialize REAP in a project (auto-detects greenfield vs existing codebase)
- `/reap.config` — View/edit project configuration

### Collaboration Commands
- `/reap.merge [--type merge --parents "<branchA>,<branchB>"]` — Merge lifecycle for parallel branches
- `/reap.pull` — Fetch remote changes and detect merge opportunities
- `/reap.push` — Validate state and push to remote

### Info Commands
- `/reap.status` — Check current generation state
- `/reap.help` — Show available commands and topics
- `/reap.run` — Execute a lifecycle command directly


## CLI Commands (no slash command equivalent)
- `reap make backlog --type <type> --title <title> [--body <body>] [--priority <priority>]` — Create backlog item (type: genome-change, environment-change, task)
- `reap make goal --title <title> --section <section>` — Add a vision goal and assign its id (appends to `vision/goals.md`; never edits an existing line)
- `reap make backlog --type <type> --title <title> [--from <id>]` — Create a backlog item. `--from` names the one thing that most directly caused it
- `reap make milestone --title <title> --goal <goal id>` — Create a milestone (template; fill in Exit Criteria / Out of Scope / Generations before it can be used)
- `reap sequence [type|id]` — Read the identity registry. With an id, answers what it names
- `reap milestone [list|main <slug>|close <slug>]` — List milestones, move the focus, or mark one completed. `main` refuses a milestone with an unfilled boundary, a goal that matches nothing in `goals.md`, or one already completed
- `reap make hook --event <event> --name <name> [--type md|sh] [--condition <condition>] [--order <order>]` — Create hook file with correct naming and frontmatter
- `reap cruise <count>` — Set cruise mode (pre-approve N generations for autonomous execution)
- `reap update` — Update project structure to match current REAP version (v0.15 migrate, v0.16 sync). When the project's `lastMigratedVersion` lags behind the installed package, pending per-version migration notes are surfaced in `context.pendingMigrations` (see § Migration Instruction Layer).
- `reap update --mark-migrated` — Mark this project as having applied all pending migration notes up to the current package version (gen-071 migration layer).
- `reap dump-state [--stdout] [--silent]` — Dump dynamic REAP context to `.reap/.session-state.md` (used by OpenCode plugin; useful for any external tool that needs current generation state)
- `reap index [update|status|impact|search|callers|callees]` — Query the built-in code index (see § Code Intelligence below)
- `reap uninstall [--confirm]` — Remove REAP from this machine: user-level files for both clients, REAP's SessionStart entries, `~/.reap/` (allowlisted), and finally the npm packages. Two-phase — without `--confirm` it lists what would go and removes nothing.

  **npm cannot do this and neither can a package hook.** `preuninstall`/`postuninstall` were measured not to fire on npm 10 or 12 (global or local) while the same probe fired on install, so `npm uninstall -g @c-d-cc/reap` leaves every file REAP wrote to the home directory — including the SessionStart hooks, which then call a command that no longer exists on every session.

  Someone who has already removed the package has no `reap`: `npx @c-d-cc/reap uninstall --confirm` works without installing anything. `reap uninstall` is the only command that skips the `ensureUserLevelAssets` entry hook — otherwise it would install the assets moments before deleting them.

  Distinct from `reap destroy`, which is per-project (`.reap/`, the CLAUDE.md section, `.gitignore` entries) and leaves the machine untouched. `destroy`'s output points here.

## Code Intelligence

REAP ships a code index. It is built in — nothing to install, nothing to start, no process running in the background.

A Tree-sitter parser walks every tracked file, records the symbols it defines and the calls and imports between them, and stores the result in `.reap/.index/` as gzipped JSON. Fifteen languages ship with it. There is no native build: the grammars are WebAssembly.

### Commands

```bash
reap index                     # update — the default
reap index update [--full]     # bring the index level with HEAD
reap index status              # counts, import resolution rate, indexed commit
reap index impact <file>...    # what breaks if you change this file
reap index search <query>      # find a definition, with file:line
reap index callers <symbolId>  # who calls this
reap index callees <symbolId>  # what this calls
```

A `symbolId` is `<file>::<name>` — for example `src/core/lifecycle.ts::nextStage`. `reap index search` prints them.

Everything emits JSON on stdout like every other REAP command, so an agent can parse it and a human can read the `message` field.

### The unit of change is a commit

The index records the SHA it describes. Deciding what to re-parse is one `git diff`, and deciding whether to bother is one string comparison — which is why a full index of this repository takes about a third of a second and a no-op re-index takes none.

```bash
reap index update    # Indexed 412 file(s) — full, 1530 symbols at 1a2b3c4 (612ms)
reap index update    # Index is current at 1a2b3c4 (1530 symbols, 3688 edges)
```

**Queries refresh the index themselves.** If `HEAD` has moved — you committed, switched branches, rebased, pulled — the next `status`, `impact`, `search`, `callers` or `callees` brings it up to date before answering. REAP refreshes it eagerly only where it has just made a commit itself: at the end of `completion`, and in `early-close`.

**A git repository is required.** Without one there is no commit to key the index to, and `reap index` says so rather than indexing something it cannot describe.

**Uncommitted work is not in the index.** This is the trade-off that buys everything above. A symbol you wrote a minute ago and have not committed will not be found by `search`, and a file you just created will not appear in `impact`. Use Grep for those. `reap index status` always names the commit the index describes, so you can see when the gap matters.

### Read `status` before trusting `impact`

```
files:   412
symbols: 1530  (function 902, method 341, class 187, type 100)
edges:   3688  (CALLS 3145, IMPORTS 543)
imports: 543/543 resolved (100%)
commit:  1a2b3c4
```

(Illustrative figures — the numbers are whatever your repository has.) The line that matters is **`imports`**. Everything `impact` knows comes from resolved import edges, so a low rate means the graph is incomplete and an empty blast radius means *unknown*, not *none*.

Concretely: an indexer that never maps a `./x.js` specifier to the `x.ts` file producing it resolves **zero** imports in every standard TypeScript project — and every check that asks "did indexing run?" stays green while blast radius returns nothing. The rate is on screen so that cannot happen quietly.

`status` also warns when a grammar fails to load, which is the other way a language can go silently unindexed.

### The index is per project, and gitignored

It lives in `.reap/.index/` — `manifest.json` plus one gzipped graph — and both `reap init` and `reap update` add it to `.gitignore` (skipping the write when a line already names that directory). Deleting the project deletes the index with it; nothing accumulates in your home directory.

The ignore is not about size. Committing the index would mean the commit containing it has to be indexed, which does not terminate.

Deleting `.reap/.index/` is always safe: the next command rebuilds it.

### When to use it, and when not to

- **Index first**: where is this defined, who calls it, what depends on this file, what is the blast radius of this change.
- **Grep first**: literal strings, comments, config files, languages with no grammar, and anything you have not committed yet.

They are complementary — the index answers with `file:line`, which you then read.

### What it does not do

`impact` walks file-to-file imports. Two further analyses are deliberately absent — community detection and process tracing. The first was connected components under another name, so its cohesion score was the constant 1.00; the second called every function whose callers could not be resolved an entry point. Shipping either would have meant three analyses nobody could act on instead of one that works.

## Migration Instruction Layer

When REAP itself evolves (e.g. memory tier semantics change in v0.17.1), existing user projects need to reorganize their artifacts to match the new conventions. The migration instruction layer (gen-071) closes this gap.

### How it works

1. Each REAP release that requires user-side reorganization ships a `vX.Y.Z.md` note at `src/templates/migration/` (bundled to `dist/templates/migration/` on install).
2. `config.yml` carries `lastMigratedVersion: "X.Y.Z"` — the most recent REAP version this project has acknowledged.
3. On every `reap update` and on every SessionStart (`reap load-context`), REAP compares `lastMigratedVersion` against the installed package version. Any `vX.Y.Z.md` file whose version falls in the gap (`lastMigratedVersion < v <= packageVersion`) is surfaced to the agent.
4. After the agent applies the listed reorganizations, it runs `reap update --mark-migrated`. This sets `lastMigratedVersion` to the current package version and the notes stop surfacing.

### Where pending migrations appear

- `reap update` output: `context.pendingMigrations: [{ version, instructions }, ...]` + a summary line in `message`.
- SessionStart context: a `# Pending Migrations` section in the additionalContext (Claude Code hookSpecificOutput / OpenCode instructions).
- `.reap/.session-state.md` sync dump (written by lifecycle commands): same section, byte-identical.

When `lastMigratedVersion >= packageVersion`, no section is added and output is byte-identical to pre-gen-071 behavior.

### Agent behavior

When you see a `# Pending Migrations` section:

1. Read each `## vX.Y.Z` subsection in order.
2. Apply the listed actions to the project's artifacts (memory, backlog, env, etc. — never to source code unless the note explicitly says so).
3. Once **all** pending migrations are applied, run `reap update --mark-migrated`. Do not call this halfway through — it marks every gap version as done.
4. Migration is best-effort and non-blocking. If you cannot apply a step (missing file, ambiguous instruction), record the partial state in the next reflect and skip `--mark-migrated` so the note re-surfaces in the next session.

### Authoring migration notes (REAP maintainers)

- File: `src/templates/migration/vX.Y.Z.md` (must match `^v\d+\.\d+\.\d+\.md$`).
- Audience: an AI agent that has *not* yet read the new REAP version's guide. Be explicit about what to read, what to change, and how to verify.
- Scope: artifact reorganization only by default. Source-code migrations belong in a separate generation, not in a migration note.
- Build is automatic — `scripts/build.sh` copies `src/templates/` wholesale to `dist/templates/`. No additional sync step.

## AI Client Support

REAP supports multiple AI clients via the `agentClient` field in `.reap/config.yml`:

| Client | Static knowledge | Dynamic state | Slash commands |
|---|---|---|---|
| `claude-code` | `@` references in `CLAUDE.md` (auto-imported by Claude Code) | `SessionStart` hook → `reap load-context` (injects into context) | `~/.claude/commands/reap.*.md` (installed by `reap install-skills`) |
| `opencode` | `instructions` field in `opencode.json` (auto-loaded by OpenCode) | `.reap/.session-state.md` auto-loaded via same `instructions`; refreshed by the REAP OpenCode plugin (`.opencode/plugins/reap-plugin.ts`) on `session.created` / `tool.execute.before` | `~/.config/opencode/commands/reap.*.md` (installed by `reap install-skills`) |
| `codex` | (not yet supported) | (not yet supported) | (not yet supported) |

Every user-level asset above — slash commands, agent definitions, `~/.reap/reap-guide.md`, the SessionStart hook — is also placed by the CLI itself. Before dispatching any command, `reap` compares the running version against `~/.reap/.install-stamp` and reinstalls the whole set when they differ; the stamp is written only when every piece landed, so a partial install is retried rather than recorded. This is why REAP survives an npm that blocks install scripts (the default from npm 12), which would otherwise leave the binary working and the whole integration absent.

Switching clients is a config edit: change `agentClient` in `.reap/config.yml`, then run `reap install-skills` and `reap update`. Each lifecycle command also writes `.reap/.session-state.md` synchronously on exit, so OpenCode users always see the latest REAP state on the next session. The `reap.` prefix in the slash commands directory is reserved by REAP — installs are cleanup-then-copy, so any `reap.*.md` file in that location will be overwritten on the next `install-skills` run.

For OpenCode users, see `AGENTS.md` (auto-generated by `reap update`) for the project-level entry-point. `~/.reap/reap-guide.md` (installed by `reap install-skills`) is referenced from `AGENTS.md` and remains the canonical REAP usage guide.

### Evaluator agent (opt-in)

<!-- reap:carrier(opencode-config-path) -->
OpenCode's paths below are defaults. It follows the XDG base directory spec, so when `XDG_CONFIG_HOME` is set REAP installs under `$XDG_CONFIG_HOME/opencode/` instead — the client reads there, and writing to `~/.config` would leave it with nothing.

Both adapters install bundled agent definitions (`reap-evolve.md`, `reap-evaluate.md`) to the client's user-level agents directory (`~/.claude/agents/` for Claude Code, `~/.config/opencode/agent/` for OpenCode). The install runs on `reap install-skills` AND `reap update`, so user-level agents stay in sync with the bundled REAP version. Set `evaluator: true` in `.reap/config.yml` to launch `reap-evaluate` as an independent reviewer during the validation stage (advisor role — the builder owns the final verdict).

## Role Separation

| Component        | Role                                                                |
| ---------------- | ------------------------------------------------------------------- |
| **CLI (`reap`)** | Project setup and maintenance. Init, status, run                    |
| **AI Agent**     | Workflow executor. Performs each stage's work                       |
| **Human**        | Decision maker. Sets goals, reviews code, provides fitness feedback |

## Execution Flow

**Recommended**: `/reap.evolve` runs the entire generation lifecycle automatically, from start through completion. This is the default way to work with REAP.

**Manual control**: If you need to control individual stages:

- `/reap.start` — Create a new generation (prompts for goal)
- `/reap.next` — Complete current stage and advance to the next
- `/reap.back` — Regress to a previous stage

For fine-grained control, use `/reap.run` to execute specific stages and phases:

1. `/reap.run start --goal "<goal>"` — Create generation
2. `/reap.run <stage>` — Start a stage (learning, planning, implementation, validation)
3. `/reap.run <stage> --phase complete` — Complete current stage and auto-advance
4. `/reap.run completion --phase reflect` — Write retrospective + update environment
5. `/reap.run completion --phase fitness --feedback "<text>"` — Save human feedback
6. `/reap.run completion --phase adapt` — Review genome, propose next goals
7. `/reap.run completion --phase commit` — Archive to lineage

**Signature-based locking**: Each stage transition generates a cryptographic nonce token and verifies the artifact exists (>50 chars). Attempting to skip a stage or execute stages out of order will fail signature verification and produce an error. Slash commands MUST be executed in the order defined by the lifecycle.

**Artifact completeness check**: When entering the validation stage, REAP checks whether previous stage artifacts (01~03 for normal, 01~04 for merge) have been properly filled. If any artifact still contains only template placeholders, validation returns `status: "artifact-incomplete"` with instructions to fill the missing artifacts. This is the only case where modifying previous stage artifacts is allowed — fill them based on the work already performed in this generation, then re-run `reap run validation`.

## Language

All REAP artifacts and user interactions follow the user's configured language (from config.yml `language` field).

- **Artifacts** (01-learning.md through 05-completion.md): Write in the user's language
- **User interactions**: Communicate in the user's configured language
- **Backlog items**: Write in the user's language
- **Genome files**: Write in the user's configured language
- **If no language is configured**: Default to English

## Critical Rules

1. **NEVER modify `current.yml` directly.** Stage transitions MUST go through `reap run` commands. Direct modification bypasses nonce verification and breaks the lifecycle.
2. **NEVER skip a stage.** Each stage must be executed and its artifact must exist before advancing.
3. **ALL development work MUST follow the REAP lifecycle.** Do NOT bypass it unless the human explicitly asks.
4. **Genome is the authoritative source of truth.** When making decisions about architecture, conventions, or constraints, ALWAYS consult the Genome first.
5. **Keep Genome fresh.** If you notice the Genome is missing information or contains outdated information, inform the human.
6. **Do NOT create backlog items during the adapt phase.** Next generation candidates and suggestions must be written in the completion artifact text only (Next Generation Hints section). The human decides which suggestions become backlog items. Never run `reap make backlog` during adapt.
