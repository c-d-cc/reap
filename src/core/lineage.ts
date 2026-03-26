import { readdir } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";
import YAML from "yaml";
import { readTextFile } from "./fs.js";

export interface LineageMeta {
  id: string;
  type: string;
  goal: string;
  parents: string[];
  dirName: string;
}

export interface GenomeDiff {
  conflicts: GenomeConflict[];
  aOnly: string[];
  bOnly: string[];
}

export interface GenomeConflict {
  file: string;
  parentA: string;
  parentB: string;
  ancestor: string;
}

// ── Git utilities ──────────────────────────────────────────

export function gitShow(cwd: string, ref: string, path: string): string | null {
  try {
    return execSync(`git show ${ref}:${path}`, { cwd, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] });
  } catch {
    return null;
  }
}

export function gitMergeBase(cwd: string, refA: string, refB: string): string | null {
  try {
    return execSync(`git merge-base ${refA} ${refB}`, { cwd, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim();
  } catch {
    return null;
  }
}

// ── Git-based genome diff ──────────────────────────────────

export function findCommonAncestor(cwd: string, refA: string, refB: string): string | null {
  return gitMergeBase(cwd, refA, refB);
}

export function extractGenomeDiff(
  cwd: string,
  refA: string,
  refB: string,
  ancestorRef: string | null,
): GenomeDiff {
  const genomeFiles = ["application.md", "evolution.md", "invariants.md"];
  const conflicts: GenomeConflict[] = [];
  const aOnly: string[] = [];
  const bOnly: string[] = [];

  for (const file of genomeFiles) {
    const genomePath = `.reap/genome/${file}`;
    const contentA = gitShow(cwd, refA, genomePath);
    const contentB = gitShow(cwd, refB, genomePath);
    const contentAnc = ancestorRef ? gitShow(cwd, ancestorRef, genomePath) : null;

    if (contentA === contentB) continue;

    if (contentA && !contentB) {
      aOnly.push(file);
    } else if (!contentA && contentB) {
      bOnly.push(file);
    } else if (contentA !== contentAnc && contentB !== contentAnc) {
      conflicts.push({
        file,
        parentA: contentA ?? "",
        parentB: contentB ?? "",
        ancestor: contentAnc ?? "",
      });
    } else if (contentA !== contentAnc) {
      aOnly.push(file);
    } else {
      bOnly.push(file);
    }
  }

  return { conflicts, aOnly, bOnly };
}

// ── Lineage meta utilities (still useful for context) ──────

export async function readLineageMetas(lineagePath: string): Promise<LineageMeta[]> {
  let entries: string[];
  try {
    entries = await readdir(lineagePath);
  } catch {
    return [];
  }

  const genDirs = entries.filter((e) => e.startsWith("gen-")).sort();
  const metas: LineageMeta[] = [];

  for (const dir of genDirs) {
    const metaContent = await readTextFile(join(lineagePath, dir, "meta.yml"));
    if (!metaContent) continue;

    const meta = YAML.parse(metaContent) as Record<string, unknown>;
    metas.push({
      id: (meta.id as string) ?? dir,
      type: (meta.type as string) ?? "normal",
      goal: (meta.goal as string) ?? "",
      parents: (meta.parents as string[]) ?? [],
      dirName: dir,
    });
  }

  return metas;
}

export function findLineageDir(metas: LineageMeta[], genId: string): string | null {
  const meta = metas.find((m) => m.id === genId);
  return meta?.dirName ?? null;
}

