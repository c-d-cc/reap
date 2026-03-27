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
2. Ensure CLAUDE.md has the REAP section:

${claudeMdSection}

3. Ask: "What is the long-term vision and major milestones for this project?" (skippable)
4. Write vision/goals.md.
5. Suggest: "Ready to start the first embryo generation? What should the goal be?"
6. If confirmed: \`reap run start --type embryo --goal "<goal>"\`
`;
}

export async function execute(paths: ReapPaths, projectName: string): Promise<void> {
  const config = await initCommon(paths, projectName);

  // Write empty genome template
  await writeTextFile(paths.application, DEFAULT_APPLICATION);

  // Write environment
  await writeTextFile(paths.environmentSummary, `# ${config.project} Environment\n\n<!-- Project environment summary -->\n`);

  const claudeMdSection = await getClaudeMdSection();

  emitOutput({
    status: "ok",
    command: "init",
    phase: "greenfield",
    completed: ["auto-detect", "create-dirs", "write-config", "write-genome", "write-environment", "write-vision"],
    context: {
      project: config.project,
      mode: "greenfield",
      reapDir: paths.reap,
    },
    message: `Project '${config.project}' initialized (greenfield). .reap/ structure created.`,
    prompt: buildConversationPrompt(claudeMdSection),
  });
}
