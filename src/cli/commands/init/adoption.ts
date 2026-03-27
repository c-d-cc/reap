import type { ReapPaths } from "../../../core/paths.js";
import { writeTextFile } from "../../../core/fs.js";
import { emitOutput } from "../../../core/output.js";
import { initCommon, getClaudeMdSection, buildPromptPreamble, buildSelfReviewBlock, buildHardGateBlock } from "./common.js";
import { scanCodebase } from "../../../core/scanner.js";
import { suggestGenome, generateSourceMap } from "../../../core/genome-suggest.js";

function buildConversationPrompt(claudeMdSection: string): string {
  return `## Adoption Init — Interactive Session

REAP has been initialized on an existing project. The codebase has been scanned and a draft genome/application.md was auto-generated. Your job is to verify, correct, and complete the genome and environment through conversation.

${buildPromptPreamble()}

### PHASE 1: Language & Scan Summary
- Detect the user's language from their first message, system locale, or any available context.
- Confirm briefly: "I'll use [detected language] for all REAP artifacts. Let me know if you'd prefer a different language."
- Update .reap/config.yml \`language\` field immediately.
- From this point, conduct **all conversation in the confirmed language**. The questions below are English templates — translate them naturally.
- Show scan summary: "The codebase has been scanned and a draft genome/application.md was created. Let's review it together."
- GATE: Language confirmed (explicit or implicit acceptance) before proceeding.

### PHASE 2: Genome Review (section-by-section verification)
Read genome/application.md and walk through each section **one at a time**:

**2a: Project Identity**
- Present detected identity → "Is this correct? What problem does this project solve, and who is it for?" → confirm/revise → update immediately.

**2b: Tech Stack**
- Present detected stack → "Anything missing or incorrect?" → confirm/revise → update immediately.

**2c: Architecture**
- Present inferred architecture → "Is this correct?" → if confirmed, follow up: "Why was this architecture chosen?" (record reasoning) → update immediately.

**2d: Conventions**
- Present detected conventions → "Any additional conventions?" (naming, formatting, etc.) → confirm/revise → update immediately.

- GATE: All sub-sections confirmed before proceeding.

### PHASE 3: What Code Cannot Tell
Ask these **one at a time**:
1. "Are there any patterns unique to this project?" (things a code scan cannot detect)
2. "What is the biggest technical debt right now?" (skippable)
3. "Any hard constraints?" (performance, compatibility, etc. Skippable)
4. "What must NEVER be done in this project?" → add to invariants.md

Update genome/application.md + invariants.md → show drafts → confirm/revise.
- GATE: User confirms before proceeding.

### PHASE 4: Genome Finalization + Self-Review
${buildSelfReviewBlock()}

- Show full genome/application.md + invariants.md to user.
- Report self-review results (any issues found).
- Ask: "Finalize this genome?" (user must explicitly confirm)
- GATE: User explicitly confirms finalization.

${buildHardGateBlock()}

### PHASE 5: Environment, CLAUDE.md, Vision
1. Update environment/summary.md with substantive content:
   - Enrich auto-generated tech stack info with conversation context
   - Add Key Design Decisions from what the human shared
   - Ensure summary.md is self-contained
2. Briefly summarize environment/source-map.md to user.
3. Ensure CLAUDE.md has the REAP section:

${claudeMdSection}

4. Ask: "What is the long-term vision and major milestones for this project?" (skippable)
5. Write vision/goals.md.
6. Suggest: "Ready to start the first embryo generation? What should the goal be?"
7. If confirmed: \`reap run start --type embryo --goal "<goal>"\`
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
