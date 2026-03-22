import type { ReapPaths } from "../../../core/paths";
import { MergeGenerationManager } from "../../../core/merge-generation";
import { generateStageToken } from "../../../core/generation";
import { readTextFile, fileExists } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";
import { executeHooks } from "../../../core/hook-engine";
import { verifyStageEntry, performTransition } from "../../../core/stage-transition";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const mgm = new MergeGenerationManager(paths);
  const state = await mgm.current();

  if (!state) {
    emitError("merge-sync", "No active Generation.");
  }
  if (state.type !== "merge") {
    emitError("merge-sync", `Generation type is '${state.type}', expected 'merge'.`);
  }
  if (state.stage !== "sync") {
    emitError("merge-sync", `Stage is '${state.stage}', expected 'sync'.`);
  }

  // Verify stage chain token from previous stage's --phase complete
  verifyStageEntry("merge-sync", state);
  await mgm.save(state);

  const mergeArtifact = paths.artifact("03-merge.md");
  if (!(await fileExists(mergeArtifact))) {
    emitError("merge-sync", "03-merge.md does not exist. Complete merge stage first.");
  }

  if (!phase || phase === "verify") {
    // Phase 1: Gate passed, instruct AI to verify genome-source consistency
    const genomeConventions = await readTextFile(paths.conventions);
    const genomeConstraints = await readTextFile(paths.constraints);
    const genomePrinciples = await readTextFile(paths.principles);
    const mergeContent = await readTextFile(mergeArtifact);

    emitOutput({
      status: "prompt",
      command: "merge-sync",
      phase: "verify",
      completed: ["gate", "context-collect"],
      context: {
        id: state.id,
        goal: state.goal,
        mergeReport: mergeContent?.slice(0, 3000),
        conventionsSummary: genomeConventions?.slice(0, 2000),
        constraintsSummary: genomeConstraints?.slice(0, 2000),
        principlesSummary: genomePrinciples?.slice(0, 2000),
      },
      prompt: [
        "## Merge Sync -- Genome-Source Consistency Verification",
        "",
        "This is NOT validation (tests/build) -- this is a semantic check that code matches genome rules.",
        "",
        "### Steps:",
        "1. Read the finalized genome (`.reap/genome/`)",
        "2. Compare genome rules against the merged source code:",
        "   - **conventions.md**: naming conventions, code style, patterns",
        "   - **constraints.md**: tech stack choices and constraints",
        "   - **principles.md**: architecture decisions",
        "   - **domain/**: business rules",
        "   - **source-map.md**: documented components vs actual files",
        "3. For each inconsistency found:",
        "   - **STOP and present to the human** (even in autonomous mode)",
        "   - Ask: fix the source, update the genome, or accept as-is with rationale",
        "   - Record the decision in `04-sync.md`",
        "4. If no inconsistencies: record 'All consistent' in `04-sync.md`",
        "",
        "### Escalation:",
        "- Every inconsistency requires user confirmation -- do NOT auto-resolve",
        "- If fixing requires significant code changes, consider `/reap.back merge`",
        "- If fixing requires genome changes, consider `/reap.back mate`",
        "",
        "When done, run: reap run merge-sync --phase complete",
      ].join("\n"),
      nextCommand: "reap run merge-sync --phase complete",
    });
  }

  if (phase === "complete") {
    // Generate stage chain token
    const { nonce, hash } = generateStageToken(state.id, state.stage);
    state.expectedTokenHash = hash;
    state.lastNonce = nonce;

    // Execute hooks
    const hookResults = await executeHooks(paths.hooks, "onMergeSynced", paths.projectRoot);

    // Auto-transition to next stage
    const transition = await performTransition(paths, state, (s) => mgm.save(s));

    const nextCommand = `reap run merge-${transition.nextStage}`;

    emitOutput({
      status: "ok",
      command: "merge-sync",
      phase: "complete",
      completed: ["gate", "context-collect", "sync-verify", "hooks", "auto-transition"],
      context: {
        id: state.id,
        hookResults,
        nextStage: transition.nextStage,
        artifactFile: transition.artifactFile,
        transitionHookResults: [...transition.stageHookResults, ...transition.transitionHookResults],
      },
      message: `Sync stage complete. Auto-advanced to ${transition.nextStage}. Run: ${nextCommand}`,
      nextCommand,
    });
  }
}
