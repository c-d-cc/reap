import YAML from "yaml";
import { createPaths } from "../../core/paths.js";
import { readTextFile, fileExists } from "../../core/fs.js";
import { emitOutput, emitError } from "../../core/output.js";
import { detectV15 } from "../../core/integrity.js";
import type { ReapConfig } from "../../types/index.js";

export async function execute(): Promise<void> {
  const root = process.cwd();
  const paths = createPaths(root);

  if (!(await fileExists(paths.config))) {
    emitError("config", "Not a reap project. Run 'reap init' first.");
  }
  if (await detectV15(paths)) {
    emitError("config", "This project uses REAP v0.15 structure. Run '/reap.update' to upgrade to v0.16.");
  }

  const configContent = await readTextFile(paths.config);
  if (!configContent) {
    emitError("config", "Config file is empty.");
  }

  const config = YAML.parse(configContent!) as ReapConfig;

  emitOutput({
    status: "ok",
    command: "config",
    context: {
      project: config.project,
      language: config.language,
      autoSubagent: config.autoSubagent,
      strictEdit: config.strictEdit,
      strictMerge: config.strictMerge,
      agentClient: config.agentClient,
      autoUpdate: config.autoUpdate,
      cruiseCount: config.cruiseCount ?? null,
    },
    message: `REAP Configuration for '${config.project}'. Edit .reap/config.yml to change settings.`,
  });
}
