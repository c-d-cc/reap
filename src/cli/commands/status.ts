import { readdir } from "fs/promises";
import yaml from "js-yaml";
import { createPaths } from "../../core/paths.js";
import { readTextFile, fileExists } from "../../core/fs.js";
import { emitOutput, emitError } from "../../core/output.js";
import type { ReapConfig, GenerationState } from "../../types/index.js";

export async function execute(): Promise<void> {
  const root = process.cwd();
  const paths = createPaths(root);

  if (!(await fileExists(paths.config))) {
    emitError("status", "Not a reap project. Run 'reap init' first.");
  }

  // Read config
  const configContent = await readTextFile(paths.config);
  const config = configContent ? (yaml.load(configContent) as ReapConfig) : null;

  // Read current generation
  let generation: GenerationState | null = null;
  const currentContent = await readTextFile(paths.current);
  if (currentContent) {
    generation = yaml.load(currentContent) as GenerationState;
  }

  // Count lineage
  let completedGenerations = 0;
  try {
    const entries = await readdir(paths.lineage);
    completedGenerations = entries.filter((e) => e.startsWith("gen-")).length;
  } catch {
    /* no lineage */
  }

  // Check genome existence
  const hasGenome = {
    application: await fileExists(paths.application),
    evolution: await fileExists(paths.evolution),
    invariants: await fileExists(paths.invariants),
  };

  // Determine execution mode
  const executionMode = config?.cruiseCount ? "cruise" : "supervised";

  emitOutput({
    status: "ok",
    command: "status",
    context: {
      project: config?.project ?? "unknown",
      executionMode,
      cruiseCount: config?.cruiseCount ?? null,
      completedGenerations,
      genome: hasGenome,
      generation: generation
        ? {
            id: generation.id,
            type: generation.type,
            stage: generation.stage,
            goal: generation.goal,
          }
        : null,
    },
    message: generation
      ? `Generation ${generation.id} | Stage: ${generation.stage} | Type: ${generation.type}`
      : `No active generation. Completed: ${completedGenerations}`,
  });
}
