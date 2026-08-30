import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { type Kind, isValid, kindOf } from "./id.ts";
import { paths, writeFileAtomic } from "./store.ts";

export type Data = Record<string, unknown>;
export type Entry = { id: string; kind: Kind; path: string; dir: string; data: Data };
export type Found = { entry: Entry } | { ambiguous: Entry[] } | { missing: true };

const OPEN = /^---[ \t]*\r?\n/;
const CLOSE = /^---[ \t]*(\r?\n|$)/m;

/**
 * frontmatter만 읽고 **본문은 자른 그대로 돌려준다.** 정규화하지 않는다 —
 * 본문은 사람과 agent가 쓴 것이고, 도구가 한 바이트라도 건드리면 그것이 곧 소유권 침범이다.
 */
export function parseDoc(text: string): { data: Data; body: string } {
  if (!OPEN.test(text)) return { data: {}, body: text };
  const rest = text.slice(text.indexOf("\n") + 1);
  const close = rest.search(CLOSE);
  if (close < 0) return { data: {}, body: text };
  const after = rest.slice(close);
  const nl = after.indexOf("\n");
  return { data: parseFields(rest.slice(0, close)), body: nl < 0 ? "" : after.slice(nl + 1) };
}

export function formatDoc(data: Data, body: string): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      // 빈 목록은 `key: []`로 남긴다 — `key:`만 있으면 읽을 때 사라진다
      if (value.length === 0) {
        lines.push(`${key}: []`);
        continue;
      }
      lines.push(`${key}:`);
      for (const item of value) lines.push(`  - ${scalar(item)}`);
    } else {
      lines.push(`${key}: ${scalar(value)}`);
    }
  }
  return `---\n${lines.map((l) => `${l}\n`).join("")}---\n${body}`;
}

/** frontmatter의 확정적 필드만 갈아끼운다. `null`은 필드를 지운다. */
export function patch(path: string, fields: Data): void {
  const { data, body } = parseDoc(readFileSync(path, "utf8"));
  for (const [key, value] of Object.entries(fields)) {
    if (value === null) delete data[key];
    else data[key] = value;
  }
  writeFileAtomic(path, formatDoc(data, body));
}

/** slug는 사람이 읽기 위한 이름표다. 한글을 로마자로 바꾸지 않는다. */
export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug === "" ? "무제" : slug;
}

export function listEntries(root: string, kind: Kind): Entry[] {
  const p = paths(root);
  switch (kind) {
    case "milestone":
      return [...dirs(p.milestones), ...dirs(p.archiveMilestones)]
        .map((dir) => entryAt(join(dir, "milestone.md"), kind))
        .filter(present);
    // 세대는 유형과 무관하게 한 곳에 쌓인다. 유형을 가르는 것은 디렉토리가 아니라 id다.
    case "generation":
      return [p.generations, p.archiveGenerations]
        .flatMap(markdown)
        .map((path) => entryAt(path, kind))
        .filter(present);
    // 닫힌 loop는 life/loops/에 남고 넘친 것만 archive로 간다. 조회는 두 곳을 다 본다.
    case "loop":
      return [p.loops, p.archiveLoops]
        .flatMap(markdown)
        .map((path) => entryAt(path, kind))
        .filter(present);
    // 세대와 같다. 참조는 경로가 아니라 id이므로 조회는 두 곳을 다 본다.
    case "backlog":
      return [p.backlog, p.archiveBacklog]
        .flatMap(markdown)
        .map((path) => entryAt(path, kind))
        .filter(present);
    // archive/idea/<kind>/ 도 본다 — 조회는 위치와 무관하게 id로 한다
    case "idea":
      return [p.ideaResearch, p.ideaFreememo, p.ideaFiles, ...["research", "freememo", "files"].map((k) => join(p.archiveIdea, k))]
        .flatMap(markdown)
        .map((path) => entryAt(path, kind))
        .filter(present);
    case "source":
      return markdown(p.planConventions).map((path) => entryAt(path, kind)).filter(present);
  }
}

/**
 * **정확한 id를 접두사보다 먼저 맞춘다** — `ms-001`은 `ms-0011`의 접두사이기도 하다.
 * 여러 개에 걸리면 후보를 돌려주고 하나를 고르지 않는다.
 */
export function findEntry(root: string, kind: Kind, needle: string): Found {
  const entries = listEntries(root, kind);
  const exact = entries.find((entry) => entry.id === needle);
  if (exact) return { entry: exact };

  const matches = entries.filter((entry) => {
    const slug = String(entry.data.slug ?? basename(entry.dir).slice(entry.id.length + 1));
    return entry.id.startsWith(needle) || slug.startsWith(needle) || basename(entry.path).includes(needle);
  });
  if (matches.length === 1) return { entry: matches[0]! };
  if (matches.length > 1) return { ambiguous: matches };
  return { missing: true };
}

function entryAt(path: string, kind: Kind): Entry | null {
  if (!existsSync(path)) return null;
  const { data } = parseDoc(readFileSync(path, "utf8"));
  const id = typeof data.id === "string" && isValid(data.id) ? data.id : idFromName(path);
  if (!id || kindOf(id) !== kind) return null;
  return { id, kind, path, dir: dirname(path), data };
}

function idFromName(path: string): string | null {
  const name = basename(path, ".md");
  const candidate = name === "milestone" ? basename(dirname(path)) : name;
  const parts = candidate.split("-");
  for (let take = Math.min(parts.length, 3); take >= 2; take--) {
    const id = parts.slice(0, take).join("-");
    if (isValid(id)) return id;
  }
  return null;
}

function present(entry: Entry | null): entry is Entry {
  return entry !== null;
}

function dirs(path: string): string[] {
  return entriesOf(path).filter((child) => isDir(child));
}

function markdown(path: string): string[] {
  return entriesOf(path).filter((child) => child.endsWith(".md") && !isDir(child));
}

function entriesOf(path: string): string[] {
  try {
    return readdirSync(path).sort().map((name) => join(path, name));
  } catch {
    return [];
  }
}

function isDir(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

/** `key: []`는 값이 빈 목록이라는 뜻이고, `key:`만 있는 것은 값이 없다는 뜻이다. 둘을 가른다. */
const EMPTY = Symbol("empty-list");

function parseFields(yaml: string): Data {
  const data: Data = {};
  let key: string | null = null;
  for (const raw of yaml.split("\n")) {
    const line = raw.replace(/\r$/, "");
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && key) {
      const list = Array.isArray(data[key]) ? (data[key] as unknown[]) : [];
      list.push(unquote(item[1]!.trim()));
      data[key] = list;
      continue;
    }
    const at = line.indexOf(":");
    if (at <= 0) continue;
    key = line.slice(0, at).trim();
    const value = line.slice(at + 1).trim();
    data[key] = value === "" ? [] : value === "[]" ? EMPTY : unquote(value);
  }
  for (const [k, v] of Object.entries(data)) {
    if (v === EMPTY) data[k] = [];
    else if (Array.isArray(v) && v.length === 0) delete data[k];
  }
  return data;
}

function unquote(value: string): string {
  const quoted = /^"(.*)"$/.exec(value) ?? /^'(.*)'$/.exec(value);
  return quoted ? quoted[1]! : value;
}

function scalar(value: unknown): string {
  const text = String(value);
  return /^[\s]|[\s]$|^["'#]|:\s/.test(text) ? JSON.stringify(text) : text;
}
