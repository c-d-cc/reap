import type { ReapPaths } from "../../../core/paths";
import { MergeGenerationManager } from "../../../core/merge-generation";
import { readTextFile, fileExists } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";
import { executeHooks } from "../../../core/hook-engine";
import { checkSubmodules } from "../../../core/commit";
import { verifyStageEntry, setPhaseNonce, verifyPhaseEntry } from "../../../core/stage-transition";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const mgm = new MergeGenerationManager(paths);
  const state = await mgm.current();

  if (!state) {
    emitError("merge-completion", "No active Generation.");
  }
  if (state.type !== "merge") {
    emitError("merge-completion", `Generation type is '${state.type}', expected 'merge'.`);
  }
  if (state.stage !== "completion") {
    emitError("merge-completion", `Stage is '${state.stage}', expected 'completion'.`);
  }

  // Verify stage chain token from previous stage's --phase complete
  verifyStageEntry("merge-completion", state);
  await mgm.save(state);

  const validationArtifact = paths.artifact("05-validation.md");
  if (!(await fileExists(validationArtifact))) {
    emitError("merge-completion", "05-validation.md does not exist. Complete validation first.");
  }

  if (!phase || phase === "retrospective") {
    // Phase 1: Gate passed, collect context for AI to write completion report
    const detectContent = await readTextFile(paths.artifact("01-detect.md"));
    const mateContent = await readTextFile(paths.artifact("02-mate.md"));
    const mergeContent = await readTextFile(paths.artifact("03-merge.md"));
    const validationContent = await readTextFile(validationArtifact);

    // Set phase nonce for archive phase
    setPhaseNonce(state, "completion", "retrospective");
    await mgm.save(state);

    emitOutput({
      status: "prompt",
      command: "merge-completion",
      phase: "retrospective",
      completed: ["gate", "context-scan"],
      context: {
        id: state.id,
        goal: state.goal,
        type: state.type,
        parents: state.parents,
        commonAncestor: state.commonAncestor,
        startedAt: state.startedAt,
        detectSummary: detectContent?.slice(0, 2000),
        mateSummary: mateContent?.slice(0, 2000),
        mergeSummary: mergeContent?.slice(0, 2000),
        validationSummary: validationContent?.slice(0, 2000),
      },
      prompt: [
        "Write 06-completion.md with:",
        "- Summary of what was merged",
        "- Genome changes applied",
        "- Lessons learned",
        "",
        "Then run: reap run merge-completion --phase archive",
      ].join("\n"),
      nextCommand: "reap run merge-completion --phase archive",
    });
  }

  if (phase === "archive") {
    // Verify phase nonce from retrospective phase
    verifyPhaseEntry("merge-completion", state, "completion", "retrospective");
    await mgm.save(state);

    // Phase 2: Execute hooks, archive, and prepare for commit
    const hookResults = await executeHooks(paths.hooks, "onMergeCompleted", paths.projectRoot);

    // Check submodules
    const submodules = checkSubmodules(paths.projectRoot);
    const dirtySubmodules = submodules.filter(s => s.dirty);

    // Archive + compress
    const compression = await mgm.complete();

    emitOutput({
      status: "prompt",
      command: "merge-completion",
      phase: "commit",
      completed: ["gate", "context-scan", "retrospective", "hooks", "archive", "compress"],
      context: {
        id: state.id,
        goal: state.goal,
        compression: { level1: compression.level1.length, level2: compression.level2.length },
        hookResults,
        dirtySubmodules,
      },
      prompt: dirtySubmodules.length > 0
        ? `Dirty submodules detected: ${dirtySubmodules.map(s => s.path).join(", ")}. Commit and push inside each submodule first, then commit the parent repo. Commit message: merge(${state.id}): [goal summary]. Generation complete.`
        : `Commit all changes (merged source + genome + .reap/ artifacts). Commit message: merge(${state.id}): [goal summary]. Generation complete.`,
      message: `Merge generation ${state.id} archived.`,
    });
  }
}
