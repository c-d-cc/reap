import type { ReapPaths } from "../../../core/paths.js";
import { writeTextFile } from "../../../core/fs.js";
import { emitOutput } from "../../../core/output.js";
import { initCommon } from "./common.js";
import { scanCodebase } from "../../../core/scanner.js";
import { suggestGenome, generateSourceMap } from "../../../core/genome-suggest.js";

const ADOPTION_CONVERSATION_PROMPT = `## Adoption Init — Interactive Session

You have just initialized reap on an existing project. The codebase has been scanned and a draft genome/application.md was auto-generated. Your job now is to have a conversation with the human to verify, correct, and complete the genome and environment.

### Important
- Respond in the human's preferred language (ask early if unclear).
- Be conversational and concise — one question at a time.
- Update files as you gather corrections — do not wait until the end.

### Conversation Flow

**Step 1: Language Preference**
Ask the human what language they prefer for all reap artifacts and conversations.
Update .reap/config.yml with the chosen language.

**Step 2: Review Auto-Generated Genome**
Read genome/application.md and present its contents to the human.
Walk through each section:
- "I detected the project identity as [X]. Is this correct?"
- "I found these architecture patterns: [X]. Are there others?"
- "The tech stack appears to be [X]. Anything missing?"
Ask for corrections and update genome/application.md accordingly.

**Step 3: Review Source Map**
Briefly summarize what was found in environment/source-map.md.
Ask: "Is this directory structure accurate? Any important areas I missed?"

**Step 4: What Code Scan Cannot Detect**
Ask: "What coding conventions does this project follow?" (naming, patterns, formatting)
Ask: "Are there any technical constraints I should know about?" (performance, compatibility, etc.)
Ask: "What is the biggest technical debt right now?"
Update genome/application.md with the answers.

**Step 5: Invariants**
Ask: "What must NEVER be done in this project?" (critical constraints that must never be violated)
Write genome/invariants.md with human-confirmed invariants (keep the default pipeline invariants + add project-specific ones).

**Step 6: Confirm Genome**
Show the final genome/application.md to the human.
Ask: "Does this accurately represent your project? Any final corrections?"
Apply corrections if needed.

**Step 7: Vision & First Generation**
Ask: "What is the future direction for this project? What are the major milestones?"
Write vision/goals.md with the answers.
Then suggest: "Ready to start the first embryo generation? What should the first goal be?"
If the human confirms, run: reap run start --type embryo --goal "<goal>"
`;

export async function execute(paths: ReapPaths, projectName?: string): Promise<void> {
  // Phase 1: Scan codebase
  const scan = await scanCodebase(paths.root);
  const name = projectName ?? scan.projectName;

  // Common init
  const config = await initCommon(paths, name);

  // Phase 2: Generate genome suggest + source-map
  const genomeSuggestion = suggestGenome(scan);
  await writeTextFile(paths.application, genomeSuggestion);

  const sourceMap = generateSourceMap(scan);
  await writeTextFile(paths.sourceMap, sourceMap);

  // Write environment summary
  const envSummary = [
    `# ${config.project} Environment`,
    "",
    `## Tech Stack`,
    `- Language: ${scan.hasTypeScript ? "TypeScript" : "JavaScript"}`,
    scan.buildTool ? `- Build: ${scan.buildTool}` : "",
    scan.testFramework ? `- Test: ${scan.testFramework}` : "",
    "",
    `## Project Structure`,
    `See environment/source-map.md for full directory tree and dependencies.`,
    "",
  ].filter(Boolean).join("\n");
  await writeTextFile(paths.environmentSummary, envSummary);

  emitOutput({
    status: "ok",
    command: "init",
    phase: "adoption",
    completed: ["auto-detect", "scan-codebase", "create-dirs", "write-config", "suggest-genome", "write-source-map", "write-environment"],
    context: {
      project: config.project,
      mode: "adoption",
      reapDir: paths.reap,
      scan: {
        dependencies: scan.dependencies.length,
        devDependencies: scan.devDependencies.length,
        hasTypeScript: scan.hasTypeScript,
        hasTests: scan.hasTests,
        testFramework: scan.testFramework,
        buildTool: scan.buildTool,
        directoryEntries: scan.directoryTree.length,
      },
    },
    message: `Project '${config.project}' initialized (adoption). Codebase scanned, genome suggested.`,
    prompt: ADOPTION_CONVERSATION_PROMPT,
  });
}
