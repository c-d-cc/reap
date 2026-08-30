import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { checkCarriers, orphans, scanCarriers } from "./carrier.ts";
import { listEntries } from "./doc.ts";
import type { Entry } from "./doc.ts";
import { isValid, kindOf, readRegistry, isRegistered } from "./id.ts";
import type { Kind } from "./id.ts";
import { validateRef } from "./plan.ts";
import { paths, readSession } from "./store.ts";
import { template } from "./templates.ts";

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
      if (!isValid(e.id)) defects.push({ kind: "id 형식", detail: `${rel(root, e.path)}: ${e.id}` });
      const prev = seen.get(e.id);
      if (prev) defects.push({ kind: "id 중복", detail: `${e.id}: ${prev} · ${rel(root, e.path)}` });
      seen.set(e.id, rel(root, e.path));
      if (registry && !registry.has(e.id)) defects.push({ kind: "레지스트리에 없는 id", detail: `${e.id} (${rel(root, e.path)})` });
    }
  }

  // 2. 끊긴 참조
  const refField = (e: Entry, field: string) => {
    const v = e.data[field];
    const ids = Array.isArray(v) ? v.map(String) : typeof v === "string" ? [v] : [];
    for (const id of ids) {
      if (!isValid(id)) continue; // id 형식이 아닌 것(경로 등)은 참조로 세지 않는다
      if (!exists(id)) defects.push({ kind: "끊긴 참조", detail: `${e.id}.${field} → ${id} (${rel(root, e.path)})` });
    }
  };
  for (const e of all.milestone) {
    refField(e, "from");
    for (const ref of Array.isArray(e.data.refs) ? e.data.refs.map(String) : []) {
      const problem = validateRef(root, ref);
      if (problem) defects.push({ kind: "끊긴 참조", detail: `${e.id}.refs → ${ref}: ${problem}` });
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
      defects.push({ kind: "커밋 없이 닫힌 generation", detail: `${e.id} (${String(e.data.startCommit)})` });
    }
    if (e.data.status === "open" && e.id !== bound) {
      notes.push({ kind: "열린 채 바인딩 안 된 generation", detail: `${e.id} — 다른 세션의 것이거나 버려진 것. 내 것이면 reap bind ${e.id}, 버려진 것이면 mark --aborted` });
    }
  }

  // 4. milestone — focus 둘
  const focused = all.milestone.filter((e) => e.data.status !== "closed" && String(e.data.focus) === "true");
  if (focused.length > 1) defects.push({ kind: "focus가 둘", detail: focused.map((e) => e.id).join(", ") });

  // 5. map.md 씨앗
  if (existsSync(p.map) && readFileSync(p.map, "utf8") !== template(root, "map.md")) {
    notes.push({ kind: "map.md가 씨앗과 다르다", detail: "프로젝트가 덧붙였거나 REAP가 레이아웃을 바꿨다. diff로 확인한다" });
  }

  // 6. 크기 안내선 — 주입되는 것
  let injected = 0;
  for (const file of markdown(p.genome)) {
    const size = sizeOf(file);
    injected += size;
    if (size > GUIDE.genomeFile) notes.push({ kind: "크기 안내선", detail: `${rel(root, file)} ${kb(size)} > ${kb(GUIDE.genomeFile)} — 매 세션 주입된다` });
  }
  const summary = join(p.environment, "summary.md");
  injected += sizeOf(summary);
  if (sizeOf(summary) > GUIDE.genomeFile * 1.5) notes.push({ kind: "크기 안내선", detail: `${rel(root, summary)} ${kb(sizeOf(summary))} — 매 세션 주입된다` });
  if (injected > GUIDE.injectedTotal) notes.push({ kind: "크기 안내선", detail: `주입 합계 ${kb(injected)} > ${kb(GUIDE.injectedTotal)}` });
  const lessons = join(p.memory, "lessons.md");
  if (existsSync(lessons)) {
    const text = readFileSync(lessons, "utf8");
    const items = (text.match(/^#{2,3} /gm) ?? []).length;
    if (text.length > GUIDE.lessons || items > GUIDE.lessonsItems) {
      notes.push({ kind: "누적 경고", detail: `lessons.md ${kb(text.length)} · 항목 ${items} — 졸업시킬 때다` });
    }
  }
  for (const e of all.milestone) {
    if (e.data.status === "closed") continue;
    const size = sizeOf(e.path);
    if (size > GUIDE.milestone) notes.push({ kind: "크기 안내선", detail: `${rel(root, e.path)} ${kb(size)} > ${kb(GUIDE.milestone)} — 세대마다 열린다` });
  }

  // 7. idea — 졸업 조건, 출처
  for (const e of all.idea) {
    if (e.dir.startsWith(p.archiveIdea)) continue;
    const kind = String(e.data.kind ?? "");
    if (kind !== "research" && kind !== "file") continue;
    const body = readFileSync(e.path, "utf8");
    if (!/^#{2,3} .*졸업/m.test(body)) notes.push({ kind: "졸업 조건이 없는 idea", detail: `${e.id} (${rel(root, e.path)})` });
    if (kind === "research" && !/^#{2,3} .*출처/m.test(body)) notes.push({ kind: "출처가 없는 research", detail: `${e.id}` });
  }

  // 8. 기록 안 상대 링크
  for (const file of walkMarkdown(p.reap)) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/\]\(([^)\s#]+)(?:#[^)]*)?\)/g)) {
      const target = m[1]!;
      if (/^[a-z]+:/i.test(target) || target.startsWith("/")) continue;
      if (!existsSync(resolve(dirname(file), target))) {
        defects.push({ kind: "깨진 상대 링크", detail: `${rel(root, file)} → ${target}` });
      }
    }
  }

  // 9. carrier
  for (const problem of checkCarriers(root)) defects.push({ kind: "carrier", detail: `${problem.kind}: ${problem.detail}` });
  for (const c of orphans(scanCarriers(root))) {
    notes.push({ kind: "carrier 고아", detail: `${c.id}-${c.slugs.join("|")} — 한 파일에만 있다. 표식이 불필요하거나 나머지가 표식되지 않았다` });
  }

  return { defects, notes };
}

export function formatReport(r: Report): string {
  const lines: string[] = [`결함 ${r.defects.length} · 참고 ${r.notes.length}`];
  if (r.defects.length > 0) {
    lines.push("", "## 결함 — 확정적으로 틀린 것");
    for (const f of r.defects) lines.push(`- [${f.kind}] ${f.detail}`);
  }
  if (r.notes.length > 0) {
    lines.push("", "## 참고 — 사람이 볼 것");
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
