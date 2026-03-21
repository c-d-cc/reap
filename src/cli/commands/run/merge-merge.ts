import type { ReapPaths } from "../../../core/paths";
import { MergeGenerationManager } from "../../../core/merge-generation";
import { readTextFile, fileExists } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";
import { executeHooks } from "../../../core/hook-engine";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const mgm = new MergeGenerationManager(paths);
  const state = await mgm.current();

  if (!state) {
    emitError("merge-merge", "No active Generation.");
  }
  if (state.type !== "merge") {
    emitError("merge-merge", `Generation type is '${state.type}', expected 'merge'.`);
  }
  if (state.stage !== "merge") {
    emitError("merge-merge", `Stage is '${state.stage}', expected 'merge'.`);
  }

  const mateArtifact = paths.artifact("02-mate.md");
  if (!(await fileExists(mateArtifact))) {
    emitError("merge-merge", "02-mate.md does not exist. Complete mate stage first.");
  }

  if (!phase || phase === "work") {
    // Phase 1: Gate passed, instruct AI to perform source merge
    const mateContent = await readTextFile(mateArtifact);
    const detectContent = await readTextFile(paths.artifact("01-detect.md"));

    // Extract target branch from goal (format: "Merge <current> + <target>")
    const targetBranch = state.goal.split(" + ").pop() ?? "";

    emitOutput({
      status: "prompt",
      command: "merge-merge",
      phase: "work",
      completed: ["gate", "artifact-read"],
      context: {
        id: state.id,
        goal: state.goal,
        parents: state.parents,
        targetBranch,
        mateReport: mateContent?.slice(0, 3000),
        detectReport: detectContent?.slice(0, 3000),
      },
      prompt: [
        "## Merge Merge -- Source Code Merge",
        "",
        `Merge source code from target branch, guided by the finalized genome.`,
        "",
        "### Steps:",
        `1. Run \`git merge --no-commit ${targetBranch}\` to start the source merge`,
        "2. If git merge conflicts exist:",
        "   - Resolve each conflict guided by the finalized genome",
        "   - Record resolutions in 03-merge.md",
        "3. If no git conflicts:",
        "   - Check for semantic conflicts (code that compiles but contradicts the genome)",
        "4. Do NOT commit yet -- sync and validation must pass first",
        "",
        "When done, run: reap run merge-merge --phase complete",
      ].join("\n"),
      nextCommand: "reap run merge-merge --phase complete",
    });
  }

  if (phase === "complete") {
    // Phase 2: Execute hooks and signal completion
    const hookResults = await executeHooks(paths.hooks, "onMergeMerged", paths.projectRoot);

    emitOutput({
      status: "ok",
      command: "merge-merge",
      phase: "complete",
      completed: ["gate", "artifact-read", "source-merge", "hooks"],
      context: {
        id: state.id,
        hookResults,
      },
      message: "Merge stage complete. Run /reap.next to advance to sync stage.",
    });
  }
}
