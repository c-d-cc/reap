import { readdir } from "fs/promises";
import { join } from "path";
import YAML from "yaml";
import { readTextFile, writeTextFile } from "./fs";

export interface BacklogFile {
  filename: string;
  type: string;
  status: string;
  consumedBy?: string;
  target?: string;
  title: string;
  body: string;
}

export async function scanBacklog(backlogDir: string): Promise<BacklogFile[]> {
  let entries: string[];
  try {
    entries = await readdir(backlogDir);
  } catch {
    return [];
  }

  const items: BacklogFile[] = [];
  for (const filename of entries) {
    if (!filename.endsWith(".md")) continue;
    const content = await readTextFile(join(backlogDir, filename));
    if (!content) continue;

    const { frontmatter, body } = parseFrontmatter(content);
    const title = body.match(/^#\s+(.+)/m)?.[1] ?? filename.replace(/\.md$/, "");

    items.push({
      filename,
      type: String(frontmatter.type ?? "task"),
      status: String(frontmatter.status ?? "pending"),
      consumedBy: frontmatter.consumedBy != null ? String(frontmatter.consumedBy) : undefined,
      target: frontmatter.target != null ? String(frontmatter.target) : undefined,
      title,
      body,
    });
  }

  return items;
}

export async function markBacklogConsumed(
  backlogDir: string,
  filename: string,
  genId: string,
): Promise<void> {
  const filePath = join(backlogDir, filename);
  const content = await readTextFile(filePath);
  if (!content) return;

  const { frontmatter, body } = parseFrontmatter(content);
  frontmatter.status = "consumed";
  frontmatter.consumedBy = genId;
  delete frontmatter.consumed; // remove legacy field if present

  const newContent = `---\n${YAML.stringify(frontmatter).trim()}\n---\n${body}`;
  await writeTextFile(filePath, newContent);
}

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  try {
    return { frontmatter: YAML.parse(match[1]) ?? {}, body: match[2] };
  } catch {
    return { frontmatter: {}, body: content };
  }
}
