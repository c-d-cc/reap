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

const SKILL_PATTERN = /^(reap|reapdev)\..+\.md$/;

/**
 * Remove existing reap/reapdev skill files from target directory
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
 * Install Claude Code skill files to user-level ~/.claude/commands/
 */
export async function installSkills(_projectRoot?: string): Promise<void> {
  const targetDir = join(homedir(), ".claude", "commands");
  await ensureDir(targetDir);

  // Clean up existing reap/reapdev skills before copying new ones
  const cleaned = await cleanupStaleSkills(targetDir);

  const files = await readdir(SKILLS_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  let installed = 0;
  for (const file of mdFiles) {
    await cp(join(SKILLS_DIR, file), join(targetDir, file));
    installed++;
  }

  // Register SessionStart hook for v0.15 legacy cleanup
  await registerCleanupHook();

  emitOutput({
    status: "ok",
    command: "install-skills",
    completed: ["cleanup-stale-skills", "copy-skills", "register-hook"],
    context: {
      targetDir,
      cleaned: cleaned.length,
      installed,
      files: mdFiles,
    },
    message: `Cleaned ${cleaned.length} stale skills, installed ${installed} skill files to ${targetDir}`,
  });
}

/**
 * Register a SessionStart hook in ~/.claude/settings.json that cleans up
 * v0.15 project-level skills/commands when Claude starts in any project.
 */
async function registerCleanupHook(): Promise<void> {
  const settingsPath = join(homedir(), ".claude", "settings.json");
  const hookCommand = "reap check-version 2>/dev/null || true";

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

    // Check if our hook already exists
    const exists = hooks.SessionStart.some((entry: unknown) => {
      const e = entry as { hooks?: { command?: string }[] };
      return e.hooks?.some((h) => h.command?.includes("reap check-version"));
    });

    if (!exists) {
      hooks.SessionStart.push({
        matcher: "",
        hooks: [{ type: "command", command: hookCommand }],
      });
      await writeFile(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf-8");
    }
  } catch {
    // settings.json doesn't exist or parse error — skip silently
  }
}
