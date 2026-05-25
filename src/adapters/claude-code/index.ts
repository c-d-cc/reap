import { installSkills, registerSessionHooks } from "./install.js";
import { ensureClaudeMd } from "../../cli/commands/init/common.js";
import type { AdapterModule, IntegrationAction } from "../types.js";

/**
 * Claude Code adapter — wraps the existing install/sync functions to satisfy
 * the `AdapterModule` interface. This is a thin wrapper; behavior is
 * unchanged from prior generations.
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
    await registerSessionHooks();
  },
};

export default claudeCodeAdapter;
