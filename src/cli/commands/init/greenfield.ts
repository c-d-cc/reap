import type { ReapPaths } from "../../../core/paths.js";
import { writeTextFile } from "../../../core/fs.js";
import { emitOutput } from "../../../core/output.js";
import { initCommon } from "./common.js";

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

const GREENFIELD_CONVERSATION_PROMPT = `## Greenfield Init — Interactive Session

You have just initialized a new greenfield project with reap. The .reap/ directory structure has been created with empty templates. Your job now is to have a conversation with the human to fill in the genome (project identity, conventions, constraints) and environment (project context).

### Important
- Respond in the human's preferred language (ask early if unclear).
- Be conversational and concise — one question at a time.
- Write files as you gather information — do not wait until the end.

### Conversation Flow

**Step 1: Language & Introduction**
Ask the human what language they prefer for all reap artifacts and conversations.
Then introduce yourself: explain that you will help set up the project through a short conversation.
Update .reap/config.yml with the chosen language.

**Step 2: Project Identity**
Ask: "What is this project? What problem does it solve?"
Ask: "Who is the target user or audience?"
Listen carefully. Summarize back to confirm.

**Step 3: Tech Stack**
Ask: "What tech stack are you planning to use?" (language, framework, database, etc.)
If the human is undecided, suggest options based on the project type and ask them to choose.

**Step 4: Architecture & Conventions**
Ask: "Do you have any architecture preferences?" (monolith, microservices, layered, etc.)
Ask: "Any coding conventions?" (naming, file structure, formatting tools, etc.)
If the human says "no preference," suggest sensible defaults and confirm.

**Step 5: Constraints & Invariants**
Ask: "Are there any hard constraints?" (performance requirements, compatibility, budget, etc.)
Ask: "What must NEVER be done in this project?" (these become invariants)
Write genome/invariants.md with human-confirmed invariants.

**Step 6: Write Genome & Environment**
Based on all gathered information:
- Write genome/application.md (project identity, architecture, tech stack, conventions, constraints)
- Write environment/summary.md (project context summary)
- Show the human what you wrote and ask for corrections.

**Step 7: Vision & First Generation**
Ask: "What is the long-term vision for this project? What are the major milestones?"
Write vision/goals.md with the answers.
Then suggest: "Ready to start the first embryo generation? What should the first goal be?"
If the human confirms, run: reap run start --type embryo --goal "<goal>"
`;

export async function execute(paths: ReapPaths, projectName: string): Promise<void> {
  const config = await initCommon(paths, projectName);

  // Write empty genome template
  await writeTextFile(paths.application, DEFAULT_APPLICATION);

  // Write environment
  await writeTextFile(paths.environmentSummary, `# ${config.project} Environment\n\n<!-- Project environment summary -->\n`);

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
    prompt: GREENFIELD_CONVERSATION_PROMPT,
  });
}
