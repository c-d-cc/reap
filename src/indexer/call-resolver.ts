import type { GraphEdge, EdgeKind } from "./types.js";
import { edgeKey, type CodeGraph } from "./graph.js";

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

/**
 * Which definition of this name the reference means.
 *
 * Resolution is by name, so a name defined in more than one file is a guess —
 * but it must be a *reproducible* guess, and a better one where the graph
 * already knows the answer. The previous version kept the last candidate it
 * happened to iterate past, which made the result depend on node insertion
 * order: an incremental run re-parses a file and moves its symbols to the end
 * of the map, so the same repository resolved differently after an ordinary
 * commit than after a full rebuild. `reap index callers` then named a function
 * that had never called anything.
 *
 * The order below is preference, and each step is total:
 *
 *   1. a file the referencing file actually imports — the graph knows this,
 *      and it is the answer a reader would give
 *   2. the referencing file itself
 *   3. any other definition, by path, so ties break the same way every time
 *
 * `resolveCalls` is a whole-graph pass and `runIncrementalPipeline` now clears
 * CALLS before re-running it, so this function's determinism is what makes an
 * incremental index equal to a rebuilt one.
 */
function pickBestTarget(targetIds: string[], refFile: string, _sourceId: string, graph: CodeGraph): string | null {
  const imported: string[] = [];
  const sameFile: string[] = [];
  const other: string[] = [];

  const importedFiles = new Set(
    graph.getEdgesFrom(`file::${refFile}`, "IMPORTS").map((e) => e.targetId.replace(/^file::/, "")),
  );

  for (const id of targetIds) {
    const node = graph.getNode(id);
    if (!node) continue;
    if (importedFiles.has(node.file)) imported.push(id);
    else if (node.file === refFile) sameFile.push(id);
    else other.push(id);
  }

  const first = (ids: string[]): string | null => (ids.length === 0 ? null : ids.slice().sort()[0]);
  return first(imported) ?? first(sameFile) ?? first(other);
}

function dedup(edges: GraphEdge[]): GraphEdge[] {
  // `edgeKey` rather than a local spelling. This was the sixth place that knew
  // how to identify an edge, and two of the first five disagreeing is what
  // silently emptied the call graph (gen-089 D1a). Harmless here because
  // `addEdge` dedups too — kept consistent so the next reader does not have to
  // work out whether it matters.
  const seen = new Set<string>();
  return edges.filter((e) => {
    const key = edgeKey(e);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
