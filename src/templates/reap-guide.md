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
| `genome/evolution.md` | ~300 lines | AI behaviour rules. Ships at ~193 lines and a maturing project adds its own; past 300 the rules are usually duplicated or carry descriptive content that belongs in environment/ |
| `genome/application.md` | ~250 lines | Project identity and architecture — scales with the project |
| `vision/memory/longterm.md` | ~50 lines | Design lessons only. Past this, pruning was skipped |
| `vision/memory/midterm.md` | ~70 lines | Live tracks only. Past this, completed tracks were not removed |
| `vision/memory/shortterm.md` | ~60 lines | The last 1~2 generations of handoff |
| `environment/summary.md` | ~250 lines | Current state, not a per-generation changelog |

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
- `reap update` — Update project structure to match current REAP version (v0.15 migrate, v0.16 sync). When the project's `lastMigratedVersion` lags behind the installed package, pending per-version migration notes are surfaced in `context.pendingMigrations` (see § Migration Instruction Layer).
- `reap update --mark-migrated` — Mark this project as having applied all pending migration notes up to the current package version (gen-071 migration layer).
- `reap dump-state [--stdout] [--silent]` — Dump dynamic REAP context to `.reap/.session-state.md` (used by OpenCode plugin; useful for any external tool that needs current generation state)
- `reap daemon status|stop|index|query` — Inspect or control the local code-intelligence daemon (see § Code Intelligence below)

## Code Intelligence (Daemon)

REAP can use a local code-intelligence daemon (`@c-d-cc/reap-daemon`) that runs on `localhost:17224`. It maintains a Tree-sitter–backed symbol graph (functions, classes, types, calls, imports) persisted to SQLite, supports incremental updates, and exposes a small HTTP API for symbol search, caller/callee lookup, and change-impact analysis.

### It is a separate package — install it

`reap` does not depend on the daemon and installing reap does not bring it along. It carries a native SQLite build and a set of Tree-sitter grammars, which every user would otherwise pay for to get a feature that is off by default.

```bash
npm i -g @c-d-cc/reap-daemon
```

Until v0.17.5 the daemon was declared as a `file:` dependency that never shipped, so `daemon: true` produced a dangling link and did nothing at all — quietly, because every call site treats a missing daemon as one that is merely down. If you enabled the daemon before that and never saw it work, this is why.

### Opt-in

With the package installed, enable it in `.reap/config.yml`:

```yaml
daemon: true
```

When opted in, REAP lifecycle commands (`start`, `learning`, `implementation complete`, `completion commit`) automatically register the project and trigger indexing. When omitted or `false`, daemon-related CLI behaviour is a no-op — byte-identical to projects that have never enabled it.

### Installed, but REAP cannot find it

REAP looks for the daemon from its own location, and the daemon is deliberately not one of reap's dependencies — that is what keeps a native SQLite build and fifteen Tree-sitter grammars out of every install. The two therefore find each other only when they share a resolution root. Installing both globally with the same package manager arranges that; a global reap with a project-local daemon, two different prefixes, or a Node version switch that moves the global prefix does not.

Tell REAP where it is:

```yaml
# .reap/config.yml
daemon: true
daemonBin: /usr/local/lib/node_modules/@c-d-cc/reap-daemon/dist/index.js
```

Or for a single command or a CI job, `REAP_DAEMON_BIN=/path/to/dist/index.js`, which takes priority over the config.

`reap daemon status` reports `bin` and `binSource` (`env`, `config`, `package`, or `checkout`), so you can confirm REAP is reading the setting rather than assuming it. That is what REAP *would* start: a daemon already running is reused whatever it came from, so `runningVersion` and `installedVersion` are shown side by side for the same reason.

A relative path is resolved against the project root and a leading `~` is expanded, so `daemonBin: ./node_modules/@c-d-cc/reap-daemon/dist/index.js` works as written. A path that holds nothing is reported by name — but it does not stop the search, because `config.yml` is committed and a location that is right on one machine may be absent on the next.

### When it is enabled but unusable

`daemon: true` with no daemon installed — or one older than this REAP requires — is a mismatch between configuration and environment, not a passing outage, so REAP says so rather than failing silently. **The lifecycle is never blocked**: indexing still fails quietly and every command runs as before. What changes is that asking gets an answer:

- `reap daemon status` distinguishes *not installed*, *too old*, and *not running*, and prints the command to run. It also shows the running version beside the installed one — the daemon stays resident for 30 idle minutes, so an upgrade does not replace the process answering requests.
- `reap fix --check` reports the mismatch as a warning.
- The agent prompt drops the query protocol and says to use ordinary file search instead, so the agent does not spend every stage curling a dead port.

REAP names the version it needs in those messages; this guide deliberately does not repeat the number, so there is nothing here to fall out of date.

### Auto-trigger points

| Lifecycle moment | What runs |
|---|---|
| `reap run start` (generation created) | `ensureRegistered` + full `triggerIndexing` |
| `reap run learning` (work phase) | `ensureRegistered` + `triggerIndexing` (keeps graph fresh before exploration) |
| `reap run implementation` (complete phase) | `triggerIndexing` (so validation/evaluator see the just-written code) |
| `reap run completion` (commit phase, post-archive) | `triggerIndexing` (graph reflects the committed state for the next generation) |

All four call sites silent-fail when the daemon process is unreachable. The CLI lifecycle is never blocked by a daemon problem.

### Querying the daemon

Always verify the daemon is alive before querying — otherwise skip silently:

```bash
curl -sf http://127.0.0.1:17224/health || echo "daemon down"
```

Look up the current project's ID (set `CWD` to your project path):

```bash
PROJECT_ID=$(curl -s http://127.0.0.1:17224/projects \
  | jq -r --arg p "$CWD" '.data[] | select(.path==$p) | .id')
```

Common queries:

```bash
# Symbol search by name (function, class, type, etc.)
curl -s "http://127.0.0.1:17224/projects/$PROJECT_ID/symbols?q=consumeBacklog"

# Callers of a specific symbol
curl -s "http://127.0.0.1:17224/projects/$PROJECT_ID/symbols/<symbol-id>/callers"

# Callees of a specific symbol
curl -s "http://127.0.0.1:17224/projects/$PROJECT_ID/symbols/<symbol-id>/callees"

# Impact (blast radius) of a file change
curl -s "http://127.0.0.1:17224/projects/$PROJECT_ID/impact?file=src/core/lifecycle.ts"

# Project status — includes lastIndexedAt and lastIndexedCommit (gen-068)
curl -s "http://127.0.0.1:17224/projects/$PROJECT_ID/status"
```

### Index staleness

`/projects/:id/status` returns `lastIndexedCommit` — the `git rev-parse HEAD` at the moment of the most recent successful indexing. To check whether the index is stale before a query:

```bash
INDEXED=$(curl -s "http://127.0.0.1:17224/projects/$PROJECT_ID/status" | jq -r '.data.lastIndexedCommit // "none"')
HEAD=$(git rev-parse HEAD)
[ "$INDEXED" = "$HEAD" ] && echo "fresh" || echo "stale — trigger reindex"
```

If stale, you can request a re-index with `curl -X POST "http://127.0.0.1:17224/projects/$PROJECT_ID/index"`. The lifecycle auto-triggers above usually keep the index fresh; manual re-index is only needed for between-stage tweaks or out-of-band edits.

### When to use daemon vs filesystem search

- **Daemon-first**: symbol definition lookup, caller/callee traversal, multi-file impact analysis.
- **Filesystem-first (Grep/Glob)**: literal string search, comment search, files with no parser support, daemon down.
- The two are complementary — symbol-graph queries return file:line positions you can `Read` immediately.

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
