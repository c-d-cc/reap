import { join } from "path";
import { readdir } from "fs/promises";
import type { ReapPaths } from "../../../core/paths";
import { ReapPaths as ReapPathsClass } from "../../../core/paths";
import { readTextFile, fileExists } from "../../../core/fs";
import { ConfigManager } from "../../../core/config";
import { GenerationManager } from "../../../core/generation";
import { emitOutput } from "../../../core/run-output";

const L1_LIMIT = 500;
const L2_LIMIT = 200;
const L1_FILES = ["principles.md", "conventions.md", "constraints.md", "source-map.md"];

/** Load Genome content (L1 core + L2 domain) with line budget. */
async function loadGenome(genomeDir: string): Promise<{ content: string; l1Lines: number }> {
  let content = "";
  let l1Lines = 0;

  // Check source-map.md header for custom line limit
  let smLimit: number | null = null;
  const smContent = await readTextFile(join(genomeDir, "source-map.md"));
  if (smContent) {
    const limitMatch = smContent.match(/줄 수 한도:\s*~?(\d+)줄/);
    if (limitMatch) smLimit = parseInt(limitMatch[1], 10);
  }

  for (const file of L1_FILES) {
    const fileContent = await readTextFile(join(genomeDir, file));
    if (!fileContent) continue;
    const lines = fileContent.split("\n").length;
    const limit = file === "source-map.md" && smLimit ? smLimit : L1_LIMIT;
    l1Lines += lines;
    if (l1Lines <= limit) {
      content += `\n### ${file}\n${fileContent}\n`;
    } else {
      content += `\n### ${file} [TRUNCATED — L1 budget exceeded]\n${fileContent.split("\n").slice(0, 20).join("\n")}\n...\n`;
    }
  }

  // L2: domain/ files
  const domainDir = join(genomeDir, "domain");
  if (await fileExists(domainDir)) {
    let l2Lines = 0;
    let l2Overflow = false;
    try {
      const domainFiles = (await readdir(domainDir)).filter(f => f.endsWith(".md")).sort();
      for (const file of domainFiles) {
        const fileContent = await readTextFile(join(domainDir, file));
        if (!fileContent) continue;
        const lines = fileContent.split("\n").length;
        l2Lines += lines;
        if (!l2Overflow && l2Lines <= L2_LIMIT) {
          content += `\n### domain/${file}\n${fileContent}\n`;
        } else {
          l2Overflow = true;
          const firstLine = fileContent.split("\n").find(l => l.startsWith(">")) || fileContent.split("\n")[0];
          content += `\n### domain/${file} [summary]\n${firstLine}\n`;
        }
      }
    } catch {
      // domain dir not readable
    }
  }

  return { content, l1Lines };
}

/** Build strict mode section. */
function buildStrictSection(
  strict: { edit: boolean; merge: boolean },
  genStage: string,
): string {
  let sections = "";

  if (strict.edit) {
    if (genStage === "implementation") {
      sections += "\n\n## Strict Mode — Edit (ACTIVE — SCOPED MODIFICATION ALLOWED)";
    } else if (genStage === "none") {
      sections += "\n\n## Strict Mode — Edit (ACTIVE — CODE MODIFICATION BLOCKED)";
    } else {
      sections += `\n\n## Strict Mode — Edit (ACTIVE — stage '${genStage}', CODE MODIFICATION BLOCKED)`;
    }
  }

  if (strict.merge) {
    sections += "\n\n## Strict Mode — Merge (ACTIVE)";
  }

  return sections;
}

export async function execute(paths: ReapPaths): Promise<void> {
  // 1. Load REAP Workflow Guide
  const guidePath = join(ReapPathsClass.packageHooksDir, "reap-guide.md");
  const reapGuide = await readTextFile(guidePath) || "";

  // 2. Load Genome (L1 + L2)
  const { content: genomeContent } = await loadGenome(paths.genome);

  // 3. Load Environment Summary
  const envSummary = await readTextFile(paths.environmentSummary) || "";

  // 4. Read Generation State
  const gm = new GenerationManager(paths);
  const state = await gm.current();
  let generationContext: string;
  let genStage: string;
  if (state && state.id) {
    genStage = state.stage;
    generationContext = `Active Generation: ${state.id} | Goal: ${state.goal} | Stage: ${state.stage}`;
  } else {
    genStage = "none";
    generationContext = "No active Generation.";
  }

  // 5. Build Strict Mode Section
  let strict = { edit: false, merge: false };
  try {
    const config = await ConfigManager.read(paths);
    strict = ConfigManager.resolveStrict(config.strict);
  } catch {
    // config read failed
  }
  const strictSection = buildStrictSection(strict, genStage);

  // 6. Build Environment Section
  const envSection = envSummary
    ? `\n\n---\n\n## Environment (External Context)\n${envSummary}`
    : "";

  // 7. Assemble full context
  const reapContext = [
    "<REAP_CONTEXT>",
    reapGuide,
    "",
    "---",
    "",
    "## Genome (Project Knowledge)",
    genomeContent,
    envSection,
    "",
    "---",
    "",
    "## Current State",
    generationContext,
    strictSection,
    "</REAP_CONTEXT>",
  ].join("\n");

  emitOutput({
    status: "ok",
    command: "refreshKnowledge",
    phase: "done",
    completed: ["load-guide", "load-genome", "load-environment", "load-state"],
    context: {
      hasGeneration: !!state?.id,
      generationId: state?.id || null,
      stage: genStage,
    },
    prompt: reapContext,
  });
}
