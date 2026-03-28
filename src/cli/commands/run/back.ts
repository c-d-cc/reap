import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { verifyTransition, prepareStageEntry } from "../../../core/stage-transition.js";
import type { LifeCycleStage, MergeStage } from "../../../types/index.js";

export async function execute(paths: ReapPaths, _phase?: string, reason?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("back", "No active generation.");

  const s = state!;
  const fromStage = s.stage;

  // Find the back transition target from pendingTransitions
  // Back transitions are entries where the target stage differs from the current stage
  // and targets a :entry phase of a previous stage
  if (!s.pendingTransitions) {
    emitError("back", "Cannot go back — no pending transitions available.");
  }

  const backTargets = Object.keys(s.pendingTransitions!).filter((key) => {
    const [targetStage] = key.split(":");
    return targetStage !== fromStage && key.endsWith(":entry");
  });

  if (backTargets.length === 0) {
    emitError("back", "Cannot go back — no back transition available (already at first stage or back not supported here).");
  }

  const target = backTargets[0]; // e.g., "implementation:entry"
  const [targetStage, targetPhase] = target.split(":");

  // Verify and consume the back transition nonce
  verifyTransition("back", s, target);

  // Update stage to target
  s.stage = targetStage as LifeCycleStage | MergeStage;

  // Prepare entry nonces for the target stage (entry ticket + back from there)
  prepareStageEntry(s, target);

  // Record in timeline
  if (!s.timeline) s.timeline = [];
  s.timeline.push({
    stage: targetStage,
    at: new Date().toISOString(),
    from: fromStage,
    reason: reason ?? "regression",
  } as any);

  await gm.save(s);

  emitOutput({
    status: "ok",
    command: "back",
    completed: ["gate", "verify-back-nonce", "apply-regression"],
    context: {
      id: s.id,
      fromStage,
      targetStage,
      reason: reason ?? "regression",
    },
    message: `Regressed: ${fromStage} → ${targetStage}. Run: reap run ${targetStage}`,
    nextCommand: `reap run ${targetStage}`,
  });
}
