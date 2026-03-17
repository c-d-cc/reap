import { mkdir } from "fs/promises";
import { join } from "path";
import { ReapPaths } from "../../core/paths";
import { ConfigManager } from "../../core/config";
import { registerClaudeHook } from "../../core/hooks";
import { fileExists, readTextFileOrThrow, writeTextFile } from "../../core/fs";
import type { ReapConfig } from "../../types";

export const COMMAND_NAMES = [
  "reap.objective", "reap.planning", "reap.implementation",
  "reap.validation", "reap.completion", "reap.evolve",
  "reap.start", "reap.next", "reap.back", "reap.status", "reap.sync",
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
    const presetExists = await fileExists(join(presetDir, "principles.md"));
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
    await writeTextFile(dest, await readTextFileOrThrow(src));
  }

  // Install artifact templates + domain guide to user-level ~/.reap/templates/
  await mkdir(ReapPaths.userReapTemplates, { recursive: true });
  const artifactFiles = ["01-objective.md", "02-planning.md", "03-implementation.md", "04-validation.md", "05-completion.md"];
  for (const file of artifactFiles) {
    const src = join(ReapPaths.packageArtifactsDir, file);
    const dest = join(ReapPaths.userReapTemplates, file);
    await writeTextFile(dest, await readTextFileOrThrow(src));
  }
  const domainGuideSrc = join(ReapPaths.packageGenomeDir, "domain/README.md");
  const domainGuideDest = join(ReapPaths.userReapTemplates, "domain-guide.md");
  await writeTextFile(domainGuideDest, await readTextFileOrThrow(domainGuideSrc));

  // Install slash commands to user-level ~/.claude/commands/
  await mkdir(ReapPaths.userClaudeCommands, { recursive: true });
  for (const cmd of COMMAND_NAMES) {
    const src = join(ReapPaths.packageCommandsDir, `${cmd}.md`);
    const dest = join(ReapPaths.userClaudeCommands, `${cmd}.md`);
    await writeTextFile(dest, await readTextFileOrThrow(src));
  }

  // Register SessionStart hook in user-level ~/.claude/hooks.json
  await registerClaudeHook();
}
