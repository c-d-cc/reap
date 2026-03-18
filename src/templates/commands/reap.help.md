---
description: "REAP Help — Contextual help based on current state"
---

# Help

**ARGUMENTS**: $ARGUMENTS

## IMPORTANT: File Access Rules
- ONLY read files under `.reap/` or REAP command files in the SAME directory as this command file.
- Do NOT access global node_modules or external paths.
- If a file read fails, skip it silently. Do NOT guess file paths.

## Steps

### 1. Check for Topic Argument
- If ARGUMENTS is provided (not empty), skip to Step 4 (Topic Help) immediately
- If ARGUMENTS is empty, proceed with Steps 2-3

### 2. Show REAP Introduction + Contextual Guidance

First, always show this introduction:

> **REAP** (Recursive Evolutionary Autonomous Pipeline) — AI와 사람이 협업하여 소프트웨어를 세대(Generation) 단위로 진화시키는 개발 파이프라인.
> 각 세대는 5단계 lifecycle을 거칩니다: Objective → Planning → Implementation → Validation → Completion.
> Genome(.reap/genome/)에 프로젝트의 설계 원칙과 규칙을 기록하고, 세대를 거듭하며 점진적으로 진화합니다.

Then read `.reap/life/current.yml` and `.reap/config.yml`:

**If no active Generation:**
- "No active Generation. `/reap.start`로 시작하거나, `/reap.evolve`로 자율 실행하세요."

**If active Generation exists:**
- Show: generation ID, goal, stage
- Show: "다음 액션 → `/reap.[stage]` 또는 `/reap.next`"

### 3. Command Reference

| Command | Description |
|---------|-------------|
| `/reap.start` | 새 Generation을 시작하고 goal을 설정 |
| `/reap.evolve` | ⚡ 전체 lifecycle을 자율적으로 실행 (사람 개입 최소화) |
| `/reap.objective` | 이번 Generation의 목표, 요구사항, 완료 기준을 정의 |
| `/reap.planning` | 태스크를 분해하고 구현 계획을 수립 |
| `/reap.implementation` | 계획에 따라 코드를 구현하고 진행 상황을 기록 |
| `/reap.validation` | 테스트 실행, 완료 기준 충족 여부를 검증 |
| `/reap.completion` | 회고, Genome 변경 반영, Generation 마무리 |
| `/reap.next` | 다음 stage로 전진 (completion → archiving + commit) |
| `/reap.back` | 이전 stage로 회귀 (regression 사유 기록) |
| `/reap.status` | 프로젝트 상태, Generation 진행도, backlog, Genome 건강도 표시 |
| `/reap.sync` | 현재 소스코드와 Genome 간 차이를 분석하고 동기화 |
| `/reap.update` | REAP 최신 버전 확인 및 업그레이드 (npm + 커맨드 동기화) |
| `/reap.help` | 상황별 도움말 표시. `/reap.help {topic}`으로 주제별 상세 설명 |

Then show: "Tip: `/reap.help {topic}` for detailed help. Topics: workflow, lifecycle, genome, backlog, strict, agents, hooks, config, evolve, regression, minor-fix, compression, author"

Then show config info from `.reap/config.yml`: Strict (on/off), Auto-Update (on/off), Language

### 4. Topic Help

If ARGUMENTS contains a topic, look up the topic from the list below and provide its explanation.

**STRICT RULE: If the topic is NOT in the list below, respond with: "Unknown topic: '{topic}'. Run `/reap.help` to see available topics." Do NOT infer or make up explanations for unknown topics.**

**How to research:** For command-name topics, read `reap.{name}.md` from the same directory as this help file. Do NOT access global node_modules or external paths.

#### Supported Topics

- **workflow** — The 5-stage lifecycle: objective → planning → implementation → validation → completion. Each stage has a gate (precondition), steps, and produces an artifact (01~05-*.md). Stages advance via `/reap.next` and regress via `/reap.back`.
- **lifecycle** — Same as workflow. Alias.
- **genome** — Project DNA stored in `.reap/genome/`: `principles.md` (architecture decisions), `conventions.md` (dev rules), `constraints.md` (tech constraints), `domain/*.md` (business rules). Immutability principle: current generation cannot modify genome directly — changes go to backlog and are applied at completion.
- **backlog** — Items in `.reap/life/backlog/`. Three types: `genome-change` (genome fixes), `environment-change` (external changes), `task` (deferred work). Status: `pending` (unprocessed) or `consumed` (processed, with `consumedBy: gen-XXX`). Consumed items archive to lineage; pending items carry forward.
- **strict** — When `strict: true` in `.reap/config.yml`: no active generation = code modification blocked; non-implementation stage = code modification blocked; implementation stage = scoped to plan only. Escape hatch: user says "override" or "bypass strict".
- **agents** — Multi-agent support via AgentAdapter abstraction. Auto-detects installed agents (Claude Code, OpenCode). Override in `config.yml` with `agents: [claude-code, opencode]`. Each agent has its own commands dir, hook registration, and settings.
- **hooks** — REAP lifecycle hooks in `config.yml`: `onGenerationStart`, `onStageTransition`, `onGenerationComplete`, `onRegression`. Two types: `command` (shell) and `prompt` (AI instruction). Also: SessionStart hook for injecting REAP context into each AI session.
- **config** — `.reap/config.yml` fields: `version`, `project`, `entryMode` (greenfield/migration/adoption), `strict`, `language`, `agents`, `autoUpdate`, `hooks`. Project-level configuration. `autoUpdate: true` enables automatic REAP version check and upgrade on every session start.
- **evolve** — Autonomous execution mode (`/reap.evolve`). Runs the full lifecycle without pausing for human confirmation. Best for small, clear-scope tasks. The AI handles objective, planning, implementation, validation, and completion sequentially.
- **regression** — Micro loop: any stage can regress to a previous stage via `/reap.back`. Reason is recorded in timeline + target artifact gets a `## Regression` section. Artifacts before target are preserved, target is overwritten (implementation appends), after target preserved until re-entry.
- **minor-fix** — Trivial fixes (typos, lint errors) done in-place without stage transition. Criterion: resolvable within 5 minutes without design changes. Recorded in current artifact.
- **compression** — Lineage compression triggers when total exceeds 10,000 lines + 5 generations. Level 1: generation folder → single .md (40 lines). Level 2: 5 Level 1 entries → epoch .md (60 lines). Runs during `/reap.next` archiving.
- **author** — REAP is created by HyeonIL Choi (At C to D). Email: hichoi@c-d.cc / Homepage: https://reap.cc / GitHub: https://github.com/c-d-cc/reap
- **start** / **objective** / **planning** / **implementation** / **validation** / **completion** / **next** / **back** / **sync** / **status** / **update** / **help** — Read `reap.{name}.md` from the same directory as this file, then explain the command based on its contents.
