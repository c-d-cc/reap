import { buildKnowledgeContext } from "./load-context.js";
import { createPaths } from "../../core/paths.js";
import { writeTextFile } from "../../core/fs.js";

/**
 * `reap dump-state` — write the current dynamic REAP context to
 * `.reap/.session-state.md`. The content is identical to what
 * `reap load-context` emits via `buildKnowledgeContext()` (current generation
 * state, strict-mode directive, language directive — the dynamic-only output
 * separated in gen-062).
 *
 * Used by:
 *   - OpenCode plugin (`session.created` / `tool.execute.before`)
 *   - Every REAP lifecycle command (`dumpStateBestEffort`) — harmless under
 *     claude-code because the file is gitignored and unread by Claude.
 *
 * Options:
 *   --stdout   — write to stdout instead of file (debugging)
 *   --silent   — exit 0 silently on any error / non-REAP project
 */
export interface DumpStateOptions {
  stdout?: boolean;
  silent?: boolean;
}

export async function execute(opts: DumpStateOptions = {}): Promise<void> {
  try {
    const cwd = process.cwd();
    const ctx = await buildKnowledgeContext(cwd);

    if (!ctx) {
      // Not a REAP project (no .reap/config.yml).
      if (opts.silent) {
        process.exit(0);
      }
      process.stderr.write("Not a REAP project (no .reap/config.yml found).\n");
      process.exit(1);
    }

    if (opts.stdout) {
      process.stdout.write(ctx + "\n");
    } else {
      const paths = createPaths(cwd);
      await writeTextFile(paths.sessionState, ctx + "\n");
    }
    process.exit(0);
  } catch (err) {
    if (opts.silent) {
      process.exit(0);
    }
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`reap dump-state failed: ${msg}\n`);
    process.exit(1);
  }
}
