import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { isRepo } from "./git.ts";
import { t } from "./i18n.ts";

export type Site = { file: string; line: number; slug: string };
export type Carrier = { id: string; slugs: string[]; sites: Site[] };
export type Problem = { kind: string; detail: string };

/** 표식. 산문의 `<hash6>` 같은 꺾쇠는 hex가 아니므로 걸리지 않는다. */
const MARK = /reap:carrier-([0-9a-f]{6})-([A-Za-z0-9][A-Za-z0-9_-]*)/g;
/** 형식이 틀린 후보 — `reap:carrier-` 뒤가 규칙에 안 맞는 것. 꺾쇠(`<`)로 시작하면 산문이다. */
const LOOSE = /reap:carrier-([A-Za-z0-9_-]*)/g;
const SLUG = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

const SKIP_DIRS = new Set([".git", "node_modules", "dist", ".index"]);
const MAX_BYTES = 2_000_000;

/**
 * **표식 자체가 레지스트리다.** `sequence/`에 행을 두지 않는다 — 표식은 남의 소스 안에 살고,
 * 파일이 지워지면 함께 사라져야 한다. 그래서 발급도 조회도 리포를 훑어서 한다.
 */
export function scanCarriers(root: string): Carrier[] {
  const byId = new Map<string, Carrier>();
  for (const file of files(root)) {
    const text = readText(file);
    if (text === null) continue;
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      for (const m of line.matchAll(MARK)) {
        const id = `carrier-${m[1]!}`;
        const slug = m[2]!;
        const c = byId.get(id) ?? { id, slugs: [], sites: [] };
        if (!c.slugs.includes(slug)) c.slugs.push(slug);
        c.sites.push({ file: relative(root, file), line: i + 1, slug });
        byId.set(id, c);
      }
    });
  }
  return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
}

/** 형식이 틀린 것, 한 해시에 slug 둘, 한 slug에 해시 둘. 고아는 여기 없다 — 실패가 아니라 참고다. */
export function checkCarriers(root: string): Problem[] {
  const problems: Problem[] = [];
  for (const file of files(root)) {
    const text = readText(file);
    if (text === null) continue;
    text.split("\n").forEach((line, i) => {
      for (const m of line.matchAll(LOOSE)) {
        const rest = m[1]!;
        if (rest === "" || rest.startsWith("<")) continue;
        const ok = /^[0-9a-f]{6}-[A-Za-z0-9][A-Za-z0-9_-]*$/.test(rest);
        if (!ok) problems.push({ kind: t(root, "carrier.kind.format"), detail: t(root, "carrier.detail.format", { file: relative(root, file), line: i + 1, rest }) });
      }
    });
  }
  const carriers = scanCarriers(root);
  for (const c of carriers) {
    if (c.slugs.length > 1) problems.push({ kind: t(root, "carrier.kind.dup_slug"), detail: `${c.id}: ${c.slugs.join(", ")}` });
  }
  const bySlug = new Map<string, string[]>();
  for (const c of carriers) for (const s of c.slugs) bySlug.set(s, [...(bySlug.get(s) ?? []), c.id]);
  for (const [slug, ids] of bySlug) {
    if (ids.length > 1) problems.push({ kind: t(root, "carrier.kind.dup_hash"), detail: `${slug}: ${ids.join(", ")}` });
  }
  return problems;
}

export function newCarrier(root: string, slug: string): string {
  if (!SLUG.test(slug)) throw new Error(t(root, "carrier.slug_invalid", { slug }));
  const existing = scanCarriers(root);
  const same = existing.find((c) => c.slugs.includes(slug));
  if (same) throw new Error(t(root, "carrier.slug_taken", { id: same.id, slug }));
  const used = new Set(existing.map((c) => c.id.slice("carrier-".length)));
  let hash = randomHash();
  while (used.has(hash)) hash = randomHash();
  return `reap:carrier-${hash}-${slug}`;
}

export function formatCarriers(carriers: Carrier[], root?: string | null): string {
  if (carriers.length === 0) return t(root, "carrier.none");
  return carriers
    .map((c) => `${c.id}-${c.slugs.join("|")}\n${c.sites.map((s) => `  ${s.file}:${s.line}`).join("\n")}`)
    .join("\n");
}

export function orphans(carriers: Carrier[]): Carrier[] {
  return carriers.filter((c) => new Set(c.sites.map((s) => s.file)).size < 2);
}

function files(root: string): string[] {
  if (isRepo(root)) {
    try {
      const out = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: root, encoding: "utf8" });
      return out.split("\0").filter(Boolean).map((f) => join(root, f));
    } catch {
      /* fall through */
    }
  }
  const acc: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (SKIP_DIRS.has(name)) continue;
      const path = join(dir, name);
      try {
        const st = statSync(path);
        if (st.isDirectory()) walk(path);
        else acc.push(path);
      } catch {
        /* ignore */
      }
    }
  };
  walk(root);
  return acc;
}

function readText(file: string): string | null {
  try {
    if (statSync(file).size > MAX_BYTES) return null;
    const buf = readFileSync(file);
    if (buf.subarray(0, 1024).includes(0)) return null;
    return buf.toString("utf8");
  } catch {
    return null;
  }
}

function randomHash(): string {
  return Array.from({ length: 6 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
}
