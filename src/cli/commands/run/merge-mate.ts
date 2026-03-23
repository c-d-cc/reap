import type { ReapPaths } from "../../../core/paths";
import { MergeGenerationManager } from "../../../core/merge-generation";
import { readTextFile, fileExists } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";
import { executeHooks } from "../../../core/hook-engine";
import { performTransition, verifyNonce, setNonce } from "../../../core/stage-transition";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const mgm = new MergeGenerationManager(paths);
  const state = await mgm.current();

  if (!state) {
    emitError("merge-mate", "No active Generation.");
  }
  if (state.type !== "merge") {
    emitError("merge-mate", `Generation type is '${state.type}', expected 'merge'.`);
  }
  if (state.stage !== "mate") {
    emitError("merge-mate", `Stage is '${state.stage}', expected 'mate'.`);
  }

  const detectArtifact = paths.artifact("01-detect.md");
  if (!(await fileExists(detectArtifact))) {
    emitError("merge-mate", "01-detect.md does not exist. Complete detect stage first.");
  }

  if (!phase || phase === "resolve") {
    // Verify entry nonce from previous stage's --phase complete
    verifyNonce("merge-mate", state, "mate", "entry");
    await mgm.save(state);

    // Phase 1: Gate passed, present conflicts for resolution
    const detectContent = await readTextFile(detectArtifact);

    // Set nonce for complete phase entry — prevents skipping resolve phase
    setNonce(state, "mate", "complete");
    await mgm.save(state);

    emitOutput({
      status: "prompt",
      command: "merge-mate",
      phase: "resolve",
      completed: ["gate", "artifact-read"],
      context: {
        id: state.id,
        goal: state.goal,
        parents: state.parents,
        detectReport: detectContent?.slice(0, 5000),
      },
      prompt: [
        "## Merge Mate -- Genome Conflict Resolution",
        "",
        "Read conflicts from 01-detect.md and resolve each one:",
        "",
        "### WRITE-WRITE conflicts:",
        "- Show both versions to the human",
        "- Ask: keep A, keep B, or merge manually",
        "- NEVER auto-resolve WRITE-WRITE conflicts",
        "",
        "### CROSS-FILE conflicts:",
        "- Show the changes and ask if they are logically compatible",
        "",
        "### Steps:",
        "1. Apply the resolved genome to `.reap/genome/`",
        "2. Record all decisions in `02-mate.md`",
        "3. If no conflicts exist, record 'No conflicts - auto-pass' in 02-mate.md",
        "",
        "### Escalation:",
        "- If conflicts are complex or ambiguous, STOP and ask the human",
        "",
        "When done, run: reap run merge-mate --phase complete",
      ].join("\n"),
      nextCommand: "reap run merge-mate --phase complete",
    });
  }

  if (phase === "complete") {
    // Verify complete phase nonce from resolve phase
    verifyNonce("merge-mate", state, "mate", "complete");

    // Verify artifact exists before completing
    const mateArtifact = paths.artifact("02-mate.md");
    if (!(await fileExists(mateArtifact))) {
      emitError("merge-mate", "02-mate.md does not exist. Write the mate artifact before completing.");
    }

    // Generate entry token for next stage (receiver-based)
    setNonce(state, "merge", "entry");
    await mgm.save(state);

    // Execute hooks
    const hookResults = await executeHooks(paths.hooks, "onMergeMated", paths.projectRoot);

    // Auto-transition to next stage
    const transition = await performTransition(paths, state, (s) => mgm.save(s));

    const nextCommand = `reap run merge-${transition.nextStage}`;

    emitOutput({
      status: "ok",
      command: "merge-mate",
      phase: "complete",
      completed: ["gate", "artifact-read", "conflict-resolution", "hooks", "auto-transition"],
      context: {
        id: state.id,
        hookResults,
        nextStage: transition.nextStage,
        artifactFile: transition.artifactFile,
        transitionHookResults: [...transition.stageHookResults, ...transition.transitionHookResults],
      },
      message: `Mate stage complete. Auto-advanced to ${transition.nextStage}. Run: ${nextCommand}`,
      nextCommand,
    });
  }
}
