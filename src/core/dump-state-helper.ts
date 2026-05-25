import { buildKnowledgeContext } from "../cli/commands/load-context.js";
import { createPaths } from "./paths.js";
import { writeTextFile } from "./fs.js";

/**
 * Best-effort dump of dynamic REAP context to `.reap/.session-state.md`.
 *
 * Invoked at the end of every REAP lifecycle command so that the OpenCode
 * plugin (and any other consumer of `.reap/.session-state.md`) sees the
 * post-command state on the next session.
 *
 * Failure is silent: this is a side-effect, not the primary contract.
 * Under claude-code this still writes the file — harmless because the file
 * is gitignored and unread by Claude Code's hooks.
 */
export async function dumpStateBestEffort(cwd: string): Promise<void> {
  try {
    const ctx = await buildKnowledgeContext(cwd);
    if (!ctx) return; // Not a REAP project — nothing to dump.
    const paths = createPaths(cwd);
    await writeTextFile(paths.sessionState, ctx + "\n");
  } catch {
    // Silent — never block lifecycle commands.
  }
}
