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
    emitError("merge-validation", "No active Generation.");
  }
  if (state.type !== "merge") {
    emitError("merge-validation", `Generation type is '${state.type}', expected 'merge'.`);
  }
  if (state.stage !== "validation") {
    emitError("merge-validation", `Stage is '${state.stage}', expected 'validation'.`);
  }

  const syncArtifact = paths.artifact("04-sync.md");
  if (!(await fileExists(syncArtifact))) {
    emitError("merge-validation", "04-sync.md does not exist. Complete sync stage first.");
  }

  if (!phase || phase === "work") {
    // Verify entry nonce from previous stage's --phase complete
    verifyNonce("merge-validation", state, "validation", "entry");
    await mgm.save(state);

    // Phase 1: Gate passed, instruct AI to run validation commands
    const constraintsContent = await readTextFile(paths.constraints);

    // Set nonce for complete phase entry — prevents skipping work phase
    setNonce(state, "validation", "complete");
    await mgm.save(state);

    emitOutput({
      status: "prompt",
      command: "merge-validation",
      phase: "work",
      completed: ["gate", "context-collect"],
      context: {
        id: state.id,
        goal: state.goal,
        constraintsContent: constraintsContent?.slice(0, 2000),
      },
      prompt: [
        "## Merge Validation -- Automated Verification",
        "",
        "HARD-GATE:",
        "- Do NOT declare 'pass' without running the validation commands.",
        "- Do NOT reuse results from a previous run -- execute them FRESH.",
        "",
        "### Steps:",
        "1. Read validation commands from `.reap/genome/constraints.md`",
        "2. Execute all commands in order:",
        "   - Tests (`bun test`)",
        "   - Type check (`bunx tsc --noEmit`)",
        "   - Build (`npm run build`)",
        "3. Record results in `05-validation.md`",
        "4. If all pass: run `reap run merge-validation --phase complete`",
        "5. If any fail:",
        "   - Analyze the failure",
        "   - `/reap.back merge` to fix source issues",
        "   - Or `/reap.back mate` if the genome needs adjustment",
        "   - Do NOT run --phase complete on failure",
      ].join("\n"),
      nextCommand: "reap run merge-validation --phase complete",
    });
  }

  if (phase === "complete") {
    // Verify complete phase nonce from work phase
    verifyNonce("merge-validation", state, "validation", "complete");

    // Phase 2: Execute hooks (only on pass) and signal completion
    const validationArtifact = paths.artifact("05-validation.md");
    if (!(await fileExists(validationArtifact))) {
      emitError("merge-validation", "05-validation.md does not exist. Complete validation work first.");
    }

    // Generate entry token for next stage (receiver-based)
    setNonce(state, "completion", "entry");
    await mgm.save(state);

    const hookResults = await executeHooks(paths.hooks, "onMergeValidated", paths.projectRoot);

    // Auto-transition to next stage
    const transition = await performTransition(paths, state, (s) => mgm.save(s));

    const nextCommand = `reap run merge-${transition.nextStage}`;

    emitOutput({
      status: "ok",
      command: "merge-validation",
      phase: "complete",
      completed: ["gate", "context-collect", "validation-work", "hooks", "auto-transition"],
      context: {
        id: state.id,
        hookResults,
        nextStage: transition.nextStage,
        artifactFile: transition.artifactFile,
        transitionHookResults: [...transition.stageHookResults, ...transition.transitionHookResults],
      },
      message: `Validation stage complete. Auto-advanced to ${transition.nextStage}. Run: ${nextCommand}`,
      nextCommand,
    });
  }
}
