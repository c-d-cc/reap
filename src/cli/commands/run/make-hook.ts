import { join } from "path";
import { chmod } from "fs/promises";
import type { ReapPaths } from "../../../core/paths.js";
import { fileExists, writeTextFile, ensureDir } from "../../../core/fs.js";
import { emitOutput, emitError } from "../../../core/output.js";
import type { ReapHookEvent } from "../../../types/index.js";

const VALID_EVENTS: ReapHookEvent[] = [
  "onLifeStarted", "onLifeLearned", "onLifePlanned", "onLifeImplemented",
  "onLifeValidated", "onLifeCompleted", "onLifeTransited",
  "onMergeStarted", "onMergeDetected", "onMergeMated", "onMergeMerged",
  "onMergeReconciled", "onMergeValidated", "onMergeCompleted", "onMergeTransited",
];

const VALID_TYPES = ["sh", "md"] as const;

interface MakeHookOptions {
  event: string;
  name: string;
  type: "sh" | "md";
  condition: string;
  order: number;
}

function parseArgs(phase?: string, extra?: string): MakeHookOptions {
  if (!extra) {
    emitError("make-hook", "Missing arguments. Usage: reap run make-hook --phase <event> --goal '{\"name\":\"my-hook\",\"type\":\"md\"}'");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(extra);
  } catch {
    emitError("make-hook", `Invalid JSON: ${extra}`);
  }

  const event = phase ?? parsed.event;
  const name = parsed.name;
  const type = parsed.type ?? "md";
  const condition = parsed.condition ?? "always";
  const order = parsed.order ?? 50;

  if (!event || !VALID_EVENTS.includes(event as ReapHookEvent)) {
    emitError("make-hook", `Invalid event '${event}'. Valid events:\n${VALID_EVENTS.join("\n")}`);
  }
  if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) {
    emitError("make-hook", `Invalid hook name '${name}'. Use alphanumeric, dash, or underscore only.`);
  }
  if (!VALID_TYPES.includes(type as any)) {
    emitError("make-hook", `Invalid type '${type}'. Use 'sh' or 'md'.`);
  }

  return { event, name, type: type as "sh" | "md", condition, order };
}

function generateShContent(opts: MakeHookOptions): string {
  return `#!/usr/bin/env bash
# condition: ${opts.condition}
# order: ${opts.order}

# TODO: Add your hook logic here
echo "${opts.event}.${opts.name} executed"
`;
}

function generateMdContent(opts: MakeHookOptions): string {
  return `---
condition: ${opts.condition}
order: ${opts.order}
---

<!-- TODO: Add your hook prompt here -->
<!-- This prompt will be executed by the AI agent when the ${opts.event} event fires. -->
`;
}

export async function execute(paths: ReapPaths, phase?: string, extra?: string): Promise<void> {
  const opts = parseArgs(phase, extra);
  const filename = `${opts.event}.${opts.name}.${opts.type}`;
  const filePath = join(paths.hooks, filename);

  await ensureDir(paths.hooks);

  if (await fileExists(filePath)) {
    emitError("make-hook", `Hook already exists: ${filename}`);
  }

  const content = opts.type === "sh" ? generateShContent(opts) : generateMdContent(opts);
  await writeTextFile(filePath, content);

  if (opts.type === "sh") {
    await chmod(filePath, 0o755);
  }

  emitOutput({
    status: "ok",
    command: "make-hook",
    message: `Hook created: ${filename}`,
    context: {
      created: filename,
      event: opts.event,
      name: opts.name,
      type: opts.type,
      condition: opts.condition,
      order: opts.order,
      path: filePath,
    },
  });
}
