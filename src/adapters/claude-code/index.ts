import {
  installSkills,
  installSlashCommandsOnly,
  registerSessionHooks,
} from "./install.js";
import { ensureClaudeMd } from "../../cli/commands/init/common.js";
import type { AdapterModule, IntegrationAction } from "../types.js";

/**
 * Claude Code adapter — wraps the existing install/sync functions to satisfy
 * the `AdapterModule` interface.
 *
 * `registerSessionIntegration` is called by `reap update` and must keep both
 * the user-level slash commands (`~/.claude/commands/reap.*.md`) and the
 * SessionStart hooks (`~/.claude/settings.json`) in sync with the bundled REAP
 * version. The user-level slash command sync is idempotent and prefix-anchored
 * (`reap.*.md` only — user-supplied commands and `reapdev.*` are preserved).
 */
export const claudeCodeAdapter: AdapterModule = {
  id: "claude-code",

  async installSkills(_projectRoot: string): Promise<void> {
    await installSkills(_projectRoot);
  },

  async ensureProjectIntegration(projectRoot: string, projectName: string): Promise<IntegrationAction> {
    return await ensureClaudeMd(projectRoot, projectName);
  },

  async registerSessionIntegration(_projectRoot: string): Promise<void> {
    await installSlashCommandsOnly();
    await registerSessionHooks();
  },
};

export default claudeCodeAdapter;
