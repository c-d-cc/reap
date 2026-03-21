import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { emitOutput, emitError } from "../../../core/run-output";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!phase || phase === "check") {
    // Phase 1: Gate — check state and warn if generation in progress
    const inProgress = state && state.id && state.stage !== "completion";

    emitOutput({
      status: "prompt",
      command: "push",
      phase: "check",
      completed: ["gate"],
      context: {
        hasActiveGeneration: !!inProgress,
        generationId: state?.id,
        stage: state?.stage,
      },
      prompt: inProgress
        ? `Generation ${state.id} is in progress (stage: ${state.stage}). Ask the user: 'Push anyway? (yes/no)'. If no: STOP. If yes: run \`git rev-parse --abbrev-ref HEAD\` to get branch, then \`git push origin <branch>\`. Report the result.`
        : "Run `git rev-parse --abbrev-ref HEAD` to get the current branch, then `git push origin <branch>`. Report the result.",
    });
  }
}
