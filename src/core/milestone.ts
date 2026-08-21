import { readdir, mkdir } from "fs/promises";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { readTextFile, writeTextFile } from "./fs.js";
import { toKebabCase } from "./backlog.js";
import type { Milestone, MilestoneGeneration } from "../types/index.js";

// ── Parse ────────────────────────────────────────────────────

/**
 * The lines of a `## <heading>` section, up to the next `## ` or the end.
 *
 * Line-based rather than one regex: a regex spanning to "next heading or end
 * of input" needs an end-of-input anchor, and JavaScript has none — `\Z` is a
 * literal `Z`, which silently makes the last section of a file unreadable.
 */
function sectionLines(body: string, heading: string): string[] | null {
  const lines = body.split(/\r?\n/);
  const target = heading.trim().toLowerCase();

  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^##\s+(.+?)\s*$/);
    if (h && h[1].trim().toLowerCase() === target) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return null;

  const out: string[] = [];
  for (let i = start; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out;
}

/**
 * Fold a section's raw lines into one logical line per bullet.
 *
 * A bullet wrapped onto a second line used to lose everything after the first
 * one — silently, since the file still looked right. In `## Exit Criteria`
 * that truncated the standard a generation is judged against.
 *
 * A continuation is a non-empty, non-bullet line following a bullet. A blank
 * line closes the bullet, so prose after a gap is not swallowed. HTML comments
 * are dropped whole — a milestone keeps its long-form notes in one, and
 * folding that into the last entry would be worse than truncating it.
 */
function foldContinuations(lines: string[]): string[] {
  const out: string[] = [];
  let inComment = false;
  let open = false;

  for (const line of lines) {
    if (inComment) {
      if (line.includes("-->")) inComment = false;
      continue;
    }
    if (/^\s*<!--/.test(line)) {
      if (!line.includes("-->")) inComment = true;
      continue;
    }
    if (line.trim() === "") {
      open = false;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      out.push(line.trim());
      open = true;
      continue;
    }
    if (open) out[out.length - 1] += ` ${line.trim()}`;
  }
  return out;
}

/**
 * A section's bullet items. Checklist markers are stripped, so a boundary
 * written as a checklist still reads as a boundary.
 */
function readBullets(body: string, heading: string): string[] {
  const lines = sectionLines(body, heading);
  if (!lines) return [];

  const items: string[] = [];
  for (const line of foldContinuations(lines)) {
    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (!bullet) continue;
    const text = bullet[1].replace(/^\[[ xX]\]\s*/, "").trim();
    if (text) items.push(text);
  }
  return items;
}

/** Read the `## Generations` checklist, preserving checked state. */
function readGenerations(body: string): MilestoneGeneration[] {
  const lines = sectionLines(body, "Generations");
  if (!lines) return [];

  const items: MilestoneGeneration[] = [];
  for (const line of foldContinuations(lines)) {
    const bullet = line.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (!bullet) continue;
    const text = bullet[2].trim();
    if (text) items.push({ checked: bullet[1].toLowerCase() === "x", text });
  }
  return items;
}

function readFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const out: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length > 0) out[key.trim()] = rest.join(":").trim();
  }
  return out;
}

export function parseMilestone(content: string, slug: string, path: string): Milestone {
  const fm = readFrontmatter(content);
  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  const heading = body.match(/^#\s+(.+)/m);

  return {
    slug,
    path,
    id: fm.id ?? "",
    title: heading ? heading[1].trim() : slug,
    goal: fm.goal ?? "",
    status: fm.status === "completed" ? "completed" : "open",
    main: fm.main === "true",
    exitCriteria: readBullets(body, "Exit Criteria"),
    outOfScope: readBullets(body, "Out of Scope"),
    generations: readGenerations(body),
    createdAt: fm.createdAt,
  };
}

// ── Query ────────────────────────────────────────────────────

export async function listMilestones(dir: string): Promise<Milestone[]> {
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }

  const items: Milestone[] = [];
  for (const entry of entries.sort()) {
    if (!entry.endsWith(".md")) continue;
    const path = join(dir, entry);
    const content = await readTextFile(path);
    if (!content) continue;
    items.push(parseMilestone(content, entry.replace(/\.md$/, ""), path));
  }
  return items;
}

/**
 * Synchronous `listMilestones`, for `buildKnowledgeContextSync`.
 *
 * Only the reading differs from the async version — the section text both
 * feed is rendered by `buildMilestoneSection`, which has one owner.
 */
export function listMilestonesSync(dir: string): Milestone[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }

  const items: Milestone[] = [];
  for (const entry of entries.sort()) {
    if (!entry.endsWith(".md")) continue;
    const path = join(dir, entry);
    let content: string;
    try {
      content = readFileSync(path, "utf-8");
    } catch {
      continue;
    }
    if (!content) continue;
    items.push(parseMilestone(content, entry.replace(/\.md$/, ""), path));
  }
  return items;
}

/** A milestone can offer candidates only when its boundary is filled. */
export function isValidMilestone(m: Milestone): boolean {
  return m.goal.trim().length > 0 && m.exitCriteria.length > 0 && m.outOfScope.length > 0;
}

export function mainMilestone(all: Milestone[]): Milestone | null {
  return all.find((m) => m.main && m.status === "open") ?? null;
}

export function findMilestone(all: Milestone[], slug: string): Milestone | null {
  return all.find((m) => m.slug === slug) ?? null;
}

/**
 * Milestones that may supply goal candidates — open and valid, main first.
 *
 * Every valid open milestone is here, not only main: pulling an item forward
 * from a later plan is an ordinary move.
 */
export function candidateMilestones(all: Milestone[]): Milestone[] {
  const usable = all.filter((m) => m.status === "open" && isValidMilestone(m));
  return usable.sort((a, b) => Number(b.main) - Number(a.main));
}

export function uncheckedGenerations(m: Milestone): MilestoneGeneration[] {
  return m.generations.filter((g) => !g.checked);
}

// ── Validation ───────────────────────────────────────────────

export interface MilestoneValidation {
  ok: boolean;
  reason?: string;
}

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Whether a milestone may become main.
 *
 * The boundary check lives here rather than at creation because
 * `reap make milestone` writes a template for the agent to fill, exactly as
 * `reap make backlog` does. Refusing an unfilled milestone the focus is what
 * enforces "no milestone without a boundary".
 *
 * `knownGoalIds` comes from `goalIds`. Ids, never titles: the goal a milestone
 * serves keeps its identity when somebody rewrites its wording, and that is
 * what this reference is for.
 */
export function validateForMain(m: Milestone, knownGoalIds: readonly string[]): MilestoneValidation {
  if (m.status === "completed") {
    return { ok: false, reason: `'${m.slug}' is completed — a finished plan cannot be the focus.` };
  }
  if (m.exitCriteria.length === 0) {
    return { ok: false, reason: `'${m.slug}' has an empty '## Exit Criteria' — a milestone without an observable end is a named memory.` };
  }
  if (m.outOfScope.length === 0) {
    return { ok: false, reason: `'${m.slug}' has an empty '## Out of Scope' — a boundary is not defined by its inside alone.` };
  }
  if (!m.goal.trim()) {
    return { ok: false, reason: `'${m.slug}' has no 'goal:' in its frontmatter — every milestone belongs to a vision goal.` };
  }

  const cited = m.goal.trim();
  if (!/^goal-\d+$/.test(cited)) {
    return {
      ok: false,
      reason: `goal '${cited}' is not a goal id. Cite the id from vision/goals.md (e.g. 'goal-004'), not the title — a title changes and the reference would go stale.`,
    };
  }
  if (!knownGoalIds.includes(cited)) {
    const sample = knownGoalIds.slice(0, 12).join(", ");
    return {
      ok: false,
      reason: `goal '${cited}' is not in vision/goals.md. Known ids: ${sample || "(none — goals.md has no ids yet)"}`,
    };
  }

  return { ok: true };
}

// ── Transition ───────────────────────────────────────────────

/**
 * Set a frontmatter field, preserving the rest of the file byte for byte.
 *
 * Line-level, never `YAML.parse → stringify`: a round trip drops comments, key
 * order and quote style from a file the user edits by hand.
 */
function setFrontmatterField(content: string, key: string, value: string): string {
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!fm) return content;

  const lines = fm[1].split(/\r?\n/);
  let found = false;
  const updated = lines.map((line) => {
    if (new RegExp(`^${key}\\s*:`).test(line)) {
      found = true;
      return `${key}: ${value}`;
    }
    return line;
  });
  if (!found) updated.push(`${key}: ${value}`);

  return content.replace(fm[0], `---\n${updated.join("\n")}\n---\n`);
}

async function writeField(path: string, key: string, value: string): Promise<boolean> {
  const content = await readTextFile(path);
  if (!content) return false;
  await writeTextFile(path, setFrontmatterField(content, key, value));
  return true;
}

export interface SetMainResult {
  status: "ok" | "error";
  previousMain?: string;
  reason?: string;
}

/**
 * Make one milestone the focus, clearing the flag from whichever held it.
 *
 * The previous main is cleared first. A failure after that point leaves no
 * main rather than two — `reap milestone list` shows which state you are in.
 */
export async function setMain(
  dir: string,
  slug: string,
  knownGoalIds: readonly string[],
): Promise<SetMainResult> {
  const all = await listMilestones(dir);
  const target = findMilestone(all, slug);
  if (!target) {
    return { status: "error", reason: `No milestone '${slug}' in ${dir}` };
  }

  const verdict = validateForMain(target, knownGoalIds);
  if (!verdict.ok) return { status: "error", reason: verdict.reason };

  let previousMain: string | undefined;
  for (const m of all) {
    if (m.main && m.slug !== slug) {
      await writeField(m.path, "main", "false");
      previousMain = m.slug;
    }
  }

  if (!(await writeField(target.path, "main", "true"))) {
    return { status: "error", reason: `${target.path} is empty or unreadable — main not set` };
  }
  return { status: "ok", previousMain };
}

export interface CloseResult {
  status: "ok" | "error";
  wasMain?: boolean;
  uncheckedCount?: number;
  reason?: string;
}

/** Mark a milestone completed. The file stays where it is. */
export async function closeMilestone(dir: string, slug: string): Promise<CloseResult> {
  const all = await listMilestones(dir);
  const target = findMilestone(all, slug);
  if (!target) {
    return { status: "error", reason: `No milestone '${slug}' in ${dir}` };
  }
  if (target.status === "completed") {
    return { status: "error", reason: `'${slug}' is already completed.` };
  }

  const content = await readTextFile(target.path);
  if (!content) {
    return { status: "error", reason: `${target.path} is empty or unreadable — not closed` };
  }

  let updated = setFrontmatterField(content, "status", "completed");
  if (target.main) updated = setFrontmatterField(updated, "main", "false");
  await writeTextFile(target.path, updated);

  return {
    status: "ok",
    wasMain: target.main,
    uncheckedCount: uncheckedGenerations(target).length,
  };
}

// ── Create ───────────────────────────────────────────────────

export interface CreateMilestoneOptions {
  title: string;
  goal: string;
  /** REAP-assigned id. The filename stays the human-readable slug. */
  id: string;
}

/** Create a milestone from the template. Returns the filename. */
export async function createMilestone(
  dir: string,
  opts: CreateMilestoneOptions,
): Promise<string> {
  await mkdir(dir, { recursive: true });
  const slug = toKebabCase(opts.title);
  const filename = `${slug}.md`;

  const content = `---
id: ${opts.id}
goal: ${opts.goal}
status: open
main: false
createdAt: ${new Date().toISOString()}
---

# ${opts.title}

## Exit Criteria
<!-- What must be true for this milestone to be over? Verifiable facts, not
     quantitative metrics — the human makes the final call. -->

## Out of Scope
<!-- What is NOT this milestone? A boundary is not defined by its inside alone. -->

## Generations
<!-- The generations planned to realise it. This list is updated as work
     proceeds — add, split and drop entries. -->
- [ ] 
`;

  await writeTextFile(join(dir, filename), content);
  return filename;
}
