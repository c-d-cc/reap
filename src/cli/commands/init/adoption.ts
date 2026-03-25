import type { ReapPaths } from "../../../core/paths.js";
import { writeTextFile } from "../../../core/fs.js";
import { emitOutput } from "../../../core/output.js";
import { initCommon, getClaudeMdSection } from "./common.js";
import { scanCodebase } from "../../../core/scanner.js";
import { suggestGenome, generateSourceMap } from "../../../core/genome-suggest.js";

function buildConversationPrompt(claudeMdSection: string): string {
  return `## Adoption Init — Interactive Session

You have just initialized reap on an existing project. The codebase has been scanned and a draft genome/application.md was auto-generated. Your job now is to have a conversation with the human to verify, correct, and complete the genome and environment.

### Important
- Respond in the human's preferred language (ask early if unclear).
- Be conversational and concise — one question at a time.
- Update files immediately as you gather corrections — do not batch writes to the end.
- If the human wants to skip a step, accept it and move on. Write "N/A" or a brief note in the relevant section.
- Adapt to the project type. Not every project is a typical software product — adjust your questions accordingly.

### Conversation Flow

**Step 1: Language Preference**
Ask the human what language they prefer for all reap artifacts and conversations.
Update .reap/config.yml with the chosen language immediately.

**Step 2: Review Auto-Generated Genome**
Read genome/application.md and present its contents to the human.
Walk through each section:
- "I detected the project identity as [X]. Is this correct? What problem does this project solve, and who is it for?"
- "I found these architecture patterns: [X]. Are there others? What is the core design philosophy or mental model behind this project?"
- "The tech stack appears to be [X]. Anything missing?"
Ask for corrections and update genome/application.md immediately.

**Step 3: Review Source Map**
Briefly summarize what was found in environment/source-map.md.
Ask: "Is this directory structure accurate? Any important areas I missed?"

**Step 4: What Code Scan Cannot Detect**
Ask: "Why was this architecture chosen? What were the alternatives considered?" Record the reasoning — it's as important as the choice itself.
Ask: "Are there any unique patterns or conventions specific to this project?" (things a new developer wouldn't guess from reading the code)
Ask: "What coding conventions does this project follow?" (naming, patterns, formatting)
Ask: "Are there any technical constraints I should know about?" (performance, compatibility, etc.)
Ask: "What is the biggest technical debt right now?"
Update genome/application.md with the answers immediately.

**Step 5: Invariants**
Ask: "What must NEVER be done in this project?" (critical constraints that must never be violated)
Write genome/invariants.md immediately with human-confirmed invariants (keep the default pipeline invariants + add project-specific ones).

**Step 6: Environment & Confirm**
Update environment/summary.md with substantive content:
- Enrich the auto-generated tech stack info with context from the conversation
- Add Build & Scripts section from scan data
- Add Key Design Decisions based on what the human shared
- Ensure summary.md is self-contained (not just "See source-map.md")

Show the final genome/application.md and environment/summary.md to the human.
Ask: "Does this accurately represent your project? Any final corrections?"
Apply corrections if needed.

**Step 6.5: CLAUDE.md**
1. Read current project's CLAUDE.md and check if a ## REAP section exists. The REAP section contains loading information about Genome, Environment, and additional knowledge pre-loading for AI agents.
2. If CLAUDE.md file does not exist, create it and add a ## REAP section.
3. If CLAUDE.md file exists but ## REAP section is not present, append the ## REAP section.
4. The ## REAP section contents should follow below:

${claudeMdSection}

Briefly mention to the human that CLAUDE.md now includes REAP loading instructions.

**Step 7: Vision & First Generation**
Ask: "What is the future direction for this project? What are the major milestones?"
Write vision/goals.md with the answers.
Then suggest: "Ready to start the first embryo generation? What should the first goal be?"
If the human confirms, run: reap run start --type embryo --goal "<goal>"
`;
}

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

  // Write environment summary with substantive content
  const envLines: string[] = [
    `# ${config.project} Environment`,
    "",
    "## Project",
    `- Source: \`${paths.root}\``,
    `- Language: ${scan.hasTypeScript ? "TypeScript" : "JavaScript"}`,
  ];
  if (scan.buildTool) envLines.push(`- Build tool: ${scan.buildTool}`);
  if (scan.testFramework) envLines.push(`- Test framework: ${scan.testFramework}`);
  if (scan.dependencies.length > 0) envLines.push(`- Dependencies: ${scan.dependencies.length} packages`);
  envLines.push("");

  // Source structure summary (top-level dirs)
  const topDirs = scan.directoryTree.filter((d) => d.endsWith("/") && !d.includes("/"));
  if (topDirs.length > 0) {
    envLines.push("## Source Structure");
    envLines.push("```");
    for (const dir of topDirs) envLines.push(dir);
    envLines.push("```");
    envLines.push("See environment/source-map.md for full tree and dependencies.");
    envLines.push("");
  }

  // Build & Scripts
  const scriptEntries = Object.entries(scan.scripts);
  if (scriptEntries.length > 0) {
    envLines.push("## Build & Scripts");
    for (const [name, cmd] of scriptEntries) {
      envLines.push(`- \`${name}\`: \`${cmd}\``);
    }
    envLines.push("");
  }

  // Key Design Decisions placeholder
  envLines.push("## Key Design Decisions");
  envLines.push("<!-- Fill in during init conversation or first generation -->");
  envLines.push("");

  await writeTextFile(paths.environmentSummary, envLines.join("\n"));

  const claudeMdSection = await getClaudeMdSection();

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
    prompt: buildConversationPrompt(claudeMdSection),
  });
}
