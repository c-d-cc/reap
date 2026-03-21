import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { MergeGenerationManager } from "../../../core/merge-generation";
import { gitRefExists, gitCurrentBranch } from "../../../core/git";
import { readTextFile, writeTextFile, fileExists } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";
import { executeHooks } from "../../../core/hook-engine";
import * as lineageUtils from "../../../core/lineage";

export async function execute(paths: ReapPaths, phase?: string, argv: string[] = []): Promise<void> {
  const positionals = argv.filter(a => !a.startsWith("--"));
  const targetBranchArg = positionals[0];
  const gm = new GenerationManager(paths);

  if (!phase || phase === "collect") {
    // Phase 1: Gate + target branch 정보 수집
    const state = await gm.current();
    if (state && state.id) {
      emitError("merge-start", `Generation ${state.id} is in progress (stage: ${state.stage}). Complete it before starting a merge.`);
    }

    const currentBranch = gitCurrentBranch(paths.projectRoot);

    emitOutput({
      status: "prompt",
      command: "merge-start",
      phase: "collect",
      completed: ["gate"],
      context: {
        currentBranch,
      },
      prompt: "Ask the human for the target branch to merge. Then run: reap run merge-start --phase create <branch-name>",
      nextCommand: "reap run merge-start --phase create",
    });
  }

  if (phase === "create") {
    // Phase 2: merge generation 생성
    const targetBranch = targetBranchArg;
    if (!targetBranch) {
      emitError("merge-start", "Target branch is required. Usage: reap run merge-start --phase create <branch>");
    }

    // Double-check gate
    const existing = await gm.current();
    if (existing && existing.id) {
      emitError("merge-start", `Generation ${existing.id} is already in progress.`);
    }

    // Verify target branch exists
    if (!gitRefExists(targetBranch, paths.projectRoot)) {
      emitError("merge-start", `Branch "${targetBranch}" does not exist.`);
    }

    // Check epoch compression (common ancestor must not be epoch-compressed)
    const epochPath = paths.artifact("epoch.md");
    // epoch check is deferred to createFromBranch which finds common ancestor

    // Create merge generation from branch
    const mgm = new MergeGenerationManager(paths);
    const { state, report } = await mgm.createFromBranch(targetBranch, paths.projectRoot);

    // Write 01-detect.md artifact with divergence report
    const detectContent = [
      "# Divergence Detection Report",
      "",
      `## Common Ancestor: ${report.commonAncestor ?? "None"}`,
      `## Parent A (local): ${report.parentA}`,
      `## Parent B (target): ${report.parentB}`,
      "",
      `## Genome Changes on Local (${report.genomeDiffsA.length})`,
      ...report.genomeDiffsA.map(d => `- ${d.file}: ${d.added ? "added" : d.removed ? "removed" : "modified"}`),
      "",
      `## Genome Changes on Target (${report.genomeDiffsB.length})`,
      ...report.genomeDiffsB.map(d => `- ${d.file}: ${d.added ? "added" : d.removed ? "removed" : "modified"}`),
      "",
      `## Conflicts (${report.conflicts.length})`,
      ...report.conflicts.map(c => `- ${c.file}: ${c.type}`),
    ].join("\n");
    await writeTextFile(paths.artifact("01-detect.md"), detectContent);

    // Execute onMergeStarted hooks
    const hookResults = await executeHooks(paths.hooks, "onMergeStarted", paths.projectRoot);

    emitOutput({
      status: "prompt",
      command: "merge-start",
      phase: "started",
      completed: ["gate", "branch-verify", "create-generation", "detect-report", "hooks"],
      context: {
        generationId: state.id,
        goal: state.goal,
        type: state.type,
        parents: state.parents,
        commonAncestor: state.commonAncestor,
        targetBranch,
        conflictCount: report.conflicts.length,
        genomeDiffsA: report.genomeDiffsA.length,
        genomeDiffsB: report.genomeDiffsB.length,
        hookResults,
      },
      prompt: report.conflicts.length > 0
        ? `Merge generation ${state.id} created. ${report.conflicts.length} genome conflict(s) found. Proceed to /reap.merge.detect to review, then /reap.merge.mate to resolve.`
        : `Merge generation ${state.id} created. No genome conflicts. Proceed to /reap.merge.detect to review, then mate can auto-pass.`,
      message: `Merge generation ${state.id} started.`,
    });
  }
}
