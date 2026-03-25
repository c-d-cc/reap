import { readdir, rm } from "fs/promises";
import { join } from "path";
import YAML from "yaml";
import { readTextFile, writeTextFile } from "./fs.js";

const LEVEL1_THRESHOLD = 5; // minimum generations before compression
const PROTECTED_RECENT = 3; // protect last N generations
const LEVEL2_THRESHOLD = 100; // Level 1 files needed to trigger Level 2

interface GenMeta {
  id: string;
  type: string;
  goal: string;
  parents: string[];
  genomeHash?: string;
}

/**
 * Level 1 compression: generation folders → single summary .md files.
 * Preserves DAG metadata in frontmatter.
 * Protects recent N generations.
 */
export async function compressLineage(lineageDir: string): Promise<number> {
  let entries: string[];
  try {
    entries = await readdir(lineageDir);
  } catch {
    return 0;
  }

  const genDirs = entries.filter((e) => e.startsWith("gen-")).sort();

  // Not enough to compress
  if (genDirs.length <= LEVEL1_THRESHOLD) return 0;

  // Determine which are already compressed (files, not dirs)
  const { stat } = await import("fs/promises");
  const uncompressed: string[] = [];
  for (const entry of genDirs) {
    const s = await stat(join(lineageDir, entry)).catch(() => null);
    if (s?.isDirectory()) uncompressed.push(entry);
  }

  // Protect recent N
  const toCompress = uncompressed.slice(0, -PROTECTED_RECENT);
  if (toCompress.length === 0) return 0;

  let compressed = 0;
  for (const dirName of toCompress) {
    const dirPath = join(lineageDir, dirName);

    // Read meta.yml
    const metaContent = await readTextFile(join(dirPath, "meta.yml"));
    let meta: GenMeta = { id: dirName, type: "unknown", goal: "", parents: [] };
    if (metaContent) {
      try { meta = YAML.parse(metaContent) as GenMeta; } catch { /* use default */ }
    }

    // Read completion for summary
    const completion = await readTextFile(join(dirPath, "05-completion.md")) ?? "";
    const summarySection = completion.match(/## Summary\n([\s\S]*?)(?=\n## |\n$)/)?.[1]?.trim() ?? "";

    // Build compressed file with DAG frontmatter
    const compressedContent = [
      "---",
      `id: ${meta.id}`,
      `type: ${meta.type}`,
      `goal: "${meta.goal.replace(/"/g, '\\"')}"`,
      `parents: [${meta.parents.map((p) => `"${p}"`).join(", ")}]`,
      meta.genomeHash ? `genomeHash: ${meta.genomeHash}` : "",
      "---",
      "",
      `# ${meta.id}`,
      "",
      summarySection || "(no summary)",
      "",
    ].filter(Boolean).join("\n");

    // Write compressed file
    await writeTextFile(join(lineageDir, `${dirName}.md`), compressedContent);

    // Remove original directory
    await rm(dirPath, { recursive: true, force: true });
    compressed++;
  }

  // After Level 1, try Level 2
  await compressToEpoch(lineageDir).catch(() => {});

  return compressed;
}

/**
 * Level 2 compression: when Level 1 .md files exceed threshold,
 * compress them into epoch summary files.
 * Preserves DAG metadata (generations hash chain in frontmatter).
 * Protects fork points (generations referenced as parents by others).
 */
export async function compressToEpoch(lineageDir: string): Promise<number> {
  let entries: string[];
  try {
    entries = await readdir(lineageDir);
  } catch {
    return 0;
  }

  const { stat } = await import("fs/promises");

  // Find Level 1 compressed files (gen-*.md, not directories, not epoch files)
  const level1Files: string[] = [];
  for (const entry of entries) {
    if (!entry.startsWith("gen-") || !entry.endsWith(".md")) continue;
    const s = await stat(join(lineageDir, entry)).catch(() => null);
    if (s?.isFile()) level1Files.push(entry);
  }

  if (level1Files.length < LEVEL2_THRESHOLD) return 0;

  // Collect all parent references to identify fork points
  const allParents = new Set<string>();
  const fileMetas: Array<{ filename: string; meta: GenMeta; content: string }> = [];

  for (const file of level1Files.sort()) {
    const content = await readTextFile(join(lineageDir, file));
    if (!content) continue;

    // Parse frontmatter
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    let meta: GenMeta = { id: file.replace(".md", ""), type: "unknown", goal: "", parents: [] };
    if (fmMatch) {
      try {
        const parsed = YAML.parse(fmMatch[1]) as GenMeta;
        meta = { ...meta, ...parsed };
      } catch { /* use default */ }
    }

    fileMetas.push({ filename: file, meta, content });

    if (meta.parents) {
      for (const p of meta.parents) allParents.add(p);
    }
  }

  // Protect fork points: any generation referenced as a parent by a non-compressed generation
  // (i.e., still a directory) should not be compressed into epoch
  const dirEntries = entries.filter((e) => e.startsWith("gen-") && !e.endsWith(".md"));
  const dirParents = new Set<string>();
  for (const dir of dirEntries) {
    const metaContent = await readTextFile(join(lineageDir, dir, "meta.yml"));
    if (!metaContent) continue;
    try {
      const m = YAML.parse(metaContent) as GenMeta;
      if (m.parents) m.parents.forEach((p) => dirParents.add(p));
    } catch { /* skip */ }
  }

  // Also check existing epoch files for references
  const epochFiles = entries.filter((e) => e.startsWith("epoch-") && e.endsWith(".md"));
  for (const ef of epochFiles) {
    const content = await readTextFile(join(lineageDir, ef));
    if (!content) continue;
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch) {
      try {
        const parsed = YAML.parse(fmMatch[1]) as Record<string, unknown>;
        const lastId = parsed.lastGeneration as string;
        if (lastId) dirParents.add(lastId);
      } catch { /* skip */ }
    }
  }

  // Determine which files can be compressed (exclude fork points for active generations)
  const compressible = fileMetas.filter((f) => !dirParents.has(f.meta.id));
  if (compressible.length < LEVEL2_THRESHOLD) return 0;

  // Determine epoch number
  const existingEpochs = epochFiles.length;
  const epochNum = existingEpochs + 1;
  const epochName = `epoch-${String(epochNum).padStart(3, "0")}.md`;

  // Build epoch content with DAG metadata
  const firstGen = compressible[0].meta.id;
  const lastGen = compressible[compressible.length - 1].meta.id;
  const hashChain = compressible.map((f) => f.meta.id);

  const epochContent = [
    "---",
    `epoch: ${epochNum}`,
    `firstGeneration: "${firstGen}"`,
    `lastGeneration: "${lastGen}"`,
    `generationCount: ${compressible.length}`,
    `generations: [${hashChain.map((id) => `"${id}"`).join(", ")}]`,
    "---",
    "",
    `# Epoch ${epochNum}`,
    "",
    `Compressed ${compressible.length} generations: ${firstGen} ~ ${lastGen}`,
    "",
    "## Generations",
    "",
    ...compressible.map((f) => {
      const goalStr = f.meta.goal ? `: ${f.meta.goal}` : "";
      return `- **${f.meta.id}**${goalStr}`;
    }),
    "",
  ].join("\n");

  await writeTextFile(join(lineageDir, epochName), epochContent);

  // Remove consumed Level 1 files
  for (const f of compressible) {
    await rm(join(lineageDir, f.filename), { force: true });
  }

  return compressible.length;
}
