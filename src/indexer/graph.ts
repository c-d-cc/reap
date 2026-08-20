import type { SymbolNode, GraphEdge, EdgeKind } from "./types.js";

/**
 * The identity of an edge — one owner, because four places used to spell it.
 *
 * Two of them separated the fields with a NUL and two with a space, so an edge
 * removed by `removeByFile` left its key behind and `addEdge` then refused to
 * re-add it forever. An incremental run removes a changed file's symbols and
 * rebuilds them, so every CALLS edge pointing at that file was silently
 * dropped and could never come back — five ordinary commits emptied this
 * repository's whole call graph while the index reported success.
 *
 * The genome's rule covers exactly this: when two pieces of code need the same
 * value, give it one owner rather than a marker asking people to keep copies in
 * step. NUL rather than a space because it cannot occur in a path or an
 * identifier, so no two distinct edges can collide on one key.
 */
export function edgeKey(edge: GraphEdge): string {
  return `${edge.sourceId}\0${edge.targetId}\0${edge.kind}`;
}

export class CodeGraph {
  private nodes = new Map<string, SymbolNode>();
  private edgesFrom = new Map<string, GraphEdge[]>();
  private edgesTo = new Map<string, GraphEdge[]>();
  private fileIndex = new Map<string, Set<string>>();
  private edgeKeys = new Set<string>();

  addNode(node: SymbolNode): void {
    this.nodes.set(node.id, node);
    if (!this.fileIndex.has(node.file)) {
      this.fileIndex.set(node.file, new Set());
    }
    this.fileIndex.get(node.file)!.add(node.id);
  }

  getNode(id: string): SymbolNode | null {
    return this.nodes.get(id) ?? null;
  }

  /**
   * Add an edge, ignoring one that is already present.
   *
   * The daemon's graph appended unconditionally and its SQLite table had
   * neither a primary key nor a unique constraint, so every re-index multiplied
   * the edge count — five runs produced five copies of all 1,482 edges. In a
   * long-lived process the in-memory graph was rebuilt each time and hid it;
   * the inflation only surfaced on restart, and by then every count-based
   * figure was wrong by the number of runs. Making the graph itself reject
   * duplicates means neither the snapshot nor an incremental update can
   * reintroduce it.
   */
  addEdge(edge: GraphEdge): void {
    const key = edgeKey(edge);
    if (this.edgeKeys.has(key)) return;
    this.edgeKeys.add(key);

    if (!this.edgesFrom.has(edge.sourceId)) {
      this.edgesFrom.set(edge.sourceId, []);
    }
    this.edgesFrom.get(edge.sourceId)!.push(edge);

    if (!this.edgesTo.has(edge.targetId)) {
      this.edgesTo.set(edge.targetId, []);
    }
    this.edgesTo.get(edge.targetId)!.push(edge);
  }

  /**
   * Drop every edge of one kind.
   *
   * Exists for CALLS during an incremental run. Call resolution is a
   * whole-graph pass — it matches references by name against every known
   * symbol — so its output must replace the previous answer rather than join
   * it. Adding to a graph that still holds the old resolution is how an
   * incremental run ended up with edges a full rebuild does not have: a name
   * defined in two files resolves to whichever node the resolver reached last,
   * and re-parsing a file moves its nodes to the end of the map, so the answer
   * changes and both answers are then present. `callers` then names a function
   * that never called anything.
   *
   * It is also what makes the result independent of insertion order, which is
   * the property the incremental-equals-full tests actually depend on.
   */
  removeEdgesOfKind(kind: EdgeKind): void {
    for (const edge of this.allEdges()) {
      if (edge.kind !== kind) continue;
      this.edgeKeys.delete(edgeKey(edge));
    }
    for (const [id, list] of this.edgesFrom) {
      const kept = list.filter((e) => e.kind !== kind);
      if (kept.length === 0) this.edgesFrom.delete(id);
      else this.edgesFrom.set(id, kept);
    }
    for (const [id, list] of this.edgesTo) {
      const kept = list.filter((e) => e.kind !== kind);
      if (kept.length === 0) this.edgesTo.delete(id);
      else this.edgesTo.set(id, kept);
    }
  }

  /**
   * Drop the IMPORTS edges a file declares.
   *
   * `removeByFile` only reaches edges attached to a file's *symbols*. Import
   * edges join `file::` pseudo-ids, which are never nodes, so an incremental
   * re-index would otherwise leave the previous imports in place beside the new
   * ones. Only outgoing edges are dropped: an import *into* this file is a fact
   * about the importing file and is still true.
   */
  removeFileEdges(file: string): void {
    const id = `file::${file}`;
    for (const edge of this.edgesFrom.get(id) ?? []) {
      this.edgeKeys.delete(edgeKey(edge));
      const incoming = this.edgesTo.get(edge.targetId);
      if (incoming) {
        const idx = incoming.findIndex((e) => e.sourceId === id && e.kind === edge.kind);
        if (idx !== -1) incoming.splice(idx, 1);
      }
    }
    this.edgesFrom.delete(id);
  }

  getEdgesFrom(nodeId: string, kind?: EdgeKind): GraphEdge[] {
    const edges = this.edgesFrom.get(nodeId) ?? [];
    return kind ? edges.filter((e) => e.kind === kind) : edges;
  }

  getEdgesTo(nodeId: string, kind?: EdgeKind): GraphEdge[] {
    const edges = this.edgesTo.get(nodeId) ?? [];
    return kind ? edges.filter((e) => e.kind === kind) : edges;
  }

  getNodesByFile(file: string): SymbolNode[] {
    const ids = this.fileIndex.get(file);
    if (!ids) return [];
    return [...ids].map((id) => this.nodes.get(id)!).filter(Boolean);
  }

  removeByFile(file: string): void {
    const ids = this.fileIndex.get(file);
    if (!ids) return;
    for (const id of ids) {
      this.nodes.delete(id);
      const outgoing = this.edgesFrom.get(id) ?? [];
      for (const edge of outgoing) {
        this.edgeKeys.delete(edgeKey(edge));
        const incoming = this.edgesTo.get(edge.targetId);
        if (incoming) {
          const idx = incoming.findIndex((e) => e.sourceId === id && e.kind === edge.kind);
          if (idx !== -1) incoming.splice(idx, 1);
        }
      }
      this.edgesFrom.delete(id);
      const incoming = this.edgesTo.get(id) ?? [];
      for (const edge of incoming) {
        this.edgeKeys.delete(edgeKey(edge));
        const outgoing2 = this.edgesFrom.get(edge.sourceId);
        if (outgoing2) {
          const idx = outgoing2.findIndex((e) => e.targetId === id && e.kind === edge.kind);
          if (idx !== -1) outgoing2.splice(idx, 1);
        }
      }
      this.edgesTo.delete(id);
    }
    this.fileIndex.delete(file);
  }

  searchNodes(query: string, kind?: string): SymbolNode[] {
    const q = query.toLowerCase();
    const results: SymbolNode[] = [];
    for (const node of this.nodes.values()) {
      if (kind && node.kind !== kind) continue;
      if (node.name.toLowerCase().includes(q)) results.push(node);
    }
    return results;
  }

  allNodes(): SymbolNode[] { return [...this.nodes.values()]; }
  allEdges(): GraphEdge[] {
    const edges: GraphEdge[] = [];
    for (const list of this.edgesFrom.values()) edges.push(...list);
    return edges;
  }

  /**
   * Total edges vs. distinct edges — the duplication guard, queryable.
   *
   * Counted here rather than by a caller so it uses the same identity
   * `addEdge` does. A caller with its own notion of "same edge" can report
   * agreement while the graph disagrees, which is how the key drifted in the
   * first place.
   */
  edgeCounts(): { total: number; distinct: number } {
    const edges = this.allEdges();
    return { total: edges.length, distinct: new Set(edges.map(edgeKey)).size };
  }

  stats(): { nodeCount: number; edgeCount: number; fileCount: number } {
    return { nodeCount: this.nodes.size, edgeCount: this.allEdges().length, fileCount: this.fileIndex.size };
  }

  clear(): void {
    this.nodes.clear();
    this.edgeKeys.clear();
    this.edgesFrom.clear();
    this.edgesTo.clear();
    this.fileIndex.clear();
  }
}
