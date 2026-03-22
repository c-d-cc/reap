import { rm, readdir, unlink } from "fs/promises";
import { join } from "path";
import { readTextFile, writeTextFile, fileExists } from "../../core/fs";
import { ReapPaths } from "../../core/paths";
import { ConfigManager } from "../../core/config";

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

  // 2. Remove .claude/commands/reap.* files
  const claudeCommandsDir = join(projectRoot, ".claude", "commands");
  await removeGlobFiles(claudeCommandsDir, "reap.", removed, skipped, ".claude/commands/");

  // 3. Remove .claude/skills/reap.* directories
  const claudeSkillsDir = join(projectRoot, ".claude", "skills");
  await removeGlobDirs(claudeSkillsDir, "reap.", removed, skipped, ".claude/skills/");

  // 4. Clean REAP section from .claude/CLAUDE.md
  await cleanClaudeMd(projectRoot, removed, skipped);

  // 5. Clean REAP entries from .gitignore
  await cleanGitignore(projectRoot, removed, skipped);

  return { removed, skipped };
}

async function removeGlobFiles(
  dir: string, prefix: string,
  removed: string[], skipped: string[], displayPrefix: string,
): Promise<void> {
  try {
    const files = await readdir(dir);
    const matched = files.filter(f => f.startsWith(prefix));
    if (matched.length === 0) {
      skipped.push(`${displayPrefix}${prefix}* (none found)`);
      return;
    }
    for (const file of matched) {
      await unlink(join(dir, file));
      removed.push(`${displayPrefix}${file}`);
    }
  } catch {
    skipped.push(`${displayPrefix}${prefix}* (directory not found)`);
  }
}

async function removeGlobDirs(
  dir: string, prefix: string,
  removed: string[], skipped: string[], displayPrefix: string,
): Promise<void> {
  try {
    const entries = await readdir(dir);
    const matched = entries.filter(e => e.startsWith(prefix));
    if (matched.length === 0) {
      skipped.push(`${displayPrefix}${prefix}* (none found)`);
      return;
    }
    for (const entry of matched) {
      await rm(join(dir, entry), { recursive: true, force: true });
      removed.push(`${displayPrefix}${entry}`);
    }
  } catch {
    skipped.push(`${displayPrefix}${prefix}* (directory not found)`);
  }
}

async function cleanClaudeMd(
  projectRoot: string, removed: string[], skipped: string[],
): Promise<void> {
  const claudeMdPath = join(projectRoot, ".claude", "CLAUDE.md");
  const content = await readTextFile(claudeMdPath);

  if (content === null) {
    skipped.push(".claude/CLAUDE.md (not found)");
    return;
  }

  const marker = "# REAP Project";
  if (!content.includes(marker)) {
    skipped.push(".claude/CLAUDE.md (no REAP section)");
    return;
  }

  // Remove REAP section (from marker to next # heading or end of file)
  const cleaned = content.replace(/# REAP Project[\s\S]*?(?=\n# |\s*$)/, "").trim();

  if (cleaned.length === 0) {
    await unlink(claudeMdPath);
    removed.push(".claude/CLAUDE.md (deleted, was REAP-only)");
  } else {
    await writeTextFile(claudeMdPath, cleaned + "\n");
    removed.push(".claude/CLAUDE.md (REAP section removed)");
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
