import type { Community } from "../types.js";
import type { CodeGraph } from "./graph.js";

export function detectCommunities(graph: CodeGraph): Community[] {
  const nodes = graph.allNodes();
  const edges = graph.allEdges().filter(e => e.kind === "CALLS" || e.kind === "IMPORTS");
  if (nodes.length === 0) return [];

  const adj = new Map<string, Set<string>>();
  for (const node of nodes) adj.set(node.id, new Set());
  for (const edge of edges) {
    if (adj.has(edge.sourceId) && adj.has(edge.targetId)) {
      adj.get(edge.sourceId)!.add(edge.targetId);
      adj.get(edge.targetId)!.add(edge.sourceId);
    }
  }

  const visited = new Set<string>();
  const components: string[][] = [];
  for (const node of nodes) {
    if (visited.has(node.id)) continue;
    const component: string[] = [];
    const queue = [node.id];
    visited.add(node.id);
    while (queue.length > 0) {
      const current = queue.shift()!;
      component.push(current);
      for (const neighbor of (adj.get(current) ?? [])) {
        if (!visited.has(neighbor)) { visited.add(neighbor); queue.push(neighbor); }
      }
    }
    components.push(component);
  }

  return components.map((nodeIds, i) => {
    const label = generateLabel(nodeIds, graph);
    const cohesion = computeCohesion(nodeIds, adj);
    return { id: `community-${i}`, label, nodeIds, cohesion };
  });
}

function generateLabel(nodeIds: string[], graph: CodeGraph): string {
  const files = new Set<string>();
  for (const id of nodeIds) { const n = graph.getNode(id); if (n) files.add(n.file); }
  const dirs = [...files].map(f => f.split("/").slice(0, -1).join("/")).filter(Boolean);
  if (dirs.length === 0) return `group-${nodeIds.length}`;
  const counts = new Map<string, number>();
  for (const dir of dirs) counts.set(dir, (counts.get(dir) ?? 0) + 1);
  const [topDir] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return topDir || `group-${nodeIds.length}`;
}

function computeCohesion(nodeIds: string[], adj: Map<string, Set<string>>): number {
  if (nodeIds.length <= 1) return 1;
  const nodeSet = new Set(nodeIds);
  let internal = 0, total = 0;
  for (const id of nodeIds) {
    for (const neighbor of (adj.get(id) ?? [])) { total++; if (nodeSet.has(neighbor)) internal++; }
  }
  return total === 0 ? 0 : internal / total;
}
