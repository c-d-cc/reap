import YAML from "yaml";
import { getAdapter } from "../../adapters/index.js";
import { createPaths } from "../../core/paths.js";
import { readTextFile, fileExists } from "../../core/fs.js";
import type { ReapConfig } from "../../types/index.js";

/**
 * `reap install-skills` — dispatch to the agentClient-specific adapter.
 *
 * - claude-code → install `~/.claude/commands/*` skills + register session hooks
 * - opencode    → copy plugin source to `.opencode/plugins/` and sync `opencode.json`
 *
 * If `.reap/config.yml` is missing (not a REAP project), defaults to
 * claude-code for backward-compatibility (matches v0.16 behavior).
 */
export async function execute(): Promise<void> {
  const cwd = process.cwd();
  const paths = createPaths(cwd);

  let agentClient: ReapConfig["agentClient"] | undefined;
  if (await fileExists(paths.config)) {
    const raw = await readTextFile(paths.config);
    if (raw) {
      try {
        const cfg = YAML.parse(raw) as ReapConfig;
        agentClient = cfg.agentClient;
      } catch { /* fall back to default */ }
    }
  }

  const adapter = getAdapter(agentClient);
  await adapter.installSkills(cwd);
}
