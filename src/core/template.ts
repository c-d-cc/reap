import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { copyFile } from "fs/promises";
import { fileExists, ensureDir } from "./fs.js";

const STAGE_ARTIFACTS: Record<string, string> = {
  learning: "01-learning.md",
  planning: "02-planning.md",
  implementation: "03-implementation.md",
  validation: "04-validation.md",
  completion: "05-completion.md",
};

const MERGE_STAGE_ARTIFACTS: Record<string, string> = {
  detect: "01-detect.md",
  mate: "02-mate.md",
  merge: "03-merge.md",
  reconcile: "04-reconcile.md",
  validation: "05-validation.md",
  completion: "06-completion.md",
};

/**
 * Copy artifact template to the life directory if it doesn't already exist.
 * Skips copy when the artifact file is already present (e.g., after back regression).
 */
export async function copyArtifactTemplate(
  stage: string,
  artifactPath: (name: string) => string,
  isMerge?: boolean,
): Promise<void> {
  const map = isMerge ? MERGE_STAGE_ARTIFACTS : STAGE_ARTIFACTS;
  const filename = map[stage];
  if (!filename) return;

  const destPath = artifactPath(filename);
  if (await fileExists(destPath)) return;

  const subdir = isMerge ? "merge" : "normal";
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const templatePath = join(__dirname, "..", "templates", "artifacts", subdir, filename);

  if (!(await fileExists(templatePath))) return;

  await ensureDir(dirname(destPath));
  await copyFile(templatePath, destPath);
}
