import { join } from "path";
import { chmod } from "fs/promises";
import type { ReapPaths } from "../../../core/paths.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { fileExists, writeTextFile, ensureDir } from "../../../core/fs.js";
import type { ReapHookEvent } from "../../../types/index.js";

const VALID_EVENTS: ReapHookEvent[] = [
  "onLifeStarted", "onLifeLearned", "onLifePlanned", "onLifeImplemented",
  "onLifeValidated", "onLifeCompleted", "onLifeTransited",
  "onMergeStarted", "onMergeDetected", "onMergeMated", "onMergeMerged",
  "onMergeReconciled", "onMergeValidated", "onMergeCompleted", "onMergeTransited",
];

export async function makeHook(paths: ReapPaths, options: Record<string, string | undefined>): Promise<void> {
  const event = options.event;
  const name = options.name;
  const type = (options.type ?? "md") as "sh" | "md";
  const condition = options.condition ?? "always";
  const order = parseInt(options.order ?? "50", 10);

  if (!event || !VALID_EVENTS.includes(event as ReapHookEvent)) {
    emitError("make", `Invalid or missing --event. Valid events:\n${VALID_EVENTS.join("\n")}`);
  }
  if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) {
    emitError("make", "Invalid or missing --name. Use alphanumeric, dash, or underscore only.");
  }
  if (type !== "sh" && type !== "md") {
    emitError("make", "Invalid --type. Use 'sh' or 'md'.");
  }

  const filename = `${event}.${name}.${type}`;
  const filePath = join(paths.hooks, filename);

  await ensureDir(paths.hooks);

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

  const prompt = type === "sh"
    ? `Hook file created: ${filename}. You MUST now use the Edit tool to replace the TODO placeholder with the actual shell commands this hook should execute.`
    : `Hook file created: ${filename}. You MUST now use the Edit tool to replace the TODO placeholder with the actual AI prompt instructions this hook should execute when the ${event} event fires.`;

  emitOutput({
    status: "ok",
    command: "make",
    context: { resource: "hook", filename, event, name, type, condition, order },
    message: `Hook created: ${filename}`,
    prompt,
  });
}
