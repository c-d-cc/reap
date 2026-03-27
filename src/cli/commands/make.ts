import { join } from "path";
import { chmod } from "fs/promises";
import { createPaths } from "../../core/paths.js";
import { emitOutput, emitError } from "../../core/output.js";
import { createBacklog } from "../../core/backlog.js";
import { fileExists, writeTextFile, ensureDir } from "../../core/fs.js";
import { detectV15 } from "../../core/integrity.js";
import type { ReapHookEvent } from "../../types/index.js";

const VALID_HOOK_EVENTS: ReapHookEvent[] = [
  "onLifeStarted", "onLifeLearned", "onLifePlanned", "onLifeImplemented",
  "onLifeValidated", "onLifeCompleted", "onLifeTransited",
  "onMergeStarted", "onMergeDetected", "onMergeMated", "onMergeMerged",
  "onMergeReconciled", "onMergeValidated", "onMergeCompleted", "onMergeTransited",
];

export async function execute(resource: string, options: { type?: string; title?: string; body?: string; priority?: string; event?: string; name?: string; condition?: string; order?: string }): Promise<void> {
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
  } else if (resource === "hook") {
    await makeHook(paths.hooks, options);
  } else {
    emitError("make", `Unknown resource '${resource}'. Available: backlog, hook`);
  }
}

async function makeHook(hooksDir: string, options: { event?: string; name?: string; type?: string; condition?: string; order?: string }): Promise<void> {
  const event = options.event;
  const name = options.name;
  const type = (options.type ?? "md") as "sh" | "md";
  const condition = options.condition ?? "always";
  const order = parseInt(options.order ?? "50", 10);

  if (!event || !VALID_HOOK_EVENTS.includes(event as ReapHookEvent)) {
    emitError("make", `Invalid or missing --event. Valid events:\n${VALID_HOOK_EVENTS.join("\n")}`);
  }
  if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) {
    emitError("make", "Invalid or missing --name. Use alphanumeric, dash, or underscore only.");
  }
  if (type !== "sh" && type !== "md") {
    emitError("make", "Invalid --type. Use 'sh' or 'md'.");
  }

  const filename = `${event}.${name}.${type}`;
  const filePath = join(hooksDir, filename);

  await ensureDir(hooksDir);

  if (await fileExists(filePath)) {
    emitError("make", `Hook already exists: ${filename}`);
  }

  const content = type === "sh"
    ? `#!/usr/bin/env bash\n# condition: ${condition}\n# order: ${order}\n\n# TODO: Add your hook logic here\necho "${event}.${name} executed"\n`
    : `---\ncondition: ${condition}\norder: ${order}\n---\n\n<!-- TODO: Add your hook prompt here -->\n<!-- This prompt will be executed by the AI agent when the ${event} event fires. -->\n`;

  await writeTextFile(filePath, content);

  if (type === "sh") {
    await chmod(filePath, 0o755);
  }

  emitOutput({
    status: "ok",
    command: "make",
    context: { resource: "hook", filename, event, name, type, condition, order },
    message: `Hook created: ${filename}`,
  });
}
