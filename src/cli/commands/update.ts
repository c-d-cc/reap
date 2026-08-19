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
import { execute as migrateExecute } from "./migrate.js";
import { getAdapter } from "../../adapters/index.js";
import {
  detectPendingMigrations,
  type PendingMigration,
} from "../../core/migration.js";
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
/** Fields that are valid in config.yml (used to prune deprecated fields) */
const VALID_CONFIG_FIELDS = new Set<string>([
  "project", "language", "autoSubagent", "strictEdit", "strictMerge",
  "agentClient", "autoUpdate", "autoIssueReport", "cruiseCount",
  // Opt-in fields — present only when user enables, but listed here so
  // `backfillConfig`'s deprecated-field pruning does not strip them.
  "evaluator", "daemon",
  // gen-084: where the daemon lives, when reap cannot work it out. Omitting it
  // here would make `reap update` delete the one setting standing between some
  // users and a working daemon — and say only "removed a deprecated field".
  "daemonBin",
  // gen-071: per-project marker tracking last applied migration note set.
  "lastMigratedVersion",
]);

const CONFIG_DEFAULTS: Omit<ReapConfig, "project" | "cruiseCount"> = {
  language: "english",
  autoSubagent: true,
  strictEdit: false,
  strictMerge: false,
  agentClient: "claude-code",
  autoUpdate: true,
  autoIssueReport: true,
  // Note: `lastMigratedVersion` is intentionally NOT in CONFIG_DEFAULTS.
  // Detection falls back to "0.0.0" via `config?.lastMigratedVersion ?? "0.0.0"`.
  // Injecting it as a default would trigger spurious config-changed diffs for
  // every existing project on first `reap update` after gen-071.
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
    paths.visionDesign,
    paths.memory,
    paths.hooks,
  ];
}

/**
 * Backfill missing config fields with defaults.
 * Returns list of field names that were added (empty if nothing changed).
 */
async function backfillConfig(paths: ReapPaths): Promise<{ added: string[]; removed: string[] }> {
  const content = await readTextFile(paths.config);
  if (!content) return { added: [], removed: [] };

  let config: Record<string, unknown>;
  try {
    config = YAML.parse(content) ?? {};
  } catch {
    return { added: [], removed: [] }; // invalid YAML — don't touch it
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

  // Remove deprecated/unknown fields
  const removed: string[] = [];
  for (const key of Object.keys(config)) {
    if (!VALID_CONFIG_FIELDS.has(key)) {
      delete config[key];
      removed.push(key);
    }
  }

  if (added.length > 0 || removed.length > 0) {
    await writeTextFile(paths.config, YAML.stringify(config));
  }

  return { added, removed };
}

/**
 * Set `lastMigratedVersion` to the given version. Reads the config, mutates
 * the field, writes back. Returns the previous value (for caller reporting).
 *
 * gen-071: backs `reap update --mark-migrated`.
 */
async function markMigratedNow(paths: ReapPaths, version: string): Promise<string> {
  const content = (await readTextFile(paths.config)) ?? "";
  let config: Record<string, unknown> = {};
  try {
    config = (YAML.parse(content) as Record<string, unknown>) ?? {};
  } catch {
    // Treat unparseable config as empty — overwrite produces a clean file.
  }
  const previous = (config.lastMigratedVersion as string | undefined) ?? "0.0.0";
  config.lastMigratedVersion = version;
  await writeTextFile(paths.config, YAML.stringify(config));
  return previous;
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
export async function execute(
  phase?: string,
  postUpgrade?: boolean,
  markMigrated?: boolean,
): Promise<void> {
  const root = process.cwd();
  const paths = createPaths(root);

  // No REAP project at all
  if (!(await fileExists(paths.config)) && !(await detectV15(paths))) {
    emitError("update", "No REAP project detected. Run 'reap init' first.");
  }

  // gen-071: `--mark-migrated` short-circuits the normal sync flow.
  // The agent calls this after applying the pending migration notes so the
  // project records that it is now up-to-date with the installed REAP version.
  // Re-runs are safe (overwrite to the same value), but to keep the contract
  // clean we still go through backfillConfig first so any other drift is
  // healed in the same pass.
  if (markMigrated) {
    await backfillConfig(paths);
    const version = getPackageVersion();
    const previous = await markMigratedNow(paths, version);
    emitOutput({
      status: "ok",
      command: "update",
      context: {
        markMigrated: true,
        lastMigratedVersion: version,
        previous,
      },
      message: previous === version
        ? `Already marked as migrated for v${version}.`
        : `Marked project as migrated for v${version} (was ${previous}).`,
    });
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

  // 1. Config backfill + prune
  const { added: configAdded, removed: configRemoved } = await backfillConfig(paths);
  if (configAdded.length > 0) {
    updated.push(`config.yml: added fields [${configAdded.join(", ")}]`);
  }
  if (configRemoved.length > 0) {
    updated.push(`config.yml: removed deprecated fields [${configRemoved.join(", ")}]`);
  }

  // 2. Directory creation
  const dirsCreated = await ensureDirectories(paths);
  if (dirsCreated.length > 0) {
    updated.push(`directories created: [${dirsCreated.join(", ")}]`);
  }

  // 3. Project-integration entry-point sync (CLAUDE.md for claude-code,
  //    AGENTS.md + opencode.json for opencode — dispatched by agentClient).
  const configContent = await readTextFile(paths.config);
  let projectName = "my-project";
  let agentClient: ReapConfig["agentClient"] | undefined;
  if (configContent) {
    try {
      const config = YAML.parse(configContent) as ReapConfig;
      projectName = config.project ?? "my-project";
      agentClient = config.agentClient;
    } catch { /* use defaults */ }
  }

  const adapter = getAdapter(agentClient);
  const integrationAction = await adapter.ensureProjectIntegration(paths.root, projectName);
  if (integrationAction !== "skipped") {
    const fileLabel = agentClient === "opencode" ? "AGENTS.md" : "CLAUDE.md";
    updated.push(`${fileLabel} (${integrationAction})`);
  }

  // 4. Session integration sync (claude-code: ~/.claude/settings.json hooks;
  //    opencode: opencode.json + .opencode/plugins/reap-plugin.ts).
  //    Idempotent — best-effort, silent on success.
  await adapter.registerSessionIntegration(paths.root);

  // Report
  // Show release notice for current version (before emitOutput, which calls process.exit)
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

  // gen-071: Surface pending migration notes for AI agent.
  // We re-read the config (it may have just been backfilled) so the
  // lastMigratedVersion field is up to date.
  const refreshedRaw = await readTextFile(paths.config);
  let refreshedConfig: ReapConfig | null = null;
  if (refreshedRaw) {
    try { refreshedConfig = YAML.parse(refreshedRaw) as ReapConfig; } catch { /* keep null */ }
  }
  const pkgVersion = getPackageVersion();
  let pendingMigrations: PendingMigration[] = [];
  try {
    pendingMigrations = detectPendingMigrations(refreshedConfig, pkgVersion);
  } catch {
    // Detection must never block update — silent fallback to empty.
    pendingMigrations = [];
  }

  const baseMessage = updated.length === 0
    ? "Project is up to date. Nothing to update."
    : `Updated: ${updated.join("; ")}`;
  const migrationMessage = pendingMigrations.length === 0
    ? ""
    : ` ${pendingMigrations.length} pending migration${pendingMigrations.length === 1 ? "" : "s"} ` +
      `(${pendingMigrations.map((m) => "v" + m.version).join(", ")}) — see context.pendingMigrations. ` +
      `Run \`reap update --mark-migrated\` after applying them.`;

  emitOutput({
    status: "ok",
    command: "update",
    context: {
      changes: updated,
      pendingMigrations,
      packageVersion: pkgVersion,
      lastMigratedVersion: refreshedConfig?.lastMigratedVersion ?? "0.0.0",
    },
    message: baseMessage + migrationMessage,
  });
}
