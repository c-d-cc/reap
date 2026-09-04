import { existsSync, readFileSync, statSync } from "node:fs";
import { basename, isAbsolute, join, relative, resolve } from "node:path";
import { slugify } from "./doc.ts";
import { issue } from "./id.ts";
import { ensureDir, paths, writeFileAtomic } from "./store.ts";
import { render, template } from "./templates.ts";
import { t } from "./i18n.ts";

export type Source = { id: string; root: string; role: string; convention: string };
export type MakePlanSource = { root: string; role: string; slug?: string; now: string };

/**
 * `sources.yml`은 `config.yml`과 달리 중첩이 있어 `readKV`로 못 읽는다.
 * **YAML 파서를 들이지 않는다** — `writeSources`가 내는 고정 모양만 손으로 읽는다.
 */
export function readSources(root: string): Source[] {
  const path = paths(root).planSources;
  if (!existsSync(path)) return [];
  return parseSources(readFileSync(path, "utf8"), root);
}

function parseSources(text: string, root: string): Source[] {
  const trimmed = text.trim();
  if (trimmed === "" || trimmed === "sources: []") return [];
  const lines = text.split("\n");
  if (lines[0] !== "sources:") throw new Error(t(root, "plan.sources_broken_header", { line: lines[0] ?? "" }));
  const sources: Source[] = [];
  let i = 1;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.trim() === "") {
      i++;
      continue;
    }
    const idMatch = /^  - id: (.*)$/.exec(line);
    if (!idMatch) throw new Error(t(root, "plan.sources_broken_line", { line }));
    const id = idMatch[1] ?? "";
    const fields: Record<"root" | "role" | "convention", string> = { root: "", role: "", convention: "" };
    for (const key of ["root", "role", "convention"] as const) {
      i++;
      const fieldLine = lines[i];
      const fieldMatch = fieldLine === undefined ? null : new RegExp(`^    ${key}: (.*)$`).exec(fieldLine);
      if (!fieldMatch) throw new Error(t(root, "plan.sources_broken_field", { id, key, line: fieldLine ?? t(root, "cli.none") }));
      fields[key] = fieldMatch[1] ?? "";
    }
    sources.push({ id, ...fields });
    i++;
  }
  return sources;
}

/**
 * 쓰기는 손으로 한다 — `Bun.YAML.stringify`는 흐름 형식(`{a: b}`)으로 내서
 * 손으로 쓴 파일과 모양이 달라진다. 같은 모양이어야 diff가 사람에게 읽힌다.
 */
export function writeSources(root: string, sources: Source[]): void {
  const lines = ["sources:"];
  for (const s of sources) {
    lines.push(`  - id: ${s.id}`, `    root: ${s.root}`, `    role: ${s.role}`, `    convention: ${s.convention}`);
  }
  writeFileAtomic(paths(root).planSources, `${lines.join("\n")}\n`);
}

export function findSource(root: string, id: string): Source | null {
  return readSources(root).find((s) => s.id === id) ?? null;
}

/** 상대 root는 프로젝트 루트 기준이다 — 어느 cwd에서 불러도 같은 곳을 가리켜야 한다. */
export function sourceRoot(root: string, source: Source): string {
  return isAbsolute(source.root) ? source.root : resolve(root, source.root);
}

export function makePlanSource(root: string, opts: MakePlanSource): { id: string; path: string; convention: string } {
  const dir = sourceRoot(root, { id: "", root: opts.root, role: "", convention: "" });
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    throw new Error(t(root, "plan.source_root_not_dir", { root: opts.root }));
  }
  const id = issue(root, "source", opts.role, opts.now.slice(0, 10));
  const slug = opts.slug ?? slugify(basename(dir), root);
  const convention = `conventions/${id}-${slug}.md`;
  const sources = readSources(root);
  sources.push({ id, root: opts.root, role: opts.role, convention });
  ensureDir(paths(root).plan);
  writeSources(root, sources);

  const conventionPath = join(paths(root).plan, convention);
  ensureDir(paths(root).planConventions);
  if (!existsSync(conventionPath)) {
    writeFileAtomic(conventionPath, render(template(root, "convention.md"), { id, slug, root: opts.root }));
  }
  return { id, path: paths(root).planSources, convention: conventionPath };
}

/**
 * `<ps-id>:<경로>[#앵커]`. **확정 가능한 것만 본다** — 소스가 등록돼 있는가, 경로가 그 소스 안의
 * 실재하는 파일인가. 앵커는 보지 않는다 (마크다운 헤딩은 자유롭게 바뀐다).
 * 문제가 없으면 `null`, 있으면 사람에게 보일 문장.
 */
export function validateRef(root: string, ref: string): string | null {
  const at = ref.indexOf(":");
  if (at <= 0 || at === ref.length - 1) return t(root, "plan.ref_format", { ref });
  const id = ref.slice(0, at);
  const path = ref.slice(at + 1).split("#")[0]!;
  const source = findSource(root, id);
  if (!source) return t(root, "plan.ref_source_unregistered", { id });
  const base = sourceRoot(root, source);
  const target = resolve(base, path);
  const inside = relative(base, target);
  if (inside.startsWith("..") || isAbsolute(inside)) return t(root, "plan.ref_outside_source", { path, root: source.root });
  if (!existsSync(target)) return t(root, "plan.ref_file_missing", { path, root: source.root });
  return null;
}

export function requireRefs(root: string, refs: string[] | undefined): void {
  for (const ref of refs ?? []) {
    const problem = validateRef(root, ref);
    if (problem) throw new Error(problem);
  }
}

export function formatSources(sources: Source[], root?: string | null): string {
  if (sources.length === 0) return t(root, "plan.no_sources");
  return sources.map((s) => `${s.id}  ${s.root}\n  ${s.role}\n  ${s.convention}`).join("\n");
}
