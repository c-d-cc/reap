import { readdir, cp } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { ensureDir } from "../../core/fs.js";
import { emitOutput } from "../../core/output.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(__dirname, "skills");

/**
 * Install Claude Code skill files to project .claude/commands/
 */
export async function installSkills(projectRoot: string): Promise<void> {
  const targetDir = join(projectRoot, ".claude", "commands");
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
