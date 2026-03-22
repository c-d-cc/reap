import { rm, readdir, mkdir } from "fs/promises";
import { join } from "path";
import { ReapPaths } from "../../core/paths";
import { fileExists, readTextFileOrThrow, writeTextFile } from "../../core/fs";
import { GenerationManager } from "../../core/generation";

export interface CleanOptions {
  lineage: "compress" | "delete";
  hooks: "keep" | "reset";
  genome: "template" | "keep" | "manual";
  backlog: "keep" | "delete";
}

export interface CleanResult {
  actions: string[];
  warnings: string[];
}

/**
 * Check if there is an active generation in progress.
 */
export async function hasActiveGeneration(projectRoot: string): Promise<boolean> {
  const paths = new ReapPaths(projectRoot);
  try {
    const mgr = new GenerationManager(paths);
    const current = await mgr.current();
    return current !== null;
  } catch {
    return false;
  }
}

/**
 * Clean (reset) a REAP project based on user options.
 */
export async function cleanProject(
  projectRoot: string, options: CleanOptions,
): Promise<CleanResult> {
  const paths = new ReapPaths(projectRoot);
  const actions: string[] = [];
  const warnings: string[] = [];

  // 1. Handle lineage
  if (options.lineage === "delete") {
    await rm(paths.lineage, { recursive: true, force: true });
    await mkdir(paths.lineage, { recursive: true });
    actions.push("Lineage: 전체 삭제됨");
  } else {
    // compress: create epoch summary and clear individual entries
    await compressLineage(paths, actions);
  }

  // 2. Handle life (current generation + artifacts)
  await cleanLife(paths, actions);

  // 3. Handle hooks
  if (options.hooks === "reset") {
    const hooksDir = paths.hooks;
    if (await fileExists(hooksDir)) {
      await rm(hooksDir, { recursive: true, force: true });
      await mkdir(hooksDir, { recursive: true });
      actions.push("Hooks: 초기화됨");
    } else {
      actions.push("Hooks: 디렉토리 없음 (skip)");
    }
  } else {
    actions.push("Hooks: 기존 유지");
  }

  // 4. Handle genome/environment
  if (options.genome === "template") {
    await resetGenomeToTemplate(paths, actions);
  } else if (options.genome === "keep") {
    actions.push("Genome/Environment: 기존 유지");
  } else {
    actions.push("Genome/Environment: 수동 편집 모드 (변경 없음)");
  }

  // 5. Handle backlog
  const backlogDir = paths.backlog;
  if (options.backlog === "delete") {
    if (await fileExists(backlogDir)) {
      await rm(backlogDir, { recursive: true, force: true });
      await mkdir(backlogDir, { recursive: true });
      actions.push("Backlog: 삭제됨");
    } else {
      actions.push("Backlog: 디렉토리 없음 (skip)");
    }
  } else {
    actions.push("Backlog: 보존됨");
  }

  return { actions, warnings };
}

async function compressLineage(paths: ReapPaths, actions: string[]): Promise<void> {
  const lineageDir = paths.lineage;
  if (!(await fileExists(lineageDir))) {
    actions.push("Lineage: 디렉토리 없음 (skip)");
    return;
  }

  let entries: string[];
  try {
    entries = await readdir(lineageDir);
  } catch {
    actions.push("Lineage: 읽기 실패 (skip)");
    return;
  }

  const genDirs = entries.filter(e => e.startsWith("gen-"));
  if (genDirs.length === 0) {
    actions.push("Lineage: 세대 기록 없음 (skip)");
    return;
  }

  // Create epoch summary
  const epochId = `epoch-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`;
  const summary = [
    `# Epoch: ${epochId}`,
    `# Compressed ${genDirs.length} generations`,
    `# Date: ${new Date().toISOString()}`,
    "",
    "## Generations",
    ...genDirs.map(d => `- ${d}`),
    "",
  ].join("\n");

  // Remove individual generation directories
  for (const dir of genDirs) {
    await rm(join(lineageDir, dir), { recursive: true, force: true });
  }

  // Write epoch file
  await writeTextFile(join(lineageDir, `${epochId}.md`), summary);
  actions.push(`Lineage: ${genDirs.length}개 세대를 ${epochId}로 압축`);
}

async function cleanLife(paths: ReapPaths, actions: string[]): Promise<void> {
  const lifeDir = paths.life;
  if (!(await fileExists(lifeDir))) {
    actions.push("Life: 디렉토리 없음 (skip)");
    return;
  }

  // Remove current.yml and all artifact files
  let entries: string[];
  try {
    entries = await readdir(lifeDir);
  } catch {
    actions.push("Life: 읽기 실패 (skip)");
    return;
  }

  let removedCount = 0;
  for (const entry of entries) {
    if (entry === "backlog") continue; // handled separately
    const entryPath = join(lifeDir, entry);
    await rm(entryPath, { recursive: true, force: true });
    removedCount++;
  }

  actions.push(`Life: ${removedCount}개 파일/디렉토리 정리됨`);
}

async function resetGenomeToTemplate(paths: ReapPaths, actions: string[]): Promise<void> {
  const genomeFiles = ["principles.md", "conventions.md", "constraints.md", "source-map.md"];

  for (const file of genomeFiles) {
    const templatePath = join(ReapPaths.packageGenomeDir, file);
    const destPath = join(paths.genome, file);
    try {
      const templateContent = await readTextFileOrThrow(templatePath);
      await writeTextFile(destPath, templateContent);
    } catch {
      // template not available, skip
    }
  }

  // Reset environment
  const envSummaryTemplate = join(ReapPaths.packageTemplatesDir, "environment", "summary.md");
  if (await fileExists(envSummaryTemplate)) {
    try {
      const content = await readTextFileOrThrow(envSummaryTemplate);
      await writeTextFile(paths.environmentSummary, content);
    } catch { /* skip */ }
  }

  actions.push("Genome/Environment: 템플릿으로 초기화됨");
}
