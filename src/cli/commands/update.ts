import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import YAML from "yaml";
import type { ReapPaths } from "../../core/paths.js";
import { createPaths } from "../../core/paths.js";
import { readTextFile, writeTextFile, fileExists, ensureDir } from "../../core/fs.js";
import { emitOutput, emitError } from "../../core/output.js";
import { detectV15 } from "../../core/integrity.js";
import { fetchReleaseNotice } from "../../core/notice.js";
import { autoReport } from "../../core/report.js";
import { ensureClaudeMd } from "./init/common.js";
import { execute as migrateExecute } from "./migrate.js";
import type { ReapConfig } from "../../types/index.js";

/** Read package version from package.json */
function getPackageVersion(): string {
  try {
    const __dir = dirname(fileURLToPath(import.meta.url));
    for (const rel of [join(__dir, "..", "..", "package.json"), join(__dir, "..", "package.json")]) {
      try { return JSON.parse(readFileSync(rel, "utf-8")).version; } catch {}
    }
  } catch {}
  return "0.0.0";
}

/** Default values for ReapConfig fields — used for backfill */
const CONFIG_DEFAULTS: Omit<ReapConfig, "project" | "cruiseCount"> = {
  language: "english",
  autoSubagent: true,
  strictEdit: false,
  strictMerge: false,
  agentClient: "claude-code",
  autoUpdate: true,
  autoIssueReport: true,
};

/** All directories that should exist in a v0.16 project */
function getRequiredDirs(paths: ReapPaths): string[] {
  return [
    paths.genome,
    paths.environment,
    paths.environmentDomain,
    paths.environmentResources,
    paths.environmentDocs,
    paths.life,
    paths.backlog,
    paths.lineage,
    paths.vision,
    paths.visionDocs,
    paths.memory,
    paths.hooks,
  ];
}

/**
 * Backfill missing config fields with defaults.
 * Returns list of field names that were added (empty if nothing changed).
 */
async function backfillConfig(paths: ReapPaths): Promise<string[]> {
  const content = await readTextFile(paths.config);
  if (!content) return [];

  let config: Record<string, unknown>;
  try {
    config = YAML.parse(content) ?? {};
  } catch {
    return []; // invalid YAML — don't touch it
  }

  const added: string[] = [];

  // Migrate legacy `strict: boolean` → strictEdit + strictMerge
  if (config.strict !== undefined && config.strictEdit === undefined && config.strictMerge === undefined) {
    const wasStrict = config.strict === true;
    config.strictEdit = wasStrict;
    config.strictMerge = wasStrict;
    delete config.strict;
    added.push("strictEdit", "strictMerge");
  }

  for (const [key, defaultValue] of Object.entries(CONFIG_DEFAULTS)) {
    if (config[key] === undefined) {
      config[key] = defaultValue;
      added.push(key);
    }
  }

  if (added.length > 0) {
    await writeTextFile(paths.config, YAML.stringify(config));
  }

  return added;
}

/**
 * Ensure all required directories exist.
 * Returns list of directories that were created (empty if all existed).
 */
async function ensureDirectories(paths: ReapPaths): Promise<string[]> {
  const created: string[] = [];
  for (const dir of getRequiredDirs(paths)) {
    if (!(await fileExists(dir))) {
      await ensureDir(dir);
      // Show path relative to .reap/
      const relative = dir.replace(paths.reap + "/", "");
      created.push(relative);
    }
  }
  return created;
}

/**
 * `reap update` — Update project structure to match current REAP version.
 *
 * - v0.15 detected → delegates to `reap init --migrate`
 * - v0.16 detected → syncs project structure (config backfill, dirs, CLAUDE.md)
 * - No REAP project → error
 */
export async function execute(phase?: string, postUpgrade?: boolean): Promise<void> {
  const root = process.cwd();
  const paths = createPaths(root);

  // No REAP project at all
  if (!(await fileExists(paths.config)) && !(await detectV15(paths))) {
    emitError("update", "No REAP project detected. Run 'reap init' first.");
  }

  // --post-upgrade: called by the OLD binary after installing a new version.
  // Skip v0.15 migration check and go straight to v0.16 sync.
  if (!postUpgrade) {
    // v0.15 → delegate to migrate
    if (await detectV15(paths)) {
      try {
        await migrateExecute(paths, phase);
      } catch (err) {
        try {
          autoReport("reap update (migration)", err, ["migration"]);
        } catch { /* best-effort */ }
        throw err;
      }
      return;
    }
  }

  // v0.16 → sync project structure
  const updated: string[] = [];

  // 1. Config backfill
  const configAdded = await backfillConfig(paths);
  if (configAdded.length > 0) {
    updated.push(`config.yml: added fields [${configAdded.join(", ")}]`);
  }

  // 2. Directory creation
  const dirsCreated = await ensureDirectories(paths);
  if (dirsCreated.length > 0) {
    updated.push(`directories created: [${dirsCreated.join(", ")}]`);
  }

  // 3. CLAUDE.md repair
  const configContent = await readTextFile(paths.config);
  let projectName = "my-project";
  if (configContent) {
    try {
      const config = YAML.parse(configContent) as ReapConfig;
      projectName = config.project ?? "my-project";
    } catch { /* use default */ }
  }

  const claudeMdAction = await ensureClaudeMd(paths.root, projectName);
  if (claudeMdAction === "created" || claudeMdAction === "appended") {
    updated.push(`CLAUDE.md (${claudeMdAction})`);
  }

  // Report
  if (updated.length === 0) {
    emitOutput({
      status: "ok",
      command: "update",
      context: { changes: [] },
      message: "Project is up to date. Nothing to update.",
    });
  } else {
    emitOutput({
      status: "ok",
      command: "update",
      context: { changes: updated },
      message: `Updated: ${updated.join("; ")}`,
    });
  }

  // Show release notice for current version
  try {
    let language = "english";
    const raw = configContent ?? "";
    if (raw) {
      try {
        const cfg = YAML.parse(raw) as Record<string, string>;
        if (cfg?.language) language = cfg.language;
      } catch { /* use default */ }
    }
    const version = getPackageVersion();
    if (version !== "0.0.0") {
      const notice = fetchReleaseNotice(version, language);
      if (notice) console.error(notice);
    }
  } catch {
    // Non-fatal — notice display failure should not break update
  }
}
