import type { SymbolNode, GraphEdge, EdgeKind } from "../types.js";

export class CodeGraph {
  private nodes = new Map<string, SymbolNode>();
  private edgesFrom = new Map<string, GraphEdge[]>();
  private edgesTo = new Map<string, GraphEdge[]>();
  private fileIndex = new Map<string, Set<string>>();

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

  addEdge(edge: GraphEdge): void {
    if (!this.edgesFrom.has(edge.sourceId)) {
      this.edgesFrom.set(edge.sourceId, []);
    }
    this.edgesFrom.get(edge.sourceId)!.push(edge);

    if (!this.edgesTo.has(edge.targetId)) {
      this.edgesTo.set(edge.targetId, []);
    }
    this.edgesTo.get(edge.targetId)!.push(edge);
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
        const incoming = this.edgesTo.get(edge.targetId);
        if (incoming) {
          const idx = incoming.findIndex((e) => e.sourceId === id && e.kind === edge.kind);
          if (idx !== -1) incoming.splice(idx, 1);
        }
      }
      this.edgesFrom.delete(id);
      const incoming = this.edgesTo.get(id) ?? [];
      for (const edge of incoming) {
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

  stats(): { nodeCount: number; edgeCount: number; fileCount: number } {
    return { nodeCount: this.nodes.size, edgeCount: this.allEdges().length, fileCount: this.fileIndex.size };
  }

  clear(): void {
    this.nodes.clear();
    this.edgesFrom.clear();
    this.edgesTo.clear();
    this.fileIndex.clear();
  }
}
