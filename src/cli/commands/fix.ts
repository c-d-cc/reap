import { mkdir, stat } from "fs/promises";
import YAML from "yaml";
import { ReapPaths } from "../../core/paths";
import { LifeCycle } from "../../core/lifecycle";
import type { GenerationState } from "../../types";

export interface FixResult {
  issues: string[];
  fixed: string[];
}

async function dirExists(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
}

export async function fixProject(projectRoot: string): Promise<FixResult> {
  const paths = new ReapPaths(projectRoot);
  const issues: string[] = [];
  const fixed: string[] = [];

  // 1. Required directories
  const requiredDirs = [
    { path: paths.genome, name: "genome" },
    { path: paths.domain, name: "genome/domain" },
    { path: paths.environment, name: "environment" },
    { path: paths.life, name: "life" },
    { path: paths.lineage, name: "lineage" },
    { path: paths.mutations, name: "life/mutations" },
    { path: paths.backlog, name: "life/backlog" },
    { path: paths.commands, name: "commands" },
    { path: paths.templates, name: "templates" },
  ];

  for (const dir of requiredDirs) {
    if (!(await dirExists(dir.path))) {
      await mkdir(dir.path, { recursive: true });
      fixed.push(`Recreated missing directory: ${dir.name}/`);
    }
  }

  // 2. config.yml
  const configFile = Bun.file(paths.config);
  if (!(await configFile.exists())) {
    issues.push("config.yml is missing. Run 'reap init' to recreate the project.");
  }

  // 3. current.yml
  const currentFile = Bun.file(paths.currentYml);
  if (await currentFile.exists()) {
    const content = await currentFile.text();
    if (content.trim()) {
      try {
        const state = YAML.parse(content) as GenerationState;
        if (!state.stage || !LifeCycle.isValid(state.stage)) {
          issues.push(`Invalid stage "${state.stage}" in current.yml. Valid stages: ${LifeCycle.stages().join(", ")}. Manual correction required.`);
        }
        if (!state.id) issues.push("current.yml is missing 'id' field. Manual correction required.");
        if (!state.goal) issues.push("current.yml is missing 'goal' field. Manual correction required.");

        // Ensure mutations dir exists for active generation
        if (!(await dirExists(paths.mutations))) {
          await mkdir(paths.mutations, { recursive: true });
          fixed.push("Recreated missing mutations/ directory for active generation");
        }
      } catch {
        await Bun.write(paths.currentYml, "");
        fixed.push("Reset corrupted current.yml (was not valid YAML)");
      }
    }
  }

  return { issues, fixed };
}
