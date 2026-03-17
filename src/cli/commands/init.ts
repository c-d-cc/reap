import { mkdir } from "fs/promises";
import { join } from "path";
import { ReapPaths } from "../../core/paths";
import { ConfigManager } from "../../core/config";
import type { ReapConfig } from "../../types";

export const COMMAND_NAMES = [
  "reap.conception", "reap.formation", "reap.planning", "reap.growth",
  "reap.validation", "reap.adaptation", "reap.birth", "reap.evolve",
];

const ARTIFACT_NAMES = [
  "01-conception-goal", "02-formation-spec", "03-planning-plan",
  "04-growth-log", "05-validation-report", "06-adaptation-retrospective",
  "07-birth-changelog",
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
    const presetDir = join(import.meta.dir, "../../templates/presets", preset);
    const presetExists = await Bun.file(join(presetDir, "principles.md")).exists();
    if (!presetExists) {
      throw new Error(`Unknown preset: "${preset}". Available presets: bun-hono-react`);
    }
  }

  // Create 4-axis structure + commands + templates
  await mkdir(paths.genome, { recursive: true });
  await mkdir(paths.domain, { recursive: true });
  await mkdir(paths.environment, { recursive: true });
  await mkdir(paths.life, { recursive: true });
  await mkdir(paths.mutations, { recursive: true });
  await mkdir(paths.backlog, { recursive: true });
  await mkdir(paths.lineage, { recursive: true });
  await mkdir(paths.commands, { recursive: true });
  await mkdir(paths.templates, { recursive: true });

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
    ? join(import.meta.dir, "../../templates/presets", preset)
    : join(import.meta.dir, "../../templates/genome");
  for (const file of genomeTemplates) {
    const src = join(genomeSourceDir, file);
    const dest = join(paths.genome, file);
    await Bun.write(dest, await Bun.file(src).text());
  }

  // Copy domain README
  const domainReadmeSrc = join(import.meta.dir, "../../templates/genome/domain/README.md");
  const domainReadmeDest = join(paths.domain, "README.md");
  await Bun.write(domainReadmeDest, await Bun.file(domainReadmeSrc).text());

  // Copy slash commands to .reap/commands/
  for (const cmd of COMMAND_NAMES) {
    const src = join(import.meta.dir, "../../templates/commands", `${cmd}.md`);
    const dest = join(paths.commands, `${cmd}.md`);
    await Bun.write(dest, await Bun.file(src).text());
  }

  // Copy artifact templates to .reap/templates/
  for (const art of ARTIFACT_NAMES) {
    const src = join(import.meta.dir, "../../templates/artifacts", `${art}.md`);
    const dest = join(paths.templates, `${art}.md`);
    await Bun.write(dest, await Bun.file(src).text());
  }

  // Copy commands to .claude/commands/ (Claude Code integration)
  const claudeDir = paths.claudeCommands;
  await mkdir(claudeDir, { recursive: true });
  for (const cmd of COMMAND_NAMES) {
    const src = join(paths.commands, `${cmd}.md`);
    const dest = join(claudeDir, `${cmd}.md`);
    await Bun.write(dest, await Bun.file(src).text());
  }
}
