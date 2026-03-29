import type { GraphEdge, EdgeKind } from "../types.js";
import type { CodeGraph } from "./graph.js";

interface Reference {
  name: string;
  kind: string;
  line: number;
  file: string;
}

export function resolveCalls(references: Reference[], graph: CodeGraph): GraphEdge[] {
  const edges: GraphEdge[] = [];

  const nameIndex = new Map<string, string[]>();
  for (const node of graph.allNodes()) {
    if (!nameIndex.has(node.name)) nameIndex.set(node.name, []);
    nameIndex.get(node.name)!.push(node.id);
  }

  for (const ref of references) {
    const targetIds = nameIndex.get(ref.name);
    if (!targetIds || targetIds.length === 0) continue;

    const sourceId = findEnclosingSymbol(ref.file, ref.line, graph);
    if (!sourceId) continue;

    const edgeKind: EdgeKind = "CALLS";
    const targetId = pickBestTarget(targetIds, ref.file, sourceId, graph);
    if (targetId && targetId !== sourceId) {
      edges.push({ sourceId, targetId, kind: edgeKind });
    }
  }

  return dedup(edges);
}

function findEnclosingSymbol(file: string, line: number, graph: CodeGraph): string | null {
  const nodes = graph.getNodesByFile(file);
  let best: { id: string; line: number } | null = null;
  for (const node of nodes) {
    if (node.line <= line) {
      const isSymbol =
        node.kind === "function" ||
        node.kind === "method" ||
        node.kind === "class" ||
        node.kind === "interface" ||
        node.kind === "module";
      if (!isSymbol) continue;
      if (!best || node.line > best.line) {
        best = { id: node.id, line: node.line };
      }
    }
  }
  return best?.id ?? null;
}

function pickBestTarget(targetIds: string[], refFile: string, sourceId: string, graph: CodeGraph): string | null {
  let sameFile: string | null = null;
  let otherFile: string | null = null;
  for (const id of targetIds) {
    const node = graph.getNode(id);
    if (!node) continue;
    if (node.file === refFile) sameFile = id;
    else otherFile = id;
  }
  return otherFile ?? sameFile;
}

function dedup(edges: GraphEdge[]): GraphEdge[] {
  const seen = new Set<string>();
  return edges.filter((e) => {
    const key = `${e.sourceId}→${e.targetId}→${e.kind}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
