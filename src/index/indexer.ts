import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { head, isRepo } from "../git.ts";
import { paths } from "../store.ts";
import { Graph } from "./graph.ts";
import type { Edge, SymbolNode } from "./graph.ts";
import { languageOf } from "./languages.ts";
import type { Language } from "./languages.ts";
import { Extractor } from "./parser.ts";
import type { Found } from "./parser.ts";
import { extractSpecifiers, resolveCalls, resolveSpecifiers } from "./resolve.ts";
import type { Specifier } from "./resolve.ts";
import { Store } from "./store.ts";
import type { FileRow, Manifest, Stats } from "./store.ts";
import { t } from "../i18n.ts";

export type Scanned = { path: string; language: Language };
export type Update = { mode: "full" | "incremental" | "up-to-date"; files: number; nodes: number; edges: number; commit: string | null; ms: number };
export type Impact = { direct: string[]; indirect: string[]; symbols: string[] };

export function indexDir(root: string): string {
  return join(paths(root).reap, ".index");
}

function git(root: string, args: string[]): string {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

/** 추적되는 파일 중 문법이 있는 것. 커밋 안 된 파일은 없다 — 인덱스의 정체가 커밋이기 때문이다. */
export function scan(root: string): Scanned[] {
  const out: Scanned[] = [];
  for (const path of git(root, ["ls-files", "-z"]).split("\0").filter(Boolean)) {
    const language = languageOf(path);
    if (language) out.push({ path, language });
  }
  return out;
}

/** `--no-renames`가 핵심이다 — 이름 바꾼 파일의 옛 경로가 안 나오면 그 심볼이 영원히 남는다. */
function changedSince(root: string, commit: string): string[] | null {
  try {
    git(root, ["cat-file", "-e", `${commit}^{commit}`]);
    return git(root, ["diff", "--no-renames", "--name-only", `${commit}..HEAD`]).split("\n").filter((f) => f && languageOf(f));
  } catch {
    return null; // 그 커밋이 없다(리베이스·shallow). 빈 목록과 구별해야 한다
  }
}

/**
 * 상주 프로세스도 감시자도 없다. 인덱스는 자기가 서술하는 SHA를 기록하고, 갱신할지는 문자열
 * 비교 하나, 무엇을 다시 파싱할지는 `git diff` 하나로 정해진다. 질의는 먼저 `ready()`로 맞춘다.
 */
export class Indexer {
  readonly store: Store;
  private graph = new Graph();
  private loaded = false;

  constructor(readonly root: string) {
    this.store = new Store(indexDir(root));
  }

  manifest(): Manifest | null {
    return this.store.manifest();
  }

  async update(full = false): Promise<Update> {
    if (!isRepo(this.root)) throw new Error(t(this.root, "index.not_a_repo"));
    const commit = head(this.root);
    if (!commit) throw new Error(t(this.root, "index.no_commits"));
    const manifest = full ? null : this.store.manifest();
    if (manifest && manifest.commit === commit) {
      return { mode: "up-to-date", files: 0, nodes: manifest.stats.nodes, edges: sum(manifest.stats.edges), commit, ms: 0 };
    }
    const start = Date.now();
    const extractor = new Extractor();
    await extractor.init();
    try {
      const files = scan(this.root);
      const previous = manifest?.commit ? changedSince(this.root, manifest.commit) : null;
      let mode: Update["mode"];
      let targets: Scanned[];
      let refs: Found[];
      let specs: Specifier[];
      if (previous !== null && this.load()) {
        mode = "incremental";
        const changed = new Set(previous);
        for (const f of changed) this.graph.removeFile(f);
        targets = files.filter((f) => changed.has(f.path));
        const snap = this.store.snapshot();
        const tracked = new Set(files.map((f) => f.path));
        const carry = <T extends { file: string }>(xs: T[]) => xs.filter((x) => tracked.has(x.file) && !changed.has(x.file));
        refs = carry(snap?.refs ?? []);
        specs = carry(snap?.specifiers ?? []);
      } else {
        mode = "full";
        this.graph = new Graph();
        this.loaded = true;
        targets = files;
        refs = [];
        specs = [];
      }
      for (const f of targets) {
        let source: string;
        try {
          source = readFileSync(join(this.root, f.path), "utf8");
        } catch {
          continue;
        }
        const got = await extractor.extract(f.path, f.language, source);
        for (const d of got.definitions) this.graph.addNode({ id: `${f.path}::${d.name}`, kind: d.kind, name: d.name, file: f.path, line: d.line });
        refs.push(...got.references);
        specs.push(...extractSpecifiers(f.path, f.language.name, source));
      }
      // 해석은 전체 패스 — 둘 다 바꿔 끼운다
      this.graph.removeEdgesOfKind("IMPORTS");
      const { edges, stats } = resolveSpecifiers(specs, files.map((f) => f.path));
      for (const e of edges) this.graph.addEdge(e);
      this.graph.removeEdgesOfKind("CALLS");
      for (const e of resolveCalls(refs, this.graph)) this.graph.addEdge(e);

      const rows: FileRow[] = files.map((f) => ({ path: f.path, language: f.language.name, imports: stats.get(f.path) ?? { attempted: 0, resolved: 0 } }));
      const nodes = [...this.graph.nodes.values()];
      const allEdges = this.graph.allEdges();
      this.store.write({ nodes, edges: allEdges, files: rows, refs, specifiers: specs }, commit, buildStats(rows, nodes, allEdges, extractor.failures()));
      return { mode, files: targets.length, nodes: nodes.length, edges: allEdges.length, commit, ms: Date.now() - start };
    } finally {
      extractor.dispose();
    }
  }

  /** HEAD가 움직였으면 먼저 올린 뒤 답한다 — 브랜치 전환·리베이스·밖에서 한 커밋 전부. */
  async ready(): Promise<void> {
    const m = this.store.manifest();
    if (!m || m.commit !== head(this.root) || !this.load()) await this.update();
  }

  private load(): boolean {
    if (this.loaded) return true;
    const snap = this.store.snapshot();
    if (!snap) return false;
    this.graph = new Graph();
    for (const n of snap.nodes) this.graph.addNode(n);
    for (const e of snap.edges) this.graph.addEdge(e);
    this.loaded = true;
    return true;
  }

  search(q: string): SymbolNode[] {
    return this.graph.search(q);
  }
  callers(id: string): Edge[] {
    return this.graph.edgesTo(id, "CALLS");
  }
  callees(id: string): Edge[] {
    return this.graph.edgesFrom(id, "CALLS");
  }
  node(id: string): SymbolNode | null {
    return this.graph.nodes.get(id) ?? null;
  }

  /** import 간선을 거슬러 걷는다. 커뮤니티도 프로세스 추적도 없다 — REAP에서 둘 다 못 쓸 것이 나왔다. */
  impact(files: string[]): Impact {
    const changed = new Set(files);
    const direct = new Set<string>();
    const symbols = new Set<string>();
    for (const f of files) {
      for (const e of this.graph.edgesTo(`file::${f}`, "IMPORTS")) {
        const importer = e.from.slice("file::".length);
        if (!changed.has(importer)) direct.add(importer);
      }
      for (const n of this.graph.nodesOf(f)) {
        symbols.add(n.id);
        for (const e of this.graph.edgesTo(n.id, "CALLS")) symbols.add(e.from);
      }
    }
    const indirect = new Set<string>();
    const queue = [...direct];
    const seen = new Set([...changed, ...direct]);
    while (queue.length > 0) {
      const cur = queue.shift()!;
      for (const e of this.graph.edgesTo(`file::${cur}`, "IMPORTS")) {
        const f = e.from.slice("file::".length);
        if (seen.has(f)) continue;
        seen.add(f);
        indirect.add(f);
        queue.push(f);
      }
    }
    return { direct: [...direct].sort(), indirect: [...indirect].sort(), symbols: [...symbols].sort() };
  }
}

function buildStats(files: FileRow[], nodes: SymbolNode[], edges: Edge[], failures: Record<string, string>): Stats {
  const kinds: Record<string, number> = {};
  for (const n of nodes) kinds[n.kind] = (kinds[n.kind] ?? 0) + 1;
  const byKind: Record<string, number> = {};
  for (const e of edges) byKind[e.kind] = (byKind[e.kind] ?? 0) + 1;
  const imports = { attempted: 0, resolved: 0 };
  for (const f of files) {
    imports.attempted += f.imports.attempted;
    imports.resolved += f.imports.resolved;
  }
  return { files: files.length, nodes: nodes.length, kinds, edges: byKind, imports, ...(Object.keys(failures).length ? { languageFailures: failures } : {}) };
}

function sum(r: Record<string, number>): number {
  return Object.values(r).reduce((a, b) => a + b, 0);
}

/** `status`에서 가장 중요한 줄은 해석률이다 — 낮으면 빈 impact는 "없음"이 아니라 "모름"이다. */
export function formatStatus(m: Manifest, root?: string | null): string {
  const { attempted, resolved } = m.stats.imports;
  const rate = attempted === 0 ? t(root, "index.status.no_imports") : `${resolved}/${attempted} (${Math.round((resolved / attempted) * 100)}%)`;
  const lines = [
    t(root, "index.status.commit_line", { commit: m.commit ?? t(root, "cli.none"), at: m.at }),
    t(root, "index.status.counts_line", { files: m.stats.files, nodes: m.stats.nodes, edges: Object.entries(m.stats.edges).map(([k, v]) => `${k} ${v}`).join(" · ") || "0" }),
    t(root, "index.status.rate_line", { rate }),
  ];
  if (attempted > 0 && resolved / attempted < 0.8) lines.push(t(root, "index.status.low_rate_warning"));
  if (m.stats.languageFailures) for (const [l, why] of Object.entries(m.stats.languageFailures)) lines.push(t(root, "index.status.language_failure", { lang: l, why }));
  return lines.join("\n");
}
