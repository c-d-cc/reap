export const en = {
  // Nav & Sidebar
  nav: {
    getStarted: "Get Started",
    groups: {
      gettingStarted: "Getting Started",
      guide: "Guide",
      collaboration: "Collaboration",
      reference: "Reference",
      other: "Other",
    },
    items: {
      introduction: "Introduction",
      quickStart: "Quick Start",
      coreConcepts: "Core Concepts",
      genome: "Genome",
      environment: "Environment",
      lifecycle: "Lifecycle",
      lineage: "Lineage",
      backlog: "Backlog",
      hooks: "Hooks",
      advanced: "Advanced",
      collaborationOverview: "Distributed Workflow",
      mergeGeneration: "Merge Generation",
      mergeCommands: "Merge Commands",
      cliReference: "CLI Reference",
      commandReference: "Command Reference",
      hookReference: "Hook Reference",
      comparison: "Comparison",
      configuration: "Configuration",
      recoveryGeneration: "Recovery Generation",
      releaseNotes: "Release Notes",
    },
  },

  // Hero Page
  hero: {
    tagline: "Recursive Evolutionary Autonomous Pipeline",
    title: "REAP",
    description: "A development pipeline where AI and humans collaborate to evolve an Application across successive Generations. Context persists between sessions, development follows a structured lifecycle, and design docs evolve with your code.",
    getStarted: "Get Started →",
    whyReap: "Why REAP?",
    whyReapDesc: "AI agents are powerful — but without structure, development becomes chaotic. Context resets every session. Code changes scatter without purpose. Design docs drift from reality. Lessons from past work vanish.",
    problems: [
      { problem: "Context loss", solution: "SessionStart Hook injects full project context into every new session" },
      { problem: "Scattered development", solution: "Each generation focuses on one objective through a structured lifecycle" },
      { problem: "Design–code drift", solution: "Genome mutations discovered during implementation feed back via backlog" },
      { problem: "Forgotten lessons", solution: "Retrospectives accumulate in Genome. Lineage archives all generations" },
      { problem: "Collaboration chaos", solution: "Genome-first merge workflow reconciles parallel branches — design conflicts before code conflicts" },
    ],
    threeLayer: "3-Layer Model",
    threeLayerDesc: "Every REAP project consists of three conceptual layers. The Knowledge Base captures what to build and the external context. The Evolution process builds it. The Civilization is the result.",
    layers: [
      { label: "Knowledge Base", sub: "Genome + Environment", path: ".reap/genome/ + .reap/environment/", desc: "Genome (architecture, conventions, constraints, source maps) and Environment (external APIs, infrastructure, business constraints). Continuously synchronized with the codebase through each generation's lifecycle." },
      { label: "Evolution", sub: "Generational Process", path: ".reap/life/ → .reap/lineage/", desc: "Each Generation runs Objective → Planning → Implementation → Validation → Completion. On completion, archived to lineage." },
      { label: "Civilization", sub: "Source Code", path: "your codebase/", desc: "Everything outside .reap/. Grows and improves with each completed generation." },
    ],
    lifecycle: "Generation Lifecycle",
    lifecycleDesc: "Each generation progresses through five stages, from goal definition to retrospective and archiving.",
    stages: [
      ["Objective", "Define goal through structured brainstorming design", "01-objective.md"],
      ["Planning", "Break down tasks, choose approach, map dependencies", "02-planning.md"],
      ["Implementation", "Build with AI + human collaboration", "03-implementation.md"],
      ["Validation", "Run tests, verify completion criteria", "04-validation.md"],
      ["Completion", "Retrospective + apply Genome changes + auto-archive (consume + archive + commit)", "05-completion.md"],
    ],
    stageHeaders: ["Stage", "What happens", "Artifact"],
    installation: "Installation",
    installStep1: "1. Install globally",
    installStep2: "2. Initialize your project",
    installStep3: "3. Sync & run your first generation (in Claude Code)",
    installNote: [
      { before: "", code: "/reap.evolve", after: " runs the full generation lifecycle — Objective through Completion — interactively. You can also control each stage manually with " },
      { linkText: "stage commands", after: "." },
    ],
    keyConcepts: "Key Concepts",
    concepts: [
      { label: "Genome Immutability", desc: "The Genome is never modified mid-generation. Design issues discovered during Implementation are logged to the backlog as genome-change items and applied only at Completion." },
      { label: "Backlog & Deferral", desc: "Items in .reap/life/backlog/ carry a type: genome-change | environment-change | task. Partial completion is normal — deferred tasks carry forward to the next generation's Objective." },
      { label: "SessionStart Hook", desc: "Every new AI agent session automatically injects the full Genome, current generation state, and workflow rules — eliminating context loss between sessions." },
      { label: "Lineage", desc: "Completed generations are archived in .reap/lineage/. Retrospectives accumulate there. Over time they're compressed (Level 1 → gen-XXX-{hash}.md, Level 2 → epoch-XXX.md) to stay manageable." },
      { label: "Four-Axis Structure", desc: "Everything under .reap/ maps to four axes: Genome (design), Environment (external context), Life (current generation), Lineage (archive of past generations)." },
      { label: "Distributed Workflow", desc: "Multiple developers or agents work in parallel on separate branches. /reap.pull fetches and runs a genome-first merge generation. /reap.push validates state before pushing. No server needed — Git is the transport layer." },
    ],
    documentation: "Documentation",
    docLinks: [
      { href: "/docs/introduction", title: "Introduction", desc: "What is REAP, why use it, 3-layer model, four-axis structure." },
      { href: "/docs/quick-start", title: "Quick Start", desc: "Install and run your first generation step by step." },
      { href: "/docs/core-concepts", title: "Core Concepts", desc: "Genome, Life Cycle, Backlog & Deferral in depth." },
      { href: "/docs/workflow", title: "Workflow", desc: "/reap.evolve, stage commands, micro loop, hooks." },
      { href: "/docs/cli-reference", title: "CLI Reference", desc: "reap init, status, update, fix with all options." },
      { href: "/docs/command-reference", title: "Command Reference", desc: "/reap.evolve, stage commands, /reap.status — all slash commands." },
      { href: "/docs/hook-reference", title: "Hook Reference", desc: "Lifecycle hooks: command and prompt types, events, SessionStart." },
      { href: "/docs/comparison", title: "Comparison", desc: "How REAP compares to traditional spec-driven development tools." },
      { href: "/docs/advanced", title: "Advanced", desc: "Signature-based locking, lineage compression, presets, entry modes." },
    ],
  },

  // Introduction Page
  intro: {
    title: "Introduction",
    breadcrumb: "Getting Started",
    description: "REAP (Recursive Evolutionary Autonomous Pipeline) is a development pipeline where AI and humans collaborate to incrementally evolve an Application across successive Generations. Rather than treating each AI session as an isolated task, REAP maintains continuity through a structured lifecycle and a living knowledge base called the Genome.",
    threeLayer: "3-Layer Model",
    layerItems: [
      { label: "Knowledge Base", sub: "Genome + Environment", path: ".reap/genome/ + .reap/environment/" },
      { label: "Evolution", sub: "Generational Process", path: ".reap/life/ → .reap/lineage/" },
      { label: "Civilization", sub: "Source Code", path: "your codebase/" },
    ],
    layerDescs: [
      "Design knowledge and external context for building the Application. Genome (architecture, conventions, constraints, source maps) in .reap/genome/ and Environment (external APIs, infrastructure, business constraints) in .reap/environment/. Continuously synchronized with the codebase through each generation's lifecycle.",
      "The process by which the Genome evolves and Civilization grows through repeated Generations.",
      "Source Code. The entire project codebase outside .reap/.",
    ],
    whyReap: "Why REAP?",
    problemHeader: "Problem",
    solutionHeader: "REAP Solution",
    problems: [
      ["Context Loss — Agent forgets project context every session", "SessionStart Hook — Every session injects full Genome + generation state automatically"],
      ["Scattered Development — Code modified with no clear goal", "Generation Model — Each generation focuses on one objective with a structured lifecycle"],
      ["Design–Code Drift — Documentation diverges from code", "Genome Mutation via Backlog — Design defects logged during implementation, applied at Completion"],
      ["Forgotten Lessons — Insights from past work are lost", "Lineage & Retrospectives — Lessons accumulate in Genome, generations archived and compressed"],
      ["Collaboration Chaos — Parallel work leads to conflicting changes", "Distributed Workflow — Genome-first merge reconciles design before code, DAG lineage tracks parallel branches"],
    ],
    fourAxis: "Four-Axis Structure",
    fourAxisDesc: "REAP organizes everything under .reap/ into four axes:",
    axes: [
      { axis: "Genome", path: ".reap/genome/", desc: "Genetic information. Principles, rules, architecture decisions, source maps (C4 Container/Component Mermaid diagrams)." },
      { axis: "Environment", path: ".reap/environment/", desc: "External context. API docs, infrastructure, business constraints." },
      { axis: "Life", path: ".reap/life/", desc: "Current generation's lifecycle. Progress state and artifacts." },
      { axis: "Lineage", path: ".reap/lineage/", desc: "Archive of completed generations." },
    ],
    projectStructure: "Project Structure",
  },

  // Quick Start Page
  quickstart: {
    title: "Quick Start",
    breadcrumb: "Getting Started",
    prerequisites: "Prerequisites",
    prerequisiteItems: [
      { name: "Node.js", desc: "v18 or later", required: true },
      { name: "npm", desc: "included with Node.js", required: true },
      { name: "Claude Code or OpenCode", desc: "AI agent CLI (at least one required)", required: true },
      { name: "Bun", desc: "alternative package manager", required: false },
    ],
    required: "Required",
    optional: "Optional",
    install: "Install",
    initProject: "Initialize a project",
    runFirst: "Run your first generation",
    runFirstDesc: "Open Claude Code in your project directory:",
    evolveTitle: "/reap.evolve is the primary command",
    evolveDesc: "It runs the entire generation lifecycle — Objective, Planning, Implementation, Validation, and Completion — interactively with you. The AI agent asks questions at each stage, and you approve before advancing. This is the command you'll use most for day-to-day development.",
    manualControl: "Manual stage control",
    manualControlDesc: "You can also control each stage individually:",
    whatHappens: "What happens during a generation",
    stageHeaders: ["Stage", "What happens", "Artifact"],
    stages: [
      ["Objective", "Define goal through structured brainstorming design", "01-objective.md"],
      ["Planning", "Break down tasks, choose approach, map dependencies", "02-planning.md"],
      ["Implementation", "Build with AI + human collaboration", "03-implementation.md"],
      ["Validation", "Run tests, verify completion criteria", "04-validation.md"],
      ["Completion", "Retrospective + apply Genome changes + auto-archive (consume + archive + commit)", "05-completion.md"],
    ],
    commandLoading: "How commands are loaded",
    commandLoadingDesc: "REAP slash commands are loaded only in REAP projects — they won't appear in non-REAP projects.",
    commandLoadingDetails: [
      { label: "Source", desc: "Command originals are stored in ~/.reap/commands/ (installed by reap init and reap update)" },
      { label: "Loading", desc: "When you open a REAP project, the session hook automatically symlinks commands to .claude/commands/" },
      { label: "Non-REAP projects", desc: "No symlinks are created, so no REAP skills appear in the AI agent's skill list" },
      { label: "Backward compat", desc: "Redirect stubs in ~/.claude/commands/ ensure older setups keep working during migration" },
    ],
  },

  // Core Concepts Page
  concepts: {
    title: "Core Concepts",
    breadcrumb: "Guide",
    fourAxisTitle: "Four-Axis Structure",
    fourAxisDesc: "REAP organizes everything under .reap/ into four axes:",
    axes: [
      { axis: "Genome", path: ".reap/genome/", desc: "Genetic information — principles, rules, architecture decisions, source maps.", href: "/docs/genome" },
      { axis: "Environment", path: ".reap/environment/", desc: "External context — APIs, infrastructure, business constraints. 3-layer: summary + docs + resources.", href: "/docs/environment" },
      { axis: "Lifecycle", path: ".reap/life/", desc: "Current generation's lifecycle — progress state, artifacts, backlog.", href: "/docs/lifecycle" },
      { axis: "Lineage", path: ".reap/lineage/", desc: "Archive of completed generations — DAG metadata, compressed history.", href: "/docs/lineage" },
    ],
    principlesTitle: "Key Principles",
    principles: [
      { name: "Genome Immutability", desc: "Never modified directly during a generation. Changes go through backlog → Completion." },
      { name: "Environment Immutability", desc: "Never modified directly during a generation. External changes are recorded as backlog items." },
      { name: "Stage Discipline", desc: "Every generation follows 5 stages. No skipping. Transitions only through /reap.next." },
      { name: "Genome as Source of Truth", desc: "Architecture decisions live in Genome, not in code comments or docs." },
    ],
    lifecycleTitle: "Lifecycle Overview",
    lifecycleDesc: "Each generation follows five stages, producing artifacts at each step:",
    stageHeaders: ["Stage", "What happens", "Artifact"],
    stages: [
      ["Objective", "Define goal through structured brainstorming", "01-objective.md"],
      ["Planning", "Task decomposition + implementation plan", "02-planning.md"],
      ["Implementation", "Code with AI + human collaboration", "03-implementation.md"],
      ["Validation", "Run tests, verify completion criteria", "04-validation.md"],
      ["Completion", "Retrospective + Genome update + auto-archive (consume + archive + commit)", "05-completion.md"],
    ],
    sessionInitTitle: "Session Initialization",
    sessionInitDesc: "When you open a REAP project, the session hook automatically injects context into the AI agent — Genome, Environment summary, generation state, and workflow rules. The agent immediately understands your project.",
    sessionInitAlt: "REAP session initialization showing Genome loaded, generation state, and active goal",
    evolutionFlowTitle: "Evolution Flow",
    evolutionFlowDesc: "Knowledge compounds across generations. Each generation evolves the Genome, and lessons accumulate in Lineage:",
  },

  // Workflow Page
  workflow: {
    title: "Workflow",
    breadcrumb: "Guide",
    intro: "A generation is the fundamental unit of work in REAP. Each generation carries a single goal through five stages, producing artifacts along the way. Here's what happens at each stage and how they connect.",
    evolveTitle: "/reap.evolve — The Primary Way to Work",
    evolveDesc: "Most of the time, you run /reap.evolve and let the AI agent drive through all stages autonomously. It handles starting the generation, executing each stage, advancing between them, and archiving at the end. Routine per-stage confirmations are skipped — the agent proceeds without pausing unless it is genuinely blocked (ambiguous goal, significant trade-off decision, genome conflict, or unexpected error).",
    evolveNote: "For fine-grained control, you can run individual stage commands. See Command Reference for details.",
    stageWalkthrough: "Stage-by-Stage Walkthrough",
    stageDetails: [
      {
        title: "1. Objective",
        desc: "Define what this generation will accomplish through structured brainstorming. The AI agent scans context, then guides you through clarifying questions (one at a time), proposes 2-3 approach alternatives with trade-offs, presents sectional design for approval, optionally uses a visual companion for mockups and diagrams, and runs automated spec review.",
        output: "01-objective.md — goal, completion criteria (max 7, verifiable), functional requirements (max 10), design (approaches considered, selected design), scope, and genome gap analysis.",
      },
      {
        title: "2. Planning",
        desc: "Break the objective into actionable tasks. The AI reads the requirements, references genome conventions and constraints, and proposes an implementation plan with architecture decisions.",
        output: "02-planning.md — phased task list (max 20 per phase), dependencies, parallelizable tasks marked with [P].",
      },
      {
        title: "3. Implementation",
        desc: "Build the code. Tasks are executed sequentially, with each completion recorded immediately. When genome or environment defects are discovered, they're logged to the backlog — never applied directly. Tasks that depend on pending genome changes are marked [deferred].",
        output: "03-implementation.md — completed tasks table, deferred tasks, genome-change backlog items.",
      },
      {
        title: "4. Validation",
        desc: "Verify the work. Runs validation commands from constraints.md (test, lint, build, type check), checks completion criteria, and applies minor fixes (≤ 5 min, no design changes). Verdict is pass, partial (some criteria deferred), or fail.",
        output: "04-validation.md — test results with actual command output, criteria check table, verdict.",
      },
      {
        title: "5. Completion",
        desc: 'Retrospect and evolve. Extract lessons learned (max 5), apply genome-change backlog items to the genome files, run garbage collection for tech debt, hand off deferred tasks to the next generation\'s backlog. Hook Suggestion detects repeated patterns across generations and suggests hook creation with user confirmation. Completion now auto-archives: consume + archive + commit in a single step (4 phases reduced to 2).',
        output: "05-completion.md — summary, retrospective, genome changelog. Auto-archive moves everything to lineage.",
      },
    ],
    microLoop: "Micro Loop (Regression)",
    microLoopDesc: "Any stage can go back to a previous stage. This is common — validation fails and you return to implementation, or a planning flaw is found during implementation and you go back to planning. The regression reason is recorded in the timeline and the target artifact.",
    artifactHandling: "Artifact handling on regression:",
    artifactRules: [
      { label: "Before target stage:", desc: "Preserved as-is" },
      { label: "Target stage:", desc: "Overwritten (implementation only appends)" },
      { label: "After target stage:", desc: "Preserved, overwritten upon re-entry" },
    ],
    minorFix: "Minor Fix",
    minorFixDesc: "Trivial issues (typos, lint errors, etc.) can be fixed directly in the current stage without a regression, as long as they're resolvable within 5 minutes and require no design changes. The fix is recorded in the stage artifact.",
    roleSeparation: "Role Separation",
    roleHeaders: ["Who", "Role"],
    roles: [
      ["CLI (reap)", "Project setup and maintenance — init, status, update, fix"],
      ["AI Agent", "Workflow executor — performs each stage's work via slash commands"],
      ["Human", "Decision maker — sets goals, reviews artifacts, approves stage transitions"],
    ],
  },

  // CLI Page
  cli: {
    title: "CLI Reference",
    breadcrumb: "Reference",
    initTitle: "reap init",
    initDesc: "Initialize a new REAP project. Creates the .reap/ structure and installs slash commands and hooks to detected agents (Claude Code, OpenCode).",
    initHeaders: ["Option", "Values", "Description"],
    initOptions: [
      ["--mode", "greenfield | migration | adoption", "Project entry mode"],
      ["--preset", "e.g. bun-hono-react", "Bootstrap Genome with a pre-configured stack"],
    ],
    runTitle: "reap run <cmd>",
    runDesc: "Execute a slash command's TypeScript script directly. Each slash command .md wrapper calls this internally. Not typically run by users directly.",
    runNote: "All 31 slash commands use this architecture: the .md file is a 1-line wrapper that calls reap run <cmd>, and the TS script returns structured JSON instructions for the AI agent.",
    statusTitle: "reap status",
    statusDesc: "Show current project and generation status.",
    statusNote: "Displays project name, entry mode, active generation (id, goal, stage), total completed generations, and REAP version with latest check.",
    updateTitle: "reap update",
    updateDesc: "Sync commands, templates, and hooks to the latest version. Automatically cleans up legacy files from ~/.claude/commands/.",
    dryRunDesc: "Show what would be updated without applying changes.",
    fixTitle: "reap fix",
    fixDesc: "Diagnose and repair the .reap/ directory structure. Use --check for read-only mode (report issues without fixing).",
    fixNote: "Checks for missing directories, verifies config.yml exists, validates current.yml stage, and recreates missing structure. With --check, performs structural integrity check without modifications.",
    cleanTitle: "reap clean",
    cleanDesc: "Reset REAP project with interactive options.",
    cleanNote: "Provides interactive prompts to selectively reset parts of the REAP project (e.g., life, lineage, genome).",
    destroyTitle: "reap destroy",
    destroyDesc: "Remove all REAP files from project.",
    destroyNote: "Completely removes the .reap/ directory and all REAP-related files from the project. Requires typing \"yes destroy\" to confirm.",
    helpTitle: "reap help",
    helpDesc: "Print CLI commands, slash commands, and a workflow summary.",
    helpNote: "Reads ~/.claude/settings.json to detect the user's language setting and outputs the help text in that language (currently en and ko supported). Falls back to English if the language file is not found.",
  },

  // Command Reference Page
  commands: {
    title: "Command Reference",
    breadcrumb: "Reference",
    intro: "REAP has two types of commands: CLI commands and Slash commands.",
    cliCommandsDesc: "CLI commands (reap ...) run in your terminal. They handle project setup and maintenance — init, status, update, fix, help. They do not interact with the AI agent.",
    slashCommandsDesc: "Slash commands (/reap.*) run inside AI agent CLIs (Claude Code, OpenCode). They drive the development workflow — the AI agent reads the prompt and executes the described task interactively with you.",
    slashTitle: "Slash Commands",
    slashIntro: "Installed by reap init to each detected agent. Used inside AI agent sessions (Claude Code, OpenCode).",
    commandHeaders: ["Command", "Description"],
    normalTitle: "Normal Generation",
    normalCommands: [
      ["/reap.evolve", "Run an entire generation from start to finish. The primary command for day-to-day development. Loops through all stages autonomously — skips routine confirmations and only stops when genuinely blocked."],
      ["/reap.evolve.recovery", "Recover from a failed or interrupted generation. Creates a recovery generation that picks up from where things went wrong."],
      ["/reap.start", "Start a new generation. Scans backlog for pending items, asks for a goal, creates current.yml, and sets stage to objective."],
      ["/reap.objective", "Define the generation's goal through structured brainstorming: clarifying questions, approach alternatives, sectional design, visual companion, and spec review loop."],
      ["/reap.planning", "Break down the objective into tasks with dependencies. Creates the implementation plan."],
      ["/reap.implementation", "Execute tasks from the plan. Records completed/deferred tasks and genome discoveries in the artifact."],
      ["/reap.validation", "Run validation commands from constraints.md. Check completion criteria. Verdict: pass / partial / fail."],
      ["/reap.completion", "Retrospective, apply genome changes from backlog, garbage collection, finalize."],
      ["/reap.next", "Advance to the next lifecycle stage. Creates the next artifact from template. Archives on completion."],
      ["/reap.back", "Return to a previous stage (micro loop). Records regression reason in timeline and artifact."],
    ],
    mergeTitle: "Merge Generation",
    mergeCommands: [
      ["/reap.pull <branch>", "Fetch remote, detect new generations, and run a full merge generation lifecycle. The distributed equivalent of /reap.evolve."],
      ["/reap.merge <branch>", "Run a full merge generation for a local branch. The local/worktree equivalent of /reap.pull — no fetch needed."],
      ["/reap.push", "Validate REAP state (warn if generation in progress) and push the current branch to remote."],
      ["/reap.merge.start", "Start a merge generation to combine divergent branches. Creates merge generation and runs detect."],
      ["/reap.merge.detect", "Analyze divergence between current branch and target branch via git refs."],
      ["/reap.merge.mate", "Resolve genome conflicts (WRITE-WRITE, CROSS-FILE) before source merge. Human decides."],
      ["/reap.merge.merge", "Run git merge --no-commit and resolve source conflicts guided by the finalized genome."],
      ["/reap.merge.sync", "AI compares genome and source for consistency. User confirms any inconsistencies."],
      ["/reap.merge.validation", "Run mechanical testing commands (bun test, tsc, build) — same as normal generation."],
      ["/reap.merge.evolve", "Run the merge lifecycle from current stage to completion. Autonomous override applies."],
    ],
    generalTitle: "General",
    generalCommands: [
      ["/reap.abort", "Abort current generation. Choose rollback/stash/hold for code changes, optionally save goal to backlog with abort metadata."],
      ["/reap.status", "Show current generation state, stage progress, backlog summary, timeline, and genome health."],
      ["/reap.sync", "Synchronize both Genome and Environment with current state. Runs sync.genome + sync.environment."],
      ["/reap.sync.genome", "Analyze source code and synchronize Genome. Direct update when no active generation; records to backlog otherwise."],
      ["/reap.sync.environment", "Discover external dependencies (APIs, infrastructure, services) and document them in the 3-layer environment structure (summary.md + docs/ + resources/)."],
      ["/reap.config", "Display current project configuration (.reap/config.yml)."],
      ["/reap.report", "Report a bug or feedback to the REAP project via GitHub Issue. Privacy double-check: PRIVACY_GATE + post-format sanitization. User confirmation required."],
      ["/reap.help", "Provide contextual help with 24+ topics."],
      ["/reap.update", "Upgrade REAP package + sync commands, templates, and hooks to all detected agents. Also syncs project .claude/commands/ immediately."],
      ["/reap.refreshKnowledge", "Reload REAP context (Genome, Environment, state). Useful after context compaction or in subagents."],
      ["/reap.update-genome", "Apply pending genome-change backlog without a generation. Only available when no generation is active. Marks applied items as consumed and bumps genomeVersion."],
    ],
    commandStructure: "Script Orchestrator Architecture",
    commandStructureDesc: "Since v0.11.0, every slash command is a 1-line .md wrapper that calls reap run <cmd>. The TypeScript script handles all deterministic logic and returns structured JSON instructions for the AI agent. Pattern: Gate (precondition check) → Steps (work execution) → Artifact (recorded to .reap/life/).",
  },

  // Recovery Generation Page
  recovery: {
    title: "Recovery Generation",
    breadcrumb: "Other",
    intro: "A Recovery Generation is a special generation type that reviews and corrects artifacts from past generations when errors or inconsistencies are discovered. It uses type: recovery and references target generations via the recovers field.",
    triggerTitle: "How to Trigger",
    triggerDesc: "Use the /reap.evolve.recovery command with the target generation ID. The system reviews the target's artifacts and only creates a recovery generation if corrections are needed.",
    criteriaTitle: "Review Criteria",
    criteriaHeaders: ["Criterion", "Description"],
    criteriaItems: [
      ["Artifact Inconsistency", "Contradictions between artifacts within the same generation (e.g., objective vs implementation design mismatch)"],
      ["Structural Defects", "Missing sections, incomplete content, or format errors in artifacts"],
      ["Human-specified Correction", "Corrections explicitly requested by the user"],
    ] as string[][],
    processTitle: "Process Flow",
    processDesc: "The recovery command runs in two phases: review (analyze artifacts against criteria) and create (start recovery generation if issues found).",
    processFlow: `/reap.evolve.recovery gen-XXX
  → Load target generation's lineage artifacts
  → Review against 3 criteria
  → Issues found → Auto-start recovery generation (type: recovery)
  → No issues   → "no recovery needed" (no generation created)`,
    stagesTitle: "Stage Purpose Comparison",
    stagesDesc: "Recovery generations follow the same 5-stage lifecycle as normal generations, but each stage serves a different purpose.",
    stageHeaders: ["Stage", "Normal", "Recovery"],
    stageItems: [
      ["Objective", "Define new goal", "Redefine corrected goal/design (cite original + review results)"],
      ["Planning", "Task decomposition", "List files/logic to review + verification criteria"],
      ["Implementation", "Write code", "Review & correct existing code"],
      ["Validation", "Verify", "Verify after correction"],
      ["Completion", "Retrospective", "Retrospective + correction record for original generation"],
    ] as string[][],
    currentYmlTitle: "current.yml Extension",
    currentYmlDesc: "Recovery generations add a recovers field to current.yml and meta.yml. The parents field follows normal DAG rules, while recovers separately references the correction target.",
    notesTitle: "Notes",
    notes: [
      "Does not affect existing normal/merge generations",
      "Same lineage compression rules apply to recovery generations",
      "Recovery generations produce the same 5 artifacts as normal generations",
      "The objective automatically cites the target generation's original objective + completion",
    ],
  },

  // Configuration Page
  config: {
    title: "Configuration",
    breadcrumb: "Reference",
    intro: "REAP projects are configured through .reap/config.yml. This file is created during reap init and controls project settings, strict mode, and agent integration.",
    structure: "Config File Structure",
    fields: "Fields",
    fieldHeaders: ["Field", "Description"],
    fieldItems: [
      ["version", "Config schema version"],
      ["project", "Project name (set during init)"],
      ["entryMode", "How REAP was initialized: greenfield, migration, or adoption"],
      ["preset", "Preset used during init (e.g. bun-hono-react). Optional"],
      ["strict", "Strict mode: boolean (shorthand) or { edit, merge } for granular control (see below)"],
      ["language", "Language for artifacts and user interactions (e.g. korean, english, japanese)"],
      ["autoUpdate", "Auto-update REAP on session start (default: true)"],
      ["autoSubagent", "Auto-delegate /reap.evolve to a subagent via Agent tool (default: true)"],
      ["autoIssueReport", "Auto-report issues to GitHub when malfunction detected. Requires gh CLI (default: true if gh found)"],
      ["agents", "Detected AI agents, managed by reap init/update (e.g. claude-code, opencode)"],
    ],
    strictMode: "Strict Mode",
    strictModeDesc: "Strict mode controls what the AI agent is allowed to do. It supports two forms:",
    strictConfigExample: `# Shorthand — enables both edit and merge restrictions
strict: true

# Granular control
strict:
  edit: true    # Restrict code changes to REAP lifecycle
  merge: false  # Restrict raw git pull/push/merge`,
    strictEditTitle: "strict.edit — Code Modification Control",
    strictEditDesc: "When enabled, the AI agent cannot modify code outside the REAP workflow.",
    strictHeaders: ["Context", "Behavior"],
    strictRules: [
      ["No active generation / non-implementation stage", "Code modifications are fully blocked"],
      ["Implementation stage", "Only modifications within the scope of 02-planning.md are allowed"],
      ["Escape hatch", 'User explicitly requests "override" or "bypass strict" — bypass applies to that specific action only, then strict mode re-engages'],
    ],
    strictMergeTitle: "strict.merge — Git Command Control",
    strictMergeDesc: "When enabled, direct git pull, git push, and git merge commands are restricted. The agent will guide users to use REAP slash commands instead (/reap.pull, /reap.push, /reap.merge).",
    strictNote: "Both are disabled by default. strict: true enables both. Reading files, analyzing code, and answering questions are always allowed regardless of strict mode.",
    entryModes: "Entry Modes",
    entryModeHeaders: ["Mode", "Use case"],
    entryModeItems: [
      ["greenfield", "New project starting from scratch"],
      ["adoption", "Applying REAP to an existing codebase"],
      ["migration", "Migrating from an existing system to a new architecture"],
    ],
  },

  // Hook Reference Page
  hooks: {
    title: "Hooks",
    breadcrumb: "Guide",
    intro: "REAP hooks let you run automation at key lifecycle events. Hooks are stored as individual files in .reap/hooks/ and the AI agent executes them at the right moment.",
    hookTypes: "Hook Types",
    hookTypesIntro: "Each hook file supports one of two types based on its extension:",
    commandType: "command (.sh)",
    commandTypeDesc: "A shell script. Executed in the project root directory by the AI agent. Use for scripts, CLI tools, build commands.",
    promptType: "prompt (.md)",
    promptTypeDesc: "An AI agent instruction in Markdown. The agent reads the prompt and performs the described task — code analysis, file modifications, documentation updates, etc. Use for tasks that require judgment.",
    hookTypeNote: "Each hook is a single file. Multiple hooks per event are executed in the order specified by frontmatter.",
    fileNaming: "File Naming",
    fileNamingDesc: "Hook files follow the pattern: .reap/hooks/{event}.{name}.{md|sh}",
    fileNamingFrontmatter: "Each hook file supports optional YAML frontmatter:",
    frontmatterHeaders: ["Field", "Description"],
    frontmatterItems: [
      ["condition", "Name of a condition script in .reap/hooks/conditions/ (e.g. always, has-code-changes, version-bumped)"],
      ["order", "Numeric execution order when multiple hooks exist for the same event (default: 0)"],
    ],
    events: "Events",
    normalEventsTitle: "Normal Lifecycle Events",
    mergeEventsTitle: "Merge Lifecycle Events",
    eventHeaders: ["Event", "When it fires"],
    eventItems: [
      ["onLifeStarted", "After /reap.start creates a new generation"],
      ["onLifeObjected", "After objective stage completes"],
      ["onLifePlanned", "After planning stage completes"],
      ["onLifeImplemented", "After implementation stage completes"],
      ["onLifeValidated", "After validation stage completes"],
      ["onLifeCompleted", "After completion + archiving (runs after git commit)"],
      ["onLifeTransited", "After any stage transition (generic)"],
      ["onLifeRegretted", "After /reap.back regression"],
      ["onMergeStarted", "After /reap.merge.start creates a merge generation"],
      ["onMergeDetected", "After detect stage completes"],
      ["onMergeMated", "After mate stage completes (genome resolved)"],
      ["onMergeMerged", "After merge stage completes (source merged)"],
      ["onMergeSynced", "After sync stage completes"],
      ["onMergeValidated", "After merge validation completes"],
      ["onMergeCompleted", "After merge completion + archiving"],
      ["onMergeTransited", "After any merge stage transition (generic)"],
    ],
    configuration: "File-based Configuration",
    configurationDesc: "Hooks are file-based — stored in .reap/hooks/, not in config.yml. Each hook is a file named {event}.{name}.{md|sh}.",
    configExample: `.reap/hooks/
├── onLifeCompleted.reap-update.sh
├── onLifeCompleted.docs-update.md
├── onLifeImplemented.lint-check.sh
└── onMergeMated.notify.md

# Example: .md hook (AI prompt)
# ---
# condition: has-code-changes
# order: 30
# ---
# Review changes and update docs if needed.

# Example: .sh hook (shell script)
# #!/bin/bash
# # condition: always
# # order: 20
# reap update`,
    hookSuggestion: "Automatic Hook Suggestion",
    hookSuggestionDesc: "During the Completion stage (Phase 5: Hook Suggestion), REAP detects repeated patterns across generations — such as recurring manual steps, repeated commands, or consistent post-stage actions. When a pattern is detected, REAP suggests creating a hook to automate it. Hook creation always requires user confirmation before being applied.",
    sessionStart: "SessionStart Hook",
    sessionStartDesc1: "Separate from REAP project hooks, the SessionStart hook is an agent mechanism that runs at the start of every AI session. REAP registers it during reap init for each detected agent (Claude Code, OpenCode).",
    sessionStartDesc2: "It injects the full REAP workflow guide, current generation state, and lifecycle rules into the AI agent — ensuring the agent understands the project context even in a brand-new session.",
    sessionStartNote: "Registered in the agent's settings (e.g. ~/.claude/settings.json for Claude Code, ~/.config/opencode/ for OpenCode). The hook script lives in the REAP package and reads from the project's .reap/ directory.",
    executionNotes: "Execution Notes",
    executionItems: [
      "Hooks are executed by the AI agent, not the CLI. The agent scans .reap/hooks/ for matching files.",
      ".sh files run as shell scripts in the project root directory.",
      ".md files are read as AI prompts and followed by the agent.",
      "Hooks within the same event run in order (frontmatter 'order' field, lower runs first).",
      "Conditions are evaluated via .reap/hooks/conditions/{name}.sh (exit 0 = run, non-zero = skip).",
      "onLifeCompleted/onMergeCompleted hooks run after the git commit — any file changes from hooks will be uncommitted.",
    ],
  },

  // Advanced Page
  advanced: {
    title: "Advanced",
    breadcrumb: "Guide",
    signatureTitle: "Signature-Based Locking",
    signatureDesc: "REAP uses a cryptographic nonce chain to enforce stage ordering. Without a valid nonce, the AI agent cannot advance to the next stage — even if it tries to skip ahead.",
    signatureFlow: `Stage Command          current.yml              /reap.next
─────────────          ───────────              ──────────
generate nonce ──────→ store hash(nonce)
return nonce to AI                         ←── AI passes nonce
                                               verify hash(nonce)
                                               ✓ advance stage`,
    signatureHow: "How It Works",
    signatureHowItems: [
      "Stage command (e.g. /reap.objective) generates a random nonce",
      "The nonce's SHA-256 hash is stored in current.yml",
      "The nonce is returned to the AI agent in the JSON response",
      "/reap.next receives the nonce, hashes it, and compares against current.yml",
      "Match → stage advances. Mismatch → rejected.",
    ],
    signatureComparisonTitle: "Prompt-Only vs Signature-Based",
    signatureComparisonHeaders: ["Threat", "Prompt-Only", "Signature-Based"],
    signatureComparisonItems: [
      ["Skipping stages", "Relies on AI compliance", "Blocked — no valid nonce"],
      ["Forging tokens", "N/A", "Infeasible — one-way hash"],
      ["Replaying old nonces", "N/A", "Blocked — single-use, stage-bound"],
      ["Prompt injection", "Vulnerable", "Nonce is external to prompt context"],
    ],
    compressionTitle: "Lineage Compression",
    compressionDesc: "As generations accumulate, lineage archives are automatically compressed during the Completion stage.",
    compressionHeaders: ["Level", "Input", "Output", "Trigger", "Protection"],
    compressionItems: [
      ["Level 1", "Generation folder (5 artifacts)", "gen-XXX-{hash}.md (40 lines)", "lineage > 5,000 lines + 5+ generations", "Recent 3 + DAG leaf nodes"],
      ["Level 2", "100+ Level 1 files", "Single epoch.md", "Level 1 files > 100", "Recent 9 + fork points"],
    ],
    compressionProtection: "DAG preservation: Level 1 files retain metadata in frontmatter. Level 2 epoch.md stores a generations hash chain. Fork guard: all local/remote branches are scanned before Level 2 compression — fork points are protected. Epoch-compressed generations cannot be used as merge bases.",
    presetsTitle: "Presets",
    presetsDesc: "Presets provide pre-configured Genome and project scaffolding for common stacks.",
    presetsNote: "The bun-hono-react preset configures Genome with conventions for a Bun + Hono + React stack, including appropriate architecture principles, conventions, and constraints.",
    entryModes: "Entry Modes",
    entryModesDesc: "Specified with reap init --mode. Controls how the Genome is initially structured.",
    entryModeHeaders: ["Mode", "Description"],
    entryModeItems: [
      ["greenfield", "Build a new project from scratch. Default mode. Genome starts empty and grows."],
      ["migration", "Build anew while referencing an existing system. Genome is seeded with analysis of the existing system."],
      ["adoption", "Apply REAP to an existing codebase. Genome starts from templates and is populated during the first generation's Objective stage."],
    ],
  },

  // Distributed Workflow - Overview
  collaboration: {
    title: "Distributed Workflow",
    breadcrumb: "Collaboration",
    intro: "REAP supports a distributed workflow for collaboration environments where multiple developers or AI agents work on the same project in parallel — without a central server. Git is the only transport layer.",
    caution: "The distributed workflow is currently in early stages and requires further testing. Use with caution in production environments. We are actively collecting user feedback — please report issues or suggestions at",
    cautionLink: "GitHub Issues",
    cautionUrl: "https://github.com/c-d-cc/reap/issues",
    howItWorks: "How It Works",
    howItWorksDesc: "Each developer or agent works independently on their own branch and generation. When it's time to combine, REAP orchestrates the merge with a genome-first strategy.",
    flowSteps: [
      "Machine A completes gen-046-a on branch-a → /reap.push",
      "Machine B completes gen-046-b on branch-b → /reap.push",
      "Machine A runs /reap.pull branch-b → fetch + full merge generation lifecycle",
    ],
    principles: "Key Principles",
    principleItems: [
      { label: "Opt-in", desc: "git pull/push always work normally. REAP commands are additive — you choose when to use the distributed workflow." },
      { label: "Genome-first", desc: "Genome conflicts are resolved before source merge. Like amending the constitution before updating the laws." },
      { label: "No server", desc: "Everything is local + Git. No external services, no central coordination." },
      { label: "DAG lineage", desc: "Each generation references its parents via a hash-based ID (gen-046-a3f8c2), forming a directed acyclic graph that naturally supports parallel work." },
    ],
    scenarios: "Usage Scenarios",
    scenarioItems: [
      { label: "Remote branches (multi-machine)", desc: "Different developers or agents work on separate machines and push to remote branches. Use /reap.push to publish, /reap.pull <branch> to fetch and merge.", example: "/reap.push → /reap.pull branch-b" },
      { label: "Local worktrees (multi-agent)", desc: "Multiple AI agents work in parallel on the same machine using git worktrees. Each worktree has its own branch and generation. Use /reap.merge.start to combine directly — no fetch needed.", example: "/reap.merge.start worktree-branch" },
      { label: "Mixed", desc: "Some work is local (worktrees), some is remote (other machines). Combine /reap.pull for remote branches and /reap.merge.start for local branches as needed." },
    ],
    pullPush: "Pull & Push (Remote)",
    pullDesc: "/reap.pull <branch> is the distributed equivalent of /reap.evolve. It fetches the remote, detects new generations, and runs a full merge generation lifecycle — from Detect through Completion.",
    pushDesc: "/reap.push validates the current REAP state (warns if a generation is in progress) and pushes the current branch to the remote.",
    merge: "Merge (Local / Worktree)",
    mergeDesc: "/reap.merge.start <branch> creates a merge generation directly from a local branch — ideal for worktree-based parallel development where no fetch is needed. Use /reap.merge.evolve to run the full merge lifecycle, or step through each stage manually.",
    gitRefReading: "Git Ref-Based Reading",
    gitRefDesc: "Before a merge, the target branch's genome and lineage are read via git refs (git show, git ls-tree) — no checkout required. This works for both remote and local branches.",
  },

  // Distributed Workflow - Merge Lifecycle
  mergeGeneration: {
    title: "Merge Generation",
    breadcrumb: "Collaboration",
    intro: "When diverged branches need to be merged, REAP runs a specialized 6-stage lifecycle called Merge Generation — separate from the normal generation lifecycle. The core principle: align the genome first, then merge source code.",
    whyLonger: "Why is Merge Generation different from a regular git merge?",
    whyLongerDesc: "A regular git merge only resolves source code conflicts. But when two branches evolve independently — each with their own generations, genome changes, and design decisions — merging source code alone isn't enough. The genome (architecture principles, conventions, constraints, business rules) may have diverged too. Merge Generation adds three critical steps before the source merge: detecting genome divergence, mating (resolving genome conflicts), and verifying genome-source consistency after the merge. This ensures that the merged codebase isn't just compile-clean, but also design-consistent.",
    whyGenomeFirst: "Why genome alignment comes first",
    whyGenomeFirstDesc: "Resolving source code conflicts does not guarantee the absence of semantic conflicts. Two pieces of code can merge cleanly — no git conflicts at all — yet contradict each other in intent, architecture, or business logic. Only genome-based reasoning can detect these invisible conflicts: does the merged code still follow the architecture principles? Are the conventions consistent? Do the business rules align? This is why REAP aligns the genome before touching source code. Once the genome is settled, it becomes the authoritative guide for resolving source conflicts — not just syntactically, but semantically.",
    whyLongerPoints: [
      { label: "Regular git merge", desc: "Source conflicts → resolve → commit. Design consistency is not checked. Semantic conflicts go undetected." },
      { label: "Merge Generation", desc: "Genome align first → source merge guided by genome → verify genome-source consistency → validate → commit. Invisible semantic conflicts are caught." },
    ],
    stageOrder: "Stage Order",
    stages: [
      { name: "Detect", desc: "Scan the target branch via git refs. Find the common ancestor using DAG BFS. Extract genome diffs. Classify conflicts as WRITE-WRITE or CROSS-FILE.", artifact: "01-detect.md" },
      { name: "Mate", desc: "Present all genome conflicts to the human. For WRITE-WRITE: choose A, B, or merge manually. For CROSS-FILE: check logical compatibility. The genome must be fully resolved before proceeding.", artifact: "02-mate.md" },
      { name: "Merge", desc: "Run git merge --no-commit with the target branch. Resolve any source conflicts guided by the finalized genome. Check for semantic conflicts — code that compiles but contradicts the genome.", artifact: "03-merge.md" },
      { name: "Sync", desc: "AI compares genome and source code for consistency. User confirms any inconsistencies found. If issues exist, regress to Merge or Mate.", artifact: "04-sync.md" },
      { name: "Validation", desc: "Run all mechanical testing commands from constraints.md (bun test, tsc, build). If any fail, regress to Merge or Mate.", artifact: "05-validation.md" },
      { name: "Completion", desc: "Commit the merged result. Record the merge in meta.yml with type: merge and both parents. Archive to lineage.", artifact: "06-completion.md" },
    ],
    stageHeaders: ["Stage", "What happens", "Artifact"],
    conflictTypes: "Conflict Types",
    conflictHeaders: ["Type", "Description", "Resolution"],
    conflicts: [
      ["WRITE-WRITE", "Same genome file modified on both branches", "Human decides: keep A, keep B, or merge"],
      ["CROSS-FILE", "Different genome files modified, but both branches changed genome", "Human reviews for logical compatibility"],
      ["Source conflict", "Git merge conflict in source code", "Resolved guided by finalized genome"],
      ["Semantic conflict", "Code merges cleanly but contradicts the genome (architecture, conventions, business rules)", "Detected in Sync stage — AI compares genome and source, user confirms resolution"],
      ["No conflict", "No genome or source conflicts", "Proceeds automatically"],
    ],
    regression: "Merge Regression",
    regressionDesc: "Validation or Sync failure can regress to Merge or Mate. Merge can regress to Mate if a genome issue is discovered. Regression rules follow the same pattern as normal generations — reason recorded in timeline and artifact.",
    currentYml: "current.yml Structure (Merge)",
  },

  // Distributed Workflow - Merge Commands
  mergeCommands: {
    title: "Merge Commands",
    breadcrumb: "Collaboration",
    intro: "All distributed workflow operations are slash commands executed by the AI agent. There are no CLI commands for merge — the AI agent is essential for genome conflict resolution and source merge guidance.",
    primaryCommands: "Primary Commands",
    primaryItems: [
      { cmd: "/reap.pull <branch>", desc: "The one-stop command for distributed merging. Fetches the remote, detects new generations on the target branch, creates a merge generation, and runs the full merge lifecycle. This is the distributed equivalent of /reap.evolve." },
      { cmd: "/reap.merge <branch>", desc: "Run a full merge generation for a local branch. No fetch — ideal for worktree-based parallel development. The local equivalent of /reap.pull." },
      { cmd: "/reap.push", desc: "Validates REAP state (warns if a generation is in progress) and pushes the current branch. Use after completing a generation." },
    ],
    stageCommands: "Stage Commands (Fine-Grained Control)",
    stageItems: [
      { cmd: "/reap.merge.start", desc: "Create a merge generation for a target branch. Runs detect and generates 01-detect.md." },
      { cmd: "/reap.merge.detect", desc: "Review the divergence report. Re-run if needed." },
      { cmd: "/reap.merge.mate", desc: "Resolve genome conflicts interactively with the human." },
      { cmd: "/reap.merge.merge", desc: "Run git merge --no-commit and resolve source conflicts." },
      { cmd: "/reap.merge.sync", desc: "AI compares genome and source for consistency. User confirms inconsistencies." },
      { cmd: "/reap.merge.validation", desc: "Run mechanical testing (bun test, tsc, build). Regress on failure." },
      { cmd: "/reap.merge.completion", desc: "Commit and archive the merge generation." },
      { cmd: "/reap.merge.evolve", desc: "Run the merge lifecycle from the current stage to completion." },
    ],
    mergeHooks: "Merge Hooks",
    mergeHookHeaders: ["Event", "When it fires"],
    mergeHookItems: [
      ["onMergeStarted", "After /reap.merge.start creates a merge generation"],
      ["onMergeDetected", "After detect stage completes"],
      ["onMergeMated", "After mate stage completes (genome resolved)"],
      ["onMergeMerged", "After merge stage completes (source merged)"],
      ["onMergeSynced", "After sync stage completes"],
      ["onMergeValidated", "After merge validation completes"],
      ["onMergeCompleted", "After merge completion + archiving"],
      ["onMergeTransited", "After any merge stage transition (generic)"],
    ],
    mergeHookNote: "onMergeTransited fires on every merge stage transition, similar to onLifeTransited for normal lifecycle.",
  },

  // Comparison Page
  comparison: {
    title: "Comparison",
    breadcrumb: "Getting Started",
    heading: "Comparison with Spec Kit",
    desc: "Spec Kit pioneered spec-driven development — writing specifications before code. REAP builds on this concept and addresses key limitations:",
    items: [
      { title: "Static specs vs Living Genome", desc: "Traditional tools treat specs as static documents. REAP's Genome is a living system — defects found during implementation feed back through the backlog and are applied at Completion. The design evolves with the code." },
      { title: "No cross-session memory", desc: "Most AI development tools lose context between sessions. REAP's SessionStart Hook injects full project context (Genome, generation state, workflow rules) into every new session automatically." },
      { title: "Linear workflow vs Micro loops", desc: "Traditional tools follow a linear flow (spec → plan → build). REAP supports structured regression — any stage can loop back to a previous one while preserving artifacts." },
      { title: "Isolated tasks vs Generational evolution", desc: "Each task in traditional tools is independent. In REAP, generations build on each other. Knowledge compounds through Lineage archives and Genome evolution." },
      { title: "No lifecycle hooks", desc: "REAP provides 16 stage-level hooks (onLifeStarted through onMergeCompleted) for automation at every lifecycle point." },
    ],
  },

  // Genome Page
  genomePage: {
    title: "Genome",
    breadcrumb: "Guide",
    intro: "The Genome is REAP's authoritative knowledge source — architecture principles, development conventions, technical constraints, and domain rules. It is the DNA of your project.",
    structureTitle: "Structure",
    structure: `.reap/genome/
├── principles.md      # Architecture principles/decisions (ADR style)
├── conventions.md     # Development rules/conventions
├── constraints.md     # Technical constraints/choices
├── source-map.md      # C4 Container/Component diagrams
└── domain/            # Business rules (per module)`,
    principlesTitle: "Writing Principles",
    principles: [
      "Map not Manual — each file ~100 lines max. Details go to domain/.",
      "Agent-actionable — written so an AI agent can immediately act on it.",
      "domain/ is for business rules — not code structure, but policies, thresholds, state machines.",
      "Mechanical enforcement first — prefer lint/test rules over document rules.",
    ],
    immutabilityTitle: "Genome Immutability",
    immutabilityDesc: "The current generation does not modify Genome directly. Issues discovered during Implementation are recorded as genome-change backlog items and applied only during the Completion stage.",
    immutabilityWhy: "Why? Think of the Genome as a constitution. If you amend it mid-sprint, every decision made so far loses its foundation. By deferring changes to Completion, the generation finishes with a stable reference — then the Genome evolves deliberately, informed by what actually happened rather than what was assumed.",
    contextTitle: "Session Context",
    contextDesc: "Genome is automatically loaded into the AI agent's context at session start. The agent always has access to your project's principles, conventions, constraints, and source map — no manual briefing needed.",
    evolutionTitle: "Evolution through Generations",
    evolutionDesc: "At the end of each generation (Completion stage), genome-change backlog items are reviewed and applied to the Genome. Source code changes from the generation are reflected back into the Genome — ensuring the Knowledge Base stays in sync with your codebase as it evolves.",
    syncTitle: "Manual Synchronization",
    syncDesc: "Use /reap.sync.genome to analyze source code and update the Genome on demand. When no active generation, changes are applied directly. With an active generation, differences are recorded to backlog for the next Completion.",
  },

  // Environment Page
  environmentPage: {
    title: "Environment",
    breadcrumb: "Guide",
    intro: "Environment stores external context that affects your project — APIs, infrastructure, organizational rules, and reference materials. Unlike Genome (internal decisions), Environment captures constraints from the outside world.",
    structureTitle: "3-Layer Structure",
    structure: `.reap/environment/
├── summary.md      # Session context (~100 lines, auto-loaded)
├── docs/           # Main reference docs (agent reads these)
└── resources/      # Raw materials (user-provided or AI-collected)`,
    layersTitle: "Layers",
    layerHeaders: ["Layer", "Maintained by", "Content", "Limit"],
    layerItems: [
      ["summary.md", "AI (auto-generated)", "Overview of all docs/. Loaded into every session context.", "~100 lines"],
      ["docs/", "AI + User", "One file per environment topic. API constraints, infrastructure, org rules.", "~100 lines each"],
      ["resources/", "User", "Original documents, PDFs, external links + summaries.", "No limit"],
    ],
    immutabilityTitle: "Environment Immutability",
    immutabilityDesc: "Like the Genome, the Environment is not modified directly during a generation. External changes discovered mid-generation are recorded as environment-change backlog items and applied at Completion.",
    immutabilityWhy: "External context shifts — an API deprecation, an infra migration — can invalidate assumptions made during Planning. By capturing changes in the backlog rather than rewriting Environment on the fly, the generation completes on a stable map of the outside world. The update happens once, deliberately, with full context of what was built.",
    flowTitle: "Lookup Flow",
    flowDesc: "summary.md (always loaded) → docs/ (when detail needed) → resources/ (when original source needed)",
    syncTitle: "Manual Synchronization",
    syncDesc: "Use /reap.sync.environment to discover external dependencies and document them. The command scans source code for clues, then interviews the user about connected systems, infrastructure, and organizational rules.",
    syncSources: [
      { label: "Human Input", role: "Primary source", desc: "The user describes APIs, infrastructure, org rules, and business constraints that can't be inferred from code." },
      { label: "Source Code", role: "Secondary source", desc: "package.json, config files, API clients — scanned to seed questions and detect dependencies." },
    ],
    syncContrast: "Compare with Genome sync, where source code is the primary source. For Environment, the outside world lives in the human's head — code only hints at it.",
  },

  // Lifecycle Page (renamed from Workflow)
  lifecyclePage: {
    title: "Lifecycle",
    breadcrumb: "Guide",
    intro: "The lifecycle is the heartbeat of REAP — each generation flows through 5 stages (Objective → Planning → Implementation → Validation → Completion), producing artifacts at every step. The AI agent guides you through the entire lifecycle.",
    structureTitle: "Artifacts Structure",
    structure: `.reap/life/
├── current.yml          # Current generation state (id, goal, stage, timeline)
├── 01-objective.md      # Goal, requirements, design decisions
├── 02-planning.md       # Task decomposition, dependencies
├── 03-implementation.md # Implementation log, changes made
├── 04-validation.md     # Test results, completion criteria check
├── 05-completion.md     # Retrospective, genome changelog
└── backlog/             # Items for next generation
    ├── fix-auth-bug.md  #   type: task
    └── add-index.md     #   type: genome-change`,
    structureDesc: "Each stage produces its artifact in .reap/life/. When the generation completes, all artifacts are archived to .reap/lineage/gen-XXX-hash-slug/ and current.yml is cleared for the next generation.",
  },

  // Lineage Page
  lineagePage: {
    title: "Lineage",
    breadcrumb: "Guide",
    intro: "Lineage is the archive of completed generations. Every generation that completes its lifecycle is preserved here with full artifacts and DAG metadata.",
    structureTitle: "Structure",
    structureDesc: "Each completed generation creates a directory with artifacts and metadata:",
    structure: `.reap/lineage/
├── gen-042-a3f8c2-fix-login-bug/   # Full generation (directory)
│   ├── meta.yml                      # DAG metadata (id, parents, genomeHash)
│   ├── 01-objective.md
│   ├── 02-planning.md
│   ├── 03-implementation.md
│   ├── 04-validation.md
│   └── 05-completion.md
├── gen-030-b7e1f2.md                 # Level 1 compressed (single file)
└── epoch.md                          # Level 2 compressed (hash chain)`,
    dagTitle: "DAG (Directed Acyclic Graph)",
    dagDesc: "Each generation records its parents in meta.yml, forming a DAG. This enables distributed workflows where multiple machines can work independently and merge later.",
    compressionTitle: "Compression",
    compressionDesc: "Compression runs during the Completion stage to manage lineage size.",
    compressionHeaders: ["Level", "Input", "Output", "Trigger", "Protection"],
    compressionItems: [
      ["Level 1", "Generation folder", "gen-XXX-{hash}.md (40 lines)", "> 5,000 lines + 5+ generations", "Recent 3 + DAG leaf nodes"],
      ["Level 2", "100+ Level 1 files", "Single epoch.md", "Level 1 files > 100", "Recent 9 + fork points"],
    ],
    compressionSafety: "DAG preservation: Level 1 retains metadata in frontmatter. Level 2 epoch.md stores a generations hash chain. Fork guard: all local/remote branches are scanned — fork points are protected. Epoch-compressed generations cannot be used as merge bases.",
  },

  // Backlog Page
  backlogPage: {
    title: "Backlog",
    breadcrumb: "Guide",
    intro: "The backlog carries items forward between generations — deferred tasks, genome changes, and environment changes. It lives in .reap/life/backlog/.",
    typesTitle: "Item Types",
    typeHeaders: ["Type", "Description", "When Applied"],
    typeItems: [
      ["task", "Deferred work, tech debt, feature ideas", "Referenced as goal candidates in next Objective"],
      ["genome-change", "Genome modifications discovered mid-generation", "Applied to Genome during Completion"],
      ["environment-change", "External environment changes discovered mid-generation", "Applied to Environment during Completion"],
    ],
    statusTitle: "Status",
    statusHeaders: ["Status", "Meaning"],
    statusItems: [
      ["pending", "Not yet processed (default)"],
      ["consumed", "Processed in a generation (requires consumedBy: gen-XXX-{hash})"],
    ],
    archivingTitle: "Archiving Rules",
    archivingDesc: "At archiving time, consumed items move to lineage. Pending items are carried forward to the next generation's backlog.",
    deferralTitle: "Task Deferral",
    deferralDesc: "Partial completion is normal — tasks depending on Genome changes are marked [deferred] and handed to the next generation.",
    abortTitle: "Abort Backlog",
    abortDesc: "When a generation is aborted via /reap.abort, the goal and progress can be saved to backlog with abort metadata (abortedFrom, abortReason, stage, sourceAction, changedFiles). This preserves context for resuming later.",
    formatTitle: "File Format",
    format: `---
type: task
status: pending
priority: medium
---

# Task Title

Description of the task.`,
  },

  // Release Notes Page
  releaseNotes: {
    title: "Release Notes",
    breadcrumb: "Other",
    breakingBannerTitle: "Breaking Changes in v0.16",
    breakingBannerDesc: "v0.16 introduces breaking changes. Automatic updates from v0.15.x to v0.16.x are blocked. Manual update required: npm install -g @c-d-cc/reap@latest",
    versions: [
      {
        version: "0.15.13",
        notes: "Replaced commander.js with built-in CLI library. Runtime dependencies: 2 -> 1.",
      },
      {
        version: "0.15.12",
        notes: "Release notice now displays correctly after reap update auto-upgrade.",
      },
      {
        version: "0.15.11",
        notes: "Fixed reap pull incorrectly recommending merge for ahead-only branches. Now uses git rev-list for accurate ahead/behind/diverged detection.",
      },
      {
        version: "0.15.10",
        notes: "Fixed release notice language matching (e.g. \"korean\" -> \"ko\").",
      },
      {
        version: "0.15.9",
        notes: "Fixed release notice not displaying after reap update. Path resolution now uses require.resolve instead of __dirname.",
      },
      {
        version: "0.15.8",
        notes: "Removed version field from config.yml. No more uncommitted changes after reap update.",
      },
      {
        version: "0.15.7",
        notes: "Renamed UPDATE_NOTICE.md to RELEASE_NOTICE.md. Notice content now inline (no GitHub Discussions dependency).",
      },
      {
        version: "0.15.6",
        notes: "Fixed UPDATE_NOTICE.md missing from npm package.",
      },
      {
        version: "0.15.5",
        notes: "Integrity check no longer warns about source-map.md line count.",
      },
      {
        version: "0.15.4",
        notes: "Bug fixes and new reap make backlog command. Fixed lineage archiving, reap back nonce chain, added compression protection for 20 recent generations.",
      },
    ],
  },
};

export type Translations = typeof en;
