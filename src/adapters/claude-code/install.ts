import { readdir, cp, unlink, readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";
import { ensureDir, fileExists } from "../../core/fs.js";
import { emitOutput } from "../../core/output.js";

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
export async function installSlashCommandsOnly(): Promise<{
  cleaned: string[];
  installed: number;
  files: string[];
  targetDir: string;
}> {
  const targetDir = join(homedir(), ".claude", "commands");
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
 * Install Claude Code skill files to user-level ~/.claude/commands/
 */
export async function installSkills(_projectRoot?: string): Promise<void> {
  const { cleaned, installed, files, targetDir } = await installSlashCommandsOnly();

  // Copy reap-guide.md to ~/.reap/ (single source, always up-to-date)
  await installReapGuide();

  // Copy agent definitions to ~/.claude/agents/
  await installAgents();

  // Register SessionStart hooks (check-version + load-context)
  await registerSessionHooks();

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
 */
async function installReapGuide(): Promise<void> {
  const reapHome = join(homedir(), ".reap");
  await ensureDir(reapHome);

  // dist/templates/reap-guide.md
  const templateDir = __dirname.includes("dist")
    ? join(__dirname, "..", "templates")
    : join(__dirname, "..", "..", "templates");
  const src = join(templateDir, "reap-guide.md");

  if (await fileExists(src)) {
    await cp(src, join(reapHome, "reap-guide.md"));
  }
}

/**
 * Register SessionStart hooks in ~/.claude/settings.json:
 * 1. `reap check-version` — v0.15 legacy cleanup + auto-update
 * 2. `reap load-context` — inject REAP knowledge into session context
 */
export async function registerSessionHooks(): Promise<void> {
  const settingsPath = join(homedir(), ".claude", "settings.json");

  const requiredHooks = [
    { command: "reap check-version 2>/dev/null || true", marker: "reap check-version" },
    { command: "reap load-context 2>/dev/null || true", marker: "reap load-context" },
  ];

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
  } catch {
    // settings.json doesn't exist or parse error — skip silently
  }
}
