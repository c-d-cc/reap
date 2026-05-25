import type { ReapOutput } from "../types/index.js";
import { dumpStateSync, DUMP_COMMANDS } from "./dump-state-sync.js";

const ARTIFACT_REMINDER = "\n\n**Reminder**: If this command created or referenced any template files (artifacts, backlog, etc.), you MUST fill in ALL template sections with concrete content. Do not leave `<!-- -->` placeholders unfilled.";

/**
 * Emit a structured output and exit.
 *
 * For lifecycle commands (`DUMP_COMMANDS`), this function also synchronously
 * writes the current dynamic REAP state to `.reap/.session-state.md` before
 * exit so that OpenCode (and any other consumer of that file) sees the
 * post-command state on the next session. Sync I/O is used because
 * `emitOutput` itself is synchronous and ends with `process.exit(0)` —
 * see `src/core/dump-state-sync.ts`.
 */
export function emitOutput(output: ReapOutput): never {
  if (output.prompt) {
    output.prompt += ARTIFACT_REMINDER;
  }

  if (output.command && DUMP_COMMANDS.has(output.command)) {
    try {
      dumpStateSync(process.cwd());
    } catch {
      // Silent — dump must never break a lifecycle command.
    }
  }

  console.log(JSON.stringify(output, null, 2));
  process.exit(0);
}

export function emitError(command: string, message: string): never {
  emitOutput({
    status: "error",
    command,
    message,
  });
}
