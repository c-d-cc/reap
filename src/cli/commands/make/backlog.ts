import type { ReapPaths } from "../../../core/paths";
import { createBacklog, VALID_BACKLOG_TYPES } from "../../../core/backlog";
import { emitOutput, emitError } from "../../../core/run-output";

function parseFlags(argv: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--") && i + 1 < argv.length) {
      flags[arg.slice(2)] = argv[++i];
    }
  }
  return flags;
}

export async function execute(paths: ReapPaths, argv: string[]): Promise<void> {
  const flags = parseFlags(argv);

  if (!flags.type) {
    emitError("make", `--type is required. Allowed: ${VALID_BACKLOG_TYPES.join(", ")}`);
  }
  if (!flags.title) {
    emitError("make", "--title is required.");
  }

  const filename = await createBacklog(paths.backlog, {
    type: flags.type,
    title: flags.title,
    body: flags.body,
    priority: flags.priority,
  });

  const filePath = `${paths.backlog}/${filename}`;
  emitOutput({
    status: "ok",
    command: "make",
    phase: "done",
    completed: ["backlog-create"],
    message: `Backlog created: ${filename}`,
    context: { filename, type: flags.type, title: flags.title, path: filePath },
    prompt: `Backlog file created at: ${filePath}\n\nNow edit the file to add detailed content. The frontmatter is already set correctly — only edit the body (below the --- delimiter). Add:\n- Problem description (## 문제)\n- Solution approach (## 해결)\n- Specific files/functions to modify (## 수정 대상)\n- Background context if relevant (## 배경)\n\nUse the Edit tool to update the file body. Keep the frontmatter unchanged.`,
  });
}
