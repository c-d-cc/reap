import {
  installSkills,
  installSlashCommandsOnly,
  installAgents,
  registerSessionHooks,
} from "./install.js";
import { ensureClaudeMd } from "../../cli/commands/init/common.js";
import type { AdapterModule, IntegrationAction } from "../types.js";

/**
 * Claude Code adapter — wraps the existing install/sync functions to satisfy
 * the `AdapterModule` interface.
 *
 * `registerSessionIntegration` is called by `reap update` and must keep three
 * user-level surfaces in sync with the bundled REAP version:
 *   1. slash commands (`~/.claude/commands/reap.*.md`)
 *   2. agent definitions (`~/.claude/agents/reap-*.md`)  ← gen-066
 *   3. SessionStart hooks (`~/.claude/settings.json`)
 *
 * Both slash-command and agent syncs are idempotent and prefix-anchored —
 * user-supplied files and `reapdev.*` entries are preserved on every run.
 * Without the agent sync here (gen-066) users who only run `reap update` (and
 * never `reap install-skills`) miss new bundled agent definitions such as
 * `reap-evaluate.md`.
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
    await installAgents();
    await registerSessionHooks();
  },
};

export default claudeCodeAdapter;
