import type { ReapPaths } from "../../../core/paths";
import { ConfigManager } from "../../../core/config";
import { emitOutput } from "../../../core/run-output";

export async function execute(paths: ReapPaths): Promise<void> {
  const config = await ConfigManager.read(paths);

  const lines = [
    `REAP Configuration (${paths.config})`,
    "",
    `  version:         ${process.env.__REAP_VERSION__ || "0.0.0"} (package)`,
    `  project:         ${config.project}`,
    `  entryMode:       ${config.entryMode}`,
    `  strict:          ${config.strict ?? false}`,
    `  language:        ${config.language ?? "(not set)"}`,
    `  autoUpdate:      ${config.autoUpdate ?? true}`,
    `  autoSubagent:    ${config.autoSubagent ?? true}`,
    `  autoIssueReport: ${config.autoIssueReport ?? false}`,
    "",
    "Edit .reap/config.yml to change settings.",
  ].join("\n");

  emitOutput({
    status: "ok",
    command: "config",
    phase: "show",
    completed: ["read-config"],
    message: lines,
  });
}
