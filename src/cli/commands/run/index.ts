import { ReapPaths } from "../../../core/paths";
import { emitError } from "../../../core/run-output";

export type CommandExecutor = (paths: ReapPaths, phase?: string) => Promise<void>;

const COMMANDS: Record<string, () => Promise<{ execute: CommandExecutor }>> = {
  next: () => import("./next"),
  back: () => import("./back"),
  start: () => import("./start"),
  completion: () => import("./completion"),
  abort: () => import("./abort"),
  push: () => import("./push"),
  objective: () => import("./objective"),
  planning: () => import("./planning"),
  implementation: () => import("./implementation"),
  validation: () => import("./validation"),
  evolve: () => import("./evolve"),
  sync: () => import("./sync"),
  "sync-genome": () => import("./sync-genome"),
  "sync-environment": () => import("./sync-environment"),
  help: () => import("./help"),
  report: () => import("./report"),
  "merge-start": () => import("./merge-start"),
  "merge-detect": () => import("./merge-detect"),
  "merge-mate": () => import("./merge-mate"),
  "merge-merge": () => import("./merge-merge"),
  "merge-sync": () => import("./merge-sync"),
  "merge-validation": () => import("./merge-validation"),
  "merge-completion": () => import("./merge-completion"),
  "merge-evolve": () => import("./merge-evolve"),
  merge: () => import("./merge"),
  pull: () => import("./pull"),
};

export async function runCommand(command: string, phase?: string): Promise<void> {
  const cwd = process.cwd();
  const paths = new ReapPaths(cwd);

  if (!(await paths.isReapProject())) {
    emitError(command, "Not a REAP project. Run 'reap init' first.");
  }

  const loader = COMMANDS[command];
  if (!loader) {
    emitError(command, `Unknown command: ${command}. Available: ${Object.keys(COMMANDS).join(", ")}`);
  }

  const mod = await loader();
  await mod.execute(paths, phase);
}
