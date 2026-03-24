import { readdir, rm } from "fs/promises";
import { join } from "path";
import yaml from "js-yaml";
import { readTextFile, writeTextFile } from "./fs.js";

const LEVEL1_THRESHOLD = 5; // minimum generations before compression
const PROTECTED_RECENT = 3; // protect last N generations

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
      try { meta = yaml.load(metaContent) as GenMeta; } catch { /* use default */ }
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

  return compressed;
}
