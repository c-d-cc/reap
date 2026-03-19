import { readdir, rm } from "fs/promises";
import { join } from "path";
import type { ReapPaths } from "./paths";
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
}

/**
 * Count total lines in lineage directory
 */
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

/**
 * Scan lineage entries and classify them
 */
async function scanLineage(paths: ReapPaths): Promise<LineageEntry[]> {
  const entries: LineageEntry[] = [];
  try {
    const items = await readdir(paths.lineage, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(paths.lineage, item.name);

      if (item.isDirectory() && item.name.startsWith("gen-")) {
        const genNum = extractGenNum(item.name);
        const lines = await countDirLines(fullPath);
        entries.push({ name: item.name, type: "dir", lines, genNum });
      } else if (item.isFile() && item.name.startsWith("gen-") && item.name.endsWith(".md")) {
        const genNum = extractGenNum(item.name);
        const lines = await countLines(fullPath);
        entries.push({ name: item.name, type: "level1", lines, genNum });
      } else if (item.isFile() && item.name.startsWith("epoch-") && item.name.endsWith(".md")) {
        const lines = await countLines(fullPath);
        entries.push({ name: item.name, type: "level2", lines, genNum: 0 });
      }
    }
  } catch { /* lineage doesn't exist */ }

  return entries.sort((a, b) => a.genNum - b.genNum);
}

/**
 * Level 1 compression: generation directory → single markdown file
 * Focus on start (objective) and end (completion), with notable middle events
 */
async function compressLevel1(genDir: string, genName: string): Promise<string> {
  const lines: string[] = [];

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
  let metadata = "";
  {
    const completion = await readTextFile(join(genDir, "05-completion.md"));
    if (completion) {
      const summaryMatch = completion.match(/## Summary\n([\s\S]*?)(?=\n##)/);
      if (summaryMatch) metadata = summaryMatch[1].trim();
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
  if (metadata) {
    lines.push(metadata.replace(/^# .+\n/, "").trim());
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

  // Truncate to max lines
  let result = lines.join("\n");
  const resultLines = result.split("\n");
  if (resultLines.length > LEVEL1_MAX_LINES) {
    result = resultLines.slice(0, LEVEL1_MAX_LINES - 1).join("\n") + "\n[...truncated]";
  }

  return result;
}

/**
 * Level 2 compression: multiple Level 1 files → single epoch file
 */
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
    // Extract header and goal line only
    const headerMatch = content.match(/^# (gen-\d{3}(?:-[a-f0-9]{6})?)/m);
    const goalMatch = content.match(/- Goal: (.+)/);
    const periodMatch = content.match(/- (?:Started|Period): (.+)/);
    const genomeMatch = content.match(/- Genome.*: (.+)/);
    const resultMatch = content.match(/## Result: (.+)/);

    const genId = headerMatch?.[1] ?? "unknown";
    const goal = goalMatch?.[1] ?? "";
    const result = resultMatch?.[1] ?? "";

    lines.push(`## ${genId}: ${goal}`);
    if (periodMatch) lines.push(`- ${periodMatch[0].trim()}`);
    if (genomeMatch) lines.push(`- ${genomeMatch[0].trim()}`);
    if (result) lines.push(`- Result: ${result}`);

    // Include genome changes if any (most important for traceability)
    const changeSection = content.match(/## Genome Changes\n([\s\S]*?)(?=\n##|$)/);
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

/**
 * Run lineage compression if needed
 * Called after generation archiving
 */
export async function compressLineageIfNeeded(
  paths: ReapPaths,
): Promise<{ level1: string[]; level2: string[] }> {
  const result = { level1: [] as string[], level2: [] as string[] };

  const entries = await scanLineage(paths);
  const totalEntries = entries.filter(e => e.type === "dir" || e.type === "level1").length;

  // Must have at least MIN_GENERATIONS before compressing
  if (totalEntries < MIN_GENERATIONS_FOR_COMPRESSION) {
    return result;
  }

  // Check total lineage size
  const totalLines = entries.reduce((sum, e) => sum + e.lines, 0);
  if (totalLines <= LINEAGE_MAX_LINES) {
    return result;
  }

  // Level 1: compress oldest uncompressed directories
  const allDirs = entries.filter(e => e.type === "dir").sort((a, b) => a.genNum - b.genNum);
  const dirs = allDirs.slice(0, Math.max(0, allDirs.length - RECENT_PROTECTED_COUNT));
  for (const dir of dirs) {
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
    .filter(e => e.type === "level1")
    .sort((a, b) => a.genNum - b.genNum);

  if (level1s.length >= LEVEL2_BATCH_SIZE) {
    // Find existing epoch count
    const existingEpochs = (await scanLineage(paths)).filter(e => e.type === "level2");
    let epochNum = existingEpochs.length + 1;

    // Batch level 1 files in groups of LEVEL2_BATCH_SIZE
    // Keep the last batch un-epoched if it's incomplete
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

      // Remove original Level 1 files
      for (const file of files) {
        await rm(file.path);
      }

      result.level2.push(`epoch-${String(epochNum).padStart(3, "0")}`);
      epochNum++;
    }
  }

  return result;
}
