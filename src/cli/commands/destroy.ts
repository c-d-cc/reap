import { rm } from "fs/promises";
import { join } from "path";
import YAML from "yaml";
import { createPaths } from "../../core/paths.js";
import { readTextFile, writeTextFile, fileExists } from "../../core/fs.js";
import { emitOutput, emitError } from "../../core/output.js";
import { detectV15 } from "../../core/integrity.js";
import type { ReapConfig } from "../../types/index.js";

export interface DestroyResult {
  removed: string[];
  skipped: string[];
}

/** Read the project name from config.yml. Returns null if unavailable. */
async function getProjectName(projectRoot: string): Promise<string | null> {
  try {
    const paths = createPaths(projectRoot);
    const content = await readTextFile(paths.config);
    if (!content) return null;
    const config = YAML.parse(content) as ReapConfig;
    return config.project ?? null;
  } catch {
    return null;
  }
}

/** Destroy all REAP-related files from a project. */
export async function destroyProject(projectRoot: string): Promise<DestroyResult> {
  const removed: string[] = [];
  const skipped: string[] = [];

  // 1. Remove .reap/ directory
  const reapDir = join(projectRoot, ".reap");
  if (await fileExists(reapDir)) {
    await rm(reapDir, { recursive: true, force: true });
    removed.push(".reap/");
  } else {
    skipped.push(".reap/ (not found)");
  }

  // 2. Clean REAP section from CLAUDE.md
  await cleanClaudeMd(projectRoot, removed, skipped);

  // 3. Clean REAP entries from .gitignore
  await cleanGitignore(projectRoot, removed, skipped);

  return { removed, skipped };
}

async function cleanClaudeMd(
  projectRoot: string, removed: string[], skipped: string[],
): Promise<void> {
  const claudeMdPath = join(projectRoot, "CLAUDE.md");
  const content = await readTextFile(claudeMdPath);

  if (content === null) {
    skipped.push("CLAUDE.md (not found)");
    return;
  }

  // The REAP section starts with "## REAP" and continues to the next same-level heading or EOF
  const reapSectionPattern = /^## REAP\b.*(?:\n(?!## ).*)*\n?/m;

  if (!reapSectionPattern.test(content)) {
    skipped.push("CLAUDE.md (no REAP section)");
    return;
  }

  let cleaned = content.replace(reapSectionPattern, "");
  // Clean up consecutive blank lines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim();

  if (cleaned.length === 0) {
    // If CLAUDE.md is empty after removing REAP section, delete the file
    await rm(claudeMdPath);
    removed.push("CLAUDE.md (deleted — was REAP-only)");
  } else {
    await writeTextFile(claudeMdPath, cleaned + "\n");
    removed.push("CLAUDE.md (REAP section removed)");
  }
}

async function cleanGitignore(
  projectRoot: string, removed: string[], skipped: string[],
): Promise<void> {
  const gitignorePath = join(projectRoot, ".gitignore");
  const content = await readTextFile(gitignorePath);

  if (content === null) {
    skipped.push(".gitignore (not found)");
    return;
  }

  const reapPatterns = [
    /^# REAP.*$/m,
    /^\.claude\/skills\/reap\..*$/m,
    /^\.claude\/commands\/reap\..*$/m,
    /^\.reap\/.*$/m,
  ];

  let cleaned = content;
  let anyRemoved = false;

  for (const pattern of reapPatterns) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(new RegExp(pattern.source, "gm"), "");
      anyRemoved = true;
    }
  }

  if (!anyRemoved) {
    skipped.push(".gitignore (no REAP entries)");
    return;
  }

  // Clean up consecutive blank lines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n").trim() + "\n";
  await writeTextFile(gitignorePath, cleaned);
  removed.push(".gitignore (REAP entries removed)");
}

/** CLI entry point for `reap destroy` */
export async function execute(confirm?: boolean): Promise<void> {
  const root = process.cwd();
  const paths = createPaths(root);
  if (await detectV15(paths)) {
    emitError("destroy", "This project uses REAP v0.15 structure. Run '/reap.update' to upgrade to v0.16.");
  }

  if (!confirm) {
    const projectName = await getProjectName(root) ?? "unknown";
    emitOutput({
      status: "prompt",
      command: "destroy",
      context: {
        projectName,
      },
      message: `This will completely remove REAP from project "${projectName}". All .reap/ data, CLAUDE.md REAP section, and .gitignore REAP entries will be deleted. This cannot be undone.`,
      prompt: `Run 'reap destroy --confirm' to proceed.`,
    });
  }

  const result = await destroyProject(root);
  emitOutput({
    status: "ok",
    command: "destroy",
    context: {
      removed: result.removed,
      skipped: result.skipped,
      removedCount: result.removed.length,
      skippedCount: result.skipped.length,
    },
    message: result.removed.length > 0
      ? `REAP removed. ${result.removed.length} item(s) cleaned.`
      : "Nothing to remove.",
  });
}
