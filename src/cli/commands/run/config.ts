import type { ReapPaths } from "../../../core/paths";
import { ConfigManager } from "../../../core/config";
import { emitOutput } from "../../../core/run-output";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const config = await ConfigManager.read(paths);

  emitOutput({
    status: "prompt",
    command: "config",
    phase: "show",
    completed: ["read-config"],
    context: {
      config: {
        version: config.version,
        project: config.project,
        entryMode: config.entryMode,
        strict: config.strict ?? false,
        language: config.language ?? "(not set)",
        autoUpdate: config.autoUpdate ?? true,
        autoSubagent: config.autoSubagent ?? true,
        autoIssueReport: config.autoIssueReport ?? false,
      },
      configPath: paths.config,
    },
    prompt: "Show the current REAP configuration to the user in a readable format. If the user wants to change a setting, edit .reap/config.yml directly.",
  });
}
