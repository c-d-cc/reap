import { readdir, rm } from "fs/promises";
import { join } from "path";
import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { emitOutput, emitError } from "../../../core/output.js";

export async function execute(paths: ReapPaths): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("abort", "No active generation to abort.");

  const s = state!;
  const id = s.id;

  // Remove artifacts (keep backlog for potential reuse)
  const lifeEntries = await readdir(paths.life);
  for (const entry of lifeEntries) {
    if (entry === "backlog") continue; // preserve backlog
    await rm(join(paths.life, entry), { recursive: true, force: true });
  }

  emitOutput({
    status: "ok",
    command: "abort",
    completed: ["gate", "clear-life"],
    context: {
      abortedGeneration: id,
      backlogPreserved: true,
    },
    message: `Generation ${id} aborted. Backlog preserved. Life/ cleared.`,
  });
}
