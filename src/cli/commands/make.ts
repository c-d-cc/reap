import { createPaths } from "../../core/paths.js";
import { emitOutput, emitError } from "../../core/output.js";
import { createBacklog } from "../../core/backlog.js";
import { detectV15 } from "../../core/integrity.js";

export async function execute(resource: string, options: { type?: string; title?: string; body?: string; priority?: string }): Promise<void> {
  const paths = createPaths(process.cwd());
  if (await detectV15(paths)) {
    emitError("make", "This project uses REAP v0.15 structure. Run '/reap.update' to upgrade to v0.16.");
  }

  if (resource === "backlog") {
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
  } else {
    emitError("make", `Unknown resource '${resource}'. Available: backlog`);
  }
}
