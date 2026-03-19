import { execSync } from "child_process";
import { ReapPaths } from "../../core/paths";
import { gitLsTree, gitShow } from "../../core/git";
import * as lineageUtils from "../../core/lineage";
import YAML from "yaml";
import type { GenerationMeta } from "../../types";
import { parseFrontmatter } from "../../core/compression";

interface RemoteGeneration {
  branch: string;
  id: string;
  goal: string;
}

export async function pullCommand(options: { remote?: string }): Promise<void> {
  const cwd = process.cwd();
  const paths = new ReapPaths(cwd);

  if (!(await paths.isReapProject())) {
    throw new Error("Not a REAP project. Run 'reap init' first.");
  }

  const remote = options.remote ?? "origin";

  // 1. git fetch
  console.log(`Fetching from ${remote}...`);
  try {
    execSync(`git fetch ${remote}`, { cwd, encoding: "utf-8", timeout: 30_000 });
  } catch (err: any) {
    throw new Error(`git fetch failed: ${err.message}`);
  }

  // 2. List remote branches
  let remoteBranches: string[];
  try {
    const output = execSync(`git branch -r --list "${remote}/*"`, {
      cwd, encoding: "utf-8", timeout: 10_000,
    });
    remoteBranches = output.trim().split("\n")
      .map(b => b.trim())
      .filter(b => b && !b.includes("HEAD"));
  } catch {
    remoteBranches = [];
  }

  if (remoteBranches.length === 0) {
    console.log("No remote branches found.");
    return;
  }

  // 3. Get local generation IDs
  const localMetas = await lineageUtils.listMeta(paths);
  const localIds = new Set(localMetas.map(m => m.id));

  // 4. Scan remote branches for new generations
  const newGens: RemoteGeneration[] = [];

  for (const branch of remoteBranches) {
    const entries = gitLsTree(branch, ".reap/lineage", cwd);
    const metaFiles = entries.filter(e => e.endsWith("/meta.yml"));

    for (const metaFile of metaFiles) {
      const content = gitShow(branch, metaFile, cwd);
      if (!content) continue;
      try {
        const meta = YAML.parse(content) as GenerationMeta;
        if (meta?.id && !localIds.has(meta.id)) {
          newGens.push({ branch, id: meta.id, goal: meta.goal });
        }
      } catch { /* invalid yaml */ }
    }

    // Also check compressed .md files
    const mdFiles = entries.filter(e =>
      e.match(/^\.reap\/lineage\/gen-[^/]+\.md$/)
    );
    for (const mdFile of mdFiles) {
      const content = gitShow(branch, mdFile, cwd);
      if (!content) continue;
      const meta = parseFrontmatter(content);
      if (meta && !localIds.has(meta.id)) {
        newGens.push({ branch, id: meta.id, goal: meta.goal });
      }
    }
  }

  // 5. Report
  if (newGens.length === 0) {
    console.log("✓ Up to date. No new generations found on remote branches.");
  } else {
    console.log(`\nFound ${newGens.length} new generation(s) on remote:\n`);
    for (const gen of newGens) {
      console.log(`  ${gen.branch}`);
      console.log(`    ${gen.id}: ${gen.goal}\n`);
    }
    console.log(`Use "reap merge <branch>" to merge a remote branch.`);
  }
}
