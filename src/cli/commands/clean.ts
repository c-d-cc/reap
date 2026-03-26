import { rm, readdir, mkdir } from "fs/promises";
import { join } from "path";
import { createPaths } from "../../core/paths.js";
import { fileExists, writeTextFile } from "../../core/fs.js";
import { emitOutput, emitError } from "../../core/output.js";
import { detectV15 } from "../../core/integrity.js";

export interface CleanOptions {
  lineage?: "compress" | "delete";
  life?: boolean;
  backlog?: boolean;
  hooks?: "reset";
}

export interface CleanResult {
  actions: string[];
}

/** Clean (reset) a REAP project based on user options. */
export async function cleanProject(
  projectRoot: string, options: CleanOptions,
): Promise<CleanResult> {
  const paths = createPaths(projectRoot);
  const actions: string[] = [];

  // 1. Handle lineage
  if (options.lineage) {
    await cleanLineage(paths.lineage, options.lineage, actions);
  }

  // 2. Handle life (current generation + artifacts, NOT backlog)
  if (options.life) {
    await cleanLife(paths.life, actions);
  }

  // 3. Handle backlog
  if (options.backlog) {
    await cleanDir(paths.backlog, "Backlog", actions);
  }

  // 4. Handle hooks
  if (options.hooks === "reset") {
    await cleanDir(paths.hooks, "Hooks", actions);
  }

  return { actions };
}

async function cleanLineage(
  lineageDir: string, mode: "compress" | "delete", actions: string[],
): Promise<void> {
  if (!(await fileExists(lineageDir))) {
    actions.push("Lineage: directory not found (skip)");
    return;
  }

  let entries: string[];
  try {
    entries = await readdir(lineageDir);
  } catch {
    actions.push("Lineage: read failed (skip)");
    return;
  }

  const genDirs = entries.filter(e => e.startsWith("gen-"));
  if (genDirs.length === 0) {
    actions.push("Lineage: no generation records (skip)");
    return;
  }

  if (mode === "delete") {
    for (const entry of entries) {
      await rm(join(lineageDir, entry), { recursive: true, force: true });
    }
    actions.push(`Lineage: deleted ${entries.length} item(s)`);
  } else {
    // compress: create epoch summary and clear gen directories
    const epochId = `epoch-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`;
    const summary = [
      `# Epoch: ${epochId}`,
      `# Compressed ${genDirs.length} generations`,
      `# Date: ${new Date().toISOString()}`,
      "",
      "## Generations",
      ...genDirs.map(d => `- ${d}`),
      "",
    ].join("\n");

    // Remove individual generation directories
    for (const dir of genDirs) {
      await rm(join(lineageDir, dir), { recursive: true, force: true });
    }

    await writeTextFile(join(lineageDir, `${epochId}.md`), summary);
    actions.push(`Lineage: compressed ${genDirs.length} generation(s) into ${epochId}`);
  }
}

async function cleanLife(lifeDir: string, actions: string[]): Promise<void> {
  if (!(await fileExists(lifeDir))) {
    actions.push("Life: directory not found (skip)");
    return;
  }

  let entries: string[];
  try {
    entries = await readdir(lifeDir);
  } catch {
    actions.push("Life: read failed (skip)");
    return;
  }

  let removedCount = 0;
  for (const entry of entries) {
    // Preserve backlog directory — it is handled separately
    if (entry === "backlog") continue;
    await rm(join(lifeDir, entry), { recursive: true, force: true });
    removedCount++;
  }

  actions.push(`Life: cleaned ${removedCount} file(s)`);
}

async function cleanDir(
  dirPath: string, label: string, actions: string[],
): Promise<void> {
  if (!(await fileExists(dirPath))) {
    actions.push(`${label}: directory not found (skip)`);
    return;
  }

  await rm(dirPath, { recursive: true, force: true });
  await mkdir(dirPath, { recursive: true });
  actions.push(`${label}: reset`);
}

/** CLI entry point for `reap clean` */
export async function execute(options: CleanOptions): Promise<void> {
  const root = process.cwd();
  const hasOptions = options.lineage || options.life || options.backlog || options.hooks;

  if (!hasOptions) {
    emitOutput({
      status: "prompt",
      command: "clean",
      message: "No clean options specified. Choose what to reset:",
      prompt: [
        "  --lineage <compress|delete>  Compress or delete lineage history",
        "  --life                       Clear current generation and artifacts",
        "  --backlog                    Delete all backlog items",
        "  --hooks reset                Reset hooks to empty directory",
        "",
        "Protected (never touched): genome/, environment/, vision/",
        "",
        "Options can be combined: reap clean --lineage delete --life --backlog",
      ].join("\n"),
    });
  }

  // Verify .reap/ exists
  const paths = createPaths(root);
  if (await detectV15(paths)) {
    emitError("clean", "This project uses REAP v0.15 structure. Run '/reap.update' to upgrade to v0.16.");
  }
  if (!(await fileExists(paths.reap))) {
    emitOutput({
      status: "error",
      command: "clean",
      message: "No .reap/ directory found. Is this a REAP project?",
    });
  }

  const result = await cleanProject(root, options);
  emitOutput({
    status: "ok",
    command: "clean",
    context: {
      actions: result.actions,
      actionCount: result.actions.length,
    },
    message: result.actions.length > 0
      ? `Clean complete. ${result.actions.length} action(s) performed.`
      : "Nothing to clean.",
  });
}
