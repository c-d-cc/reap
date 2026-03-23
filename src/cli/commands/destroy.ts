import { rm } from "fs/promises";
import { join } from "path";
import { readTextFile, writeTextFile, fileExists } from "../../core/fs";
import { ReapPaths } from "../../core/paths";
import { ConfigManager } from "../../core/config";
import { AgentRegistry } from "../../core/agents";

export interface DestroyResult {
  removed: string[];
  skipped: string[];
}

/**
 * Get the project name from .reap/config.yml.
 * Returns null if config cannot be read.
 */
export async function getProjectName(projectRoot: string): Promise<string | null> {
  try {
    const paths = new ReapPaths(projectRoot);
    const config = await ConfigManager.read(paths);
    return config.project;
  } catch {
    return null;
  }
}

/**
 * Destroy all REAP-related files from a project.
 */
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

  // 2. Clean up agent-specific project files via adapters
  const adapters = AgentRegistry.allAdapters();
  for (const adapter of adapters) {
    if (typeof adapter.cleanupProjectFiles === "function") {
      const result = await adapter.cleanupProjectFiles(projectRoot);
      removed.push(...result.removed);
      skipped.push(...result.skipped);
    }
  }

  // 5. Clean REAP entries from .gitignore
  await cleanGitignore(projectRoot, removed, skipped);

  return { removed, skipped };
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
