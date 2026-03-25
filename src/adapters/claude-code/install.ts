import { readdir, cp } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";
import { ensureDir } from "../../core/fs.js";
import { emitOutput } from "../../core/output.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// In bundled mode, __dirname is dist/cli/. Skills are at dist/adapters/claude-code/skills/
// In dev mode, __dirname is src/adapters/claude-code/. Skills are at src/adapters/claude-code/skills/
const SKILLS_DIR = __dirname.includes("dist")
  ? join(__dirname, "..", "adapters", "claude-code", "skills")
  : join(__dirname, "skills");

/**
 * Install Claude Code skill files to user-level ~/.claude/commands/
 */
export async function installSkills(_projectRoot?: string): Promise<void> {
  const targetDir = join(homedir(), ".claude", "commands");
  await ensureDir(targetDir);

  const files = await readdir(SKILLS_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  let installed = 0;
  for (const file of mdFiles) {
    await cp(join(SKILLS_DIR, file), join(targetDir, file));
    installed++;
  }

  emitOutput({
    status: "ok",
    command: "install-skills",
    completed: ["copy-skills"],
    context: {
      targetDir,
      installed,
      files: mdFiles,
    },
    message: `Installed ${installed} skill files to ${targetDir}`,
  });
}
