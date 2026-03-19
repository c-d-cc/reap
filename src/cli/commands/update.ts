import { readdir, unlink, rm, mkdir } from "fs/promises";
import { join } from "path";
import { ReapPaths } from "../../core/paths";
import { AgentRegistry } from "../../core/agents";
import { migrateHooks } from "../../core/hooks";
import { readTextFile, readTextFileOrThrow, writeTextFile } from "../../core/fs";
import { ConfigManager } from "../../core/config";

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

  // Read config for agent overrides
  const config = await ConfigManager.read(paths);

  // Get active agents
  const adapters = await AgentRegistry.getActiveAdapters(config ?? undefined);

  // 1. Sync slash commands to each agent
  const commandsDir = ReapPaths.packageCommandsDir;
  const commandFiles = await readdir(commandsDir);
  for (const adapter of adapters) {
    const agentCmdDir = adapter.getCommandsDir();
    const label = `${adapter.displayName}`;

    for (const file of commandFiles) {
      if (!file.endsWith(".md")) continue;
      const src = await readTextFileOrThrow(join(commandsDir, file));
      const dest = join(agentCmdDir, file);
      const existingContent = await readTextFile(dest);
      if (existingContent !== null && existingContent === src) {
        result.skipped.push(`[${label}] commands/${file}`);
      } else {
        if (!dryRun) {
          await mkdir(agentCmdDir, { recursive: true });
          await writeTextFile(dest, src);
        }
        result.updated.push(`[${label}] commands/${file}`);
      }
    }

    // Cleanup stale commands
    const validCommandFiles = new Set(commandFiles);
    if (!dryRun) {
      await adapter.removeStaleCommands(validCommandFiles);
    }
  }

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

  // 3. Run migrations for all agents
  const migrations = await migrateHooks(dryRun);
  for (const m of migrations.results) {
    if (m.action === "migrated") {
      result.updated.push(`[${m.agent}] hooks (migrated)`);
    }
  }

  // 4. Sync hook registration for all agents
  for (const adapter of adapters) {
    const hookResult = await adapter.syncSessionHook(dryRun);
    if (hookResult.action === "updated") {
      result.updated.push(`[${adapter.displayName}] session hook`);
    } else {
      result.skipped.push(`[${adapter.displayName}] session hook`);
    }
  }

  // 5. Migration: clean up legacy project-level files
  await migrateLegacyFiles(paths, dryRun, result);

  return result;
}

/**
 * Remove legacy project-level commands, templates, hooks that are no longer needed.
 */
async function migrateLegacyFiles(
  paths: ReapPaths,
  dryRun: boolean,
  result: UpdateResult,
): Promise<void> {
  await removeDirIfExists(paths.legacyCommands, ".reap/commands/", dryRun, result);
  await removeDirIfExists(paths.legacyTemplates, ".reap/templates/", dryRun, result);
  // .reap/hooks/ is now used for hook execute files (gen-031+), do NOT remove

  // Remove project-level .claude/commands/reap.* files
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

  // Clean up .claude/hooks.json legacy references
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
