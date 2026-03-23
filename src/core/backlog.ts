import { readdir, mkdir } from "fs/promises";
import { join } from "path";
import YAML from "yaml";
import { readTextFile, writeTextFile } from "./fs";

export const VALID_BACKLOG_TYPES = ["genome-change", "environment-change", "task"] as const;
export type BacklogType = (typeof VALID_BACKLOG_TYPES)[number];

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
    const title =
      body.match(/^#\s+(.+)/m)?.[1] ??
      (frontmatter.title != null ? String(frontmatter.title) : filename.replace(/\.md$/, ""));

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

export async function revertBacklogConsumed(backlogDir: string, genId: string): Promise<void> {
  let entries: string[];
  try {
    entries = await readdir(backlogDir);
  } catch {
    return;
  }

  for (const filename of entries) {
    if (!filename.endsWith(".md")) continue;
    const filePath = join(backlogDir, filename);
    const content = await readTextFile(filePath);
    if (!content) continue;

    const { frontmatter, body } = parseFrontmatter(content);
    if (frontmatter.status === "consumed" && frontmatter.consumedBy === genId) {
      frontmatter.status = "pending";
      delete frontmatter.consumedBy;

      const newContent = `---\n${YAML.stringify(frontmatter).trim()}\n---\n${body}`;
      await writeTextFile(filePath, newContent);
    }
  }
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

export function toKebabCase(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface CreateBacklogOptions {
  type: string;
  title: string;
  body?: string;
  priority?: string;
}

export async function createBacklog(
  backlogDir: string,
  opts: CreateBacklogOptions,
): Promise<string> {
  if (!(VALID_BACKLOG_TYPES as readonly string[]).includes(opts.type)) {
    throw new Error(
      `Invalid backlog type: "${opts.type}". Allowed: ${VALID_BACKLOG_TYPES.join(", ")}`,
    );
  }

  const priority = opts.priority ?? "medium";
  const filename = `${toKebabCase(opts.title)}.md`;
  const frontmatter: Record<string, string> = {
    type: opts.type,
    status: "pending",
    priority,
  };

  const bodyContent = opts.body ? `\n# ${opts.title}\n\n${opts.body}\n` : `\n# ${opts.title}\n`;
  const content = `---\n${YAML.stringify(frontmatter).trim()}\n---\n${bodyContent}`;

  await mkdir(backlogDir, { recursive: true });
  await writeTextFile(join(backlogDir, filename), content);

  return filename;
}
