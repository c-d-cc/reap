import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { verifyBackNonce } from "../../../core/stage-transition.js";

export async function execute(paths: ReapPaths, _phase?: string, reason?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("back", "No active generation.");

  const s = state!;
  const fromStage = s.stage;
  const target = s.backTarget;

  if (!target) {
    emitError("back", "Cannot go back — already at first stage or no back target available.");
  }

  // Verify and consume back nonce, set new forward nonce for target stage
  verifyBackNonce("back", s);

  // Record in timeline
  if (!s.timeline) s.timeline = [];
  s.timeline.push({
    stage: target!,
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
      targetStage: target,
      reason: reason ?? "regression",
    },
    message: `Regressed: ${fromStage} → ${target}. Run: reap run ${target}`,
    nextCommand: `reap run ${target}`,
  });
}
