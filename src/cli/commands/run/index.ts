import { execSync } from "child_process";
import { ReapPaths } from "../../../core/paths";
import { ConfigManager } from "../../../core/config";
import { emitError } from "../../../core/run-output";

export type CommandExecutor = (paths: ReapPaths, phase?: string, argv?: string[]) => Promise<void>;

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
  "evolve-recovery": () => import("./evolve-recovery"),
  pull: () => import("./pull"),
  config: () => import("./config"),
  "update-genome": () => import("./update-genome"),
  refreshKnowledge: () => import("./refresh-knowledge"),
};

export async function runCommand(command: string, phase?: string, argv: string[] = []): Promise<void> {
  const cwd = process.cwd();
  const paths = new ReapPaths(cwd);

  if (!(await paths.isReapProject())) {
    emitError(command, "Not a REAP project. Run 'reap init' first.");
  }

  const loader = COMMANDS[command];
  if (!loader) {
    emitError(command, `Unknown command: ${command}. Available: ${Object.keys(COMMANDS).join(", ")}`);
  }

  try {
    const mod = await loader();
    await mod.execute(paths, phase, argv);
  } catch (err) {
    // Intentional errors (emitError → process.exit) don't reach here.
    // This catches unexpected runtime errors only.
    try {
      const config = await ConfigManager.read(paths);
      if (config.autoIssueReport) {
        const version = process.env.__REAP_VERSION__ || "unknown";
        const errMsg = err instanceof Error ? err.message : String(err);
        const title = `[auto] reap run ${command}: ${errMsg.slice(0, 80)}`;
        const body = [
          `**REAP Version**: ${version}`,
          `**Command**: reap run ${command}${phase ? ` --phase ${phase}` : ""}`,
          `**Error**: ${errMsg}`,
          `**OS**: ${process.platform} ${process.arch}`,
          `**Node**: ${process.version}`,
        ].join("\\n");
        execSync(
          `gh issue create --repo c-d-cc/reap --title "${title}" --label "auto-reported,bug" --body "${body}"`,
          { stdio: "ignore", timeout: 10000 },
        );
      }
    } catch { /* report is best-effort */ }

    // Re-emit the original error
    emitError(command, err instanceof Error ? err.message : String(err));
  }
}
