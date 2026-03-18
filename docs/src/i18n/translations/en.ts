export const en = {
  // Nav & Sidebar
  nav: {
    getStarted: "Get Started",
    groups: {
      gettingStarted: "Getting Started",
      guide: "Guide",
      reference: "Reference",
      other: "Other",
    },
    items: {
      introduction: "Introduction",
      quickStart: "Quick Start",
      coreConcepts: "Core Concepts",
      workflow: "Workflow",
      advanced: "Advanced",
      cliReference: "CLI Reference",
      commandReference: "Command Reference",
      hookReference: "Hook Reference",
      comparison: "Comparison",
      configuration: "Configuration",
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
    ],
    threeLayer: "3-Layer Model",
    threeLayerDesc: "Every REAP project consists of three conceptual layers. The Genome defines what to build. The Evolution process builds it. The Civilization is the result.",
    layers: [
      { label: "Genome", sub: "Design & Knowledge", path: ".reap/genome/", desc: "Architecture principles, business rules, conventions, technical constraints. Never modified mid-generation." },
      { label: "Evolution", sub: "Generational Process", path: ".reap/life/ → .reap/lineage/", desc: "Each Generation runs Objective → Planning → Implementation → Validation → Completion. On completion, archived to lineage." },
      { label: "Civilization", sub: "Source Code", path: "your codebase/", desc: "Everything outside .reap/. Grows and improves with each completed generation." },
    ],
    lifecycle: "Generation Lifecycle",
    lifecycleDesc: "Each generation progresses through five stages, from goal definition to retrospective and archiving.",
    stages: [
      ["Objective", "Define goal, requirements, and acceptance criteria", "01-objective.md"],
      ["Planning", "Break down tasks, choose approach, map dependencies", "02-planning.md"],
      ["Implementation", "Build with AI + human collaboration", "03-implementation.md"],
      ["Validation", "Run tests, verify completion criteria", "04-validation.md"],
      ["Completion", "Retrospective + apply Genome changes + archive generation", "05-completion.md"],
    ],
    stageHeaders: ["Stage", "What happens", "Artifact"],
    installation: "Installation",
    installStep1: "1. Install globally",
    installStep2: "2. Initialize your project",
    installStep3: "3. Run your first generation (in Claude Code)",
    installNote: [
      { before: "", code: "/reap.evolve", after: " runs the full generation lifecycle — Objective through Completion — interactively. You can also control each stage manually with " },
      { linkText: "stage commands", after: "." },
    ],
    keyConcepts: "Key Concepts",
    concepts: [
      { label: "Genome Immutability", desc: "The Genome is never modified mid-generation. Design issues discovered during Implementation are logged to the backlog as genome-change items and applied only at Completion." },
      { label: "Backlog & Deferral", desc: "Items in .reap/life/backlog/ carry a type: genome-change | environment-change | task. Partial completion is normal — deferred tasks carry forward to the next generation's Objective." },
      { label: "SessionStart Hook", desc: "Every new AI agent session automatically injects the full Genome, current generation state, and workflow rules — eliminating context loss between sessions." },
      { label: "Lineage", desc: "Completed generations are archived in .reap/lineage/. Retrospectives accumulate there. Over time they're compressed (Level 1 → gen-XXX.md, Level 2 → epoch-XXX.md) to stay manageable." },
      { label: "Four-Axis Structure", desc: "Everything under .reap/ maps to four axes: Genome (design), Environment (external context), Life (current generation), Lineage (archive of past generations)." },
    ],
    documentation: "Documentation",
    docLinks: [
      { href: "/docs/introduction", title: "Introduction", desc: "What is REAP, why use it, 3-layer model, four-axis structure." },
      { href: "/docs/quick-start", title: "Quick Start", desc: "Install and run your first generation step by step." },
      { href: "/docs/core-concepts", title: "Core Concepts", desc: "Genome, Life Cycle, Backlog & Deferral in depth." },
      { href: "/docs/workflow", title: "Workflow", desc: "/reap.evolve, stage commands, micro loop, hooks." },
      { href: "/docs/cli", title: "CLI Reference", desc: "reap init, status, update, fix with all options." },
      { href: "/docs/commands", title: "Command Reference", desc: "/reap.evolve, stage commands, /reap.status — all slash commands." },
      { href: "/docs/hooks", title: "Hook Reference", desc: "Lifecycle hooks: command and prompt types, events, SessionStart." },
      { href: "/docs/comparison", title: "Comparison", desc: "How REAP compares to traditional spec-driven development tools." },
      { href: "/docs/advanced", title: "Advanced", desc: "Lineage compression, presets, entry modes." },
    ],
  },

  // Introduction Page
  intro: {
    title: "Introduction",
    breadcrumb: "Getting Started",
    description: "REAP (Recursive Evolutionary Autonomous Pipeline) is a development pipeline where AI and humans collaborate to incrementally evolve an Application across successive Generations. Rather than treating each AI session as an isolated task, REAP maintains continuity through a structured lifecycle and a living knowledge base called the Genome.",
    threeLayer: "3-Layer Model",
    layerItems: [
      { label: "Genome", sub: "Design & Knowledge", path: ".reap/genome/" },
      { label: "Evolution", sub: "Generational Process", path: ".reap/life/ → .reap/lineage/" },
      { label: "Civilization", sub: "Source Code", path: "your codebase/" },
    ],
    layerDescs: [
      "Design and knowledge for building the Application. Architecture principles, business rules, conventions, and technical constraints. Stored in .reap/genome/.",
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
    ],
    fourAxis: "Four-Axis Structure",
    fourAxisDesc: "REAP organizes everything under .reap/ into four axes:",
    axes: [
      { axis: "Genome", path: ".reap/genome/", desc: "Genetic information. Principles, rules, architecture decisions." },
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
      ["Objective", "Define goal, requirements, and acceptance criteria", "01-objective.md"],
      ["Planning", "Break down tasks, choose approach, map dependencies", "02-planning.md"],
      ["Implementation", "Build with AI + human collaboration", "03-implementation.md"],
      ["Validation", "Run tests, verify completion criteria", "04-validation.md"],
      ["Completion", "Retrospective + apply Genome changes + archive", "05-completion.md"],
    ],
  },

  // Core Concepts Page
  concepts: {
    title: "Core Concepts",
    breadcrumb: "Concepts",
    genomeTitle: "Genome",
    genomeDesc: "The Genome is the application's genetic information — architecture principles, business rules, conventions, and technical constraints.",
    principles: "Principles",
    genomeImmutability: "Genome Immutability Principle",
    genomeImmutabilityDesc: "The Genome is never modified directly during the current generation. Issues are recorded in the backlog and only applied at the Completion stage.",
    envImmutability: "Environment Immutability Principle",
    envImmutabilityDesc: "The Environment is never modified directly during the current generation. External changes are recorded in the backlog and applied at the Completion stage.",
    lifecycle: "Life Cycle",
    lifecycleDesc: "Each generation follows five stages:",
    stageHeaders: ["Stage", "What happens", "Artifact"],
    stages: [
      ["Objective", "Define goal, requirements, and acceptance criteria", "01-objective.md"],
      ["Planning", "Break down tasks, choose approach, map dependencies", "02-planning.md"],
      ["Implementation", "Build with AI + human collaboration", "03-implementation.md"],
      ["Validation", "Run tests, verify completion criteria", "04-validation.md"],
      ["Completion", "Retrospective + apply Genome changes + archive", "05-completion.md"],
    ],
    backlog: "Backlog & Deferral",
    backlogDesc: "All backlog items stored in .reap/life/backlog/ as markdown files with frontmatter:",
    backlogHeaders: ["Type", "Description"],
    backlogTypes: [
      { type: "genome-change", desc: "Applied to Genome at Completion stage." },
      { type: "environment-change", desc: "Applied to Environment at Completion stage." },
      { type: "task", desc: "Candidate goals for the next Objective." },
    ],
    statusField: "Each item also carries a status field:",
    statusHeaders: ["Status", "Description"],
    statuses: [
      { type: "pending", desc: "Not yet processed. Default value — absent field is treated as pending." },
      { type: "consumed", desc: "Processed in the current generation. Requires consumedBy: gen-XXX." },
    ],
    archivingNote: "At archiving time, consumed items move to lineage. pending items are carried forward to the next generation's backlog.",
    deferralNote: "Partial completion is normal — tasks depending on Genome changes are marked [deferred] and handed to the next generation.",
    evolutionFlow: "Evolution Flow Example",
  },

  // Workflow Page
  workflow: {
    title: "Workflow",
    breadcrumb: "Workflow",
    intro: "A generation is the fundamental unit of work in REAP. Each generation carries a single goal through five stages, producing artifacts along the way. Here's what happens at each stage and how they connect.",
    evolveTitle: "/reap.evolve — The Primary Way to Work",
    evolveDesc: "Most of the time, you run /reap.evolve and let the AI agent drive through all stages autonomously. It handles starting the generation, executing each stage, advancing between them, and archiving at the end. Routine per-stage confirmations are skipped — the agent proceeds without pausing unless it is genuinely blocked (ambiguous goal, significant trade-off decision, genome conflict, or unexpected error).",
    evolveNote: "For fine-grained control, you can run individual stage commands. See Command Reference for details.",
    stageWalkthrough: "Stage-by-Stage Walkthrough",
    stageDetails: [
      {
        title: "1. Objective",
        desc: "Define what this generation will accomplish. The AI agent scans the environment for external context, reviews the backlog for pending items, checks genome health, and then works with you to refine the goal.",
        output: "01-objective.md — goal, completion criteria (max 7, verifiable), functional requirements (max 10), scope, and genome gap analysis.",
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
        desc: 'Retrospect and evolve. Extract lessons learned (max 5), apply genome-change backlog items to the genome files, run garbage collection for tech debt, hand off deferred tasks to the next generation\'s backlog. When run standalone, genome changes require human confirmation; when called via /reap.evolve, the agent proceeds autonomously.',
        output: "05-completion.md — summary, retrospective, genome changelog. Then /reap.next archives everything to lineage.",
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
    statusTitle: "reap status",
    statusDesc: "Show current project and generation status.",
    statusNote: "Displays project name, entry mode, active generation (id, goal, stage), and total completed generations.",
    updateTitle: "reap update",
    updateDesc: "Sync commands, templates, and hooks to the latest version.",
    dryRunDesc: "Show what would be updated without applying changes.",
    fixTitle: "reap fix",
    fixDesc: "Diagnose and repair the .reap/ directory structure.",
    fixNote: "Checks for missing directories, verifies config.yml exists, validates current.yml stage, and recreates missing structure.",
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
    commands: [
      ["/reap.evolve", "Run an entire generation from start to finish. The primary command for day-to-day development. Loops through all stages autonomously — skips routine confirmations and only stops when genuinely blocked."],
      ["/reap.start", "Start a new generation. Scans backlog for pending items, asks for a goal, creates current.yml, and sets stage to objective."],
      ["/reap.objective", "Define the generation's goal, requirements, and acceptance criteria. Scans environment, reviews backlog, checks genome health."],
      ["/reap.planning", "Break down the objective into tasks with dependencies. Creates the implementation plan."],
      ["/reap.implementation", "Execute tasks from the plan. Records completed/deferred tasks and genome discoveries in the artifact."],
      ["/reap.validation", "Run validation commands from constraints.md. Check completion criteria. Verdict: pass / partial / fail."],
      ["/reap.completion", "Retrospective, apply genome changes from backlog, garbage collection, finalize."],
      ["/reap.next", "Advance to the next lifecycle stage. Creates the next artifact from template. Archives on completion."],
      ["/reap.back", "Return to a previous stage (micro loop). Records regression reason in timeline and artifact."],
      ["/reap.status", "Show current generation state, stage progress, backlog summary, timeline, and genome health."],
      ["/reap.sync", "Analyze source code and synchronize Genome. Direct update when no active generation; records to backlog otherwise."],
      ["/reap.help", "Provide contextual help with 24+ topics, including REAP introduction, anti-hallucination topic guard, and detailed explanations (workflow, genome, backlog, strict, agents, hooks, config, evolve, regression, minor-fix, compression, author, and all command names)."],
      ["/reap.update", "Check for REAP updates and upgrade to the latest version. Compares installed vs published version, updates the npm package, and syncs commands/templates/hooks."],
    ],
    lifecycleFlow: "Lifecycle Flow",
    lifecycleFlowDesc: "The typical flow when using /reap.evolve:",
    commandStructure: "Each Command Structure",
    commandStructureDesc: "Every slash command follows the same pattern: Gate (precondition check — stage must be correct, previous artifact must exist) → Steps (work execution with human interaction) → Artifact (progressively recorded to .reap/life/).",
  },

  // Configuration Page
  config: {
    title: "Configuration",
    breadcrumb: "Reference",
    intro: "REAP projects are configured through .reap/config.yml. This file is created during reap init and controls project settings, strict mode, and lifecycle hooks.",
    structure: "Config File Structure",
    fields: "Fields",
    fieldHeaders: ["Field", "Description"],
    fieldItems: [
      ["version", "Config schema version"],
      ["project", "Project name (set during init)"],
      ["entryMode", "How REAP was initialized: greenfield, migration, or adoption"],
      ["strict", "Enable strict mode to restrict code changes (see below)"],
      ["language", "Language for artifacts and user interactions (e.g. korean, english, japanese)"],
      ["autoUpdate", "Auto-update REAP on session start (default: false)"],
      ["agents", "Detected AI agents, managed by reap init/update (e.g. claude-code, opencode)"],
      ["hooks", "Lifecycle hooks (see Hook Reference)"],
    ],
    strictMode: "Strict Mode",
    strictModeDesc: "When strict: true is set, the AI agent is restricted from modifying code outside the REAP workflow. This ensures all changes go through the structured lifecycle.",
    strictHeaders: ["Context", "Behavior"],
    strictRules: [
      ["No active generation / non-implementation stage", "Code modifications are fully blocked"],
      ["Implementation stage", "Only modifications within the scope of 02-planning.md are allowed"],
      ["Escape hatch", 'User explicitly requests "override" or "bypass strict" to allow modifications'],
    ],
    strictNote: "Strict mode is disabled by default. Reading files, analyzing code, and answering questions are always allowed regardless of strict mode.",
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
    title: "Hook Reference",
    breadcrumb: "Reference",
    intro: "REAP hooks let you run automation at key lifecycle events. Define them in .reap/config.yml and the AI agent executes them at the right moment.",
    hookTypes: "Hook Types",
    hookTypesIntro: "Each hook entry supports one of two types:",
    commandType: "command",
    commandTypeDesc: "A shell command. Executed in the project root directory by the AI agent. Use for scripts, CLI tools, build commands.",
    promptType: "prompt",
    promptTypeDesc: "An AI agent instruction. The agent reads the prompt and performs the described task — code analysis, file modifications, documentation updates, etc. Use for tasks that require judgment.",
    hookTypeNote: "Only one of command or prompt per entry. Multiple entries per event are executed in order.",
    events: "Events",
    eventHeaders: ["Event", "When it fires"],
    eventItems: [
      ["onGenerationStart", "After /reap.start creates a new generation and writes current.yml"],
      ["onStageTransition", "After /reap.next advances to the next stage and creates the new artifact"],
      ["onGenerationComplete", "After /reap.next archives a completed generation. Runs after the git commit, so changes from hooks are uncommitted"],
      ["onRegression", "After /reap.back returns to a previous stage"],
    ],
    configuration: "Configuration",
    configExample: `# .reap/config.yml
hooks:
  onGenerationStart:
    - command: "echo 'Generation started'"
  onStageTransition:
    - command: "npm run lint"
  onGenerationComplete:
    - command: "reap update"
    - prompt: |
        Review the changes made in this generation.
        Update README.md and docs if any features, CLI commands,
        or slash commands were added or modified.
        Skip if no documentation updates are needed.
  onRegression:
    - command: "echo 'Regressed to previous stage'"
    - prompt: "Log the regression reason to a tracking file."`,
    sessionStart: "SessionStart Hook",
    sessionStartDesc1: "Separate from REAP project hooks, the SessionStart hook is an agent mechanism that runs at the start of every AI session. REAP registers it during reap init for each detected agent (Claude Code, OpenCode).",
    sessionStartDesc2: "It injects the full REAP workflow guide, current generation state, and lifecycle rules into the AI agent — ensuring the agent understands the project context even in a brand-new session.",
    sessionStartNote: "Registered in the agent's settings (e.g. ~/.claude/settings.json for Claude Code, ~/.config/opencode/ for OpenCode). The hook script lives in the REAP package and reads from the project's .reap/ directory.",
    executionNotes: "Execution Notes",
    executionItems: [
      "Hooks are executed by the AI agent, not the CLI. The agent reads the config and runs each hook.",
      "command hooks run in the project root directory.",
      "prompt hooks are interpreted by the AI agent in the current session context.",
      "Hooks within the same event run sequentially, in the order defined.",
      "onGenerationComplete hooks run after the git commit — any file changes from hooks will be uncommitted.",
    ],
  },

  // Advanced Page
  advanced: {
    title: "Advanced",
    breadcrumb: "Guide",
    compressionTitle: "Lineage Compression",
    compressionDesc: "As generations accumulate, lineage archives are automatically compressed to manage size.",
    compressionHeaders: ["Level", "Input", "Output", "Max lines", "Trigger"],
    compressionItems: [
      ["Level 1", "Generation folder (5 artifacts)", "gen-XXX.md", "40", "lineage > 10,000 lines + 5+ generations"],
      ["Level 2", "5 Level 1 files", "epoch-XXX.md", "60", "5+ Level 1 files exist"],
    ],
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

  // Comparison Page
  comparison: {
    title: "Comparison",
    breadcrumb: "Reference",
    heading: "Comparison with Spec Kit",
    desc: "Spec Kit pioneered spec-driven development — writing specifications before code. REAP builds on this concept and addresses key limitations:",
    items: [
      { title: "Static specs vs Living Genome", desc: "Traditional tools treat specs as static documents. REAP's Genome is a living system — defects found during implementation feed back through the backlog and are applied at Completion. The design evolves with the code." },
      { title: "No cross-session memory", desc: "Most AI development tools lose context between sessions. REAP's SessionStart Hook injects full project context (Genome, generation state, workflow rules) into every new session automatically." },
      { title: "Linear workflow vs Micro loops", desc: "Traditional tools follow a linear flow (spec → plan → build). REAP supports structured regression — any stage can loop back to a previous one while preserving artifacts." },
      { title: "Isolated tasks vs Generational evolution", desc: "Each task in traditional tools is independent. In REAP, generations build on each other. Knowledge compounds through Lineage archives and Genome evolution." },
      { title: "No lifecycle hooks", desc: "REAP provides project-level hooks (onGenerationStart, onStageTransition, onGenerationComplete, onRegression) for automation." },
    ],
  },
};

export type Translations = typeof en;
