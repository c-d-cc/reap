import type { ReapPaths } from "../../../core/paths.js";
import { writeTextFile } from "../../../core/fs.js";
import { emitOutput } from "../../../core/output.js";
import { initCommon, getClaudeMdSection } from "./common.js";

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

You have just initialized a new greenfield project with reap. The .reap/ directory structure has been created with empty templates. Your job now is to have a conversation with the human to fill in the genome (project identity, conventions, constraints) and environment (project context).

### Important
- Respond in the human's preferred language (ask early if unclear).
- Be conversational and concise — one question at a time.
- Write each file immediately after gathering the relevant information — do not batch writes to the end.
- If the human wants to skip a step (e.g., "no tech stack yet"), write "N/A" or a brief note in the relevant section and move on. Do not push for answers they don't have.
- Adapt to the project type. Not every project is a typical software product — it could be a test project, a library, a research prototype, etc. Adjust your questions accordingly.

### Conversation Flow

**Step 1: Language & Introduction**
Ask the human what language they prefer for all reap artifacts and conversations.
Then introduce yourself: explain that you will help set up the project through a short conversation.
Update .reap/config.yml with the chosen language immediately.

**Step 2: Project Identity**
Ask: "What is this project? What problem does it solve?"
Ask: "Who is the target user or audience?"
Ask: "Is there a core metaphor, mental model, or design philosophy behind this project?" (e.g., "it's like a pipeline", "we treat everything as an event", etc. If none, skip.)
Listen carefully. Summarize back to confirm.
Write genome/application.md Project Identity section immediately after confirmation.

**Step 3: Tech Stack**
Ask: "What tech stack are you planning to use?" (language, framework, database, etc.)
If the human is undecided, suggest options based on the project type and ask them to choose.
If skipped, write "N/A" in the Tech Stack section and move on.
Write genome/application.md Tech Stack section immediately.

**Step 4: Architecture & Conventions**
Ask: "Do you have any architecture preferences?" (monolith, microservices, layered, etc.)
If they choose an architecture, follow up: "Why this architecture? What drove this decision?" Record the reasoning — it helps future AI understand trade-offs.
Ask: "Any coding conventions?" (naming, file structure, formatting tools, etc.)
If the human says "no preference," suggest sensible defaults and confirm.
If skipped, write "N/A" and move on.
Write genome/application.md Architecture and Conventions sections immediately.

**Step 5: Constraints & Invariants**
Ask: "Are there any hard constraints?" (performance requirements, compatibility, budget, etc.)
Ask: "What must NEVER be done in this project?" (these become invariants)
Write genome/invariants.md with human-confirmed invariants immediately.
Write genome/application.md Constraints section immediately.

**Step 6: Environment & Review**
Write environment/summary.md with substantive project context:
- Tech stack decisions and why
- Planned project structure (if discussed)
- Build/test approach
- Key design decisions so far
Then show the human a summary of genome/application.md and environment/summary.md.
Ask for corrections. Apply any changes.

**Step 6.5: CLAUDE.md**
1. Read current project's CLAUDE.md and check if a ## REAP section exists. The REAP section contains loading information about Genome, Environment, and additional knowledge pre-loading for AI agents.
2. If CLAUDE.md file does not exist, create it and add a ## REAP section.
3. If CLAUDE.md file exists but ## REAP section is not present, append the ## REAP section.
4. The ## REAP section contents should follow below:

${claudeMdSection}

Briefly mention to the human that CLAUDE.md now includes REAP loading instructions.

**Step 7: Vision & First Generation**
Ask: "What is the long-term vision for this project? What are the major milestones?"
Write vision/goals.md with the answers.
Then suggest: "Ready to start the first embryo generation? What should the first goal be?"
If the human confirms, run: reap run start --type embryo --goal "<goal>"
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
