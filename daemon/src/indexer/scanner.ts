import { execSync } from "child_process";
import { statSync } from "fs";
import { join } from "path";
import { detectLanguage } from "./languages.js";

export interface ScannedFile {
  relativePath: string;
  absolutePath: string;
  language: string;
  mtime: number;
}

export async function scanFiles(projectRoot: string): Promise<ScannedFile[]> {
  const output = execSync("git ls-files -z", { cwd: projectRoot, encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 });
  const paths = output.split("\0").filter(Boolean);

  const files: ScannedFile[] = [];
  for (const relativePath of paths) {
    const language = detectLanguage(relativePath);
    if (!language) continue;

    const absolutePath = join(projectRoot, relativePath);
    try {
      const stat = statSync(absolutePath);
      files.push({ relativePath, absolutePath, language, mtime: stat.mtimeMs });
    } catch {}
  }

  return files;
}

export async function getChangedFiles(projectRoot: string, sinceCommit: string): Promise<string[]> {
  let committed: string[] = [];
  try {
    const output = execSync(`git diff --name-only ${sinceCommit}..HEAD`, { cwd: projectRoot, encoding: "utf-8" });
    committed = output.split("\n").filter(Boolean);
  } catch {
    return [];
  }

  let uncommitted: string[] = [];
  try {
    const output = execSync("git diff --name-only HEAD", { cwd: projectRoot, encoding: "utf-8" });
    const staged = execSync("git diff --name-only --cached", { cwd: projectRoot, encoding: "utf-8" });
    uncommitted = [...output.split("\n"), ...staged.split("\n")].filter(Boolean);
  } catch {}

  const all = [...new Set([...committed, ...uncommitted])];
  return all.filter((f) => detectLanguage(f) !== null);
}
