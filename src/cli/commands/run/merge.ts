import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { MergeGenerationManager } from "../../../core/merge-generation";
import { gitRefExists, gitCurrentBranch } from "../../../core/git";
import { emitOutput, emitError } from "../../../core/run-output";
import * as lineageUtils from "../../../core/lineage";
import { canFastForward } from "../../../core/merge-generation";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);

  if (!phase || phase === "detect") {
    // Phase 1: Gate + target branch detection
    const state = await gm.current();
    if (state && state.id) {
      emitError("merge", `Generation ${state.id} is in progress (stage: ${state.stage}). Complete it before merging.`);
    }

    emitOutput({
      status: "prompt",
      command: "merge",
      phase: "detect",
      completed: ["gate"],
      context: {
        currentBranch: gitCurrentBranch(paths.projectRoot),
      },
      prompt: [
        "## Merge -- Full Merge Generation for a Local Branch",
        "",
        "Ask the human for the target branch to merge.",
        "Set REAP_MERGE_TARGET_BRANCH to the branch name.",
        "Then run: reap run merge --phase check",
      ].join("\n"),
      nextCommand: "reap run merge --phase check",
    });
  }

  if (phase === "check") {
    // Phase 2: Fast-forward check and divergence analysis
    const targetBranch = process.env.REAP_MERGE_TARGET_BRANCH;
    if (!targetBranch) {
      emitError("merge", "REAP_MERGE_TARGET_BRANCH environment variable is required.");
    }

    if (!gitRefExists(targetBranch, paths.projectRoot)) {
      emitError("merge", `Branch "${targetBranch}" does not exist.`);
    }

    const currentBranch = gitCurrentBranch(paths.projectRoot);

    // Check fast-forward possibility via lineage DAG
    const mgm = new MergeGenerationManager(paths);
    const localMetas = await lineageUtils.listMeta(paths);

    if (localMetas.length === 0) {
      emitOutput({
        status: "prompt",
        command: "merge",
        phase: "start-merge",
        completed: ["gate", "branch-verify"],
        context: { targetBranch, currentBranch },
        prompt: `No lineage found. Run /reap.merge.start with REAP_MERGE_TARGET_BRANCH=${targetBranch} to begin the merge generation, then /reap.merge.evolve.`,
        nextCommand: `reap run merge-start --phase create`,
      });
      return;
    }

    const localLatest = localMetas.sort((a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )[0];

    emitOutput({
      status: "prompt",
      command: "merge",
      phase: "start-merge",
      completed: ["gate", "branch-verify", "ff-check"],
      context: {
        targetBranch,
        currentBranch,
        localLatestId: localLatest.id,
      },
      prompt: [
        `## Merge Orchestration`,
        "",
        `Target branch: ${targetBranch}`,
        `Current branch: ${currentBranch}`,
        "",
        "Execute the following sequence:",
        `1. Set REAP_MERGE_TARGET_BRANCH=${targetBranch}`,
        "2. Run /reap.merge.start (creates merge generation + detect report)",
        "3. Run /reap.merge.evolve (runs detect -> mate -> merge -> sync -> validation -> completion)",
        "",
        "The merge generation will be archived upon completion.",
      ].join("\n"),
    });
  }
}
