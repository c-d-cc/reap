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
  homeBanner: {
    text: "Breaking changes coming in v0.16",
    cta: "Release Notes →",
  },
  hero: {
    tagline: "Recursive Evolutionary Autonomous Pipeline",
    title: "REAP",
    description: "A development pipeline where AI and humans collaborate to evolve an Application across successive Generations. Context persists between sessions, development follows a structured lifecycle, and design docs evolve with your code.",
    getStarted: "Get Started →",
    whyReap: "Why REAP?",
    whyReapDesc: "AI agents are powerful — but without structure, development becomes chaotic. Context resets every session. Code changes scatter without purpose. Design docs drift from reality. Lessons from past work vanish.",
    problems: [
      { problem: "Context loss", solution: "CLAUDE.md + Memory automatically restore full project context in every session" },
      { problem: "Scattered development", solution: "Each generation focuses on one objective through a structured lifecycle" },
      { problem: "Design–code drift", solution: "Genome mutations discovered during implementation feed back via backlog" },
      { problem: "Forgotten lessons", solution: "Retrospectives accumulate in Genome. Lineage archives all generations" },
      { problem: "Collaboration chaos", solution: "Genome-first merge workflow reconciles parallel branches — design conflicts before code conflicts" },
    ],
    threeLayer: "4-Layer Architecture",
    threeLayerDesc: "REAP consists of four interconnected layers: Knowledge provides the basis, Vision drives direction, Generations execute the work, and Civilization is what evolves.",
    layers: [
      { label: "Knowledge", sub: "Genome + Environment", path: ".reap/genome/ + .reap/environment/", desc: "Genome (prescriptive — architecture, conventions, constraints) and Environment (descriptive — tech stack, source structure, domain). The basis for each generation's work." },
      { label: "Vision", sub: "Goals + Memory", path: ".reap/vision/", desc: "Long-term goals and direction. Vision drives each generation — it determines what goal to pursue next. Memory persists context across sessions." },
      { label: "Generation", sub: "Evolution Cycle", path: ".reap/life/ → .reap/lineage/", desc: "Each Generation runs Learning → Planning → Implementation → Validation → Completion. On completion, archived to lineage." },
      { label: "Civilization", sub: "Source Code", path: "your codebase/", desc: "Everything outside .reap/. What generations evolve. Lessons feed back into Knowledge." },
    ],
    lifecycle: "Generation Lifecycle",
    lifecycleDesc: "Each generation progresses through five stages, from goal definition to retrospective and archiving.",
    stages: [
      ["Learning", "Explore project, build context, review genome and environment", "01-learning.md"],
      ["Planning", "Break down tasks, choose approach, map dependencies", "02-planning.md"],
      ["Implementation", "Build with AI + human collaboration", "03-implementation.md"],
      ["Validation", "Run tests, verify completion criteria", "04-validation.md"],
      ["Completion", "Reflect + fitness feedback + adapt genome + archive (4 phases)", "05-completion.md"],
    ],
    stageHeaders: ["Stage", "What happens", "Artifact"],
    installation: "Installation",
    installStep1: "1. Install globally",
    installStep2: "2. Open Claude Code, initialize and start",
    installStep3: "",
    installNote: [
      { before: "", code: "/reap.evolve", after: " runs the full generation lifecycle — Learning through Completion — autonomously. You can also control stages manually with " },
      { linkText: "stage commands", after: "." },
    ],
    keyConcepts: "Key Concepts",
    concepts: [
      { label: "Genome Immutability", desc: "The Genome is never modified during a normal generation. Issues are logged as genome-change backlog items and applied at Completion's adapt phase. (Embryo generations allow free modification.)" },
      { label: "Backlog & Deferral", desc: "Items in .reap/life/backlog/ carry a type: genome-change | environment-change | task. Partial completion is normal — deferred tasks carry forward to the next generation." },
      { label: "Vision & Memory", desc: "Vision (.reap/vision/) drives each generation's goal. Memory is a 3-tier free-form recording system (longterm/midterm/shortterm) for AI to persist context across sessions." },
      { label: "Lineage", desc: "Completed generations are archived in .reap/lineage/. Retrospectives accumulate there. Over time they're compressed (Level 1 → gen-XXX-{hash}.md, Level 2 → epoch.md) to stay manageable." },
      { label: "4-Layer Architecture", desc: "Vision (goals + memory), Knowledge (genome + environment), Generation (lifecycle), Civilization (source code)." },
      { label: "Distributed Workflow", desc: "Multiple developers or agents work in parallel on separate branches. /reap.pull fetches and runs a genome-first merge generation. /reap.push validates state before pushing. No server needed — Git is the transport layer." },
    ],
    documentation: "Documentation",
    docLinks: [
      { href: "/docs/introduction", title: "Introduction", desc: "What is REAP, why use it, 4-layer architecture." },
      { href: "/docs/quick-start", title: "Quick Start", desc: "Install and run your first generation step by step." },
      { href: "/docs/core-concepts", title: "Core Concepts", desc: "Genome, Life Cycle, Backlog & Deferral in depth." },
      { href: "/docs/lifecycle", title: "Lifecycle", desc: "/reap.evolve, stage commands, micro loop, completion phases." },
      { href: "/docs/self-evolving", title: "Self-Evolving", desc: "Clarity-driven interaction, cruise mode, memory, gap-driven evolution." },
      { href: "/docs/command-reference", title: "Command Reference", desc: "/reap.evolve, stage commands, /reap.status — all slash commands." },
      { href: "/docs/hook-reference", title: "Hook Reference", desc: "Lifecycle hooks: file-based event hooks, conditions, ordering." },
      { href: "/docs/migration-guide", title: "Migration Guide", desc: "Upgrading from v0.15 — step-by-step migration with resume support." },
      { href: "/docs/comparison", title: "Comparison", desc: "How REAP compares to traditional spec-driven development tools." },
      { href: "/docs/advanced", title: "Advanced", desc: "Signature-based locking, lineage compression, presets, entry modes." },
    ],
  },

  // Introduction Page
  intro: {
    title: "Introduction",
    breadcrumb: "Getting Started",
    description: "REAP (Recursive Evolutionary Autonomous Pipeline) is a development pipeline where AI and humans collaborate to incrementally evolve an Application across successive Generations. Rather than treating each AI session as an isolated task, REAP maintains continuity through a structured lifecycle and a living knowledge base called the Genome.",
    threeLayer: "4-Layer Architecture",
    layerItems: [
      { label: "Vision", sub: "Goals + Memory", path: ".reap/vision/" },
      { label: "Knowledge", sub: "Genome + Environment", path: ".reap/genome/ + .reap/environment/" },
      { label: "Generation", sub: "Evolution Cycle", path: ".reap/life/ → .reap/lineage/" },
      { label: "Civilization", sub: "Source Code", path: "your codebase/" },
    ],
    layerDescs: [
      "Long-term goals and direction. Vision drives each generation — it determines what goal to pursue next. Memory is a 3-tier free-form recording system for AI to persist context across sessions.",
      "Genome (prescriptive — architecture, conventions, constraints) and Environment (descriptive — tech stack, source structure, domain). The basis for each generation's work.",
      "A single evolution cycle driven by Vision, grounded in Knowledge. Follows Learning → Planning → Implementation → Validation → Completion.",
      "Source code and all project artifacts outside .reap/. What generations evolve. Lessons feed back into Knowledge.",
    ],
    whyReap: "Why REAP?",
    problemHeader: "Problem",
    solutionHeader: "REAP Solution",
    problems: [
      ["Context Loss — Agent forgets project context every session", "CLAUDE.md + Memory — Every session loads genome, environment, and reap-guide. Memory persists context across sessions."],
      ["Scattered Development — Code modified with no clear goal", "Generation Model — Each generation focuses on one goal with a structured lifecycle"],
      ["Design–Code Drift — Documentation diverges from code", "Genome Mutation via Backlog — Design defects logged during implementation, applied at Completion adapt phase"],
      ["Forgotten Lessons — Insights from past work are lost", "Lineage & Memory — Lessons accumulate in genome and memory, generations archived and compressed"],
      ["Collaboration Chaos — Parallel work leads to conflicting changes", "Distributed Workflow — Genome-first merge reconciles design before code, DAG lineage tracks parallel branches"],
    ],
    fourAxis: "4-Layer Architecture",
    fourAxisDesc: "REAP consists of four interconnected layers:",
    axes: [
      { axis: "Vision", path: ".reap/vision/", desc: "Long-term goals and direction. Goals + memory for cross-session context." },
      { axis: "Knowledge", path: ".reap/genome/ + .reap/environment/", desc: "Genome (prescriptive) + Environment (descriptive). The basis for each generation." },
      { axis: "Generation", path: ".reap/life/", desc: "Current generation's lifecycle. Progress state and artifacts." },
      { axis: "Civilization", path: "your codebase/ + .reap/lineage/", desc: "Source code + archive of completed generations." },
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
    evolveDesc: "It runs the entire generation lifecycle — Learning, Planning, Implementation, Validation, and Completion — autonomously. The AI agent drives through all stages, only stopping when genuinely blocked. This is the command you'll use most for day-to-day development.",
    manualControl: "Manual stage control",
    manualControlDesc: "You can also control each stage individually:",
    whatHappens: "What happens during a generation",
    stageHeaders: ["Stage", "What happens", "Artifact"],
    stages: [
      ["Learning", "Explore project, build context, review genome and environment", "01-learning.md"],
      ["Planning", "Break down tasks, choose approach, map dependencies", "02-planning.md"],
      ["Implementation", "Build with AI + human collaboration", "03-implementation.md"],
      ["Validation", "Run tests, verify completion criteria", "04-validation.md"],
      ["Completion", "Reflect, collect fitness feedback, adapt genome, archive", "05-completion.md"],
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
    fourAxisTitle: "4-Layer Architecture",
    fourAxisDesc: "REAP consists of four interconnected layers:",
    axes: [
      { axis: "Vision", path: ".reap/vision/", desc: "Long-term goals and direction. Goals drive each generation. Memory persists context across sessions.", href: "/docs/self-evolving" },
      { axis: "Knowledge", path: ".reap/genome/ + .reap/environment/", desc: "Genome (prescriptive — how to build) + Environment (descriptive — what exists). The basis for each generation.", href: "/docs/genome" },
      { axis: "Generation", path: ".reap/life/", desc: "A single evolution cycle driven by Vision, grounded in Knowledge. Follows Learning → Planning → Implementation → Validation → Completion.", href: "/docs/lifecycle" },
      { axis: "Civilization", path: "your codebase/", desc: "Source code and all project artifacts outside .reap/. What generations evolve. Lessons feed back into Knowledge.", href: "/docs/lineage" },
    ],
    principlesTitle: "Key Principles",
    principles: [
      { name: "Genome Immutability", desc: "Never modified during a normal generation. Changes go through backlog → Completion adapt phase. (Embryo generations allow free modification.)" },
      { name: "Human Judges Fitness", desc: "No quantitative metrics. The human's natural language feedback is the only fitness signal." },
      { name: "Clarity-Driven Interaction", desc: "The AI adjusts communication depth based on context clarity — from active dialogue to autonomous execution. See Self-Evolving Features for details." },
    ],
    lifecycleTitle: "Lifecycle Overview",
    lifecycleDesc: "Each generation follows five stages, producing artifacts at each step:",
    stageHeaders: ["Stage", "What happens", "Artifact"],
    stages: [
      ["Learning", "Explore project, build context, review genome and environment", "01-learning.md"],
      ["Planning", "Task decomposition + implementation plan", "02-planning.md"],
      ["Implementation", "Code with AI + human collaboration", "03-implementation.md"],
      ["Validation", "Run tests, verify completion criteria", "04-validation.md"],
      ["Completion", "Reflect + fitness feedback + adapt genome + archive (4 phases)", "05-completion.md"],
    ],
    sessionInitTitle: "Session Context Loading",
    sessionInitDesc: "When you open a REAP project, CLAUDE.md instructs the AI agent to read genome, environment, and the REAP guide. The agent immediately loads the project's knowledge and understands the current state.",
    sessionInitAlt: "REAP session context loading — genome, environment, and guide loaded via CLAUDE.md",
    evolutionFlowTitle: "Evolution Flow",
    evolutionFlowDesc: "Knowledge compounds across generations. Each generation evolves the Genome, and lessons accumulate in Lineage:",
  },

  // Workflow Page
  workflow: {
    title: "Workflow",
    breadcrumb: "Guide",
    intro: "A generation is the fundamental unit of work in REAP. Each generation carries a single goal through five stages, producing artifacts along the way. Here's what happens at each stage and how they connect.",
    evolveTitle: "/reap.evolve — The Primary Way to Work",
    evolveDesc: "Most of the time, you run /reap.evolve and let the AI agent drive through all stages autonomously. It can delegate the entire generation to a subagent that runs through all stages, surfacing only when genuinely blocked (ambiguous goal, significant trade-off, genome conflict, or unexpected error). The subagent handles starting, executing each stage, advancing, and archiving.",
    evolveNote: "For fine-grained control, you can run individual stage commands. See Command Reference for details.",
    stageWalkthrough: "Stage-by-Stage Walkthrough",
    stageDetails: [
      {
        title: "1. Learning",
        desc: "Explore the project and build context. The AI reviews genome, environment, lineage, and assesses the clarity level. It builds a thorough understanding of the current state before any goal is set.",
        output: "01-learning.md — context exploration, genome/environment review, clarity assessment.",
      },
      {
        title: "2. Planning",
        desc: "Break the goal into actionable tasks. The AI reads the context from learning, references genome conventions and constraints, and proposes an implementation plan with architecture decisions.",
        output: "02-planning.md — phased task list, dependencies, parallelizable tasks marked with [P].",
      },
      {
        title: "3. Implementation",
        desc: "Build the code. Tasks are executed sequentially, with each completion recorded immediately. When genome or environment defects are discovered, they're logged to the backlog — never applied directly. Tasks that depend on pending genome changes are marked [deferred].",
        output: "03-implementation.md — completed tasks table, deferred tasks, genome-change backlog items.",
      },
      {
        title: "4. Validation",
        desc: "Verify the work. Run tests, lint, build, and type checks. Check completion criteria and apply minor fixes (5 min or less, no design changes). Verdict is pass, partial (some criteria deferred), or fail.",
        output: "04-validation.md — test results with actual command output, criteria check table, verdict.",
      },
      {
        title: "5. Completion (4 phases)",
        desc: "Reflect: write retrospective + refresh environment. Fitness: collect human feedback (or self-assessment in cruise mode). Adapt: review genome, apply backlog changes, propose next generation goals. Commit: archive to lineage + git commit.",
        output: "05-completion.md — retrospective, fitness feedback, genome changelog, next generation hints.",
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
      ["CLI (reap)", "Project setup and maintenance — init, status, run"],
      ["AI Agent", "Workflow executor — performs each stage's work via slash commands"],
      ["Human", "Decision maker — sets goals, reviews code, provides fitness feedback"],
    ],
  },

  // CLI Page
  cli: {
    title: "CLI Reference",
    breadcrumb: "Reference",
    initTitle: "reap init",
    initDesc: "Initialize a new REAP project. Auto-detects greenfield (empty project) vs adoption (existing codebase). Creates the .reap/ structure and installs slash commands and hooks.",
    initHeaders: ["Option", "Values", "Description"],
    initOptions: [
      ["--mode", "greenfield | adoption", "Override auto-detected project entry mode"],
      ["--repair", "", "Repair a broken .reap/ structure without re-initializing"],
      ["--migrate", "", "Migrate from v0.15 to v0.16 structure"],
    ],
    statusTitle: "reap status",
    statusDesc: "Show current project and generation status.",
    statusNote: "Displays project name, active generation (id, goal, stage), total completed generations, and REAP version.",
    runTitle: "reap run",
    runDesc: "Execute a lifecycle command directly. Used internally by slash commands and for fine-grained stage control.",
    runNote: "Examples: reap run start --goal \"...\", reap run learning, reap run completion --phase reflect. Each command returns structured JSON instructions for the AI agent.",
    fixTitle: "reap fix",
    fixDesc: "Diagnose and repair the .reap/ directory structure. Use --check for read-only mode (report issues without fixing).",
    fixNote: "Checks for missing directories, verifies config.yml exists, validates current.yml stage, and recreates missing structure. With --check, performs structural integrity check without modifications.",
    cleanTitle: "reap clean",
    cleanDesc: "Reset REAP project with interactive options.",
    cleanNote: "Provides interactive prompts to selectively reset parts of the REAP project (e.g., life, lineage, genome).",
    destroyTitle: "reap destroy",
    destroyDesc: "Remove all REAP files from project.",
    destroyNote: "Completely removes the .reap/ directory and all REAP-related files from the project. Requires typing \"yes destroy\" to confirm.",
    makeBacklogTitle: "reap make backlog",
    makeBacklogDesc: "Create a backlog item. The only supported way to create backlog files.",
    makeBacklogNote: "Options: --type <genome-change|environment-change|task> --title <title> [--body <body>] [--priority <priority>]. Never create backlog files directly.",
    cruiseTitle: "reap cruise",
    cruiseDesc: "Set cruise mode — pre-approve N generations for autonomous execution.",
    cruiseNote: "Usage: reap cruise <count>. Each generation runs the full lifecycle with self-assessment. If uncertainty or risk is detected, cruise pauses and requests human feedback.",
    helpTitle: "reap help",
    helpDesc: "Print CLI commands, slash commands, and a workflow summary.",
    helpNote: "Outputs help text in the configured language (currently en and ko supported). Falls back to English if the language file is not found.",
  },

  // Command Reference Page
  commands: {
    title: "Command Reference",
    breadcrumb: "Reference",
    intro: "REAP has two types of commands: CLI commands and Slash commands.",
    cliCommandsDesc: "CLI commands (reap ...) run in your terminal. They handle project setup and maintenance — init, status, run, fix, clean, destroy, make backlog, cruise. They do not interact with the AI agent.",
    slashCommandsDesc: "Slash commands (/reap.*) run inside AI agent CLIs (Claude Code). They drive the development workflow — the AI agent reads the prompt and executes the described task interactively with you.",
    slashTitle: "Slash Commands",
    slashIntro: "All REAP interactions go through /reap.* slash commands. These are the primary interface for both users and AI agents.",
    commandHeaders: ["Command", "Description"],
    normalTitle: "Lifecycle Commands",
    normalCommands: [
      ["/reap.evolve", "Run an entire generation lifecycle (recommended). The primary command for day-to-day development. Loops through all stages — learning, planning, implementation, validation, completion."],
      ["/reap.start", "Start a new generation. Prompts for a goal, creates current.yml, and sets stage to learning."],
      ["/reap.next", "Advance to the next lifecycle stage. Verifies artifact exists and nonce chain before advancing."],
      ["/reap.back", "Return to a previous stage (micro loop). Usage: /reap.back [--reason \"<reason>\"]"],
      ["/reap.abort", "Abort current generation. 2-phase process: confirm (shows what will happen) then execute. Options: --phase execute, --reason, --source-action <rollback|stash|hold|none>, --save-backlog."],
    ],
    mergeTitle: "Collaboration Commands",
    mergeCommands: [
      ["/reap.merge", "Merge lifecycle for parallel branches. Usage: /reap.merge [--type merge --parents \"<branchA>,<branchB>\"]"],
      ["/reap.pull", "Fetch remote changes and detect merge opportunities."],
      ["/reap.push", "Validate REAP state (warn if generation in progress) and push the current branch to remote."],
    ],
    generalTitle: "General Commands",
    generalCommands: [
      ["/reap.init", "Initialize REAP in a project. Auto-detects greenfield vs existing codebase."],
      ["/reap.knowledge", "Manage genome, environment, and context knowledge. Subcommands: reload, genome, environment."],
      ["/reap.config", "View/edit project configuration (.reap/config.yml)."],
      ["/reap.status", "Check current generation state, stage progress, and backlog summary."],
      ["/reap.help", "Show available commands and topics."],
      ["/reap.run", "Execute a lifecycle command directly. For fine-grained stage and phase control."],
      ["/reap.update", "Run migration from v0.15 to v0.16."],
    ],
    commandStructure: "Script Orchestrator Architecture",
    commandStructureDesc: "Every slash command is a 1-line .md wrapper that calls reap run <cmd>. The TypeScript script handles all deterministic logic and returns structured JSON instructions for the AI agent. Pattern: Gate (precondition check) → Steps (work execution) → Artifact (recorded to .reap/life/).",
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
      ["Learning", "Explore project, build context", "Review target generation artifacts, identify corrections needed"],
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
      ["project", "Project name (set during init)"],
      ["language", "Language for artifacts and user interactions (e.g. korean, english, japanese). Default: english"],
      ["autoSubagent", "Auto-delegate /reap.evolve to a subagent via Agent tool (default: true)"],
      ["strictEdit", "Restrict code changes to REAP lifecycle (default: false). See Strict Mode below."],
      ["strictMerge", "Restrict direct git pull/push/merge — use REAP commands instead (default: false). See Strict Mode below."],
      ["agentClient", "AI agent client to use (default: claude-code). Determines which adapter is used for skill deployment and session hooks"],
      ["cruiseCount", "When present, enables cruise mode. Format: current/total (e.g. 1/5). Removed automatically after cruise completes"],
    ],
    strictMode: "Strict Mode",
    strictModeDesc: "Strict mode controls what the AI agent is allowed to do. Two independent settings:",
    strictConfigExample: `strictEdit: true    # Restrict code changes to REAP lifecycle
strictMerge: true   # Restrict raw git pull/push/merge`,
    strictEditTitle: "strictEdit — Code Modification Control",
    strictEditDesc: "When enabled, the AI agent cannot modify code outside the REAP workflow.",
    strictHeaders: ["Context", "Behavior"],
    strictRules: [
      ["No active generation / non-implementation stage", "Code modifications are fully blocked"],
      ["Implementation stage", "Only modifications within the scope of 02-planning.md are allowed"],
      ["Escape hatch", 'User explicitly requests "override" or "bypass strict" — bypass applies to that specific action only, then strict mode re-engages'],
    ],
    strictMergeTitle: "strictMerge — Git Command Control",
    strictMergeDesc: "When enabled, direct git pull, git push, and git merge commands are restricted. The agent will guide users to use REAP slash commands instead (/reap.pull, /reap.push, /reap.merge).",
    strictNote: "Both are disabled by default. Reading files, analyzing code, and answering questions are always allowed regardless of strict mode.",
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
      ["order", "Numeric execution order when multiple hooks exist for the same event (default: 50, lower runs first)"],
    ],
    events: "Events",
    normalEventsTitle: "Normal Lifecycle Events",
    mergeEventsTitle: "Merge Lifecycle Events",
    eventHeaders: ["Event", "When it fires"],
    eventItems: [
      ["onLifeStarted", "After /reap.start creates a new generation"],
      ["onLifeLearned", "After learning stage completes"],
      ["onLifePlanned", "After planning stage completes"],
      ["onLifeImplemented", "After implementation stage completes"],
      ["onLifeValidated", "After validation stage completes"],
      ["onLifeCompleted", "After completion + archiving (runs after git commit)"],
      ["onLifeTransited", "After any stage transition (generic)"],
      ["onMergeStarted", "After merge generation is created"],
      ["onMergeDetected", "After detect stage completes"],
      ["onMergeMated", "After mate stage completes (genome resolved)"],
      ["onMergeMerged", "After merge stage completes (source merged)"],
      ["onMergeReconciled", "After reconcile stage completes (genome-source consistency verified)"],
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
    sessionStart: "Session Context Loading",
    sessionStartDesc1: "REAP adds a section to CLAUDE.md that instructs the AI agent to read genome, environment, and the REAP guide at every session start. This ensures the agent always has full project context.",
    sessionStartDesc2: "The REAP guide (~/.reap/reap-guide.md) is installed globally and updated automatically when the package is upgraded. CLAUDE.md is created or updated during 'reap init'.",
    sessionStartNote: "",
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
      ["adoption", "Apply REAP to an existing codebase. Genome starts from templates and is populated during the first generation's Learning stage."],
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
      { name: "Reconcile", desc: "Verify genome-source consistency after merge. AI compares genome and source code. User confirms any inconsistencies found. If issues exist, regress to Merge or Mate.", artifact: "04-reconcile.md" },
      { name: "Validation", desc: "Run all mechanical testing commands (test, lint, build, type check). If any fail, regress to Merge or Mate.", artifact: "05-validation.md" },
      { name: "Completion", desc: "Commit the merged result. Record the merge in meta.yml with type: merge and both parents. Archive to lineage.", artifact: "06-completion.md" },
    ],
    stageHeaders: ["Stage", "What happens", "Artifact"],
    conflictTypes: "Conflict Types",
    conflictHeaders: ["Type", "Description", "Resolution"],
    conflicts: [
      ["WRITE-WRITE", "Same genome file modified on both branches", "Human decides: keep A, keep B, or merge"],
      ["CROSS-FILE", "Different genome files modified, but both branches changed genome", "Human reviews for logical compatibility"],
      ["Source conflict", "Git merge conflict in source code", "Resolved guided by finalized genome"],
      ["Semantic conflict", "Code merges cleanly but contradicts the genome (architecture, conventions, business rules)", "Detected in Reconcile stage — AI compares genome and source, user confirms resolution"],
      ["No conflict", "No genome or source conflicts", "Proceeds automatically"],
    ],
    regression: "Merge Regression",
    regressionDesc: "Validation or Reconcile failure can regress to Merge or Mate. Merge can regress to Mate if a genome issue is discovered. Regression rules follow the same pattern as normal generations — reason recorded in timeline and artifact.",
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
      { cmd: "/reap.merge.reconcile", desc: "Verify genome-source consistency. AI compares genome and source, user confirms inconsistencies." },
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
      ["onMergeReconciled", "After reconcile stage completes (genome-source consistency verified)"],
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
      { title: "No cross-session memory", desc: "Most AI development tools lose context between sessions. REAP's CLAUDE.md + 3-tier Memory system automatically restores full project context (genome, environment, vision, memory) in every new session." },
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
├── application.md     # Project identity, architecture, conventions
├── evolution.md       # AI behavior guide, evolution direction
└── invariants.md      # Absolute constraints (human-only edits)`,
    principlesTitle: "Three Files",
    principles: [
      "application.md — Project identity, architecture decisions, development conventions, and constraints.",
      "evolution.md — AI behavior guide, interaction principles, code quality rules, and soft lifecycle rules.",
      "invariants.md — Absolute constraints that can never be violated. Only the human can modify this file.",
    ],
    immutabilityTitle: "Genome Immutability",
    immutabilityDesc: "The Genome is never modified during a normal generation. Issues discovered during Implementation are recorded as genome-change backlog items and applied only during the Completion adapt phase.",
    immutabilityWhy: "Exception: Embryo generations (early-stage projects) allow free genome modification during any stage. Once the project matures, the AI proposes transitioning from embryo to normal during the adapt phase, and the human approves.",
    contextTitle: "Always Loaded",
    contextDesc: "All three genome files are fully loaded into the AI agent's context at session start via CLAUDE.md. The agent always has access to your project's architecture, conventions, and constraints — no manual briefing needed.",
    evolutionTitle: "Evolution through Generations",
    evolutionDesc: "At the end of each generation (Completion adapt phase), genome-change backlog items are reviewed and applied to the Genome. This ensures the Genome evolves deliberately, informed by what actually happened during the generation.",
    syncTitle: "Knowledge Management",
    syncDesc: "Use /reap.knowledge to review and manage the Genome and Environment. The command provides options to reload context, inspect genome files, and manage environment data.",
  },

  // Environment Page
  environmentPage: {
    title: "Environment",
    breadcrumb: "Guide",
    intro: "Environment is the project's descriptive knowledge — what exists now. It captures tech stack, source structure, build configuration, domain knowledge, and code dependencies. Unlike Genome (prescriptive — how to build), Environment describes the current state.",
    structureTitle: "2-Tier Structure",
    structure: `.reap/environment/
├── summary.md      # Always loaded (~100 lines) — tech stack, source structure, build, tests
├── domain/         # Domain knowledge (on-demand)
├── resources/      # External reference docs — API docs, SDK specs (on-demand)
├── docs/           # Project reference docs — design docs, specs (on-demand)
└── source-map.md   # Code structure + dependencies (on-demand)`,
    layersTitle: "Tiers",
    layerHeaders: ["Tier", "Loading", "Content", "Limit"],
    layerItems: [
      ["summary.md", "Always loaded at session start", "Tech stack, source structure, build config, test setup. The AI's baseline understanding.", "~100 lines"],
      ["domain/", "On-demand (loaded when needed)", "Domain knowledge — business rules, API specs, infrastructure details.", "No limit"],
      ["resources/", "On-demand (loaded when needed)", "External reference documents — API docs, SDK specs, third-party documentation.", "No limit"],
      ["docs/", "On-demand (loaded when needed)", "Project reference documents — design docs, specs, architecture decisions.", "No limit"],
      ["source-map.md", "On-demand (loaded when needed)", "Current code structure and dependency map.", "No limit"],
    ],
    immutabilityTitle: "Environment Immutability",
    immutabilityDesc: "Like the Genome, the Environment is never modified directly during a generation. Changes are recorded as environment-change backlog items and applied during the Completion reflect phase.",
    immutabilityWhy: "By capturing changes in the backlog rather than rewriting Environment mid-generation, the generation completes on a stable map. The update happens once, deliberately, during the reflect phase with full context of what was built.",
    flowTitle: "Loading Strategy",
    flowDesc: "summary.md is always loaded at session start. domain/ and source-map.md are loaded on-demand when the AI needs deeper context for a specific task.",
    syncTitle: "Knowledge Management",
    syncDesc: "Use /reap.knowledge to review and manage the Environment. During the Completion reflect phase, the AI automatically refreshes the environment to reflect changes made during the generation.",
    syncSources: [
      { label: "summary.md", role: "Always loaded", desc: "Compact overview of the project's technical state. Loaded into every session so the AI has baseline context." },
      { label: "domain/ + resources/ + docs/ + source-map.md", role: "On-demand", desc: "Deeper knowledge loaded when the AI needs specific domain, external reference, or structural context for the current task." },
    ],
    syncContrast: "The 2-tier strategy balances context window efficiency (summary.md is small) with depth (domain/ and source-map.md are available when needed).",
  },

  // Lifecycle Page (renamed from Workflow)
  lifecyclePage: {
    title: "Lifecycle",
    breadcrumb: "Guide",
    intro: "The lifecycle is the heartbeat of REAP — each generation flows through 5 stages (Learning → Planning → Implementation → Validation → Completion), producing artifacts at every step. Completion has 4 phases: reflect → fitness → adapt → commit.",
    structureTitle: "Artifacts Structure",
    structure: `.reap/life/
├── current.yml          # Current generation state (id, goal, stage, timeline)
├── 01-learning.md       # Context exploration, genome/environment review
├── 02-planning.md       # Task decomposition, dependencies
├── 03-implementation.md # Implementation log, changes made
├── 04-validation.md     # Test results, completion criteria check
├── 05-completion.md     # Reflect + fitness + adapt + commit
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
│   ├── 01-learning.md
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
      ["task", "Deferred work, tech debt, feature ideas", "Referenced as goal candidates in next generation"],
      ["genome-change", "Genome modifications discovered mid-generation", "Applied to Genome during Completion adapt phase"],
      ["environment-change", "External environment changes discovered mid-generation", "Applied to Environment during Completion reflect phase"],
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
    breakingBannerDesc: "Automatic updates from v0.15.x to v0.16.x are blocked. Run /reap.update to upgrade manually.",
    breakingBannerItems: [
      "REAP transitions to a Self Evolving Pipeline — AI collaborates with humans to self-evolve software through a recursive pipeline.",
      "Lifecycle changed: learning → planning → implementation → validation → completion (new Learning stage added, Objective and Planning merged into Planning).",
      "Slash commands restructured for optimal skill matching: 10 auto-matching skills + 6 direct-invocation-only skills.",
      "CLI commands removed from user-facing interface. All operations now through slash commands only (CLI commands reserved for internal use).",
    ],
    versions: [
      {
        version: "0.16.0",
        notes: "Complete rewrite as a Self-Evolving Pipeline. New genome structure (application.md, evolution.md, invariants.md). Learning stage replaces Objective. Clarity-driven interaction. Cruise mode for autonomous multi-generation execution. Vision layer with 3-tier memory (longterm/midterm/shortterm). Merge lifecycle adds Reconcile stage for genome-source consistency. /reap.knowledge replaces /reap.sync. 2-phase /reap.abort. File-based hooks with conditions and ordering.",
      },
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
