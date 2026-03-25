import { createPaths } from "../../core/paths.js";
import { emitOutput, emitError } from "../../core/output.js";
import { scanBacklog, createBacklog } from "../../core/backlog.js";

export async function execute(action: string, options: { type?: string; title?: string; body?: string; priority?: string }): Promise<void> {
  const paths = createPaths(process.cwd());

  if (action === "create") {
    if (!options.type || !options.title) {
      emitError("backlog", 'Usage: reap backlog create --type <type> --title "<title>" [--body "<body>"] [--priority <priority>]');
    }
    const filename = await createBacklog(paths.backlog, {
      type: options.type!,
      title: options.title!,
      body: options.body,
      priority: options.priority,
    });
    emitOutput({
      status: "ok",
      command: "backlog",
      context: { action: "create", filename },
      message: `Backlog item created: ${filename}`,
    });
  } else if (action === "list") {
    const items = await scanBacklog(paths.backlog);
    emitOutput({
      status: "ok",
      command: "backlog",
      context: { action: "list", items: items.map((i) => ({ type: i.type, title: i.title, status: i.status, priority: i.priority, filename: i.filename })) },
      message: `${items.length} backlog items.`,
    });
  } else {
    emitError("backlog", `Unknown action '${action}'. Available: create, list`);
  }
}
