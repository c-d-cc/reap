import {
  installSkills,
  syncUserLevelAssets,
  claudeCodeCommandsDir,
} from "./install.js";
import { ensureClaudeMd } from "../../cli/commands/init/common.js";
import type { AdapterModule, IntegrationAction, UserLevelSyncResult } from "../types.js";

/**
 * Claude Code adapter — wraps the existing install/sync functions to satisfy
 * the `AdapterModule` interface.
 *
 * `installSkills`, `registerSessionIntegration` (called by `reap update`) and
 * `ensureUserLevelAssets` (called before every command) all keep the same four
 * user-level surfaces current, so they share one owner — `syncUserLevelAssets`
 * in `install.ts`:
 *   1. slash commands (`~/.claude/commands/reap.*.md`)
 *   2. agent definitions (`~/.claude/agents/reap-*.md`)  ← gen-066
 *   3. SessionStart hooks (`~/.claude/settings.json`)
 *   4. `~/.reap/reap-guide.md`
 *
 * Every sync is idempotent and prefix-anchored — user-supplied files and
 * `reapdev.*` entries are preserved on every run. Without the `reap update`
 * caller (gen-066) users who only run `reap update` miss new bundled agent
 * definitions such as `reap-evaluate.md`; without the third caller (gen-087)
 * users whose npm blocked the postinstall get none of the four at all.
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
    await syncUserLevelAssets();
  },

  async syncUserLevelAssets(home?: string): Promise<UserLevelSyncResult> {
    return await syncUserLevelAssets(home);
  },

  // reap:carrier(claude-code-commands-path)
  userLevelDirs(home?: string): string[] {
    // `~/.claude/agents/` is deliberately absent: installAgents writes
    // `reap-*.md` there, which the checker matches with a `reap.` prefix — the
    // dot makes them distinct, so they were never flagged.
    return [claudeCodeCommandsDir(home)];
  },
};

export default claudeCodeAdapter;
