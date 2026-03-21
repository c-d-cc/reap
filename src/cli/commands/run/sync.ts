import type { ReapPaths } from "../../../core/paths";
import { emitOutput } from "../../../core/run-output";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  // sync는 genome + environment 둘 다 실행하는 dispatcher
  // gate 없음 — active gen 관계없이 실행 가능

  emitOutput({
    status: "prompt",
    command: "sync",
    phase: "dispatch",
    completed: ["gate"],
    context: {},
    prompt: [
      "## Sync — Full Synchronization",
      "",
      "Run both Genome and Environment synchronization in order:",
      "",
      "1. Execute `/reap.sync.genome` (run `reap run sync-genome`)",
      "2. Execute `/reap.sync.environment` (run `reap run sync-environment`)",
      "",
      "After both complete, report the results.",
    ].join("\n"),
  });
}
