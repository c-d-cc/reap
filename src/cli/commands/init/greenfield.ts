import type { ReapPaths } from "../../../core/paths.js";
import { writeTextFile } from "../../../core/fs.js";
import { emitOutput } from "../../../core/output.js";
import { initCommon, getClaudeMdSection, buildPromptPreamble, buildSelfReviewBlock, buildHardGateBlock } from "./common.js";

const DEFAULT_APPLICATION = `# Application

## Project Identity
<!-- What is this project? -->

## Architecture Decisions
<!-- Key architectural choices -->

## Tech Stack
<!-- Technology selections -->

## Conventions
<!-- Code conventions and standards -->

## Constraints
<!-- Technical constraints -->
`;

/**
 * `environment/source-map.md` for a project that has no code yet.
 *
 * `adoption` builds this file from a scan of the existing tree. Greenfield has
 * nothing to scan, so it wrote no source-map at all — harmless until the shipped
 * genome started telling every agent to open it before changing code (gen-090).
 *
 * So the stub teaches rather than describes: an empty directory tree would be
 * useless, while this says what the file is for and when to fill it. It also
 * claims nothing about the tree — `--mode greenfield` can be forced on a
 * directory that already has code, and a stub asserting "no source files yet"
 * would be false there. The prose is what keeps it out of placeholder territory
 * as well: the integrity check counts lines that are not headings, blockquotes
 * or comments, and a file of headings alone reads as unfilled scaffolding.
 */
function buildSourceMapStub(projectName: string): string {
  return `# ${projectName} Source Map

> Code structure — what each module is for and what owns it.
> Loaded on demand, unlike \`environment/summary.md\`, which loads every session.
> Keep the structure description here and a pointer to it there.

Record what each module or directory is for and what it owns, one entry each,
and keep it current as the code changes. \`reap index\` reports what calls what;
this file is where the reasons live.

## Directory Structure

(not recorded yet)

## Modules

(none recorded yet — add an entry per module: path, role, and what it owns)
`;
}

function buildConversationPrompt(claudeMdSection: string): string {
  return `## Greenfield Init — Interactive Session

A new greenfield project has been initialized. The .reap/ directory structure is created with empty templates. Your job is to have a conversation with the human to fill in the genome and environment.

${buildPromptPreamble()}

### PHASE 1: Language & Introduction
- Detect the user's language from their first message, system locale, or any available context.
- Confirm briefly: "I'll use [detected language] for all REAP artifacts. Let me know if you'd prefer a different language."
- Update .reap/config.yml \`language\` field immediately.
- From this point, conduct **all conversation in the confirmed language**. The questions below are English templates — translate them naturally.
- Introduce yourself briefly: explain that you will help set up the project through a few questions.
- GATE: Language confirmed (explicit or implicit acceptance) before proceeding.

### PHASE 2: Project Identity
Ask these questions **one at a time**, waiting for a response before the next:
1. "What is this project? What problem does it solve?" (free input)
2. "Who is the target user?" (multiple choice: Developers / End users / Internal team / Other)
3. "Is there a core design philosophy or metaphor?" (examples: "like a pipeline", "event-driven", etc. Skippable)

All answers collected → write genome/application.md Project Identity section → show draft to user → confirm/revise.
- GATE: User confirms Project Identity before proceeding.

### PHASE 3: Tech Stack & Architecture
Ask **one at a time**:
1. "What tech stack?" (multiple choice presets, skippable)
   - Language: TypeScript / Python / Go / Rust / Java / Other
   - Framework: React / Vue / Express / FastAPI / Gin / Other / None
   - DB: PostgreSQL / MySQL / MongoDB / SQLite / None / Other
2. "Architecture?" (multiple choice: Monolith / Layered / Microservices / Serverless / Undecided)
3. If architecture chosen: "Why this architecture?" (record reasoning)

All answers collected → write genome/application.md Tech Stack + Architecture sections → show draft → confirm/revise.
- GATE: User confirms before proceeding.

### PHASE 4: Conventions & Constraints
Ask **one at a time**:
1. "Coding conventions?" (multiple choice + free input)
   - Naming: camelCase / snake_case / framework default / Other
   - Formatting: Prettier / ESLint / Biome / None / Other
2. "Any hard constraints?" (e.g. performance, compatibility, budget. Skippable)
3. "What must NEVER be done in this project?" → add to invariants.md

Write genome/application.md Conventions + Constraints → write invariants.md → show drafts → confirm/revise.
- GATE: User confirms before proceeding.

### PHASE 5: Genome Finalization + Self-Review
${buildSelfReviewBlock()}

- Show full genome/application.md + invariants.md to user.
- Report self-review results (any issues found).
- Ask: "Finalize this genome?" (user must explicitly confirm)
- GATE: User explicitly confirms finalization.

${buildHardGateBlock()}

### PHASE 6: Environment, CLAUDE.md, Vision
1. Write environment/summary.md based on everything discussed (tech stack, architecture, conventions, constraints).
2. Fill in environment/source-map.md, which was created as a stub. If the architecture discussion above settled on a module layout, record it now — one entry per module, what it is for, what it owns. If nothing is settled yet, leave the stub as it is; genome/evolution.md tells the agent to read this file before changing code, so it should describe the structure rather than repeat the summary.
3. Ensure CLAUDE.md has the REAP section:

${claudeMdSection}

4. Ask: "What is the long-term vision and major milestones for this project?" (skippable)
5. Add each goal with \`reap make goal --title "<goal>" --section "<section>"\` — it assigns the id that milestones and memory will cite. Do NOT write items into vision/goals.md by hand; an item with no id cannot be referenced, and \`reap fix --check\` reports it.
6. Suggest: "Ready to start the first embryo generation? What should the goal be?"
7. If confirmed: \`reap run start --type embryo --goal "<goal>"\`
`;
}

export async function execute(paths: ReapPaths, projectName: string): Promise<void> {
  const { config, ignoreAction } = await initCommon(paths, projectName);

  // Write empty genome template
  await writeTextFile(paths.application, DEFAULT_APPLICATION);

  // Write environment
  await writeTextFile(paths.environmentSummary, `# ${config.project} Environment\n\n<!-- Project environment summary -->\n`);
  await writeTextFile(paths.sourceMap, buildSourceMapStub(config.project));

  const claudeMdSection = await getClaudeMdSection();

  emitOutput({
    status: "ok",
    command: "init",
    phase: "greenfield",
    completed: ["auto-detect", "create-dirs", "write-config", "write-genome", "write-environment", "write-source-map", "write-vision"],
    context: {
      project: config.project,
      mode: "greenfield",
      reapDir: paths.reap,
      ...(ignoreAction === "failed"
        ? { warning: "could not add .reap/.index/ to .gitignore (check file permissions) — the code index would otherwise be committed" }
        : {}),
    },
    message: `Project '${config.project}' initialized (greenfield). .reap/ structure created.`,
    prompt: buildConversationPrompt(claudeMdSection),
  });
}
