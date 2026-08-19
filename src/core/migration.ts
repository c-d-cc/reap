/**
 * Migration instruction layer (gen-071).
 *
 * REAP ships per-version migration notes at `src/templates/migration/vX.Y.Z.md`.
 * When the installed REAP package version is newer than the project's
 * `config.lastMigratedVersion`, the matching notes are surfaced to the AI
 * agent so existing artifacts/memory can be reorganized to match the new
 * version's conventions.
 *
 * Three call sites share `detectPendingMigrations` / `buildPendingMigrationsSection`:
 *   - `src/cli/commands/update.ts`         — emits `context.pendingMigrations`
 *   - `src/cli/commands/load-context.ts`   — SessionStart async context
 *   - `src/core/dump-state-sync.ts`        — `.session-state.md` sync dump
 *
 * The helpers are sync because they only do filesystem reads — keeping them
 * sync lets the async + sync builders share the same code path and remain
 * byte-identical (gen-068 daemon section pattern).
 *
 * All failures are silent: detection that throws or hits an unreadable file
 * yields an empty array. Migration is best-effort — it must never block the
 * lifecycle.
 */

import { readdirSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { ReapConfig } from "../types/index.js";
import { semverGt, semverCore } from "./semver.js";

// ── filename pattern ─────────────────────────────────────────────────────────

/** Match `vX.Y.Z.md` (semver core only). Capture group is the version. */
const MIGRATION_FILENAME_RE = /^v(\d+\.\d+\.\d+)\.md$/;

/**
 * Extract `X.Y.Z` from a filename like `v0.17.1.md`. Returns null when the
 * filename does not match the pattern.
 */
export function parseVersionFromFilename(name: string): string | null {
  const m = MIGRATION_FILENAME_RE.exec(name);
  return m ? m[1] : null;
}

// ── release-line comparison ─────────────────────────────────────────────────

/**
 * True when `a` belongs to a later release line than `b`.
 *
 * Cores only. Someone running `0.17.6-alpha.3` is running the 0.17.6 code and
 * needs the v0.17.6 note, but under strict precedence that note sorts above
 * their version and `detectPendingMigrations` drops it as unreleased — hiding
 * it from prerelease testers, who meet the new conventions first.
 */
export function releaseLineGt(a: string, b: string): boolean {
  return semverGt(semverCore(a), semverCore(b));
}

// ── templates directory resolution ──────────────────────────────────────────

/**
 * Resolve the directory holding migration template files.
 *
 *   - Bundled (`dist/cli/...`): templates copied by build to
 *     `dist/templates/migration/`.
 *   - Dev (bun runtime, `src/core/...`): templates live at
 *     `src/templates/migration/`.
 *
 * Same dist/dev split pattern used by `agentsTemplateDir` in the OpenCode
 * adapter. The branch is mandatory — without it, the bundled binary cannot
 * locate sibling assets.
 */
export function migrationTemplatesDir(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  // dist:  __dirname = .../dist/cli       → ../templates/migration  (dist/templates/migration)
  // dev:   __dirname = .../src/core       → ../templates/migration  (src/templates/migration)
  // Both branches happen to be one level up, but kept explicit for documentation
  // and parity with `agentsTemplateDir` in src/adapters/opencode/install.ts.
  return here.includes("dist")
    ? join(here, "..", "templates", "migration")
    : join(here, "..", "templates", "migration");
}

// ── pending migration detection ─────────────────────────────────────────────

/** Single pending migration: version + raw instruction body. */
export interface PendingMigration {
  version: string;
  instructions: string;
}

/**
 * Read all `vX.Y.Z.md` files from the migration templates directory whose
 * version satisfies `lastMigratedVersion < v <= currentVersion`, sorted
 * ascending by semver.
 *
 * Returns `[]` on any failure (missing dir, read error, malformed input).
 * Never throws — this is best-effort surfacing for the agent.
 *
 * @param config            ReapConfig instance (uses `lastMigratedVersion`, defaults to `"0.0.0"`)
 * @param currentVersion    The installed REAP package version (e.g. `"0.17.1"`)
 * @param templatesDir      Optional override for the templates directory.
 *                          Defaults to `migrationTemplatesDir()` (the bundled
 *                          `dist/templates/migration/` or dev `src/templates/migration/`).
 *                          Tests inject a tmp dir to avoid touching real files.
 */
export function detectPendingMigrations(
  config: ReapConfig | null,
  currentVersion: string,
  templatesDir?: string,
): PendingMigration[] {
  if (!currentVersion || currentVersion === "0.0.0") return [];

  const lastMigrated = config?.lastMigratedVersion ?? "0.0.0";
  const dir = templatesDir ?? migrationTemplatesDir();

  let entries: string[];
  try {
    if (!existsSync(dir)) return [];
    entries = readdirSync(dir);
  } catch {
    return [];
  }

  const pending: PendingMigration[] = [];
  for (const name of entries) {
    const version = parseVersionFromFilename(name);
    if (!version) continue;
    // gap window: lastMigrated < version <= currentVersion
    if (!releaseLineGt(version, lastMigrated)) continue;
    if (releaseLineGt(version, currentVersion)) continue;
    try {
      const body = readFileSync(join(dir, name), "utf-8");
      pending.push({ version, instructions: body });
    } catch {
      // Skip unreadable file — never fail the caller.
    }
  }

  pending.sort((a, b) => (releaseLineGt(a.version, b.version) ? 1 : -1));
  return pending;
}

// ── markdown section builder ────────────────────────────────────────────────

/**
 * Build the `# Pending Migrations` markdown section for the dynamic-context
 * builders (`load-context.ts` async, `dump-state-sync.ts` sync). Returns
 * `null` when there are no pending migrations — callers should omit the
 * entire section in that case to preserve the byte-identical guarantee
 * vs older REAP versions (no Pending Migrations section, no output diff).
 */
export function buildPendingMigrationsSection(
  config: ReapConfig | null,
  currentVersion: string,
  templatesDir?: string,
): string | null {
  const pending = detectPendingMigrations(config, currentVersion, templatesDir);
  if (pending.length === 0) return null;

  const lines: string[] = [];
  lines.push("# Pending Migrations");
  lines.push("");
  lines.push(
    `This project has not yet been migrated for ${pending.length} REAP version${pending.length === 1 ? "" : "s"}. ` +
      `Follow the instructions below to bring existing artifacts/memory in line with the current REAP version, ` +
      `then run \`reap update --mark-migrated\` to record completion.`,
  );

  for (const m of pending) {
    lines.push("");
    lines.push(`## v${m.version}`);
    lines.push("");
    lines.push(m.instructions.trim());
  }

  return lines.join("\n");
}
