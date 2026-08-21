import { readdir, mkdir } from "fs/promises";
import { join } from "path";
import { readTextFile, writeTextFile } from "./fs.js";
import { createHash, randomBytes } from "crypto";
import {
  SEQUENCED_TYPES,
  HASHED_TYPES,
  type SequencedType,
  type HashedType,
  type SequenceType,
  type SequenceEntry,
} from "../types/index.js";

/**
 * Identity — two families, and which family a kind belongs to is a question
 * about how long its items are cited.
 *
 * **Numbered** (`goal-004`, `ms-002`): backed by `.reap/sequence/<type>.md`,
 * append-only. A row is never edited and never removed, so a number that has
 * been handed out is never handed out again: delete the goal it named and its
 * row stays, which is what makes `nextId` monotonic without a counter field.
 * The cost is a registry that only grows — worth paying where the id will be
 * cited long after the item was made.
 *
 * **Hashed** (`bklog-a3f8c2`): no registry at all. A backlog is consumed,
 * archived and removed; the only reference to it is `sourceBacklog` for one
 * generation, and lineage keeps the file after that. Spending a permanent
 * number on something that transient would leave the registry a graveyard, so
 * uniqueness comes from the hash and there is nothing to keep in sync.
 *
 * ── The registry ──
 *
 * Append-only. A row is never edited and never removed, so a number that has
 * been handed out is never handed out again: delete the goal it named and its
 * row stays, which is what makes `nextId` monotonic without a counter field.
 *
 * Per-kind files so two branches touching different kinds do not collide. Two
 * branches touching the SAME kind both append at the end, and git merges both
 * without a conflict — a duplicate id appears silently. `findDuplicates` exists
 * for exactly that, and is the reason ids add a check rather than removing one.
 *
 * Markdown table rather than a database: this file is committed and has to
 * merge. A conflict here must be something a person can read and resolve.
 */

/** Reference prefix per kind. `gen-` is not here — a generation has its own. */
export const SEQUENCE_PREFIX: Record<SequenceType, string> = {
  goal: "goal",
  milestone: "ms",
  design: "ds",
  idea: "idea",
  memory: "mem",
  backlog: "bklog",
};

const PREFIX_TO_TYPE: Record<string, SequencedType> = Object.fromEntries(
  SEQUENCED_TYPES.map((t) => [SEQUENCE_PREFIX[t], t]),
) as Record<string, SequencedType>;

export function isHashedType(type: string): type is HashedType {
  return (HASHED_TYPES as readonly string[]).includes(type);
}

/** `goal-004` → `{ type: "goal", n: 4 }`, or null when it is not a numbered id. */
export function parseId(id: string): { type: SequencedType; n: number } | null {
  const m = id.trim().match(/^([a-z]+)-(\d+)$/);
  if (!m) return null;
  const type = PREFIX_TO_TYPE[m[1]];
  if (!type) return null;
  return { type, n: Number(m[2]) };
}

/** `bklog-a3f8c2` → `{ type: "backlog" }`, or null. */
export function parseHashedId(id: string): { type: HashedType } | null {
  const m = id.trim().match(/^([a-z]+)-([0-9a-f]{6})$/);
  if (!m) return null;
  for (const t of HASHED_TYPES) {
    if (SEQUENCE_PREFIX[t] === m[1]) return { type: t };
  }
  return null;
}

/** `gen-097-e3ae8e` — assigned by `GenerationManager`, outside both families. */
export function isGenerationId(id: string): boolean {
  return /^gen-\d{3,}-[0-9a-f]{6}$/.test(id.trim());
}

/**
 * Any id one item may cite: numbered, hashed, or a generation.
 *
 * A generation belongs here even though it has no registry — a backlog is
 * routinely caused by one, and `lineage/` is where it is looked up.
 */
export function isReapId(id: string): boolean {
  return parseId(id) !== null || parseHashedId(id) !== null || isGenerationId(id);
}

export function formatId(type: SequencedType, n: number): string {
  return `${SEQUENCE_PREFIX[type]}-${String(n).padStart(3, "0")}`;
}

/**
 * A hashed id. Random, not derived from the title — a title is rewritten, and
 * an id derived from one would change with it, which is the thing ids exist to
 * prevent. Six hex characters, the same width `gen-NNN-hash` uses.
 */
export function makeHashedId(type: HashedType, seed?: string): string {
  const hash = seed
    ? createHash("sha256").update(seed).digest("hex").slice(0, 6)
    : randomBytes(3).toString("hex");
  return `${SEQUENCE_PREFIX[type]}-${hash}`;
}

function registryPath(dir: string, type: SequencedType): string {
  return join(dir, `${type}.md`);
}

function header(type: SequencedType): string {
  return [
    `<!-- reap:sequence(${type}) — append only. A number handed out is never handed out again. -->`,
    "",
    `# ${type} ids`,
    "",
    "| id | title | createdAt |",
    "|---|---|---|",
  ].join("\n");
}

/** Escape a table cell so a title containing `|` cannot split the row. */
function cell(text: string): string {
  return text.replace(/\r?\n/g, " ").replace(/\|/g, "\\|").trim();
}

// ── Read ─────────────────────────────────────────────────────

export async function readRegistry(dir: string, type: SequencedType): Promise<SequenceEntry[]> {
  const content = await readTextFile(registryPath(dir, type));
  if (!content) return [];

  const entries: SequenceEntry[] = [];
  for (const line of content.split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) continue;
    // Split on pipes the author did not escape — a title may contain `\|`,
    // and splitting on every pipe would cut the row in the middle of it.
    const cols = line.split(/(?<!\\)\|/).slice(1, -1).map((c) => c.trim());
    if (cols.length < 3) continue;
    if (cols[0] === "id" || /^-+$/.test(cols[0])) continue;
    if (!parseId(cols[0])) continue;
    entries.push({ id: cols[0], title: cols[1].replace(/\\\|/g, "|"), createdAt: cols[2] });
  }
  return entries;
}

export async function readAll(dir: string): Promise<Map<SequencedType, SequenceEntry[]>> {
  const out = new Map<SequencedType, SequenceEntry[]>();
  for (const type of SEQUENCED_TYPES) {
    out.set(type, await readRegistry(dir, type));
  }
  return out;
}

/**
 * The next id for a kind — one past the highest number ever recorded.
 *
 * Reads the registry, not the items: an item that was deleted keeps its row,
 * so its number is not reachable again.
 */
export async function nextId(dir: string, type: SequencedType): Promise<string> {
  const entries = await readRegistry(dir, type);
  let max = 0;
  for (const e of entries) {
    const parsed = parseId(e.id);
    if (parsed && parsed.n > max) max = parsed.n;
  }
  return formatId(type, max + 1);
}

// ── Write ────────────────────────────────────────────────────

/**
 * Append one row. Creates the file with its header when absent.
 *
 * Only ever appends — existing rows are not read back and rewritten, so a
 * hand-edited registry keeps whatever formatting it has.
 */
export async function appendEntry(
  dir: string,
  type: SequencedType,
  entry: SequenceEntry,
): Promise<void> {
  await mkdir(dir, { recursive: true });
  const path = registryPath(dir, type);
  const existing = await readTextFile(path);
  const row = `| ${entry.id} | ${cell(entry.title)} | ${entry.createdAt} |`;

  if (!existing) {
    await writeTextFile(path, `${header(type)}\n${row}\n`);
    return;
  }
  const base = existing.replace(/\s*$/, "");
  await writeTextFile(path, `${base}\n${row}\n`);
}

/** Assign the next id for a kind and record it. Returns the id. */
export async function assignId(
  dir: string,
  type: SequencedType,
  title: string,
  now = new Date(),
): Promise<string> {
  const id = await nextId(dir, type);
  await appendEntry(dir, type, { id, title, createdAt: now.toISOString().slice(0, 10) });
  return id;
}

// ── Query ────────────────────────────────────────────────────

/**
 * Ids recorded more than once, per kind.
 *
 * Two branches that each append a row for the same number produce no git
 * conflict — both lines land. Nothing else notices.
 */
export async function findDuplicates(dir: string): Promise<Array<{ type: SequencedType; id: string; count: number }>> {
  const out: Array<{ type: SequencedType; id: string; count: number }> = [];
  for (const [type, entries] of await readAll(dir)) {
    const seen = new Map<string, number>();
    for (const e of entries) seen.set(e.id, (seen.get(e.id) ?? 0) + 1);
    for (const [id, count] of seen) {
      if (count > 1) out.push({ type, id, count });
    }
  }
  return out;
}

/** The registry row for an id, or null. Answers "what is `ds-007`?". */
export async function lookup(dir: string, id: string): Promise<SequenceEntry | null> {
  const parsed = parseId(id);
  if (!parsed) return null;
  return (await readRegistry(dir, parsed.type)).find((e) => e.id === id) ?? null;
}

/** Every id the registry knows, across kinds. */
export async function allIds(dir: string): Promise<Set<string>> {
  const out = new Set<string>();
  for (const [, entries] of await readAll(dir)) {
    for (const e of entries) out.add(e.id);
  }
  return out;
}

/** Ids of one kind. */
export async function idsOfType(dir: string, type: SequencedType): Promise<Set<string>> {
  return new Set((await readRegistry(dir, type)).map((e) => e.id));
}

export async function registryExists(dir: string): Promise<boolean> {
  try {
    return (await readdir(dir)).length > 0;
  } catch {
    return false;
  }
}
