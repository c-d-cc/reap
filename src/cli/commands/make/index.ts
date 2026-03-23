import type { ReapPaths } from "../../../core/paths";
import { emitError } from "../../../core/run-output";

type TargetExecutor = (paths: ReapPaths, argv: string[]) => Promise<void>;

const TARGETS: Record<string, () => Promise<{ execute: TargetExecutor }>> = {
  backlog: () => import("./backlog"),
};

export async function execute(paths: ReapPaths, _phase?: string, argv: string[] = []): Promise<void> {
  const target = argv[0];
  if (!target) {
    emitError("make", `Target required. Available: ${Object.keys(TARGETS).join(", ")}`);
  }

  const loader = TARGETS[target];
  if (!loader) {
    emitError("make", `Unknown target: "${target}". Available: ${Object.keys(TARGETS).join(", ")}`);
  }

  const mod = await loader();
  await mod.execute(paths, argv.slice(1));
}
