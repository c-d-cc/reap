import { getAdapter, resolveAgentClient } from "../../adapters/index.js";

/**
 * `reap install-skills` — dispatch to the agentClient-specific adapter.
 *
 * - claude-code → install `~/.claude/commands/*` skills + register session hooks
 * - opencode    → copy plugin source to `.opencode/plugins/` and sync `opencode.json`
 *
 * If `.reap/config.yml` is missing (not a REAP project), defaults to
 * claude-code for backward-compatibility (matches v0.16 behavior).
 *
 * Still worth having as an explicit command even though `ensureUserLevelAssets`
 * now runs before every command: this one reports what it did, does the
 * project-level wiring too, and re-copies regardless of the install stamp.
 */
export async function execute(): Promise<void> {
  const cwd = process.cwd();
  const adapter = getAdapter(await resolveAgentClient(cwd));
  await adapter.installSkills(cwd);
}
