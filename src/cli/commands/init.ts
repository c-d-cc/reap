import { mkdir, readdir, chmod } from "fs/promises";
import { join } from "path";
import { ReapPaths } from "../../core/paths";
import { ConfigManager } from "../../core/config";
import { AgentRegistry } from "../../core/agents";
import { fileExists, readTextFileOrThrow, writeTextFile } from "../../core/fs";
import type { ReapConfig } from "../../types";

export const COMMAND_NAMES = [
  "reap.objective", "reap.planning", "reap.implementation",
  "reap.validation", "reap.completion", "reap.evolve",
  "reap.start", "reap.next", "reap.back", "reap.status", "reap.sync", "reap.help",
  "reap.update",
  "reap.merge.start", "reap.merge.detect", "reap.merge.mate",
  "reap.merge.merge", "reap.merge.sync", "reap.merge.validation",
  "reap.merge.completion", "reap.merge.evolve",
  "reap.merge",
  "reap.pull", "reap.push",
];

export async function initProject(
  projectRoot: string,
  projectName: string,
  entryMode: "greenfield" | "migration" | "adoption",
  preset?: string,
  onProgress?: (message: string) => void,
): Promise<{ agents: string[] }> {
  const log = onProgress ?? (() => {});
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

  // 1. Create 4-axis structure
  log("Creating .reap/ directory structure...");
  await mkdir(paths.genome, { recursive: true });
  await mkdir(paths.domain, { recursive: true });
  await mkdir(paths.environment, { recursive: true });
  await mkdir(paths.life, { recursive: true });
  await mkdir(paths.backlog, { recursive: true });
  await mkdir(paths.lineage, { recursive: true });

  // 2. Write config
  log("Writing config.yml...");
  const config: ReapConfig = {
    version: "0.1.0",
    project: projectName,
    entryMode,
    autoUpdate: true,
    ...(preset && { preset }),
  };
  await ConfigManager.write(paths, config);

  // 3. Copy genome templates (then override with project scan for adoption/migration)
  log("Setting up Genome templates...");
  const genomeTemplates = ["principles.md", "conventions.md", "constraints.md", "source-map.md"];
  const genomeSourceDir = preset
    ? join(ReapPaths.packageTemplatesDir, "presets", preset)
    : ReapPaths.packageGenomeDir;
  for (const file of genomeTemplates) {
    const src = join(genomeSourceDir, file);
    const dest = join(paths.genome, file);
    await writeTextFile(dest, await readTextFileOrThrow(src));
  }

  // 3b. Auto-sync genome from project scan (adoption/migration only)
  if ((entryMode === "adoption" || entryMode === "migration") && !preset) {
    log("Scanning project for genome auto-sync...");
    const { syncGenomeFromProject } = await import("../../core/genome-sync");
    await syncGenomeFromProject(projectRoot, paths.genome, log);
  }

  // 4. Install artifact templates + domain guide
  log("Installing artifact templates...");
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

  // Install merge artifact templates
  const mergeTemplatesDir = join(ReapPaths.userReapTemplates, "merge");
  await mkdir(mergeTemplatesDir, { recursive: true });
  const mergeArtifactFiles = ["01-detect.md", "02-mate.md", "03-merge.md", "04-sync.md", "05-validation.md", "06-completion.md"];
  const mergeSourceDir = join(ReapPaths.packageArtifactsDir, "merge");
  for (const file of mergeArtifactFiles) {
    const src = join(mergeSourceDir, file);
    const dest = join(mergeTemplatesDir, file);
    await writeTextFile(dest, await readTextFileOrThrow(src));
  }

  // 5. Install hook condition scripts
  log("Installing hook conditions...");
  const conditionsSourceDir = join(ReapPaths.packageTemplatesDir, "conditions");
  const conditionsDestDir = join(paths.hooks, "conditions");
  await mkdir(conditionsDestDir, { recursive: true });
  const conditionFiles = await readdir(conditionsSourceDir);
  for (const file of conditionFiles) {
    if (!file.endsWith(".sh")) continue;
    const src = join(conditionsSourceDir, file);
    const dest = join(conditionsDestDir, file);
    await writeTextFile(dest, await readTextFileOrThrow(src));
    await chmod(dest, 0o755);
  }

  // 6. Detect installed agents and install commands + hooks
  log("Detecting AI agents...");
  const detectedAgents = await AgentRegistry.detectInstalled();
  const sourceDir = ReapPaths.packageCommandsDir;

  for (const adapter of detectedAgents) {
    log(`  Installing commands for ${adapter.displayName}...`);
    await adapter.installCommands(COMMAND_NAMES, sourceDir);
    log(`  Registering session hook for ${adapter.displayName}...`);
    await adapter.registerSessionHook();
  }

  if (detectedAgents.length === 0) {
    log("  No AI agents detected.");
  }

  return { agents: detectedAgents.map(a => a.displayName) };
}
