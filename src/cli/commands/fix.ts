import { mkdir, stat } from "fs/promises";
import YAML from "yaml";
import { createPaths } from "../../core/paths.js";
import { readTextFile, fileExists, writeTextFile } from "../../core/fs.js";
import {
  checkIntegrity,
  checkUserLevelArtifacts,
  detectV15,
  type IntegrityResult,
} from "../../core/integrity.js";
import { emitOutput, emitError } from "../../core/output.js";
import { LIFECYCLE_STAGES, MERGE_STAGES } from "../../types/index.js";
import type { GenerationState } from "../../types/index.js";

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

/** Check-only mode: run structural integrity check without modifying anything */
export async function checkProject(
  projectRoot: string,
): Promise<IntegrityResult> {
  const paths = createPaths(projectRoot);
  const [structureResult, userLevelResult] = await Promise.all([
    checkIntegrity(paths),
    checkUserLevelArtifacts(projectRoot),
  ]);
  return {
    errors: [...structureResult.errors, ...userLevelResult.errors],
    warnings: [...structureResult.warnings, ...userLevelResult.warnings],
  };
}

/** Fix mode: diagnose and repair what can be auto-fixed */
export async function fixProject(projectRoot: string): Promise<FixResult> {
  const paths = createPaths(projectRoot);
  const issues: string[] = [];
  const fixed: string[] = [];

  // 1. Required directories
  const requiredDirs = [
    { path: paths.genome, name: "genome" },
    { path: paths.environment, name: "environment" },
    { path: paths.life, name: "life" },
    { path: paths.lineage, name: "lineage" },
    { path: paths.vision, name: "vision" },
    { path: paths.hooks, name: "hooks" },
  ];

  for (const dir of requiredDirs) {
    if (!(await dirExists(dir.path))) {
      await mkdir(dir.path, { recursive: true });
      fixed.push(`Recreated missing directory: ${dir.name}/`);
    }
  }

  // 2. config.yml
  if (!(await fileExists(paths.config))) {
    issues.push(
      "config.yml is missing. Run 'reap init' to recreate the project.",
    );
  }

  // 3. current.yml
  const currentContent = await readTextFile(paths.current);
  if (currentContent !== null) {
    if (currentContent.trim()) {
      try {
        const state = YAML.parse(currentContent) as GenerationState;
        const allStages = [
          ...LIFECYCLE_STAGES,
          ...MERGE_STAGES,
        ] as readonly string[];
        if (!state.stage || !allStages.includes(state.stage)) {
          issues.push(
            `Invalid stage "${state.stage}" in current.yml. Valid stages: ${allStages.join(", ")}. Manual correction required.`,
          );
        }
        if (!state.id)
          issues.push(
            "current.yml is missing 'id' field. Manual correction required.",
          );
        if (!state.goal)
          issues.push(
            "current.yml is missing 'goal' field. Manual correction required.",
          );

        // Ensure backlog dir exists for active generation
        if (!(await dirExists(paths.backlog))) {
          await mkdir(paths.backlog, { recursive: true });
          fixed.push(
            "Recreated missing backlog/ directory for active generation",
          );
        }
      } catch {
        await writeTextFile(paths.current, "");
        fixed.push("Reset corrupted current.yml (was not valid YAML)");
      }
    }
  }

  // 4. Genome files — report missing but don't auto-create (init handles templates)
  const genomeFiles = [
    { path: paths.application, name: "application.md" },
    { path: paths.evolution, name: "evolution.md" },
    { path: paths.invariants, name: "invariants.md" },
  ];
  for (const gf of genomeFiles) {
    if (!(await fileExists(gf.path))) {
      issues.push(
        `genome/${gf.name} is missing. Run 'reap init --repair' to restore.`,
      );
    }
  }

  return { issues, fixed };
}

/** CLI entry point for `reap fix` */
export async function execute(check?: boolean): Promise<void> {
  const root = process.cwd();
  const paths = createPaths(root);
  if (await detectV15(paths)) {
    emitError("fix", "This project uses REAP v0.15 structure. Run '/reap.migrate' to upgrade to v0.16.");
  }

  if (check) {
    const result = await checkProject(root);
    const hasErrors = result.errors.length > 0;
    const hasWarnings = result.warnings.length > 0;
    emitOutput({
      status: hasErrors ? "error" : "ok",
      command: "fix",
      context: {
        mode: "check",
        errors: result.errors,
        warnings: result.warnings,
        errorCount: result.errors.length,
        warningCount: result.warnings.length,
      },
      message: hasErrors || hasWarnings
        ? `Found ${result.errors.length} error(s) and ${result.warnings.length} warning(s)`
        : "No issues found",
    });
  } else {
    const result = await fixProject(root);
    const hasIssues = result.issues.length > 0;
    emitOutput({
      status: hasIssues ? "error" : "ok",
      command: "fix",
      context: {
        mode: "fix",
        issues: result.issues,
        fixed: result.fixed,
        issueCount: result.issues.length,
        fixedCount: result.fixed.length,
      },
      message:
        result.fixed.length > 0
          ? `Fixed ${result.fixed.length} item(s). ${result.issues.length} issue(s) require manual attention.`
          : hasIssues
            ? `${result.issues.length} issue(s) require manual attention`
            : "No issues found",
    });
  }
}
