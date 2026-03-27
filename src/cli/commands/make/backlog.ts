import type { ReapPaths } from "../../../core/paths.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { createBacklog } from "../../../core/backlog.js";

export async function makeBacklog(paths: ReapPaths, options: Record<string, string | undefined>): Promise<void> {
  if (!options.type || !options.title) {
    emitError("make", 'Usage: reap make backlog --type <type> --title "<title>" [--body "<body>"] [--priority <priority>]');
  }
  const filename = await createBacklog(paths.backlog, {
    type: options.type!,
    title: options.title!,
    body: options.body,
    priority: options.priority,
  });
  emitOutput({
    status: "ok",
    command: "make",
    context: { resource: "backlog", filename },
    message: `Backlog item created: ${filename}`,
    prompt: `The backlog file has been created with template sections (Problem, Solution, Files to Change). You MUST now use the Edit tool to fill in these sections with concrete content. Do not leave <!-- --> placeholders.`,
  });
}
