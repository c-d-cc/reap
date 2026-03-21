import type { ReapPaths } from "../../../core/paths";
import { MergeGenerationManager } from "../../../core/merge-generation";
import { readTextFile, fileExists } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";
import { executeHooks } from "../../../core/hook-engine";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const mgm = new MergeGenerationManager(paths);
  const state = await mgm.current();

  if (!state) {
    emitError("merge-detect", "No active Generation.");
  }
  if (state.type !== "merge") {
    emitError("merge-detect", `Generation type is '${state.type}', expected 'merge'.`);
  }
  if (state.stage !== "detect") {
    emitError("merge-detect", `Stage is '${state.stage}', expected 'detect'.`);
  }

  if (!phase || phase === "review") {
    // Phase 1: Gate passed, present divergence report for review
    const detectArtifact = paths.artifact("01-detect.md");
    if (!(await fileExists(detectArtifact))) {
      emitError("merge-detect", "01-detect.md does not exist. Run /reap.merge.start first.");
    }

    const detectContent = await readTextFile(detectArtifact);

    emitOutput({
      status: "prompt",
      command: "merge-detect",
      phase: "review",
      completed: ["gate", "artifact-read"],
      context: {
        id: state.id,
        goal: state.goal,
        parents: state.parents,
        commonAncestor: state.commonAncestor,
        detectReport: detectContent?.slice(0, 5000),
      },
      prompt: [
        "## Merge Detect -- Divergence Review",
        "",
        "Review the divergence report in 01-detect.md with the human:",
        "- Common ancestor",
        "- Genome changes on each side",
        "- Conflicts (WRITE-WRITE, CROSS-FILE)",
        "",
        "If the detect needs to be re-run, use /reap.merge again.",
        "When satisfied, run: reap run merge-detect --phase complete",
      ].join("\n"),
      nextCommand: "reap run merge-detect --phase complete",
    });
  }

  if (phase === "complete") {
    // Phase 2: Execute hooks and signal completion
    const hookResults = await executeHooks(paths.hooks, "onMergeDetected", paths.projectRoot);

    emitOutput({
      status: "ok",
      command: "merge-detect",
      phase: "complete",
      completed: ["gate", "artifact-read", "review", "hooks"],
      context: {
        id: state.id,
        hookResults,
      },
      message: "Detect stage complete. Run /reap.next to advance to mate stage.",
    });
  }
}
