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

Memory is a free-form recording system under `.reap/vision/memory/` where AI can persist context across sessions and generations. Unlike Genome (which has modification constraints) or Lineage (which gets compressed), Memory is always accessible and freely writable.

### 3-Tier Structure

| Tier | File | Lifespan | Purpose |
|------|------|----------|---------|
| **Longterm** | `longterm.md` | Project lifetime | Lessons that bear repeating, recurring patterns, decision rationale, architecture choice reasons |
| **Midterm** | `midterm.md` | Multiple generations | Ongoing large task context, multi-generation plans, progress tracking |
| **Shortterm** | `shortterm.md` | 1-2 sessions | Next session handoff, immediate context to pass forward, unfinished discussions |

### Rules

- **Free access**: Read and write at any time — no permission needed, no phase restriction
- **AI discretion**: Content and timing are the AI's judgment. No mandatory updates
- **Tier fitness**: Place content in the tier matching its expected lifespan. Promote/demote between tiers as relevance changes
- **Keep concise**: Memory should be scannable, not exhaustive. Prefer bullet points over paragraphs
- **Empty is normal**: Memory files may be empty — this is a valid state
- **Git-committed**: Memory is committed with the project, accessible to any AI agent

### When to Update

- **Reflect phase**: Natural moment to update memory (prompted but not forced)
- **Any time**: Memory can be updated during any stage if useful context arises
- **Shortterm cleanup**: Clear shortterm items that have been acted on

### Update Criteria

**Shortterm** (update every generation — mandatory):
- Summary of what was done in this generation
- Context to hand off to the next session
- Undecided matters, ongoing discussions
- Current backlog state snapshot

**Midterm** (update when context changes):
- Flow of large ongoing tasks
- Multi-generation plans
- Directions agreed with the user

**Longterm** (update only when lessons emerge):
- Design lessons worth repeating
- Background behind architecture decisions
- Lessons from project transitions

**Do NOT write**:
- Code change details (environment handles this)
- Test numbers (artifact handles this)
- Principles already in genome (no duplication)

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
├── vision/                    # Long-term goals and direction
│   ├── goals.md               #   North star objectives
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
- `reap make hook --event <event> --name <name> [--type md|sh] [--condition <condition>] [--order <order>]` — Create hook file with correct naming and frontmatter
- `reap cruise <count>` — Set cruise mode (pre-approve N generations for autonomous execution)
- `reap update` — Update project structure to match current REAP version (v0.15 migrate, v0.16 sync)
- `reap dump-state [--stdout] [--silent]` — Dump dynamic REAP context to `.reap/.session-state.md` (used by OpenCode plugin; useful for any external tool that needs current generation state)

## AI Client Support

REAP supports multiple AI clients via the `agentClient` field in `.reap/config.yml`:

| Client | Static knowledge | Dynamic state | Slash commands |
|---|---|---|---|
| `claude-code` | `@` references in `CLAUDE.md` (auto-imported by Claude Code) | `SessionStart` hook → `reap load-context` (injects into context) | `~/.claude/commands/reap.*.md` (installed by `reap install-skills`) |
| `opencode` | `instructions` field in `opencode.json` (auto-loaded by OpenCode) | `.reap/.session-state.md` auto-loaded via same `instructions`; refreshed by the REAP OpenCode plugin (`.opencode/plugins/reap-plugin.ts`) on `session.created` / `tool.execute.before` | `~/.config/opencode/commands/reap.*.md` (installed by `reap install-skills`) |
| `codex` | (not yet supported) | (not yet supported) | (not yet supported) |

Switching clients is a config edit: change `agentClient` in `.reap/config.yml`, then run `reap install-skills` and `reap update`. Each lifecycle command also writes `.reap/.session-state.md` synchronously on exit, so OpenCode users always see the latest REAP state on the next session. The `reap.` prefix in the slash commands directory is reserved by REAP — installs are cleanup-then-copy, so any `reap.*.md` file in that location will be overwritten on the next `install-skills` run.

For OpenCode users, see `AGENTS.md` (auto-generated by `reap update`) for the project-level entry-point. `~/.reap/reap-guide.md` (installed by `reap install-skills`) is referenced from `AGENTS.md` and remains the canonical REAP usage guide.

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
