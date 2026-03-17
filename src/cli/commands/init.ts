import { mkdir } from "fs/promises";
import { join } from "path";
import { ReapPaths } from "../../core/paths";
import { ConfigManager } from "../../core/config";
import { registerClaudeHook } from "../../core/hooks";
import type { ReapConfig } from "../../types";

export const COMMAND_NAMES = [
  "reap.objective", "reap.planning", "reap.implementation",
  "reap.validation", "reap.completion", "reap.evolve",
];

export async function initProject(
  projectRoot: string,
  projectName: string,
  entryMode: "greenfield" | "migration" | "adoption",
  preset?: string,
): Promise<void> {
  const paths = new ReapPaths(projectRoot);

  if (await paths.isReapProject()) {
    throw new Error(".reap/ already exists. This is already a REAP project.");
  }

  // Validate preset if provided
  if (preset) {
    const presetDir = join(ReapPaths.packageTemplatesDir, "presets", preset);
    const presetExists = await Bun.file(join(presetDir, "principles.md")).exists();
    if (!presetExists) {
      throw new Error(`Unknown preset: "${preset}". Available presets: bun-hono-react`);
    }
  }

  // Create 4-axis structure (project artifacts only)
  await mkdir(paths.genome, { recursive: true });
  await mkdir(paths.domain, { recursive: true });
  await mkdir(paths.environment, { recursive: true });
  await mkdir(paths.life, { recursive: true });
  await mkdir(paths.backlog, { recursive: true });
  await mkdir(paths.lineage, { recursive: true });

  // Write config
  const config: ReapConfig = {
    version: "0.1.0",
    project: projectName,
    entryMode,
    ...(preset && { preset }),
  };
  await ConfigManager.write(paths, config);

  // Copy genome templates (from preset or default)
  const genomeTemplates = ["principles.md", "conventions.md", "constraints.md"];
  const genomeSourceDir = preset
    ? join(ReapPaths.packageTemplatesDir, "presets", preset)
    : ReapPaths.packageGenomeDir;
  for (const file of genomeTemplates) {
    const src = join(genomeSourceDir, file);
    const dest = join(paths.genome, file);
    await Bun.write(dest, await Bun.file(src).text());
  }

  // Copy domain README
  const domainReadmeSrc = join(ReapPaths.packageGenomeDir, "domain/README.md");
  const domainReadmeDest = join(paths.domain, "README.md");
  await Bun.write(domainReadmeDest, await Bun.file(domainReadmeSrc).text());

  // Install slash commands to user-level ~/.claude/commands/
  await mkdir(ReapPaths.userClaudeCommands, { recursive: true });
  for (const cmd of COMMAND_NAMES) {
    const src = join(ReapPaths.packageCommandsDir, `${cmd}.md`);
    const dest = join(ReapPaths.userClaudeCommands, `${cmd}.md`);
    await Bun.write(dest, await Bun.file(src).text());
  }

  // Register SessionStart hook in user-level ~/.claude/hooks.json
  await registerClaudeHook();
}
