import { readdir } from "fs/promises";
import { join } from "path";
import { readTextFile, writeTextFile } from "./fs.js";

export interface BacklogItem {
  filename: string;
  path: string;
  type: "genome-change" | "environment-change" | "task";
  status: "pending" | "consumed";
  priority: "high" | "medium" | "low";
  title: string;
  consumedBy?: string;
  createdAt?: string;
  consumedAt?: string;
}

/**
 * Scan backlog directory and parse frontmatter from .md files.
 */
export async function scanBacklog(backlogDir: string): Promise<BacklogItem[]> {
  let entries: string[];
  try {
    entries = await readdir(backlogDir);
  } catch {
    return [];
  }

  const items: BacklogItem[] = [];
  for (const entry of entries) {
    if (!entry.endsWith(".md")) continue;
    const filePath = join(backlogDir, entry);
    const content = await readTextFile(filePath);
    if (!content) continue;

    const frontmatter = parseFrontmatter(content);
    items.push({
      filename: entry,
      path: filePath,
      type: (frontmatter.type as BacklogItem["type"]) ?? "task",
      status: (frontmatter.status as BacklogItem["status"]) ?? "pending",
      priority: (frontmatter.priority as BacklogItem["priority"]) ?? "medium",
      title: extractTitle(content) ?? entry.replace(".md", ""),
      consumedBy: frontmatter.consumedBy as string | undefined,
      createdAt: frontmatter.createdAt as string | undefined,
      consumedAt: frontmatter.consumedAt as string | undefined,
    });
  }

  return items;
}

/**
 * Mark a backlog item as consumed by a generation.
 */
export async function consumeBacklog(filePath: string, genId: string): Promise<void> {
  const content = await readTextFile(filePath);
  if (!content) return;

  // Replace status in frontmatter
  const updated = content
    .replace(/status:\s*pending/, `status: consumed\nconsumedBy: ${genId}\nconsumedAt: ${new Date().toISOString()}`);
  await writeTextFile(filePath, updated);
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const result: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length > 0) {
      result[key.trim()] = valueParts.join(":").trim();
    }
  }
  return result;
}

function extractTitle(content: string): string | null {
  // Look for first # heading after frontmatter
  const withoutFm = content.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const match = withoutFm.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : null;
}

// ── Create backlog ──────────────────────────────────────────

const VALID_TYPES = ["genome-change", "environment-change", "task"] as const;

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

/**
 * Create a backlog item with standard template.
 * Returns the generated filename.
 */
export async function createBacklog(
  backlogDir: string,
  opts: CreateBacklogOptions,
): Promise<string> {
  if (!(VALID_TYPES as readonly string[]).includes(opts.type)) {
    throw new Error(`Invalid backlog type: "${opts.type}". Allowed: ${VALID_TYPES.join(", ")}`);
  }

  const priority = opts.priority ?? "medium";
  const filename = `${toKebabCase(opts.title)}.md`;
  const body = opts.body ? `\n${opts.body}\n` : "";

  const content = `---
type: ${opts.type}
status: pending
priority: ${priority}
createdAt: ${new Date().toISOString()}
---

# ${opts.title}
${body}
## Problem
<!-- Describe the current issue and why this work is needed -->

## Solution
<!-- Describe the approach, implementation direction, and key ideas -->

## Files to Change
<!-- List specific file/function/module paths that need modification -->
`;

  const { mkdir } = await import("fs/promises");
  await mkdir(backlogDir, { recursive: true });
  await writeTextFile(join(backlogDir, filename), content);

  return filename;
}
