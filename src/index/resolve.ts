import { dirname, join, normalize } from "node:path";
import type { Edge, Graph } from "./graph.ts";
import type { Found } from "./parser.ts";
import { languageOf } from "./languages.ts";

export type Specifier = { file: string; language: string; specifier: string };
export type ImportStats = { attempted: number; resolved: number };

/**
 * 추출과 해석을 가른다. 추출은 파일 하나를 읽고, **해석은 전체 파일 목록에 대고 한다** —
 * 파일이 생기거나 사라지면 손대지 않은 파일의 답도 바뀌므로 증분 갱신도 전부 다시 해석한다.
 */
export function extractSpecifiers(file: string, language: string, source: string): Specifier[] {
  if (language === "typescript" || language === "tsx" || language === "javascript") return js(file, language, source);
  if (language === "python") return python(file, language, source);
  return [];
}

export function resolveSpecifiers(specs: Specifier[], files: string[]): { edges: Edge[]; stats: Map<string, ImportStats> } {
  const set = new Set(files);
  const edges: Edge[] = [];
  const stats = new Map<string, ImportStats>();
  for (const s of specs) {
    const st = stats.get(s.file) ?? { attempted: 0, resolved: 0 };
    stats.set(s.file, st);
    st.attempted++;
    const target = s.language === "python" ? resolvePython(s.file, s.specifier, set) : resolveJs(dirname(s.file), s.specifier, set);
    if (target) {
      st.resolved++;
      edges.push({ from: `file::${s.file}`, to: `file::${target}`, kind: "IMPORTS" });
    }
  }
  return { edges, stats };
}

function js(file: string, language: string, source: string): Specifier[] {
  const out: Specifier[] = [];
  const re = /(?:import|export)\s+(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)?\s*(?:,\s*\{[^}]*\})?\s*from\s+["']([^"']+)["']|import\s+["']([^"']+)["']/g;
  for (const m of source.matchAll(re)) {
    const spec = m[1] ?? m[2]!;
    if (!spec.startsWith(".") || !isCode(spec)) continue;
    out.push({ file, language, specifier: spec });
  }
  return out;
}

/** `./x.js`는 `x.ts`를 뜻한다(NodeNext). 이것을 모르는 해석기는 표준 TS 프로젝트에서 0%를 낸다. */
const JS_TO_TS: Record<string, string[]> = {
  ".js": [".ts", ".tsx", ".js", ".jsx"],
  ".jsx": [".tsx", ".jsx"],
  ".mjs": [".mts", ".mjs"],
  ".cjs": [".cts", ".cjs"],
};

/** `./index.css`는 애초에 코드가 아니다 — 세면 해석률이 100%에 못 닿고, 못 닿는 숫자는 아무도 안 읽는다. */
function isCode(spec: string): boolean {
  const name = spec.slice(spec.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return true;
  const ext = name.slice(dot);
  return ext in JS_TO_TS || languageOf(name) !== null;
}

function resolveJs(fromDir: string, spec: string, set: Set<string>): string | null {
  const base = normalize(join(fromDir, spec));
  const candidates = [base];
  const dot = base.lastIndexOf(".");
  const ext = dot < 0 ? "" : base.slice(dot);
  for (const e of JS_TO_TS[ext] ?? []) candidates.push(base.slice(0, dot) + e);
  for (const e of [".ts", ".tsx", ".js", ".jsx", ".mts", ".mjs"]) candidates.push(base + e);
  for (const i of ["index.ts", "index.tsx", "index.js"]) candidates.push(join(base, i));
  return candidates.find((c) => set.has(c)) ?? null;
}

function python(file: string, language: string, source: string): Specifier[] {
  const out: Specifier[] = [];
  for (const m of source.matchAll(/^\s*from\s+(\.+[\w.]*)\s+import\s+/gm)) out.push({ file, language, specifier: m[1]! });
  return out;
}

function resolvePython(file: string, mod: string, set: Set<string>): string | null {
  const dots = mod.match(/^\.+/)?.[0].length ?? 0;
  if (dots === 0) return null;
  const parts = mod.slice(dots).split(".").filter(Boolean);
  let dir = dirname(file);
  for (let i = 1; i < dots; i++) dir = dirname(dir);
  return [join(dir, ...parts) + ".py", join(dir, ...parts, "__init__.py")].find((c) => set.has(c)) ?? null;
}

/**
 * 이름 기반 호출 해석. 타입을 모르므로 동명이인은 **재현 가능한 추측**이어야 한다 —
 * 그 파일이 import하는 파일 > 같은 파일 > 나머지(경로순). 삽입 순서에 의존하면
 * 증분 결과가 전체 재빌드와 달라진다.
 */
export function resolveCalls(refs: Found[], graph: Graph): Edge[] {
  const byName = new Map<string, string[]>();
  for (const n of graph.nodes.values()) (byName.get(n.name) ?? byName.set(n.name, []).get(n.name)!).push(n.id);
  const edges: Edge[] = [];
  const seen = new Set<string>();
  for (const ref of refs) {
    const targets = byName.get(ref.name);
    if (!targets) continue;
    const from = enclosing(ref.file, ref.line, graph);
    if (!from) continue;
    const imported = new Set(graph.edgesFrom(`file::${ref.file}`, "IMPORTS").map((e) => e.to.slice("file::".length)));
    const rank = (id: string) => {
      const n = graph.nodes.get(id)!;
      return imported.has(n.file) ? 0 : n.file === ref.file ? 1 : 2;
    };
    const to = [...targets].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))[0]!;
    if (to === from) continue;
    const e: Edge = { from, to, kind: "CALLS" };
    const k = `${from}\0${to}`;
    if (seen.has(k)) continue;
    seen.add(k);
    edges.push(e);
  }
  return edges;
}

const CONTAINERS = new Set(["function", "method", "class", "interface", "module"]);

function enclosing(file: string, line: number, graph: Graph): string | null {
  let best: { id: string; line: number } | null = null;
  for (const n of graph.nodesOf(file)) {
    if (n.line <= line && CONTAINERS.has(n.kind) && (!best || n.line > best.line)) best = { id: n.id, line: n.line };
  }
  return best?.id ?? null;
}
