import {
  installSkills,
  ensureAgentsMd,
  registerSessionIntegration,
  opencodeCommandsDir,
  opencodeAgentsDir,
} from "./install.js";
import type { AdapterModule, IntegrationAction } from "../types.js";

/**
 * OpenCode adapter — fulfills the `AdapterModule` contract using the OpenCode
 * native mechanisms (opencode.json instructions/plugin + AGENTS.md).
 */
export const opencodeAdapter: AdapterModule = {
  id: "opencode",

  async installSkills(projectRoot: string): Promise<void> {
    await installSkills(projectRoot);
  },

  async ensureProjectIntegration(
    projectRoot: string,
    projectName: string,
  ): Promise<IntegrationAction> {
    return await ensureAgentsMd(projectRoot, projectName);
  },

  async registerSessionIntegration(projectRoot: string): Promise<void> {
    await registerSessionIntegration(projectRoot);
  },

  userLevelDirs(home?: string): string[] {
    return [opencodeCommandsDir(home), opencodeAgentsDir(home)];
  },
};

export default opencodeAdapter;
