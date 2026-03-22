import type { ReapPaths } from "../../../core/paths";
import { MergeGenerationManager } from "../../../core/merge-generation";
import { generateStageToken } from "../../../core/generation";
import { readTextFile, fileExists } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";
import { executeHooks } from "../../../core/hook-engine";
import { verifyStageEntry, performTransition, setPhaseNonce, verifyPhaseEntry } from "../../../core/stage-transition";

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

  // Verify stage chain token from previous stage's --phase complete
  verifyStageEntry("merge-merge", state);
  await mgm.save(state);

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

    // Set phase nonce — prevents skipping work phase
    setPhaseNonce(state, "merge", "work");
    await mgm.save(state);

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
    // Verify phase nonce from work phase
    verifyPhaseEntry("merge-merge", state, "merge", "work");
    await mgm.save(state);

    // Generate stage chain token
    const { nonce, hash } = generateStageToken(state.id, state.stage);
    state.expectedTokenHash = hash;
    state.lastNonce = nonce;

    // Execute hooks
    const hookResults = await executeHooks(paths.hooks, "onMergeMerged", paths.projectRoot);

    // Auto-transition to next stage
    const transition = await performTransition(paths, state, (s) => mgm.save(s));

    const nextCommand = `reap run merge-${transition.nextStage}`;

    emitOutput({
      status: "ok",
      command: "merge-merge",
      phase: "complete",
      completed: ["gate", "artifact-read", "source-merge", "hooks", "auto-transition"],
      context: {
        id: state.id,
        hookResults,
        nextStage: transition.nextStage,
        artifactFile: transition.artifactFile,
        transitionHookResults: [...transition.stageHookResults, ...transition.transitionHookResults],
      },
      message: `Merge stage complete. Auto-advanced to ${transition.nextStage}. Run: ${nextCommand}`,
      nextCommand,
    });
  }
}
