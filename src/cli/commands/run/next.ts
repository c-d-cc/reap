import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { emitOutput, emitError } from "../../../core/run-output";

export async function execute(paths: ReapPaths, _phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();
  if (!state) {
    emitError("next", "No active Generation. Run /reap.start first.");
  }

  const isMerge = state.type === "merge";

  // With auto-transition, --phase complete already advances the stage.
  // If lastNonce exists, the stage was already advanced by the previous stage's --phase complete.
  // next.ts now simply confirms the transition and tells the user to run the next stage command.
  if (state.lastNonce) {
    const nextCommand = isMerge ? `reap run merge-${state.stage}` : `reap run ${state.stage}`;

    emitOutput({
      status: "ok",
      command: "next",
      phase: "done",
      completed: ["gate", "auto-transition-detected"],
      context: {
        generationId: state.id,
        stage: state.stage,
        type: state.type,
      },
      message: `Stage already advanced to ${state.stage} by auto-transition. Run: ${nextCommand}`,
      nextCommand,
    });
  }

  // No lastNonce means no --phase complete was called, or the stage entry already consumed the token.
  // Either way, there's nothing to transition.
  emitError("next", `Stage transition not available. The current stage '${state.stage}' has not been completed yet. Run the stage command with --phase complete first, which will auto-advance to the next stage.`);
}
