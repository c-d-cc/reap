import { readdir, stat } from "fs/promises";
import { join, relative } from "path";
import { readTextFile } from "./fs.js";

export interface ScanResult {
  projectName: string;
  packageJson: Record<string, unknown> | null;
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
  hasTypeScript: boolean;
  hasTests: boolean;
  testFramework: string | null;
  buildTool: string | null;
  directoryTree: string[];
  readmeExcerpt: string | null;
}

/**
 * Scan a codebase and extract project metadata.
 */
export async function scanCodebase(root: string): Promise<ScanResult> {
  // Package.json
  let packageJson: Record<string, unknown> | null = null;
  const pkgContent = await readTextFile(join(root, "package.json"));
  if (pkgContent) {
    try { packageJson = JSON.parse(pkgContent); } catch { /* ignore */ }
  }

  const deps = Object.keys((packageJson?.dependencies as Record<string, string>) ?? {});
  const devDeps = Object.keys((packageJson?.devDependencies as Record<string, string>) ?? {});
  const scripts = (packageJson?.scripts as Record<string, string>) ?? {};

  // TypeScript
  const hasTypeScript = !!(await readTextFile(join(root, "tsconfig.json"))) || devDeps.includes("typescript");

  // Test framework detection
  const testFrameworks = ["jest", "vitest", "mocha", "@jest/core", "bun:test"];
  const testFramework = [...deps, ...devDeps].find((d) => testFrameworks.includes(d)) ?? null;
  const hasTests = !!testFramework || scripts.test !== undefined;

  // Build tool
  const buildTools = ["webpack", "vite", "esbuild", "rollup", "tsup", "turbo"];
  const buildTool = [...deps, ...devDeps].find((d) => buildTools.includes(d)) ?? null;

  // Directory tree (top 2 levels, skip node_modules/dist/.git)
  const tree = await buildTree(root, root, 2);

  // README excerpt
  let readmeExcerpt: string | null = null;
  const readme = await readTextFile(join(root, "README.md"));
  if (readme) {
    readmeExcerpt = readme.slice(0, 500);
  }

  return {
    projectName: (packageJson?.name as string) ?? root.split("/").pop() ?? "unknown",
    packageJson,
    dependencies: deps,
    devDependencies: devDeps,
    scripts,
    hasTypeScript,
    hasTests,
    testFramework,
    buildTool,
    directoryTree: tree,
    readmeExcerpt,
  };
}

const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".reap", ".next", "coverage", "__pycache__"]);

async function buildTree(root: string, dir: string, depth: number): Promise<string[]> {
  if (depth <= 0) return [];

  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }

  const result: string[] = [];
  for (const entry of entries.sort()) {
    if (entry.startsWith(".") && entry !== ".env.example") continue;
    if (SKIP_DIRS.has(entry)) continue;

    const fullPath = join(dir, entry);
    const relPath = relative(root, fullPath);
    const s = await stat(fullPath).catch(() => null);
    if (!s) continue;

    if (s.isDirectory()) {
      result.push(`${relPath}/`);
      const children = await buildTree(root, fullPath, depth - 1);
      result.push(...children);
    } else {
      result.push(relPath);
    }
  }
  return result;
}
