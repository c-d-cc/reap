import { mkdir, stat, copyFile } from "fs/promises";
import { join } from "path";
import YAML from "yaml";
import { ReapPaths } from "../../core/paths";
import { LifeCycle } from "../../core/lifecycle";
import { readTextFile, fileExists, writeTextFile } from "../../core/fs";
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
    { path: paths.backlog, name: "life/backlog" },
  ];

  for (const dir of requiredDirs) {
    if (!(await dirExists(dir.path))) {
      await mkdir(dir.path, { recursive: true });
      fixed.push(`Recreated missing directory: ${dir.name}/`);
    }
  }

  // 2. Genome required files
  const genomeFiles = [
    { path: paths.principles, name: "principles.md" },
    { path: paths.conventions, name: "conventions.md" },
    { path: paths.constraints, name: "constraints.md" },
    { path: paths.sourceMap, name: "source-map.md" },
  ];
  for (const gf of genomeFiles) {
    if (!(await fileExists(gf.path))) {
      const templateSrc = join(ReapPaths.packageGenomeDir, gf.name);
      if (await fileExists(templateSrc)) {
        await copyFile(templateSrc, gf.path);
        fixed.push(`Restored missing genome/${gf.name} from template`);
      } else {
        issues.push(`genome/${gf.name} is missing and no template found`);
      }
    }
  }

  // 3. config.yml
  if (!(await fileExists(paths.config))) {
    issues.push("config.yml is missing. Run 'reap init' to recreate the project.");
  }

  // 3. current.yml
  const currentContent = await readTextFile(paths.currentYml);
  if (currentContent !== null) {
    if (currentContent.trim()) {
      try {
        const state = YAML.parse(currentContent) as GenerationState;
        if (!state.stage || !LifeCycle.isValid(state.stage)) {
          issues.push(`Invalid stage "${state.stage}" in current.yml. Valid stages: ${LifeCycle.stages().join(", ")}. Manual correction required.`);
        }
        if (!state.id) issues.push("current.yml is missing 'id' field. Manual correction required.");
        if (!state.goal) issues.push("current.yml is missing 'goal' field. Manual correction required.");

        // Ensure backlog dir exists for active generation
        if (!(await dirExists(paths.backlog))) {
          await mkdir(paths.backlog, { recursive: true });
          fixed.push("Recreated missing backlog/ directory for active generation");
        }
      } catch {
        await writeTextFile(paths.currentYml, "");
        fixed.push("Reset corrupted current.yml (was not valid YAML)");
      }
    }
  }

  return { issues, fixed };
}
