import { readdir, mkdir } from "fs/promises";
import { join } from "path";
import { ReapPaths } from "./paths";
import { readTextFile, readTextFileOrThrow, writeTextFile } from "./fs";

export interface SyncSkillsResult {
  installed: number;
  total: number;
}

/**
 * Sync ~/.reap/commands/reap.*.md → .claude/skills/{name}/SKILL.md
 * Parses frontmatter from command files and generates SKILL.md with name/description.
 *
 * NOTE: This is Claude Code-specific logic. Claude Code uses .claude/skills/ for
 * slash command discovery. Other agents (OpenCode, Codex CLI) use different mechanisms
 * (plugins, AGENTS.md) and do not need skills syncing.
 */
export async function syncSkillsToProject(
  projectRoot: string,
  dryRun: boolean = false,
): Promise<SyncSkillsResult> {
  const projectClaudeSkills = join(projectRoot, ".claude", "skills");
  const reapCmdFiles = (await readdir(ReapPaths.userReapCommands)).filter(
    (f: string) => f.startsWith("reap.") && f.endsWith(".md"),
  );

  let installed = 0;
  for (const file of reapCmdFiles) {
    const src = await readTextFileOrThrow(join(ReapPaths.userReapCommands, file));
    const name = file.replace(/\.md$/, "");
    const skillDir = join(projectClaudeSkills, name);
    const skillFile = join(skillDir, "SKILL.md");

    const fmMatch = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    const description = fmMatch
      ? (fmMatch[1].match(/^description:\s*"?([^"\n]*)"?/m)?.[1]?.trim() ?? "")
      : "";
    const body = fmMatch ? fmMatch[2] : src;
    const skillContent = `---\nname: ${name}\ndescription: "${description}"\n---\n${body}`;

    const existing = await readTextFile(skillFile);
    if (existing !== null && existing === skillContent) continue;

    if (!dryRun) {
      await mkdir(skillDir, { recursive: true });
      await writeTextFile(skillFile, skillContent);
    }
    installed++;
  }

  return { installed, total: reapCmdFiles.length };
}
