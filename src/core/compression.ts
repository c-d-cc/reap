import YAML from "yaml";
import { readdir, rm } from "fs/promises";
import { join } from "path";
import type { ReapPaths } from "./paths";
import type { GenerationMeta } from "../types";
import { readTextFile, readTextFileOrThrow, writeTextFile, fileExists } from "./fs";
import { gitAllBranches, gitLsTree, gitShow, gitCurrentBranch } from "./git";

const LINEAGE_MAX_LINES = 5_000;
const MIN_GENERATIONS_FOR_COMPRESSION = 5;
const LEVEL1_MAX_LINES = 40;
const LEVEL1_PROTECTED_COUNT = 3;
const LEVEL2_MIN_LEVEL1_COUNT = 100;
const LEVEL2_PROTECTED_COUNT = 9;

/** Safe completedAt to timestamp — returns 0 for NaN/invalid dates */
function safeCompletedAtTime(dateStr: string): number {
  const t = new Date(dateStr).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Extract generation number from directory/file name (supports both gen-NNN and gen-NNN-hash formats) */
function extractGenNum(name: string): number {
  const match = name.match(/^gen-(\d{3})/);
  return match ? parseInt(match[1], 10) : 0;
}

interface LineageEntry {
  name: string;
  type: "dir" | "level1" | "level2";
  lines: number;
  genNum: number;
  completedAt: string;  // ISO date or "" if unknown
  genId: string;        // gen-NNN or gen-NNN-hash
}

// ── Frontmatter utilities ───────────────────────────────────

/** Parse YAML frontmatter from a markdown string. Returns null if no frontmatter. */
export function parseFrontmatter(content: string): GenerationMeta | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  try {
    return YAML.parse(match[1]) as GenerationMeta;
  } catch {
    return null;
  }
}

/** Build YAML frontmatter string from GenerationMeta */
function buildFrontmatter(meta: GenerationMeta): string {
  return `---\n${YAML.stringify(meta).trim()}\n---\n`;
}

// ── Line counting ───────────────────────────────────────────

async function countLines(filePath: string): Promise<number> {
  const content = await readTextFile(filePath);
  if (content === null) return 0;
  return content.split("\n").length;
}

async function countDirLines(dirPath: string): Promise<number> {
  let total = 0;
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      if (entry.isFile() && entry.name.endsWith(".md")) {
        total += await countLines(fullPath);
      } else if (entry.isDirectory()) {
        total += await countDirLines(fullPath);
      }
    }
  } catch { /* dir doesn't exist */ }
  return total;
}

// ── Scanning ────────────────────────────────────────────────

/** Read meta from a lineage directory's meta.yml */
async function readDirMeta(dirPath: string): Promise<GenerationMeta | null> {
  const content = await readTextFile(join(dirPath, "meta.yml"));
  if (content === null) return null;
  try { return YAML.parse(content) as GenerationMeta; } catch { return null; }
}

/** Read meta from a compressed .md file's frontmatter */
async function readFileMeta(filePath: string): Promise<GenerationMeta | null> {
  const content = await readTextFile(filePath);
  if (content === null) return null;
  return parseFrontmatter(content);
}

async function scanLineage(paths: ReapPaths): Promise<LineageEntry[]> {
  const entries: LineageEntry[] = [];
  try {
    const items = await readdir(paths.lineage, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(paths.lineage, item.name);

      if (item.isDirectory() && item.name.startsWith("gen-")) {
        const genNum = extractGenNum(item.name);
        const lines = await countDirLines(fullPath);
        const meta = await readDirMeta(fullPath);
        const genId = meta?.id ?? item.name.match(/^gen-\d{3}(?:-[a-f0-9]{6})?/)?.[0] ?? item.name;
        entries.push({
          name: item.name, type: "dir", lines, genNum,
          completedAt: meta?.completedAt ?? "",
          genId,
        });
      } else if (item.isFile() && item.name.startsWith("gen-") && item.name.endsWith(".md")) {
        const genNum = extractGenNum(item.name);
        const lines = await countLines(fullPath);
        const meta = await readFileMeta(fullPath);
        const genId = meta?.id ?? item.name.replace(".md", "").match(/^gen-\d{3}(?:-[a-f0-9]{6})?/)?.[0] ?? item.name;
        entries.push({
          name: item.name, type: "level1", lines, genNum,
          completedAt: meta?.completedAt ?? "",
          genId,
        });
      } else if (item.isFile() && item.name.startsWith("epoch-") && item.name.endsWith(".md")) {
        const lines = await countLines(fullPath);
        entries.push({
          name: item.name, type: "level2", lines, genNum: 0,
          completedAt: "", genId: "",
        });
      }
    }
  } catch { /* lineage doesn't exist */ }

  // Sort by completedAt, then by genNum as tiebreaker
  return entries.sort((a, b) => {
    const aTime = safeCompletedAtTime(a.completedAt);
    const bTime = safeCompletedAtTime(b.completedAt);
    if (aTime !== bTime) return aTime - bTime;
    return a.genNum - b.genNum;
  });
}

// ── DAG-aware protection ────────────────────────────────────

/** Find generation IDs that are NOT referenced as parents by any other generation (leaf nodes) */
async function findLeafNodes(paths: ReapPaths, entries: LineageEntry[]): Promise<Set<string>> {
  const allIds = new Set<string>();
  const referencedAsParent = new Set<string>();

  for (const entry of entries) {
    if (entry.type === "level2") continue;

    let meta: GenerationMeta | null = null;
    const fullPath = join(paths.lineage, entry.name);
    if (entry.type === "dir") {
      meta = await readDirMeta(fullPath);
    } else {
      meta = await readFileMeta(fullPath);
    }

    if (meta) {
      allIds.add(meta.id);
      for (const parent of meta.parents) {
        referencedAsParent.add(parent);
      }
    } else {
      allIds.add(entry.genId);
    }
  }

  const leaves = new Set<string>();
  for (const id of allIds) {
    if (!referencedAsParent.has(id)) {
      leaves.add(id);
    }
  }
  return leaves;
}

// ── Level 1 compression ────────────────────────────────────

async function compressLevel1(genDir: string, genName: string): Promise<string> {
  const lines: string[] = [];

  // Read meta.yml for DAG frontmatter
  const meta = await readDirMeta(genDir);
  if (meta) {
    lines.push(buildFrontmatter(meta));
  }

  // Read objective (start)
  let goal = "", completionConditions = "";
  {
    const objective = await readTextFile(join(genDir, "01-objective.md"));
    if (objective) {
      const goalMatch = objective.match(/## Goal\n([\s\S]*?)(?=\n##)/);
      if (goalMatch) goal = goalMatch[1].trim();
      const condMatch = objective.match(/## Completion Criteria\n([\s\S]*?)(?=\n##)/);
      if (condMatch) completionConditions = condMatch[1].trim();
    }
  }

  // Read completion (end)
  let lessons = "", genomeChanges = "", nextBacklog = "";
  {
    const completion = await readTextFile(join(genDir, "05-completion.md"));
    if (completion) {
      const lessonsMatch = completion.match(/### Lessons Learned\n([\s\S]*?)(?=\n###)/);
      if (lessonsMatch) lessons = lessonsMatch[1].trim();
      const changeMatch = completion.match(/### Genome-Change Backlog Applied\n([\s\S]*?)(?=\n###)/);
      if (changeMatch) genomeChanges = changeMatch[1].trim();
      const backlogMatch = completion.match(/### Next Generation Backlog\n([\s\S]*?)(?=\n---|\n##|$)/);
      if (backlogMatch) nextBacklog = backlogMatch[1].trim();
    }
  }

  // Read Summary section from 05-completion.md for metadata
  let summaryText = "";
  {
    const completion = await readTextFile(join(genDir, "05-completion.md"));
    if (completion) {
      const summaryMatch = completion.match(/## Summary\n([\s\S]*?)(?=\n##)/);
      if (summaryMatch) summaryText = summaryMatch[1].trim();
    }
  }

  // Read validation result
  let validationResult = "";
  {
    const validation = await readTextFile(join(genDir, "04-validation.md"));
    if (validation) {
      const resultMatch = validation.match(/## Result: (.+)/);
      if (resultMatch) validationResult = resultMatch[1].trim();
    }
  }

  // Read implementation for notable regressions/deferred
  let deferred = "";
  {
    const impl = await readTextFile(join(genDir, "03-implementation.md"));
    if (impl) {
      const deferredMatch = impl.match(/## Deferred Tasks\n([\s\S]*?)(?=\n##)/);
      if (deferredMatch) {
        const content = deferredMatch[1].trim();
        if (content && !content.match(/^\|\s*\|\s*\|\s*\|\s*\|$/)) {
          deferred = content;
        }
      }
    }
  }

  // Build compressed content
  const genId = genName.match(/^gen-\d{3}(?:-[a-f0-9]{6})?/)?.[0] ?? genName;

  lines.push(`# ${genId}`);
  if (summaryText) {
    lines.push(summaryText.replace(/^# .+\n/, "").trim());
  }
  lines.push("");

  if (goal) {
    lines.push(`## Objective`);
    lines.push(goal);
    lines.push("");
  }

  if (completionConditions) {
    lines.push(`## Completion Conditions`);
    lines.push(completionConditions);
    lines.push("");
  }

  if (validationResult) {
    lines.push(`## Result: ${validationResult}`);
    lines.push("");
  }

  if (lessons) {
    lines.push(`## Lessons`);
    lines.push(lessons);
    lines.push("");
  }

  if (genomeChanges && !genomeChanges.match(/^\|\s*\|\s*\|\s*\|\s*\|$/)) {
    lines.push(`## Genome Changes`);
    lines.push(genomeChanges);
    lines.push("");
  }

  if (deferred) {
    lines.push(`## Deferred`);
    lines.push(deferred);
    lines.push("");
  }

  if (nextBacklog) {
    lines.push(`## Next Backlog`);
    lines.push(nextBacklog);
    lines.push("");
  }

  // Truncate to max lines (frontmatter doesn't count toward limit)
  let result = lines.join("\n");
  const resultLines = result.split("\n");
  if (resultLines.length > LEVEL1_MAX_LINES) {
    result = resultLines.slice(0, LEVEL1_MAX_LINES - 1).join("\n") + "\n[...truncated]";
  }

  return result;
}

// ── Fork detection ────────────────────────────────────────

interface EpochMeta {
  generations: Array<{ id: string; parents: string[]; genomeHash: string }>;
}

/** Find generation IDs that are forked by other branches (local + remote) */
async function findForkedByOtherBranches(
  paths: ReapPaths,
  cwd: string,
): Promise<Set<string>> {
  const forked = new Set<string>();
  const currentBranch = gitCurrentBranch(cwd);
  const branches = gitAllBranches(cwd).filter(b => b !== currentBranch && b !== "HEAD");

  for (const branch of branches) {
    const files = gitLsTree(branch, ".reap/lineage/", cwd);
    for (const file of files) {
      if (!file.endsWith("meta.yml")) continue;
      const content = gitShow(branch, file, cwd);
      if (!content) continue;
      try {
        const meta = YAML.parse(content) as GenerationMeta;
        for (const parent of meta.parents) {
          forked.add(parent);
        }
      } catch { /* skip invalid */ }
    }
  }

  return forked;
}

/** Check if a generation ID is inside epoch.md */
export async function isInEpoch(paths: ReapPaths, genId: string): Promise<boolean> {
  const epochPath = join(paths.lineage, "epoch.md");
  const content = await readTextFile(epochPath);
  if (!content) return false;
  const meta = parseFrontmatter(content) as unknown as EpochMeta | null;
  if (!meta?.generations) return false;
  return meta.generations.some(g => g.id === genId);
}

// ── Level 2 compression (single epoch.md) ────────────────

async function compressLevel2Single(
  level1Files: { name: string; path: string; meta: GenerationMeta | null }[],
  paths: ReapPaths,
): Promise<string[]> {
  const compressed: string[] = [];
  const epochPath = join(paths.lineage, "epoch.md");

  // Load existing epoch.md if present
  let existingMeta: EpochMeta = { generations: [] };
  let existingBody = "";
  const existingContent = await readTextFile(epochPath);
  if (existingContent) {
    const parsed = parseFrontmatter(existingContent) as unknown as EpochMeta | null;
    if (parsed?.generations) existingMeta = parsed;
    existingBody = existingContent.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();
  }

  // Append new generations
  const newBodyLines: string[] = [];
  for (const file of level1Files) {
    const content = await readTextFileOrThrow(file.path);
    const meta = file.meta;
    const bodyContent = content.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();

    // Add to chain
    if (meta) {
      existingMeta.generations.push({
        id: meta.id,
        parents: meta.parents,
        genomeHash: meta.genomeHash,
      });
    }

    // Extract summary for body
    const headerMatch = bodyContent.match(/^# (gen-\d{3}(?:-[a-f0-9]{6})?)/m);
    const genId = headerMatch?.[1] ?? meta?.id ?? "unknown";
    const goalMatch = bodyContent.match(/## Objective\n([\s\S]*?)(?=\n##|$)/);
    const goal = goalMatch?.[1]?.trim().split("\n")[0] ?? "";

    newBodyLines.push(`## ${genId}: ${goal}`);
    newBodyLines.push("");

    compressed.push(genId);
  }

  // Build epoch.md
  const frontmatter = `---\n${YAML.stringify(existingMeta).trim()}\n---\n`;
  const allIds = existingMeta.generations.map(g => g.id);
  const first = allIds[0] ?? "?";
  const last = allIds[allIds.length - 1] ?? "?";
  const header = `# Epoch (${first} ~ ${last})\n\n`;
  const body = existingBody
    ? existingBody + "\n\n" + newBodyLines.join("\n")
    : newBodyLines.join("\n");

  await writeTextFile(epochPath, frontmatter + header + body.trim() + "\n");

  // Remove compressed Level 1 files
  for (const file of level1Files) {
    await rm(file.path);
  }

  return compressed;
}

// ── Main compression entry point ────────────────────────────

export async function compressLineageIfNeeded(
  paths: ReapPaths,
  projectRoot?: string,
): Promise<{ level1: string[]; level2: string[] }> {
  const result = { level1: [] as string[], level2: [] as string[] };

  const entries = await scanLineage(paths);
  const totalEntries = entries.filter(e => e.type === "dir" || e.type === "level1").length;

  if (totalEntries < MIN_GENERATIONS_FOR_COMPRESSION) {
    return result;
  }

  const totalLines = entries.reduce((sum, e) => sum + e.lines, 0);
  if (totalLines <= LINEAGE_MAX_LINES) {
    return result;
  }

  // Find leaf nodes — these must be protected regardless of age
  const leafNodes = await findLeafNodes(paths, entries);

  // Level 1: compress oldest uncompressed directories
  // Protected: recent N entries by completedAt + all leaf nodes
  const allDirs = entries.filter(e => e.type === "dir");
  // Already sorted by completedAt/genNum from scanLineage
  const recentIds = new Set(
    allDirs.slice(Math.max(0, allDirs.length - LEVEL1_PROTECTED_COUNT)).map(e => e.genId)
  );

  const compressibleDirs = allDirs.filter(dir =>
    !recentIds.has(dir.genId) && !leafNodes.has(dir.genId)
  );

  for (const dir of compressibleDirs) {
    const currentTotal = await countDirLines(paths.lineage);
    if (currentTotal <= LINEAGE_MAX_LINES) break;

    const dirPath = join(paths.lineage, dir.name);
    const compressed = await compressLevel1(dirPath, dir.name);
    const genId = dir.name.match(/^gen-\d{3}(?:-[a-f0-9]{6})?/)?.[0] ?? dir.name;
    const outPath = join(paths.lineage, `${genId}.md`);

    await writeTextFile(outPath, compressed);
    await rm(dirPath, { recursive: true });
    result.level1.push(genId);
  }

  // Level 2: if 100+ Level 1 files exist, compress to single epoch.md
  const level1s = (await scanLineage(paths))
    .filter(e => e.type === "level1");

  if (level1s.length > LEVEL2_MIN_LEVEL1_COUNT) {
    // Find fork points from other branches
    const forkedIds = projectRoot
      ? await findForkedByOtherBranches(paths, projectRoot)
      : new Set<string>();

    // Find the earliest fork point index — everything from that point onward is protected
    let forkCutoff = level1s.length;
    for (let i = 0; i < level1s.length; i++) {
      if (forkedIds.has(level1s[i].genId)) {
        forkCutoff = i;
        break;
      }
    }

    // Protect recent 9 Level 1 files
    const protectedStart = Math.max(0, level1s.length - LEVEL2_PROTECTED_COUNT);

    // Compressible: before fork cutoff AND before protected zone
    const compressEnd = Math.min(forkCutoff, protectedStart);
    const compressible = level1s.slice(0, compressEnd);

    if (compressible.length > 0) {
      // Read meta for each Level 1 file
      const filesWithMeta = await Promise.all(
        compressible.map(async (e) => ({
          name: e.name,
          path: join(paths.lineage, e.name),
          meta: await readFileMeta(join(paths.lineage, e.name)),
        }))
      );

      const compressed = await compressLevel2Single(filesWithMeta, paths);
      result.level2.push(...compressed);
    }
  }

  return result;
}
