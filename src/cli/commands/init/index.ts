import { readdir } from "fs/promises";
import { join } from "path";
import { createPaths } from "../../../core/paths.js";
import { fileExists } from "../../../core/fs.js";
import { emitError } from "../../../core/output.js";
import { execute as greenfieldExecute } from "./greenfield.js";
import { execute as adoptionExecute } from "./adoption.js";
import { execute as repairExecute } from "./repair.js";
import { execute as migrateExecute } from "../migrate.js";

/**
 * Source indicators — if any of these exist, the project is not greenfield.
 */
const SOURCE_DIRS = ["src", "lib", "app", "pages", "components", "server", "api", "cmd", "pkg", "internal"];
const PROJECT_FILES = [
  "package.json", "Cargo.toml", "go.mod", "pyproject.toml", "setup.py",
  "Makefile", "CMakeLists.txt", "pom.xml", "build.gradle", "Gemfile",
  "composer.json", "mix.exs", "deno.json", "bun.lockb",
];
const SOURCE_GLOBS = [".ts", ".js", ".py", ".rs", ".go", ".java", ".rb", ".php", ".swift", ".kt"];

/**
 * Detect whether the current directory is a greenfield or adoption project.
 * Returns "adoption" if significant source files exist, "greenfield" otherwise.
 */
async function detectMode(root: string): Promise<"greenfield" | "adoption"> {
  // Check for project files
  for (const file of PROJECT_FILES) {
    if (await fileExists(join(root, file))) {
      return "adoption";
    }
  }

  // Check for source directories
  for (const dir of SOURCE_DIRS) {
    if (await fileExists(join(root, dir))) {
      return "adoption";
    }
  }

  // Check for source files in root (shallow scan only)
  let entries: string[];
  try {
    entries = await readdir(root);
  } catch {
    return "greenfield";
  }

  for (const entry of entries) {
    if (entry.startsWith(".")) continue;
    for (const ext of SOURCE_GLOBS) {
      if (entry.endsWith(ext)) return "adoption";
    }
  }

  return "greenfield";
}

export async function execute(projectName?: string, mode?: string, repair?: boolean, migrate?: boolean, phase?: string): Promise<void> {
  const root = process.cwd();
  const paths = createPaths(root);

  // Migrate mode: v0.15 → v0.16
  if (migrate) {
    await migrateExecute(paths, phase);
    return;
  }

  // Repair mode: supplement missing files in an existing reap project
  if (repair) {
    if (!(await fileExists(paths.config))) {
      emitError("init", ".reap/ not found. This is not a reap project. Run 'reap init' first.");
    }
    await repairExecute(paths);
    return;
  }

  if (await fileExists(paths.config)) {
    emitError("init", ".reap/ already exists. Use 'reap status' to check current state.");
  }

  // Auto-detect mode, allow manual override
  const resolvedMode = (mode as "greenfield" | "adoption") ?? await detectMode(root);

  if (resolvedMode === "adoption") {
    await adoptionExecute(paths, projectName);
  } else {
    await greenfieldExecute(paths, projectName ?? "my-project");
  }
}
