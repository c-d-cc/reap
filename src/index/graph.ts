export type SymbolNode = { id: string; kind: string; name: string; file: string; line: number };
export type EdgeKind = "CALLS" | "IMPORTS";
export type Edge = { from: string; to: string; kind: EdgeKind };

/** 간선의 정체는 한 곳이 정한다 — REAP에서 네 곳이 따로 적다 둘이 어긋나 호출 그래프가 비었다. */
export function edgeKey(e: Edge): string {
  return `${e.from}\0${e.to}\0${e.kind}`;
}

export class Graph {
  readonly nodes = new Map<string, SymbolNode>();
  private from = new Map<string, Edge[]>();
  private to = new Map<string, Edge[]>();
  private byFile = new Map<string, Set<string>>();
  private keys = new Set<string>();

  addNode(n: SymbolNode): void {
    this.nodes.set(n.id, n);
    (this.byFile.get(n.file) ?? this.byFile.set(n.file, new Set()).get(n.file)!).add(n.id);
  }

  /** 같은 간선은 두 번 들어가지 않는다 — 재인덱싱이 개수를 부풀리면 안 된다. */
  addEdge(e: Edge): void {
    const k = edgeKey(e);
    if (this.keys.has(k)) return;
    this.keys.add(k);
    (this.from.get(e.from) ?? this.from.set(e.from, []).get(e.from)!).push(e);
    (this.to.get(e.to) ?? this.to.set(e.to, []).get(e.to)!).push(e);
  }

  edgesFrom(id: string, kind?: EdgeKind): Edge[] {
    const list = this.from.get(id) ?? [];
    return kind ? list.filter((e) => e.kind === kind) : list;
  }

  edgesTo(id: string, kind?: EdgeKind): Edge[] {
    const list = this.to.get(id) ?? [];
    return kind ? list.filter((e) => e.kind === kind) : list;
  }

  nodesOf(file: string): SymbolNode[] {
    return [...(this.byFile.get(file) ?? [])].map((id) => this.nodes.get(id)!).filter(Boolean);
  }

  allEdges(): Edge[] {
    return [...this.from.values()].flat();
  }

  /** 해석은 전체 그래프 패스라 답을 **바꿔 끼운다** — 앞 답에 더하면 없는 관계가 남는다. */
  removeEdgesOfKind(kind: EdgeKind): void {
    for (const e of this.allEdges()) if (e.kind === kind) this.keys.delete(edgeKey(e));
    for (const m of [this.from, this.to]) {
      for (const [id, list] of m) {
        const kept = list.filter((e) => e.kind !== kind);
        if (kept.length === 0) m.delete(id);
        else m.set(id, kept);
      }
    }
  }

  removeFile(file: string): void {
    for (const id of this.byFile.get(file) ?? []) {
      this.nodes.delete(id);
      for (const e of [...this.edgesFrom(id), ...this.edgesTo(id)]) this.dropEdge(e);
    }
    this.byFile.delete(file);
  }

  private dropEdge(e: Edge): void {
    this.keys.delete(edgeKey(e));
    this.from.set(e.from, (this.from.get(e.from) ?? []).filter((x) => edgeKey(x) !== edgeKey(e)));
    this.to.set(e.to, (this.to.get(e.to) ?? []).filter((x) => edgeKey(x) !== edgeKey(e)));
  }

  search(q: string): SymbolNode[] {
    const needle = q.toLowerCase();
    return [...this.nodes.values()].filter((n) => n.name.toLowerCase().includes(needle)).sort((a, b) => a.id.localeCompare(b.id));
  }

  fileCount(): number {
    return this.byFile.size;
  }
}
