import type { CodeGraph } from "./graph.js";
import type { ImpactResult } from "../types.js";

export function analyzeImpact(changedFiles: string[], graph: CodeGraph): ImpactResult {
  const directFiles = new Set<string>();
  const indirectFiles = new Set<string>();
  const affectedSymbols = new Set<string>();
  const changedSet = new Set(changedFiles);

  for (const file of changedFiles) {
    const importers = graph.getEdgesTo(`file::${file}`, "IMPORTS");
    for (const edge of importers) {
      const f = edge.sourceId.replace("file::", "");
      if (!changedSet.has(f)) directFiles.add(f);
    }
    for (const node of graph.getNodesByFile(file)) {
      affectedSymbols.add(node.id);
      for (const callEdge of graph.getEdgesTo(node.id, "CALLS")) {
        affectedSymbols.add(callEdge.sourceId);
      }
    }
  }

  // BFS for indirect importers
  const queue = [...directFiles];
  const visited = new Set([...changedFiles, ...directFiles]);
  while (queue.length > 0) {
    const current = queue.shift()!;
    const importers = graph.getEdgesTo(`file::${current}`, "IMPORTS");
    for (const edge of importers) {
      const f = edge.sourceId.replace("file::", "");
      if (!visited.has(f)) {
        visited.add(f);
        indirectFiles.add(f);
        queue.push(f);
      }
    }
  }

  const totalFiles = graph.stats().fileCount || 1;
  return {
    directFiles: [...directFiles],
    indirectFiles: [...indirectFiles],
    affectedSymbols: [...affectedSymbols],
    blastRadius: Math.min(1, (changedFiles.length + directFiles.size + indirectFiles.size) / totalFiles),
  };
}
