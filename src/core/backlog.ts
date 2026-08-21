import { readdir } from "fs/promises";
import { join } from "path";
import YAML from "yaml";
import { readTextFile, writeTextFile } from "./fs.js";

export interface BacklogItem {
  filename: string;
  path: string;
  /** REAP-assigned id (`bklog-a3f8c2`), or "" for a file written before ids. */
  id: string;
  /**
   * The id of **the one thing that most directly caused this item**, or "".
   *
   * Not a list of everything related. Usually a generation — the one that ran
   * into the problem — but it may be any kind: a design document whose
   * conclusion produced the work, a goal, a milestone, a backlog that split.
   * Surrounding context is not a cause; naming several makes the field mean
   * "related to", and then it answers nothing.
   */
  from: string;
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
      id: (frontmatter.id as string) ?? "",
      from: parseSingleId(frontmatter.from),
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

export interface ConsumeBacklogResult {
  /**
   * - "ok" — frontmatter was updated to mark this generation as the consumer.
   * - "already" — same generation already marked; no write performed.
   * - "warning" — could not mark (file empty / no frontmatter). Caller should surface `warning`.
   */
  status: "ok" | "already" | "warning";
  warning?: string;
}

/**
 * Mark a backlog item as consumed by a generation.
 *
 * Robust against frontmatter variations (gen-065 fix):
 * - `status: pending` present → replaced in-place
 * - `status:` absent → field appended to frontmatter (no silent fail)
 * - `status: consumed` already, same gen → idempotent ("already")
 * - `status: consumed` different gen → consumedBy/consumedAt overwritten
 * - no frontmatter at all → returns "warning" (visible result, not silent fail)
 *
 * Uses YAML parser for analysis but line-level write to preserve the user's
 * frontmatter formatting (comments, key order, quoting). YAML.stringify would
 * round-trip-lose those.
 */
export async function consumeBacklog(filePath: string, genId: string): Promise<ConsumeBacklogResult> {
  const content = await readTextFile(filePath);
  if (!content) {
    return { status: "warning", warning: `${filePath}: file empty or unreadable — backlog not marked` };
  }

  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!fmMatch) {
    return { status: "warning", warning: `${filePath}: frontmatter not found — backlog not marked (use 'reap make backlog' to create well-formed items)` };
  }

  const fmRaw = fmMatch[1];

  // Parse with YAML for semantic analysis (idempotency check).
  let parsed: Record<string, unknown> = {};
  try {
    parsed = (YAML.parse(fmRaw) ?? {}) as Record<string, unknown>;
  } catch {
    // Malformed YAML — fall through to line-level fix attempt; warn on it.
    return { status: "warning", warning: `${filePath}: malformed YAML frontmatter — backlog not marked` };
  }

  // Idempotency: same gen already marked → no-op.
  if (parsed.status === "consumed" && parsed.consumedBy === genId) {
    return { status: "already" };
  }

  const now = new Date().toISOString();

  // Line-level manipulation to preserve formatting.
  const lines = fmRaw.split(/\r?\n/);
  let hasStatus = false;
  let hasConsumedBy = false;
  let hasConsumedAt = false;
  const newLines = lines.map((line) => {
    if (/^status\s*:/.test(line)) {
      hasStatus = true;
      return `status: consumed`;
    }
    if (/^consumedBy\s*:/.test(line)) {
      hasConsumedBy = true;
      return `consumedBy: ${genId}`;
    }
    if (/^consumedAt\s*:/.test(line)) {
      hasConsumedAt = true;
      return `consumedAt: ${now}`;
    }
    return line;
  });

  if (!hasStatus) newLines.push(`status: consumed`);
  if (!hasConsumedBy) newLines.push(`consumedBy: ${genId}`);
  if (!hasConsumedAt) newLines.push(`consumedAt: ${now}`);

  // Trim trailing blank lines we may have introduced from split, but preserve
  // any intentional structure within.
  while (newLines.length > 0 && newLines[newLines.length - 1] === "") {
    newLines.pop();
  }

  const newFm = newLines.join("\n");
  // Reconstruct: replace exact match span with new frontmatter block.
  const updated = content.replace(fmMatch[0], `---\n${newFm}\n---\n`);
  await writeTextFile(filePath, updated);
  return { status: "ok" };
}

/**
 * `from: gen-098-99c09a` → the id.
 *
 * Brackets and quotes are tolerated on the way in — a file written by hand, or
 * by the earlier list form, still reads — but only the first entry is kept.
 * The field names one cause.
 */
function parseSingleId(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/^\[|\]$/g, "")
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/g, "");
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

/**
 * Revert backlog items consumed by a generation back to pending.
 * Scans backlog dir, finds items where consumedBy === genId,
 * removes consumedBy/consumedAt and sets status back to pending.
 * Returns count of reverted items.
 */
export async function revertBacklogConsumed(backlogDir: string, genId: string): Promise<number> {
  const items = await scanBacklog(backlogDir);
  let reverted = 0;

  for (const item of items) {
    if (item.status !== "consumed" || item.consumedBy !== genId) continue;

    const content = await readTextFile(item.path);
    if (!content) continue;

    const updated = content
      .replace(/status:\s*consumed/, "status: pending")
      .replace(/\nconsumedBy:.*/, "")
      .replace(/\nconsumedAt:.*/, "");

    await writeTextFile(item.path, updated);
    reverted++;
  }

  return reverted;
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
  /** REAP-assigned id. Absent for callers that predate the registry. */
  id?: string;
  /** Id of the one thing that most directly caused this item. */
  from?: string;
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
${opts.id ? `id: ${opts.id}\n` : ""}type: ${opts.type}
status: pending
priority: ${priority}
createdAt: ${new Date().toISOString()}
${opts.from ? `from: ${opts.from}\n` : ""}---

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

// ── Deferred backlog (early-close path) ─────────────────────

export interface DeferredBacklogInput {
  /** Generation that is being early-closed (origin of these tasks). */
  fromGenId: string;
  /** Stage at which the generation was early-closed. */
  closedAtStage: string;
  /** Goal of the closed generation — used for slug + title. */
  goal: string;
  /** Reason text from the early-close. */
  closeReason: string;
  /** REAP-assigned id. Absent leaves the item unreferenceable — `fix --check` says so. */
  id?: string;

  /** Extracted unchecked tasks (e.g. ["T005 ...", "T010 ..."]). May be empty. */
  taskList: string[];
}

/**
 * Create a deferred backlog file for tasks carried over from an early-closed
 * generation. Filename pattern: `deferred-{gen-id}-{slug}.md`.
 *
 * Front matter includes:
 * - type: task
 * - status: pending
 * - priority: medium
 * - from: {gen-id}
 * - closedAtStage: {stage}
 *
 * If taskList is empty, the body notes that no auto-extracted tasks were
 * found and the user should fill in the body manually.
 */
export async function createDeferredBacklog(
  backlogDir: string,
  input: DeferredBacklogInput,
): Promise<string> {
  const slug = toKebabCase(input.goal).slice(0, 30).replace(/-+$/, "");
  const filename = `deferred-${input.fromGenId}-${slug || "untitled"}.md`;

  const tasksSection = input.taskList.length > 0
    ? input.taskList.map((t) => `- [ ] ${t}`).join("\n")
    : "_원본 generation에서 미완 task 자동 추출 결과 없음 — 본문을 사용자가 직접 채워야 함._";

  const content = `---
${input.id ? `id: ${input.id}\n` : ""}type: task
status: pending
priority: medium
createdAt: ${new Date().toISOString()}
from: ${input.fromGenId}
closedAtStage: ${input.closedAtStage}
---

# Deferred from ${input.fromGenId}: ${input.goal}

## Close Reason
${input.closeReason}

## Carried-over Tasks
${tasksSection}

## Notes
원본 generation(${input.fromGenId})이 \`${input.closedAtStage}\` 단계에서 early-close되어 다음 세대로 승계된 backlog입니다. 필요 시 task를 추가하거나 우선순위를 조정한 뒤 새 generation의 \`--backlog ${filename}\` 으로 consume하세요.
`;

  const { mkdir } = await import("fs/promises");
  await mkdir(backlogDir, { recursive: true });
  await writeTextFile(join(backlogDir, filename), content);

  return filename;
}

/**
 * Extract unchecked task lines from an implementation/planning artifact.
 * Returns the inner text of each `- [ ] ...` line (without the prefix).
 */
export function extractUncheckedTasks(artifactContent: string): string[] {
  const lines = artifactContent.split(/\r?\n/);
  const tasks: string[] = [];
  const pattern = /^\s*-\s+\[\s\]\s+(.+?)\s*$/;
  for (const line of lines) {
    const m = line.match(pattern);
    if (m) tasks.push(m[1]);
  }
  return tasks;
}

/**
 * Count checked tasks (`- [x]` or `- [X]`) in an artifact.
 */
export function countCheckedTasks(artifactContent: string): number {
  const matches = artifactContent.match(/^\s*-\s+\[(x|X)\]\s+/gm);
  return matches ? matches.length : 0;
}
