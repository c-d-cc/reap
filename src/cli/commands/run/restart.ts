import { readdir, rm, writeFile } from "fs/promises";
import { join } from "path";
import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { isGitRepo, gitDiff, gitResetHard } from "../../../core/git.js";

export async function execute(paths: ReapPaths, _phase?: string, goal?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("restart", "No active generation to restart.");

  const s = state!;
  const newGoal = goal ?? s.goal;

  // Git reset with diff backup (only if in a git repo)
  let backupPath: string | undefined;
  if (isGitRepo(paths.root)) {
    const diff = gitDiff(paths.root);
    if (diff) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      backupPath = join(paths.reap, `restart-backup-${timestamp}.diff`);
      await writeFile(backupPath, diff, "utf-8");
    }
    gitResetHard(paths.root);
  }

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
    completed: ["gate", ...(backupPath ? ["diff-backup"] : []), "git-reset", "abort", "create-generation"],
    context: {
      abortedGeneration: s.id,
      newGeneration: newState.id,
      goal: newGoal,
      type: newState.type,
      ...(backupPath ? { diffBackup: backupPath } : {}),
    },
    message: backupPath
      ? `Restarted: ${s.id} → ${newState.id}. Diff backup: ${backupPath}. Run: reap run learning`
      : `Restarted: ${s.id} → ${newState.id}. Run: reap run learning`,
    nextCommand: "reap run learning",
  });
}
