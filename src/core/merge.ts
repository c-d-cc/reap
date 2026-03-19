import { readdir } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";
import { readTextFile } from "./fs";
import { gitShow, gitLsTree } from "./git";

// ── Types ───────────────────────────────────────────────────

export type ConflictType = "WRITE-WRITE" | "CROSS-FILE";

export interface GenomeDiff {
  file: string;
  added: boolean;
  removed: boolean;
  modified: boolean;
  content?: string;
}

export interface GenomeConflict {
  file: string;
  type: ConflictType;
  diffA: GenomeDiff;
  diffB: GenomeDiff;
}

export interface DivergenceReport {
  commonAncestor: string | null;
  parentA: string;
  parentB: string;
  genomeDiffsA: GenomeDiff[];
  genomeDiffsB: GenomeDiff[];
  conflicts: GenomeConflict[];
}

// ── Genome Diff ─────────────────────────────────────────────

/** Read all files in a genome directory into a map */
async function readGenomeFiles(genomePath: string): Promise<Map<string, string>> {
  const files = new Map<string, string>();
  try {
    const entries = await readdir(genomePath, { recursive: true, withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const parentPath = (entry as any).parentPath ?? (entry as any).path ?? "";
      const fullPath = join(parentPath, entry.name);
      const relativePath = fullPath.replace(genomePath, "").replace(/^\//, "");
      const content = await readTextFile(fullPath);
      if (content !== null) files.set(relativePath, content);
    }
  } catch { /* dir may not exist */ }
  return files;
}

/** Read all genome files from a git ref into a map */
export function readGenomeFilesFromRef(
  ref: string,
  genomePath: string,
  cwd: string,
): Map<string, string> {
  const files = new Map<string, string>();
  const entries = gitLsTree(ref, genomePath, cwd);
  for (const entry of entries) {
    const relativePath = entry.replace(genomePath + "/", "");
    const content = gitShow(ref, entry, cwd);
    if (content !== null) files.set(relativePath, content);
  }
  return files;
}

/** Extract genome diffs between ancestor and descendant using git refs */
export function extractGenomeDiffFromRefs(
  ancestorRef: string,
  currentRef: string,
  genomePath: string,
  cwd: string,
): GenomeDiff[] {
  const ancestorFiles = readGenomeFilesFromRef(ancestorRef, genomePath, cwd);
  const currentFiles = readGenomeFilesFromRef(currentRef, genomePath, cwd);
  return diffGenomeMaps(ancestorFiles, currentFiles);
}

/** Generate a full divergence report using git refs */
export function detectDivergenceFromRefs(
  ancestorRef: string,
  refA: string,
  refB: string,
  genomePath: string,
  cwd: string,
  commonAncestor: string | null,
  parentA: string,
  parentB: string,
): DivergenceReport {
  const genomeDiffsA = extractGenomeDiffFromRefs(ancestorRef, refA, genomePath, cwd);
  const genomeDiffsB = extractGenomeDiffFromRefs(ancestorRef, refB, genomePath, cwd);
  const conflicts = classifyConflicts(genomeDiffsA, genomeDiffsB);
  return { commonAncestor, parentA, parentB, genomeDiffsA, genomeDiffsB, conflicts };
}

/** Diff two genome file maps (shared logic for filesystem and git ref) */
function diffGenomeMaps(
  ancestorFiles: Map<string, string>,
  currentFiles: Map<string, string>,
): GenomeDiff[] {
  const diffs: GenomeDiff[] = [];
  for (const [file, ancestorContent] of ancestorFiles) {
    const currentContent = currentFiles.get(file);
    if (currentContent === undefined) {
      diffs.push({ file, added: false, removed: true, modified: false });
    } else if (currentContent !== ancestorContent) {
      diffs.push({ file, added: false, removed: false, modified: true, content: currentContent });
    }
  }
  for (const file of currentFiles.keys()) {
    if (!ancestorFiles.has(file)) {
      diffs.push({ file, added: true, removed: false, modified: false, content: currentFiles.get(file) });
    }
  }
  return diffs;
}

/** Extract genome diffs between ancestor and descendant (filesystem) */
export async function extractGenomeDiff(
  ancestorGenomePath: string,
  currentGenomePath: string,
): Promise<GenomeDiff[]> {
  const ancestorFiles = await readGenomeFiles(ancestorGenomePath);
  const currentFiles = await readGenomeFiles(currentGenomePath);
  return diffGenomeMaps(ancestorFiles, currentFiles);
}

/** Classify conflicts between two sets of diffs */
export function classifyConflicts(
  diffsA: GenomeDiff[],
  diffsB: GenomeDiff[],
): GenomeConflict[] {
  const conflicts: GenomeConflict[] = [];
  const bMap = new Map<string, GenomeDiff>();
  for (const d of diffsB) bMap.set(d.file, d);

  for (const diffA of diffsA) {
    const diffB = bMap.get(diffA.file);
    if (diffB) {
      // Same file changed by both → WRITE-WRITE
      conflicts.push({ file: diffA.file, type: "WRITE-WRITE", diffA, diffB });
    }
  }

  // CROSS-FILE: both sides changed genome, but different files
  // Only flag if both sides have changes and no WRITE-WRITE overlap
  if (diffsA.length > 0 && diffsB.length > 0 && conflicts.length === 0) {
    // Mark all pairs as CROSS-FILE for review
    for (const diffA of diffsA) {
      for (const diffB of diffsB) {
        conflicts.push({ file: `${diffA.file} ↔ ${diffB.file}`, type: "CROSS-FILE", diffA, diffB });
      }
    }
  }

  return conflicts;
}

/** Generate a full divergence report */
export async function detectDivergence(
  ancestorGenomePath: string,
  parentAGenomePath: string,
  parentBGenomePath: string,
  commonAncestor: string | null,
  parentA: string,
  parentB: string,
): Promise<DivergenceReport> {
  const genomeDiffsA = await extractGenomeDiff(ancestorGenomePath, parentAGenomePath);
  const genomeDiffsB = await extractGenomeDiff(ancestorGenomePath, parentBGenomePath);
  const conflicts = classifyConflicts(genomeDiffsA, genomeDiffsB);

  return {
    commonAncestor,
    parentA,
    parentB,
    genomeDiffsA,
    genomeDiffsB,
    conflicts,
  };
}

// ── Sync Test ───────────────────────────────────────────────

export interface SyncTestResult {
  command: string;
  success: boolean;
  output: string;
}

/** Run validation commands from constraints.md */
export async function runSyncTest(projectRoot: string, constraintsPath: string): Promise<SyncTestResult[]> {
  const content = await readTextFile(constraintsPath);
  if (!content) return [];

  // Parse validation commands table from constraints.md
  const commands = parseValidationCommands(content);
  const results: SyncTestResult[] = [];

  for (const cmd of commands) {
    try {
      const output = execSync(cmd, { cwd: projectRoot, encoding: "utf-8", timeout: 120_000 });
      results.push({ command: cmd, success: true, output: output.slice(0, 2000) });
    } catch (err: any) {
      results.push({
        command: cmd,
        success: false,
        output: (err.stderr ?? err.stdout ?? err.message ?? "").slice(0, 2000),
      });
    }
  }

  return results;
}

/** Extract validation commands from constraints.md content */
export function parseValidationCommands(content: string): string[] {
  const commands: string[] = [];
  const lines = content.split("\n");
  let inTable = false;

  for (const line of lines) {
    if (line.includes("Validation Commands") || line.includes("검증 명령어")) {
      inTable = true;
      continue;
    }
    if (inTable) {
      // Table row: | 용도 | 명령어 | 설명 |
      const match = line.match(/^\|\s*[^|]+\s*\|\s*`([^`]+)`\s*\|/);
      if (match) {
        commands.push(match[1]);
      }
      // End of table
      if (inTable && line.trim() === "") break;
      if (inTable && line.startsWith("#")) break;
    }
  }

  return commands;
}
