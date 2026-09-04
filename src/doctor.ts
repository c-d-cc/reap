import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { checkCarriers, orphans, scanCarriers } from "./carrier.ts";
import { listEntries } from "./doc.ts";
import type { Entry } from "./doc.ts";
import { HOOK_EVENTS, listHooks } from "./hooks.ts";
import { isValid, kindOf, readRegistry, isRegistered } from "./id.ts";
import type { Kind } from "./id.ts";
import { validateRef } from "./plan.ts";
import { paths, readSession } from "./store.ts";
import { template } from "./templates.ts";
import { allTranslations, t } from "./i18n.ts";

export type Finding = { kind: string; detail: string };
export type Report = { defects: Finding[]; notes: Finding[] };

/**
 * 안내선. **이 리포의 실측에서 나왔다** (2026-08-31, 세대 57): genome 셋 0.3·1.2·3.3KB,
 * summary 3.8KB, 주입 합계 8.6KB, lessons 11.7KB(항목 16), milestone.md 5.5~6.5KB.
 * 가장 큰 실물의 두 배 안팎이다 — 넘으면 커진 것이지 잘못된 것은 아니다. 그래서 참고다.
 */
export const GUIDE = {
  genomeFile: 6_000,
  injectedTotal: 16_000,
  lessons: 16_000,
  lessonsItems: 24,
  milestone: 10_000,
} as const;

/**
 * **보고만 하고 파일을 쓰지 않는다** (`genome/invariants.md`). 결함은 확정적으로 틀린 것,
 * 참고는 사람이 봐야 할 것이다 — 둘을 섞으면 참고가 결함을 묻는다.
 */
export function diagnose(root: string): Report {
  const defects: Finding[] = [];
  const notes: Finding[] = [];
  const p = paths(root);

  const all: Record<Kind, Entry[]> = {
    milestone: listEntries(root, "milestone"),
    generation: listEntries(root, "generation"),
    loop: listEntries(root, "loop"),
    backlog: listEntries(root, "backlog"),
    idea: listEntries(root, "idea"),
    source: listEntries(root, "source"),
  };
  const exists = (id: string): boolean => {
    const kind = kindOf(id);
    return kind !== null && all[kind].some((e) => e.id === id);
  };

  // 1. id — 형식, 레지스트리와의 일치, 중복
  for (const kind of Object.keys(all) as Kind[]) {
    const seen = new Map<string, string>();
    const registry = isRegistered(kind) ? new Set(readRegistry(root, kind).map((r) => r.id)) : null;
    for (const e of all[kind]) {
      if (!isValid(e.id)) defects.push({ kind: t(root, "doctor.kind.id_format"), detail: `${rel(root, e.path)}: ${e.id}` });
      const prev = seen.get(e.id);
      if (prev) defects.push({ kind: t(root, "doctor.kind.id_duplicate"), detail: `${e.id}: ${prev} · ${rel(root, e.path)}` });
      seen.set(e.id, rel(root, e.path));
      if (registry && !registry.has(e.id)) defects.push({ kind: t(root, "doctor.kind.id_unregistered"), detail: `${e.id} (${rel(root, e.path)})` });
    }
  }

  // 2. 끊긴 참조
  const refField = (e: Entry, field: string) => {
    const v = e.data[field];
    const ids = Array.isArray(v) ? v.map(String) : typeof v === "string" ? [v] : [];
    for (const id of ids) {
      if (!isValid(id)) continue; // id 형식이 아닌 것(경로 등)은 참조로 세지 않는다
      if (!exists(id)) defects.push({ kind: t(root, "doctor.kind.broken_ref"), detail: `${e.id}.${field} → ${id} (${rel(root, e.path)})` });
    }
  };
  for (const e of all.milestone) {
    refField(e, "from");
    for (const ref of Array.isArray(e.data.refs) ? e.data.refs.map(String) : []) {
      const problem = validateRef(root, ref);
      if (problem) defects.push({ kind: t(root, "doctor.kind.broken_ref"), detail: `${e.id}.refs → ${ref}: ${problem}` });
    }
  }
  for (const e of all.generation) {
    refField(e, "milestone");
    refField(e, "backlog");
  }
  for (const e of all.backlog) {
    refField(e, "consumedBy");
    refField(e, "from");
  }
  for (const e of all.loop) {
    refField(e, "milestones");
    refField(e, "from");
  }

  // 3. generation — 커밋 없이 닫힌 것, 열린 채 바인딩 안 된 것
  const bound = readSession(root).generation;
  for (const e of all.generation) {
    if (e.data.status === "closed" && e.data.startCommit && e.data.startCommit === e.data.endCommit) {
      defects.push({ kind: t(root, "doctor.kind.gen_closed_no_commit"), detail: `${e.id} (${String(e.data.startCommit)})` });
    }
    if (e.data.status === "open" && e.id !== bound) {
      notes.push({ kind: t(root, "doctor.kind.gen_unbound"), detail: t(root, "doctor.detail.gen_unbound", { id: e.id }) });
    }
  }

  // 4. milestone — focus 둘
  const focused = all.milestone.filter((e) => e.data.status !== "closed" && String(e.data.focus) === "true");
  if (focused.length > 1) defects.push({ kind: t(root, "doctor.kind.duplicate_focus"), detail: focused.map((e) => e.id).join(", ") });

  // 5. map.md 씨앗
  if (existsSync(p.map) && readFileSync(p.map, "utf8") !== template(root, "map.md")) {
    notes.push({ kind: t(root, "doctor.kind.map_diverged"), detail: t(root, "doctor.detail.map_diverged") });
  }

  // 6. 크기 안내선 — 주입되는 것
  let injected = 0;
  for (const file of markdown(p.genome)) {
    const size = sizeOf(file);
    injected += size;
    if (size > GUIDE.genomeFile) notes.push({ kind: t(root, "doctor.kind.size_guideline"), detail: t(root, "doctor.detail.size_over", { path: rel(root, file), size: kb(size), limit: kb(GUIDE.genomeFile) }) });
  }
  const summary = join(p.environment, "summary.md");
  injected += sizeOf(summary);
  if (sizeOf(summary) > GUIDE.genomeFile * 1.5) notes.push({ kind: t(root, "doctor.kind.size_guideline"), detail: t(root, "doctor.detail.size_over", { path: rel(root, summary), size: kb(sizeOf(summary)), limit: kb(GUIDE.genomeFile * 1.5) }) });
  if (injected > GUIDE.injectedTotal) notes.push({ kind: t(root, "doctor.kind.size_guideline"), detail: t(root, "doctor.detail.injected_total", { size: kb(injected), limit: kb(GUIDE.injectedTotal) }) });
  const lessons = join(p.memory, "lessons.md");
  if (existsSync(lessons)) {
    const text = readFileSync(lessons, "utf8");
    const items = (text.match(/^#{2,3} /gm) ?? []).length;
    if (text.length > GUIDE.lessons || items > GUIDE.lessonsItems) {
      notes.push({ kind: t(root, "doctor.kind.accumulation_warning"), detail: t(root, "doctor.detail.lessons_over", { size: kb(text.length), items }) });
    }
  }
  for (const e of all.milestone) {
    if (e.data.status === "closed") continue;
    const size = sizeOf(e.path);
    if (size > GUIDE.milestone) notes.push({ kind: t(root, "doctor.kind.size_guideline"), detail: t(root, "doctor.detail.milestone_size_over", { path: rel(root, e.path), size: kb(size), limit: kb(GUIDE.milestone) }) });
  }

  // 7. idea — 졸업 조건, 출처. 헤딩 낱말은 카탈로그 전 언어의 합집합이다 —
  // ko 프로젝트에 en 씨앗으로 만든 idea가 있어도, 그 반대여도 잡는다.
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const graduationWords = allTranslations("doctor.pattern.graduation").map(escapeRegex);
  const sourcesWords = allTranslations("doctor.pattern.sources").map(escapeRegex);
  const graduationHeading = new RegExp(`^#{2,3} .*(${graduationWords.join("|")})`, "m");
  const sourcesHeading = new RegExp(`^#{2,3} .*(${sourcesWords.join("|")})`, "m");
  for (const e of all.idea) {
    if (e.dir.startsWith(p.archiveIdea)) continue;
    const kind = String(e.data.kind ?? "");
    if (kind !== "research" && kind !== "file") continue;
    const body = readFileSync(e.path, "utf8");
    if (!graduationHeading.test(body)) notes.push({ kind: t(root, "doctor.kind.idea_no_graduation"), detail: `${e.id} (${rel(root, e.path)})` });
    if (kind === "research" && !sourcesHeading.test(body)) notes.push({ kind: t(root, "doctor.kind.research_no_sources"), detail: `${e.id}` });
  }

  // 8. 기록 안 상대 링크
  for (const file of walkMarkdown(p.reap)) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/\]\(([^)\s#]+)(?:#[^)]*)?\)/g)) {
      const target = m[1]!;
      if (/^[a-z]+:/i.test(target) || target.startsWith("/")) continue;
      if (!existsSync(resolve(dirname(file), target))) {
        defects.push({ kind: t(root, "doctor.kind.broken_link"), detail: `${rel(root, file)} → ${target}` });
      }
    }
  }

  // 9. carrier
  for (const problem of checkCarriers(root)) defects.push({ kind: "carrier", detail: `${problem.kind}: ${problem.detail}` });
  for (const c of orphans(scanCarriers(root))) {
    notes.push({ kind: t(root, "doctor.kind.carrier_orphan"), detail: t(root, "doctor.detail.carrier_orphan", { id: c.id, slugs: c.slugs.join("|") }) });
  }

  // 10. hooks — 파일명 규약, 이벤트, 조건 스크립트
  for (const finding of checkHooks(root)) defects.push(finding);

  return { defects, notes };
}

/** `hooks/{event}.{name}.{md|sh}` 규약, 이벤트 여섯, 조건 스크립트 실재를 본다. `conditions/`와 dot 파일은 뺀다. */
function checkHooks(root: string): Finding[] {
  const out: Finding[] = [];
  const dir = paths(root).hooks;
  if (!existsSync(dir)) return out;

  const recognized = new Set<string>();
  for (const event of HOOK_EVENTS) {
    for (const hook of listHooks(root, event)) {
      recognized.add(hook.file);
      if (hook.condition !== "always" && !existsSync(join(paths(root).hookConditions, `${hook.condition}.sh`))) {
        out.push({ kind: t(root, "doctor.kind.hook_condition_missing"), detail: `hooks/${hook.file} → conditions/${hook.condition}.sh` });
      }
    }
  }

  const shape = /^(.+)\.([^.]+)\.(md|sh)$/;
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    if (!statSync(full).isFile()) continue; // conditions/ 는 디렉토리라 여기서 빠진다
    if (recognized.has(name)) continue;
    const match = shape.exec(name);
    if (match) out.push({ kind: t(root, "doctor.kind.hook_unknown_event"), detail: `hooks/${name} → ${match[1]}` });
    else out.push({ kind: t(root, "doctor.kind.hook_filename_invalid"), detail: `hooks/${name}` });
  }

  return out;
}

export function formatReport(r: Report, root?: string | null): string {
  const lines: string[] = [t(root, "doctor.report.header", { defects: r.defects.length, notes: r.notes.length })];
  if (r.defects.length > 0) {
    lines.push("", t(root, "doctor.report.defects_header"));
    for (const f of r.defects) lines.push(`- [${f.kind}] ${f.detail}`);
  }
  if (r.notes.length > 0) {
    lines.push("", t(root, "doctor.report.notes_header"));
    for (const f of r.notes) lines.push(`- [${f.kind}] ${f.detail}`);
  }
  return lines.join("\n");
}

function rel(root: string, path: string): string {
  return relative(root, path);
}
function sizeOf(path: string): number {
  try {
    return statSync(path).size;
  } catch {
    return 0;
  }
}
function kb(n: number): string {
  return `${(n / 1000).toFixed(1)}KB`;
}
function markdown(dir: string): string[] {
  try {
    return readdirSync(dir).filter((n) => n.endsWith(".md")).sort().map((n) => join(dir, n));
  } catch {
    return [];
  }
}
function walkMarkdown(dir: string): string[] {
  const acc: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      if (name.startsWith(".")) continue;
      const path = join(d, name);
      const st = statSync(path);
      if (st.isDirectory()) walk(path);
      else if (name.endsWith(".md")) acc.push(path);
    }
  };
  walk(dir);
  return acc;
}
