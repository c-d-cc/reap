/**
 * REAP OpenCode plugin.
 *
 * Purpose:
 *   - On `session.created`, refresh `.reap/.session-state.md` so that
 *     OpenCode's `instructions`-based static loading picks up the current
 *     REAP state for the next session/tool turn.
 *   - On `tool.execute.before`, refresh once if not already done in this
 *     plugin instance (handles the "resume" case where `session.created`
 *     does not fire).
 *
 * Failure mode: best-effort. If `reap` CLI is missing, not a REAP project,
 * or any other error occurs, the plugin silently swallows it — never blocks
 * the user's session.
 *
 * Plugin API target: OpenCode plugin spec as of 2026-05
 *   - signature: `async ({ project, client, $, directory, worktree }) => hooks`
 *   - hooks used: `session.created`, `tool.execute.before`
 *
 * For typed development, install `@opencode-ai/plugin` and replace the
 * inline parameter type with `import type { Plugin } from "@opencode-ai/plugin"`.
 */

type ShellTagFn = (strings: TemplateStringsArray, ...values: unknown[]) => {
  cwd(dir: string): ShellResult;
  quiet?(): ShellResult;
};

type ShellResult = {
  cwd?(dir: string): ShellResult;
  quiet?(): ShellResult;
  then<T = unknown>(onfulfilled?: ((v: unknown) => T) | null, onrejected?: ((r: unknown) => T) | null): Promise<T>;
};

interface PluginContext {
  $: ShellTagFn;
  directory: string;
  // Other fields (project, client, worktree) are unused by this plugin.
  [k: string]: unknown;
}

export const reapPlugin = async ({ $, directory }: PluginContext) => {
  let dumpedThisSession = false;

  const dump = async () => {
    try {
      // `reap dump-state --silent` writes .reap/.session-state.md and
      // exits 0 even when the project is not a REAP project (silent mode).
      const cmd = $`reap dump-state --silent`.cwd(directory);
      // Prefer quiet() if available to suppress incidental stdout.
      const runnable = typeof cmd.quiet === "function" ? cmd.quiet() : cmd;
      await runnable;
      dumpedThisSession = true;
    } catch {
      // REAP not installed, not a REAP project, or transient error — ignore.
    }
  };

  return {
    "session.created": async () => {
      await dump();
    },
    "tool.execute.before": async () => {
      if (!dumpedThisSession) await dump();
    },
  };
};

export default reapPlugin;
