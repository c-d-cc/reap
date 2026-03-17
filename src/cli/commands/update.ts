import { readdir, unlink, rm, mkdir } from "fs/promises";
import { join } from "path";
import { ReapPaths } from "../../core/paths";
import { syncHookRegistration } from "../../core/hooks";
import { readTextFile, readTextFileOrThrow, writeTextFile } from "../../core/fs";

interface UpdateResult {
  updated: string[];
  skipped: string[];
  removed: string[];
}

export async function updateProject(projectRoot: string, dryRun: boolean = false): Promise<UpdateResult> {
  const paths = new ReapPaths(projectRoot);

  if (!(await paths.isReapProject())) {
    throw new Error("Not a REAP project. Run 'reap init' first.");
  }

  const result: UpdateResult = { updated: [], skipped: [], removed: [] };

  // 1. Sync slash commands to user-level ~/.claude/commands/
  await mkdir(ReapPaths.userClaudeCommands, { recursive: true });
  const commandsDir = ReapPaths.packageCommandsDir;
  const commandFiles = await readdir(commandsDir);
  for (const file of commandFiles) {
    if (!file.endsWith(".md")) continue;
    const src = await readTextFileOrThrow(join(commandsDir, file));
    const dest = join(ReapPaths.userClaudeCommands, file);
    const existingContent = await readTextFile(dest);
    if (existingContent !== null && existingContent === src) {
      result.skipped.push(`~/.claude/commands/${file}`);
    } else {
      if (!dryRun) await writeTextFile(dest, src);
      result.updated.push(`~/.claude/commands/${file}`);
    }
  }

  // 1b. Cleanup stale commands in user-level
  const validCommandFiles = new Set(commandFiles);
  try {
    const existing = await readdir(ReapPaths.userClaudeCommands);
    for (const file of existing) {
      if (!file.startsWith("reap.") || !file.endsWith(".md")) continue;
      if (!validCommandFiles.has(file)) {
        if (!dryRun) await unlink(join(ReapPaths.userClaudeCommands, file));
        result.removed.push(`~/.claude/commands/${file}`);
      }
    }
  } catch { /* dir may not exist */ }

  // 2. Sync artifact templates + domain guide to ~/.reap/templates/
  await mkdir(ReapPaths.userReapTemplates, { recursive: true });
  const artifactFiles = ["01-objective.md", "02-planning.md", "03-implementation.md", "04-validation.md", "05-completion.md"];
  for (const file of artifactFiles) {
    const src = await readTextFileOrThrow(join(ReapPaths.packageArtifactsDir, file));
    const dest = join(ReapPaths.userReapTemplates, file);
    const existingContent = await readTextFile(dest);
    if (existingContent !== null && existingContent === src) {
      result.skipped.push(`~/.reap/templates/${file}`);
    } else {
      if (!dryRun) await writeTextFile(dest, src);
      result.updated.push(`~/.reap/templates/${file}`);
    }
  }
  const domainGuideSrc = await readTextFileOrThrow(join(ReapPaths.packageGenomeDir, "domain/README.md"));
  const domainGuideDest = join(ReapPaths.userReapTemplates, "domain-guide.md");
  const domainExistingContent = await readTextFile(domainGuideDest);
  if (domainExistingContent !== null && domainExistingContent === domainGuideSrc) {
    result.skipped.push(`~/.reap/templates/domain-guide.md`);
  } else {
    if (!dryRun) await writeTextFile(domainGuideDest, domainGuideSrc);
    result.updated.push(`~/.reap/templates/domain-guide.md`);
  }

  // 3. Sync hook registration in user-level ~/.claude/hooks.json
  const hookReg = await syncHookRegistration(dryRun);
  if (hookReg.action === "updated") {
    result.updated.push(`~/.claude/hooks.json`);
  } else {
    result.skipped.push(`~/.claude/hooks.json`);
  }

  // 4. Migration: clean up legacy project-level files
  await migrateLegacyFiles(paths, dryRun, result);

  return result;
}

/**
 * Remove legacy project-level commands, templates, hooks that are no longer needed.
 * These were moved to user-level in gen-007.
 */
async function migrateLegacyFiles(
  paths: ReapPaths,
  dryRun: boolean,
  result: UpdateResult,
): Promise<void> {
  // Remove .reap/commands/
  await removeDirIfExists(paths.legacyCommands, ".reap/commands/", dryRun, result);

  // Remove .reap/templates/
  await removeDirIfExists(paths.legacyTemplates, ".reap/templates/", dryRun, result);

  // Remove .reap/hooks/
  await removeDirIfExists(paths.legacyHooks, ".reap/hooks/", dryRun, result);

  // Remove .claude/commands/reap.* files (but preserve non-reap commands)
  try {
    const claudeCmdDir = paths.legacyClaudeCommands;
    const files = await readdir(claudeCmdDir);
    for (const file of files) {
      if (file.startsWith("reap.") && file.endsWith(".md")) {
        if (!dryRun) await unlink(join(claudeCmdDir, file));
        result.removed.push(`.claude/commands/${file}`);
      }
    }
  } catch { /* dir may not exist */ }

  // Clean up .claude/hooks.json — remove project-level .reap/hooks/ references
  try {
    const legacyHooksJson = paths.legacyClaudeHooksJson;
    const fileContent = await readTextFile(legacyHooksJson);
    if (fileContent !== null) {
      const content = JSON.parse(fileContent);
      const sessionStart = content["SessionStart"];
      if (Array.isArray(sessionStart)) {
        const filtered = sessionStart.filter((entry: unknown) => {
          if (typeof entry !== "object" || entry === null) return true;
          const hooks = (entry as Record<string, unknown>)["hooks"];
          if (!Array.isArray(hooks)) return true;
          return !hooks.some((h: unknown) => {
            if (typeof h !== "object" || h === null) return false;
            const cmd = (h as Record<string, unknown>)["command"];
            return typeof cmd === "string" && cmd.includes(".reap/hooks/");
          });
        });
        if (filtered.length !== sessionStart.length) {
          if (!dryRun) {
            if (filtered.length === 0 && Object.keys(content).length === 1) {
              // hooks.json only had REAP hook, remove the file
              await unlink(legacyHooksJson);
              result.removed.push(`.claude/hooks.json (legacy)`);
            } else {
              content["SessionStart"] = filtered;
              await writeTextFile(legacyHooksJson, JSON.stringify(content, null, 2) + "\n");
              result.removed.push(`.claude/hooks.json (legacy REAP hook entry)`);
            }
          }
        }
      }
    }
  } catch { /* file may not exist or be invalid */ }
}

async function removeDirIfExists(
  dirPath: string,
  label: string,
  dryRun: boolean,
  result: UpdateResult,
): Promise<void> {
  try {
    const entries = await readdir(dirPath);
    if (entries.length > 0 || true) {
      if (!dryRun) await rm(dirPath, { recursive: true });
      result.removed.push(label);
    }
  } catch { /* dir doesn't exist, nothing to clean */ }
}
