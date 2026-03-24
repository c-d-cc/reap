import type { ReapPaths } from "../../../core/paths.js";
import { writeTextFile } from "../../../core/fs.js";
import { emitOutput } from "../../../core/output.js";
import { initCommon } from "./common.js";
import { scanCodebase } from "../../../core/scanner.js";
import { suggestGenome, generateSourceMap } from "../../../core/genome-suggest.js";

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
    completed: ["scan-codebase", "create-dirs", "write-config", "suggest-genome", "write-source-map", "write-environment"],
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
    prompt: [
      "## Adoption Init Complete",
      "",
      "Scanned codebase and generated a draft genome/application.md.",
      "",
      "### Next steps:",
      "1. **Review genome/application.md**: Verify/edit the auto-generated draft with the human",
      "   - Are the architecture decisions correct?",
      "   - Are there missing conventions or constraints?",
      "   - Is the project identity accurate?",
      "2. **Verify environment/source-map.md**: Check if directory structure and deps are correct",
      "3. **Ask the human additional questions**:",
      "   - What is the biggest technical debt right now?",
      "   - What is the future direction? (record in vision/goals.md + backlog)",
      "   - What must never be done in this project? (record in invariants.md)",
      "4. Start the first embryo generation with `reap run start --goal \"<goal>\"`",
    ].join("\n"),
  });
}
