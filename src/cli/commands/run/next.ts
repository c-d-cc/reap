import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { emitOutput, emitError } from "../../../core/output.js";

export async function execute(paths: ReapPaths): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("next", "No active generation.");

  const s = state!;

  emitOutput({
    status: "prompt",
    command: "next",
    completed: ["gate"],
    context: {
      id: s.id,
      stage: s.stage,
      phase: s.phase,
    },
    message: `Current: ${s.stage}:${s.phase ?? "work"}. Run: reap run ${s.stage} --phase complete`,
    nextCommand: `reap run ${s.stage} --phase complete`,
  });
}
