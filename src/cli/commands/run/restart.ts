import { readdir, rm } from "fs/promises";
import { join } from "path";
import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { emitOutput, emitError } from "../../../core/output.js";

export async function execute(paths: ReapPaths, _phase?: string, goal?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("restart", "No active generation to restart.");

  const s = state!;
  const newGoal = goal ?? s.goal;

  // Inline abort: clear life/ except backlog
  const lifeEntries = await readdir(paths.life);
  for (const entry of lifeEntries) {
    if (entry === "backlog") continue;
    await rm(join(paths.life, entry), { recursive: true, force: true });
  }

  // Create new generation
  const newState = await gm.create(newGoal, s.type);

  emitOutput({
    status: "ok",
    command: "restart",
    completed: ["gate", "abort", "create-generation"],
    context: {
      abortedGeneration: s.id,
      newGeneration: newState.id,
      goal: newGoal,
      type: newState.type,
    },
    message: `Restarted: ${s.id} → ${newState.id}. Run: reap run learning`,
    nextCommand: "reap run learning",
  });
}
