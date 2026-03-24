import { readdir, unlink, rm, mkdir, chmod } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";
import { ReapPaths } from "../../core/paths";
import { AgentRegistry } from "../../core/agents";
import { migrateHooks } from "../../core/hooks";
import { readTextFile, readTextFileOrThrow, writeTextFile } from "../../core/fs";
import { ConfigManager } from "../../core/config";
import { MigrationRunner } from "../../core/migrations";
import { buildMigrationSpec, detectMigrationGaps } from "../../core/migration-spec";
import { syncSkillsToProject } from "../../core/skills";

interface UpdateResult {
  updated: string[];
  skipped: string[];
  removed: string[];
}

export interface SelfUpgradeResult {
  upgraded: boolean;
  blocked?: boolean;
  from?: string;
  to?: string;
  reason?: string;
}

/**
 * Check for newer @c-d-cc/reap on npm and upgrade if available.
 * Blocks auto-upgrade when installed < autoUpdateMinVersion (breaking change guard).
 */
export function selfUpgrade(): SelfUpgradeResult {
  try {
    const installed = execSync("reap --version", { encoding: "utf-8", timeout: 5_000 }).trim();
    // Skip self-upgrade for local dev builds (+dev suffix)
    if (installed.includes("+dev")) {
      return { upgraded: false };
    }
    const latest = execSync("npm view @c-d-cc/reap version", { encoding: "utf-8", timeout: 10_000 }).trim();
    if (installed === latest) {
      return { upgraded: false };
    }

    // Auto-update guard: check if installed version meets minimum requirement
    const minVersion = queryAutoUpdateMinVersion();
    if (minVersion && !semverGte(installed, minVersion)) {
      return {
        upgraded: false,
        blocked: true,
        from: installed,
        to: latest,
        reason: `Breaking change: v${installed} -> v${latest}. Run '/reap.update' to upgrade manually. See https://reap.cc/docs/release-notes`,
      };
    }

    execSync("npm update -g @c-d-cc/reap", { encoding: "utf-8", timeout: 60_000, stdio: "pipe" });
    return { upgraded: true, from: installed, to: latest };
  } catch {
    return { upgraded: false };
  }
}

/** Inline semver comparison: returns true if a >= b */
function semverGte(a: string, b: string): boolean {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return true;
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return false;
  }
  return true;
}

/**
 * Force upgrade bypassing the autoUpdateMinVersion guard.
 * Used after user confirms they want to proceed with a breaking change update.
 */
export function forceUpgrade(to: string): SelfUpgradeResult {
  try {
    const installed = execSync("reap --version", { encoding: "utf-8", timeout: 5_000 }).trim();
    execSync(`npm install -g @c-d-cc/reap@${to}`, { encoding: "utf-8", timeout: 60_000, stdio: "pipe" });
    return { upgraded: true, from: installed, to };
  } catch {
    return { upgraded: false };
  }
}

/** Query autoUpdateMinVersion from the latest npm package */
function queryAutoUpdateMinVersion(): string | null {
  try {
    const result = execSync("npm view @c-d-cc/reap reap.autoUpdateMinVersion", {
      encoding: "utf-8",
      timeout: 10_000,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return result.trim() || null;
  } catch {
    return null;
  }
}

export async function updateProject(projectRoot: string, dryRun: boolean = false): Promise<UpdateResult> {
  const paths = new ReapPaths(projectRoot);
  const result: UpdateResult = { updated: [], skipped: [], removed: [] };

  // --- Global sync (always runs, no project required) ---

  // Read config for agent overrides (use project config if available, else defaults)
  const config = (await paths.isReapProject()) ? await ConfigManager.read(paths) : null;
  const adapters = await AgentRegistry.getActiveAdapters(config ?? undefined);

  // 1a. Sync originals to ~/.reap/commands/
  const commandsDir = ReapPaths.packageCommandsDir;
  const commandFiles = await readdir(commandsDir);
  await mkdir(ReapPaths.userReapCommands, { recursive: true });
  for (const file of commandFiles) {
    if (!file.endsWith(".md")) continue;
    const src = await readTextFileOrThrow(join(commandsDir, file));
    const dest = join(ReapPaths.userReapCommands, file);
    const existing = await readTextFile(dest);
    if (existing !== null && existing === src) {
      result.skipped.push(`~/.reap/commands/${file}`);
    } else {
      if (!dryRun) await writeTextFile(dest, src);
      result.updated.push(`~/.reap/commands/${file}`);
    }
  }

  // 1b. Phase 2 migration: remove redirect stubs from agent commands dirs
  for (const adapter of adapters) {
    const agentCmdDir = adapter.getCommandsDir();
    const label = adapter.displayName;
    try {
      const existing = await readdir(agentCmdDir);
      for (const file of existing) {
        if (!file.startsWith("reap.") || !file.endsWith(".md")) continue;
        const filePath = join(agentCmdDir, file);
        const content = await readTextFile(filePath);
        if (content !== null && content.includes("redirected to ~/.reap/commands/")) {
          if (!dryRun) await unlink(filePath);
          result.removed.push(`[${label}] commands/${file} (Phase 2: redirect removed)`);
        }
      }
    } catch { /* dir may not exist */ }
  }

  // 1c. Clean up legacy user-level slash commands (e.g. ~/.claude/commands/reap.*.md)
  for (const adapter of adapters) {
    if (typeof adapter.cleanupLegacyCommands === "function") {
      const removed = await adapter.cleanupLegacyCommands();
      for (const file of removed) {
        result.removed.push(`[${adapter.displayName}] ~commands/${file} (legacy user-level)`);
      }
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

  // 2b. Sync merge artifact templates to ~/.reap/templates/merge/
  const mergeTemplatesDir = join(ReapPaths.userReapTemplates, "merge");
  await mkdir(mergeTemplatesDir, { recursive: true });
  const mergeArtifactFiles = ["01-detect.md", "02-mate.md", "03-merge.md", "04-sync.md", "05-validation.md", "06-completion.md"];
  const mergeSourceDir = join(ReapPaths.packageArtifactsDir, "merge");
  for (const file of mergeArtifactFiles) {
    const src = await readTextFileOrThrow(join(mergeSourceDir, file));
    const dest = join(mergeTemplatesDir, file);
    const existing = await readTextFile(dest);
    if (existing !== null && existing === src) {
      result.skipped.push(`~/.reap/templates/merge/${file}`);
    } else {
      if (!dryRun) await writeTextFile(dest, src);
      result.updated.push(`~/.reap/templates/merge/${file}`);
    }
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

  // Sync agent instruction files (e.g. .claude/CLAUDE.md, .codex/AGENTS.md)
  for (const adapter of adapters) {
    if (typeof adapter.setupAgentMd === "function") {
      const mdResult = await adapter.setupAgentMd(projectRoot);
      if (mdResult.action !== "skipped") {
        result.updated.push(`[${adapter.displayName}] agent md (${mdResult.action})`);
      } else {
        result.skipped.push(`[${adapter.displayName}] agent md`);
      }
    }
  }

  // --- Project-level sync (only if .reap/ exists) ---

  if (await paths.isReapProject()) {
    // 4b. Backfill missing config fields with defaults
    if (!dryRun) {
      const backfillResult = await ConfigManager.backfill(paths);
      if (backfillResult.added.length > 0) {
        result.updated.push(`Config: added ${backfillResult.added.join(", ")}`);
      }
    }

    // 5. Sync commands to project .claude/skills/{name}/SKILL.md
    const skillsResult = await syncSkillsToProject(paths.projectRoot, dryRun);
    if (skillsResult.installed > 0) {
      result.updated.push(`.claude/skills/ (${skillsResult.installed} synced)`);
    } else {
      result.skipped.push(`.claude/skills/ (${skillsResult.total} unchanged)`);
    }

    // 5b. Clean up legacy .claude/commands/reap.* files
    const projectClaudeCommands = join(paths.projectRoot, ".claude", "commands");
    try {
      const legacyFiles = (await readdir(projectClaudeCommands)).filter(
        (f: string) => f.startsWith("reap.") && f.endsWith(".md"),
      );
      for (const file of legacyFiles) {
        if (!dryRun) await unlink(join(projectClaudeCommands, file));
        result.removed.push(`.claude/commands/${file} (legacy)`);
      }
    } catch { /* dir may not exist */ }

    // 6. Migration: clean up legacy project-level files
    await migrateLegacyFiles(paths, dryRun, result);

    // 6. Run migrations: each migration's check() determines if it needs to run
    const migrationResult = await MigrationRunner.run(paths, dryRun);
    for (const m of migrationResult.migrated) {
      result.updated.push(`[migration] ${m}`);
    }
    for (const s of migrationResult.skipped) {
      result.skipped.push(`[migration] ${s}`);
    }
    for (const e of migrationResult.errors) {
      result.removed.push(`[migration error] ${e}`);
    }

    // 7. Check for structural gaps that AI migration agent can fix
    const gaps = await detectMigrationGaps(paths);
    if (gaps.length > 0) {
      const spec = buildMigrationSpec(paths);
      console.log(JSON.stringify({
        status: "prompt",
        command: "migrate",
        gaps,
        spec,
        prompt: "Analyze the gaps between current .reap/ structure and expected structure. Fix each gap after user confirmation.",
      }, null, 2));
    }

    // Auto-report migration failures if enabled
    if (migrationResult.errors.length > 0 && config?.autoIssueReport) {
      try {
        const { execSync } = await import("child_process");
        const errorSummary = migrationResult.errors.join("\\n");
        const title = `Migration failure during update`;
        const body = `## Migration Error\\n\\n### Errors\\n\\n${errorSummary}`;
        execSync(
          `gh issue create --repo c-d-cc/reap --title "${title}" --label "auto-reported,migration" --body "${body}"`,
          { encoding: "utf-8", timeout: 15_000, stdio: "pipe" },
        );
      } catch { /* report is best-effort */ }
    }
  }

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

  // .claude/commands/reap.* legacy files are cleaned up in step 5b above
  // .claude/skills/reap.*/SKILL.md are now managed by session-start hook

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
