import type { ProcessFlow } from "../types.js";
import type { CodeGraph } from "./graph.js";

const MAX_DEPTH = 10;
const MAX_PROCESSES = 75;

export function traceProcesses(graph: CodeGraph): ProcessFlow[] {
  const nodes = graph.allNodes();
  const callEdges = graph.allEdges().filter(e => e.kind === "CALLS");
  const calledIds = new Set(callEdges.map(e => e.targetId));
  const entryPoints = nodes.filter(n => (n.kind === "function" || n.kind === "method") && !calledIds.has(n.id));

  const processes: ProcessFlow[] = [];
  for (const entry of entryPoints) {
    if (processes.length >= MAX_PROCESSES) break;
    const nodeIds = new Set<string>();
    traceForward(entry.id, graph, nodeIds, 0);
    if (nodeIds.size > 0) {
      processes.push({
        id: `process-${processes.length}`,
        label: generateLabel(entry, nodeIds, graph),
        entryPoint: entry.id,
        nodeIds: [...nodeIds],
      });
    }
  }
  return processes;
}

function traceForward(nodeId: string, graph: CodeGraph, visited: Set<string>, depth: number): void {
  if (depth >= MAX_DEPTH || visited.has(nodeId)) return;
  visited.add(nodeId);
  for (const edge of graph.getEdgesFrom(nodeId, "CALLS")) {
    traceForward(edge.targetId, graph, visited, depth + 1);
  }
}

function generateLabel(entry: { id: string; name: string }, nodeIds: Set<string>, graph: CodeGraph): string {
  const names = [entry.name];
  for (const id of nodeIds) {
    if (id === entry.id) continue;
    const node = graph.getNode(id);
    if (node && names.length < 3) names.push(node.name);
  }
  return names.join(" → ");
}
