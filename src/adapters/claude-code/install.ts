import { readdir, cp, unlink, readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";
import { ensureDir, fileExists } from "../../core/fs.js";
import { emitOutput } from "../../core/output.js";
import type { UserLevelRemovalResult, UserLevelSyncResult } from "../types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// In bundled mode, __dirname is dist/cli/. Skills are at dist/adapters/claude-code/skills/
// In dev mode, __dirname is src/adapters/claude-code/. Skills are at src/adapters/claude-code/skills/
const SKILLS_DIR = __dirname.includes("dist")
  ? join(__dirname, "..", "adapters", "claude-code", "skills")
  : join(__dirname, "skills");

const SKILL_PATTERN = /^reap\..+\.md$/;

/**
 * Remove existing reap.* skill files from target directory before re-installing.
 * Does not match `reapdev.*` (reserved for REAP repo's own project-level dev commands).
 */
async function cleanupStaleSkills(targetDir: string): Promise<string[]> {
  const files = await readdir(targetDir);
  const staleFiles = files.filter((f) => SKILL_PATTERN.test(f));

  for (const file of staleFiles) {
    await unlink(join(targetDir, file));
  }

  return staleFiles;
}

/**
 * Sync user-level `~/.claude/commands/reap.*.md` files: cleanup stale REAP
 * commands, then copy the bundled skill files. Silent — does NOT emit output.
 * Used by both the noisy `installSkills` (which wraps this in emitOutput) and
 * the silent `registerSessionIntegration` (called by `reap update`).
 *
 * @returns `{ cleaned, installed, files, targetDir }` for the caller's report.
 */
/**
 * Canonical install location for Claude Code slash commands.
 *
 * Single owner of this path (gen-076, issue #22). The integrity checker used to
 * hardcode the same string and flag it as a v0.15 leftover, so `install-skills`
 * and `fix --check` contradicted each other in the same release. The checker now
 * receives this via `AdapterModule.userLevelDirs()` instead of knowing it —
 * change the path here and the checker follows.
 *
 * Mirrors `opencodeCommandsDir` in the OpenCode adapter.
 *
 * reap:carrier(claude-code-commands-path)
 */
export function claudeCodeCommandsDir(home: string = homedir()): string {
  return join(home, ".claude", "commands");
}

export async function installSlashCommandsOnly(home: string = homedir()): Promise<{
  cleaned: string[];
  installed: number;
  files: string[];
  targetDir: string;
}> {
  const targetDir = claudeCodeCommandsDir(home);
  await ensureDir(targetDir);

  const cleaned = await cleanupStaleSkills(targetDir);

  const files = await readdir(SKILLS_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  let installed = 0;
  for (const file of mdFiles) {
    await cp(join(SKILLS_DIR, file), join(targetDir, file));
    installed++;
  }

  return { cleaned, installed, files: mdFiles, targetDir };
}

/**
 * Every user-level asset the Claude Code integration needs, in one call.
 *
 * This is the set `scripts/postinstall.sh` used to be the only trigger for.
 * npm 12 blocks install scripts for global installs by default, so a single
 * owner was needed that any code path can call — see `ensureUserLevelAssets`
 * in the adapter dispatcher (gen-087).
 *
 * Strictly user-level: nothing here reads or writes the project directory, so
 * it is safe to call from a directory that is not a REAP project at all.
 * Silent, idempotent, and prefix-anchored — user-supplied files in the same
 * directories survive every run.
 *
 * reap:carrier(user-level-asset-set)
 */
export async function syncUserLevelAssets(home: string = homedir()): Promise<
  UserLevelSyncResult & {
    slashCommands: { cleaned: string[]; installed: number; files: string[]; targetDir: string };
    agents: { cleaned: string[]; installed: number; files: string[]; targetDir: string };
  }
> {
  const slashCommands = await installSlashCommandsOnly(home);

  // Copy reap-guide.md to ~/.reap/ (single source, always up-to-date)
  const guide = await installReapGuide(home);

  // Copy agent definitions to ~/.claude/agents/
  const agents = await installAgents(home);

  // Register SessionStart hooks (check-version + load-context)
  const hooks = await registerSessionHooks(home);

  // Each installer above swallows its own failure, so "it returned" says
  // nothing. The caller stamps on this, and a stamp is permanent for the
  // version — see UserLevelSyncResult.
  const missing: string[] = [];
  if (slashCommands.installed === 0) missing.push("slash commands");
  if (!guide) missing.push("~/.reap/reap-guide.md");
  if (agents.installed === 0) missing.push("agent definitions");
  if (!hooks) missing.push("SessionStart hooks");

  return { complete: missing.length === 0, missing, slashCommands, agents };
}

/**
 * Install Claude Code skill files to user-level ~/.claude/commands/
 */
export async function installSkills(_projectRoot?: string): Promise<void> {
  const {
    slashCommands: { cleaned, installed, files, targetDir },
  } = await syncUserLevelAssets();

  emitOutput({
    status: "ok",
    command: "install-skills",
    completed: ["cleanup-stale-skills", "copy-skills", "register-hook"],
    context: {
      targetDir,
      cleaned: cleaned.length,
      installed,
      files,
    },
    message: `Cleaned ${cleaned.length} stale skills, installed ${installed} skill files to ${targetDir}`,
  });
}

// Prefix-anchored pattern (gen-066) — cleanup only touches `reap-*.md` so any
// user-supplied agent definition (e.g. `my-tool.md`, `reapdev.review.md`) in
// `~/.claude/agents/` survives. Mirrors the SKILL_PATTERN approach proven safe
// in gen-064.
const AGENT_PATTERN = /^reap-.+\.md$/;

function agentsTemplateDir(): string {
  return __dirname.includes("dist")
    ? join(__dirname, "..", "templates", "agents")
    : join(__dirname, "..", "..", "templates", "agents");
}

/**
 * Sync user-level `~/.claude/agents/reap-*.md` files: cleanup stale REAP agent
 * definitions, then copy the bundled agent templates. Silent — does NOT emit
 * output. Mirrors `installSlashCommandsOnly` so `reap install-skills` (full
 * install) and `reap update` (silent re-sync via `registerSessionIntegration`)
 * keep the user's agents directory current.
 *
 * Without the `reap update` caller (gen-064 longterm lesson) users who never
 * re-run `reap install-skills` end up with stale agent definitions when the
 * bundled REAP version ships new agent fields.
 *
 * @returns `{ cleaned, installed, files, targetDir }` for the caller's report.
 */
export async function installAgents(home: string = homedir()): Promise<{
  cleaned: string[];
  installed: number;
  files: string[];
  targetDir: string;
}> {
  const targetDir = join(home, ".claude", "agents");
  await ensureDir(targetDir);

  // Cleanup stale REAP agents (prefix-anchored — user agents untouched).
  let cleaned: string[] = [];
  try {
    const existing = await readdir(targetDir);
    cleaned = existing.filter((f) => AGENT_PATTERN.test(f));
    for (const file of cleaned) {
      await unlink(join(targetDir, file));
    }
  } catch {
    // Empty / missing target — nothing to clean.
  }

  // Copy fresh agents.
  let installed = 0;
  const files: string[] = [];
  const templateDir = agentsTemplateDir();
  try {
    const sources = await readdir(templateDir);
    for (const file of sources) {
      if (!file.endsWith(".md")) continue;
      await cp(join(templateDir, file), join(targetDir, file));
      files.push(file);
      installed++;
    }
  } catch {
    // agents template dir doesn't exist — skip silently (broken bundle).
  }

  return { cleaned, installed, files, targetDir };
}

/**
 * Copy reap-guide.md to ~/.reap/ so all projects reference a single, up-to-date copy.
 *
 * reap:carrier(reap-home-asset-set)
 */
export async function installReapGuide(home: string = homedir()): Promise<boolean> {
  const reapHome = join(home, ".reap");
  await ensureDir(reapHome);

  // dist/templates/reap-guide.md
  const templateDir = __dirname.includes("dist")
    ? join(__dirname, "..", "templates")
    : join(__dirname, "..", "..", "templates");
  const src = join(templateDir, "reap-guide.md");

  try {
    if (!(await fileExists(src))) return false;
    await cp(src, join(reapHome, "reap-guide.md"));
    return true;
  } catch {
    return false;
  }
}

/**
 * The SessionStart hooks REAP puts in `~/.claude/settings.json`, and the
 * substring that identifies each one again later.
 *
 * One owner rather than two matching lists: `registerSessionHooks` writes these
 * and `unregisterSessionHooks` has to find exactly the same ones to take them
 * back out. A marker that drifted from the command it was meant to match would
 * leave the entry behind — and an entry left behind calls a command that no
 * longer exists on every session the user starts, for as long as they never
 * hand-edit the JSON.
 */
const REAP_SESSION_HOOKS = [
  { command: "reap check-version 2>/dev/null || true", marker: "reap check-version" },
  { command: "reap load-context 2>/dev/null || true", marker: "reap load-context" },
] as const;

/**
 * Register SessionStart hooks in ~/.claude/settings.json:
 * 1. `reap check-version` — v0.15 legacy cleanup + auto-update
 * 2. `reap load-context` — inject REAP knowledge into session context
 */
export async function registerSessionHooks(home: string = homedir()): Promise<boolean> {
  const settingsPath = join(home, ".claude", "settings.json");

  const requiredHooks = REAP_SESSION_HOOKS;

  try {
    let settings: Record<string, unknown> = {};
    if (await fileExists(settingsPath)) {
      const content = await readFile(settingsPath, "utf-8");
      settings = JSON.parse(content);
    }

    if (!settings.hooks || typeof settings.hooks !== "object") {
      settings.hooks = {};
    }
    const hooks = settings.hooks as Record<string, unknown[]>;

    if (!Array.isArray(hooks.SessionStart)) {
      hooks.SessionStart = [];
    }

    let changed = false;
    for (const req of requiredHooks) {
      const exists = hooks.SessionStart.some((entry: unknown) => {
        const e = entry as { hooks?: { command?: string }[] };
        return e.hooks?.some((h) => h.command?.includes(req.marker));
      });

      if (!exists) {
        hooks.SessionStart.push({
          matcher: "",
          hooks: [{ type: "command", command: req.command }],
        });
        changed = true;
      }
    }

    if (changed) {
      await writeFile(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf-8");
    }
    return true;
  } catch {
    // A hand-edited settings.json that will not parse lands here, and skipping
    // is still the right move — REAP must not clobber it. Reporting the miss is
    // what is new: the caller then declines to stamp, so the next command tries
    // again instead of the hook being lost for good at this version.
    return false;
  }
}

// ── removal ─────────────────────────────────────────────────────────────────

/**
 * Take away every Claude Code user-level asset REAP installs.
 *
 * The inverse of `syncUserLevelAssets` above, and kept in the same file for
 * that reason — the list of surfaces cannot be shared as a value (one is a
 * directory of copies, one is a JSON edit), so the only thing keeping the two
 * in step is proximity.
 *
 * reap:carrier(user-level-asset-set)
 *
 * `~/.reap/` is deliberately not handled here: `reap-guide.md`, the install
 * stamp and the daemon's data are not client-specific, and are removed once by
 * `removeReapHomeAssets` in the adapter dispatcher rather than once per
 * adapter. `reap uninstall` sweeps both adapters, so doing it here would mean
 * doing it twice.
 *
 * Every removal is prefix-anchored. Anything a user put in these directories
 * themselves — including `reapdev.*`, which the dot keeps outside `reap-*` —
 * survives, and is reported in `kept` so that silence is never the evidence.
 */
export async function removeUserLevelAssets(
  home: string = homedir(),
): Promise<UserLevelRemovalResult> {
  const removed: string[] = [];
  const kept: string[] = [];

  const commands = await removeMatching(claudeCodeCommandsDir(home), SKILL_PATTERN);
  removed.push(...commands.removed.map((f) => `~/.claude/commands/${f}`));
  kept.push(...commands.kept.map((f) => `~/.claude/commands/${f}`));

  const agents = await removeMatching(join(home, ".claude", "agents"), AGENT_PATTERN);
  removed.push(...agents.removed.map((f) => `~/.claude/agents/${f}`));
  kept.push(...agents.kept.map((f) => `~/.claude/agents/${f}`));

  const hooks = await unregisterSessionHooks(home);
  for (const marker of hooks.removed) removed.push(`~/.claude/settings.json: ${marker}`);
  for (const other of hooks.kept) kept.push(`~/.claude/settings.json: ${other}`);

  return { removed, kept };
}

/**
 * Delete the files in `dir` whose names match `pattern`; report the rest.
 *
 * A missing directory is not an error — uninstall runs on machines where the
 * install never completed, and on machines where it has already run once.
 */
async function removeMatching(
  dir: string,
  pattern: RegExp,
): Promise<{ removed: string[]; kept: string[] }> {
  const removed: string[] = [];
  const kept: string[] = [];
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return { removed, kept };
  }
  for (const entry of entries) {
    if (!pattern.test(entry)) {
      kept.push(entry);
      continue;
    }
    try {
      await unlink(join(dir, entry));
      removed.push(entry);
    } catch {
      // Unwritable, already gone, a directory — leave it and say so rather
      // than reporting a removal that did not happen.
      kept.push(entry);
    }
  }
  return { removed, kept };
}

/**
 * Take REAP's SessionStart hooks back out of `~/.claude/settings.json`.
 *
 * This is the residue that actually costs the user something. The files are
 * litter; a hook entry keeps invoking a command that is no longer installed on
 * every session they start. It is wrapped in `2>/dev/null || true`, so nothing
 * visibly breaks and nothing tells them either.
 *
 * The filter runs at the level of the individual hook, not the entry. REAP
 * writes one hook per entry, but a user who merged their own command into the
 * same entry would otherwise lose it — an entry is only dropped once it holds
 * nothing else. The file itself is never deleted or rewritten wholesale: other
 * events, other settings and the user's formatting choices are not ours.
 *
 * Unparseable JSON is left exactly as it is. Hand-editing is the likeliest
 * reason for it, and clobbering it to complete an uninstall would be a worse
 * outcome than a hook that has to be removed by hand.
 */
export async function unregisterSessionHooks(
  home: string = homedir(),
): Promise<{ removed: string[]; kept: string[]; rewritten: boolean }> {
  const settingsPath = join(home, ".claude", "settings.json");
  const removedMarkers: string[] = [];
  const keptCommands: string[] = [];

  let settings: Record<string, unknown>;
  try {
    if (!(await fileExists(settingsPath))) return { removed: [], kept: [], rewritten: false };
    settings = JSON.parse(await readFile(settingsPath, "utf-8"));
  } catch {
    return { removed: [], kept: [], rewritten: false };
  }

  const hooks = settings.hooks as Record<string, unknown> | undefined;
  const sessionStart = hooks?.SessionStart;
  if (!hooks || !Array.isArray(sessionStart)) return { removed: [], kept: [], rewritten: false };

  const isReapHook = (command: unknown): string | null => {
    if (typeof command !== "string") return null;
    for (const { marker } of REAP_SESSION_HOOKS) if (command.includes(marker)) return marker;
    return null;
  };

  const survivingEntries: unknown[] = [];
  for (const entry of sessionStart) {
    const e = entry as { hooks?: { command?: string }[] };
    if (!Array.isArray(e?.hooks)) {
      survivingEntries.push(entry);
      continue;
    }
    const survivingHooks = e.hooks.filter((h) => {
      const marker = isReapHook(h?.command);
      if (marker) {
        removedMarkers.push(marker);
        return false;
      }
      if (typeof h?.command === "string") keptCommands.push(h.command);
      return true;
    });
    if (survivingHooks.length > 0) survivingEntries.push({ ...e, hooks: survivingHooks });
  }

  if (removedMarkers.length === 0) return { removed: [], kept: keptCommands, rewritten: false };

  if (survivingEntries.length > 0) {
    (hooks as Record<string, unknown>).SessionStart = survivingEntries;
  } else {
    delete (hooks as Record<string, unknown>).SessionStart;
    if (Object.keys(hooks).length === 0) delete settings.hooks;
  }

  try {
    await writeFile(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf-8");
  } catch {
    return { removed: [], kept: keptCommands, rewritten: false };
  }
  return { removed: removedMarkers, kept: keptCommands, rewritten: true };
}
