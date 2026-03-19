import YAML from "yaml";
import { readdir, rm } from "fs/promises";
import { join } from "path";
import type { ReapPaths } from "./paths";
import type { GenerationMeta } from "../types";
import { readTextFile, readTextFileOrThrow, writeTextFile } from "./fs";

const LINEAGE_MAX_LINES = 5_000;
const MIN_GENERATIONS_FOR_COMPRESSION = 5;
const LEVEL1_MAX_LINES = 40;
const LEVEL2_MAX_LINES = 60;
const LEVEL2_BATCH_SIZE = 5;
const RECENT_PROTECTED_COUNT = 3;

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

  // Sort by completedAt if available, fallback to genNum
  return entries.sort((a, b) => {
    if (a.completedAt && b.completedAt) {
      return a.completedAt.localeCompare(b.completedAt);
    }
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

// ── Level 2 compression ────────────────────────────────────

async function compressLevel2(
  level1Files: { name: string; path: string }[],
  epochNum: number,
): Promise<string> {
  const lines: string[] = [];
  const genIds = level1Files.map(f => f.name.replace(".md", "").match(/^gen-\d{3}(?:-[a-f0-9]{6})?/)?.[0] ?? f.name);
  const first = genIds[0];
  const last = genIds[genIds.length - 1];

  lines.push(`# Epoch ${String(epochNum).padStart(3, "0")} (${first} ~ ${last})`);
  lines.push("");

  for (const file of level1Files) {
    const content = await readTextFileOrThrow(file.path);
    // Strip frontmatter before parsing content
    const bodyContent = content.replace(/^---\n[\s\S]*?\n---\n?/, "");

    const headerMatch = bodyContent.match(/^# (gen-\d{3}(?:-[a-f0-9]{6})?)/m);
    const goalMatch = bodyContent.match(/- Goal: (.+)/);
    const periodMatch = bodyContent.match(/- (?:Started|Period): (.+)/);
    const genomeMatch = bodyContent.match(/- Genome.*: (.+)/);
    const resultMatch = bodyContent.match(/## Result: (.+)/);

    const genId = headerMatch?.[1] ?? "unknown";
    const goal = goalMatch?.[1] ?? "";
    const result = resultMatch?.[1] ?? "";

    lines.push(`## ${genId}: ${goal}`);
    if (periodMatch) lines.push(`- ${periodMatch[0].trim()}`);
    if (genomeMatch) lines.push(`- ${genomeMatch[0].trim()}`);
    if (result) lines.push(`- Result: ${result}`);

    // Include genome changes if any (most important for traceability)
    const changeSection = bodyContent.match(/## Genome Changes\n([\s\S]*?)(?=\n##|$)/);
    if (changeSection && !changeSection[1].match(/^\|\s*\|\s*\|\s*\|\s*\|$/)) {
      lines.push(`- Genome Changes: ${changeSection[1].trim().split("\n")[0]}`);
    }

    lines.push("");
  }

  // Truncate to max lines
  let result = lines.join("\n");
  const resultLines = result.split("\n");
  if (resultLines.length > LEVEL2_MAX_LINES) {
    result = resultLines.slice(0, LEVEL2_MAX_LINES - 1).join("\n") + "\n[...truncated]";
  }

  return result;
}

// ── Main compression entry point ────────────────────────────

export async function compressLineageIfNeeded(
  paths: ReapPaths,
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
    allDirs.slice(Math.max(0, allDirs.length - RECENT_PROTECTED_COUNT)).map(e => e.genId)
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

  // Level 2: if 5+ Level 1 files exist, batch into epochs
  const level1s = (await scanLineage(paths))
    .filter(e => e.type === "level1");
  // Already sorted by completedAt/genNum from scanLineage

  if (level1s.length >= LEVEL2_BATCH_SIZE) {
    const existingEpochs = (await scanLineage(paths)).filter(e => e.type === "level2");
    let epochNum = existingEpochs.length + 1;

    const batchCount = Math.floor(level1s.length / LEVEL2_BATCH_SIZE);
    for (let i = 0; i < batchCount; i++) {
      const batch = level1s.slice(i * LEVEL2_BATCH_SIZE, (i + 1) * LEVEL2_BATCH_SIZE);
      const files = batch.map(e => ({
        name: e.name,
        path: join(paths.lineage, e.name),
      }));

      const compressed = await compressLevel2(files, epochNum);
      const outPath = join(paths.lineage, `epoch-${String(epochNum).padStart(3, "0")}.md`);

      await writeTextFile(outPath, compressed);

      for (const file of files) {
        await rm(file.path);
      }

      result.level2.push(`epoch-${String(epochNum).padStart(3, "0")}`);
      epochNum++;
    }
  }

  return result;
}
