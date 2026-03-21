import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { MergeGenerationManager } from "../../../core/merge-generation";
import { gitRefExists, gitCurrentBranch } from "../../../core/git";
import { emitOutput, emitError } from "../../../core/run-output";
import * as lineageUtils from "../../../core/lineage";
import { canFastForward } from "../../../core/merge-generation";
import { execSync } from "child_process";

export async function execute(paths: ReapPaths, phase?: string, argv: string[] = []): Promise<void> {
  const positionals = argv.filter(a => !a.startsWith("--"));
  const targetBranchArg = positionals[0];
  const gm = new GenerationManager(paths);

  if (!phase || phase === "fetch") {
    // Phase 1: Gate + fetch
    const state = await gm.current();
    if (state && state.id) {
      emitError("pull", `Generation ${state.id} is in progress (stage: ${state.stage}). Complete it before pulling.`);
    }

    emitOutput({
      status: "prompt",
      command: "pull",
      phase: "fetch",
      completed: ["gate"],
      context: {
        currentBranch: gitCurrentBranch(paths.projectRoot),
      },
      prompt: [
        "## Pull -- Fetch Remote and Merge",
        "",
        "1. Run `git fetch origin`",
        "2. Ask the human for the target remote branch (e.g., `origin/main`)",
        "3. Then run: reap run pull --phase check <branch-name>",
      ].join("\n"),
      nextCommand: "reap run pull --phase check",
    });
  }

  if (phase === "check") {
    // Phase 2: Divergence detection and fast-forward check
    const targetBranch = targetBranchArg;
    if (!targetBranch) {
      emitError("pull", "Target branch is required. Usage: reap run pull --phase check <branch>");
    }

    if (!gitRefExists(targetBranch, paths.projectRoot)) {
      emitError("pull", `Branch "${targetBranch}" does not exist. Run \`git fetch\` first.`);
    }

    const currentBranch = gitCurrentBranch(paths.projectRoot);
    const mgm = new MergeGenerationManager(paths);
    const localMetas = await lineageUtils.listMeta(paths);

    // Try to resolve remote lineage for fast-forward check
    let remoteMetasRaw: Array<{ id: string; completedAt: string }> = [];
    try {
      const remoteMetas = (mgm as any).listMetaFromRef(targetBranch, paths.projectRoot);
      remoteMetasRaw = remoteMetas;
    } catch { /* may fail if no lineage on remote */ }

    if (localMetas.length === 0 && remoteMetasRaw.length === 0) {
      emitOutput({
        status: "ok",
        command: "pull",
        phase: "up-to-date",
        completed: ["gate", "fetch", "detect"],
        context: { targetBranch, currentBranch },
        message: "No lineage on either branch. Already up to date.",
      });
      return;
    }

    // Check if we can fast-forward
    if (localMetas.length > 0 && remoteMetasRaw.length > 0) {
      const localLatest = localMetas.sort((a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )[0];
      const remoteLatest = remoteMetasRaw.sort((a: any, b: any) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      )[0];

      const allMetas = [...localMetas];
      for (const rm of remoteMetasRaw as any[]) {
        if (!allMetas.find(m => m.id === rm.id)) allMetas.push(rm);
      }

      const ffResult = canFastForward(localLatest.id, remoteLatest.id, allMetas);

      if (ffResult.fastForward) {
        emitOutput({
          status: "prompt",
          command: "pull",
          phase: "fast-forward",
          completed: ["gate", "fetch", "detect", "ff-check"],
          context: {
            targetBranch,
            currentBranch,
            localLatestId: localLatest.id,
            remoteLatestId: remoteLatest.id,
            reason: ffResult.reason,
          },
          prompt: [
            `Fast-forward possible: ${ffResult.reason}`,
            "",
            `Run \`git merge --ff ${targetBranch}\`, then \`git submodule update --init\`.`,
            "No merge generation needed.",
          ].join("\n"),
        });
        return;
      }
    }

    // Diverged — need merge generation
    emitOutput({
      status: "prompt",
      command: "pull",
      phase: "start-merge",
      completed: ["gate", "fetch", "detect", "ff-check"],
      context: {
        targetBranch,
        currentBranch,
        diverged: true,
      },
      prompt: [
        "## Branches have diverged -- full merge required",
        "",
        "Execute the following sequence:",
        `1. Run /reap.merge.start ${targetBranch} (creates merge generation + detect report)`,
        "2. Run /reap.merge.evolve (runs detect -> mate -> merge -> sync -> validation -> completion)",
        "3. Run `git submodule update --init` after merge completes",
      ].join("\n"),
    });
  }
}
