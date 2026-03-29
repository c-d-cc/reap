import { describe, test, expect } from "bun:test";
import { CodeGraph } from "../src/indexer/graph.js";

describe("Process tracer", () => {
  test("traces execution flow from entry point", async () => {
    const { traceProcesses } = await import("../src/indexer/process-tracer.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "main.ts::main", kind: "function", name: "main", file: "main.ts", line: 1 });
    graph.addNode({ id: "svc.ts::handle", kind: "function", name: "handle", file: "svc.ts", line: 1 });
    graph.addNode({ id: "db.ts::query", kind: "function", name: "query", file: "db.ts", line: 1 });
    graph.addEdge({ sourceId: "main.ts::main", targetId: "svc.ts::handle", kind: "CALLS" });
    graph.addEdge({ sourceId: "svc.ts::handle", targetId: "db.ts::query", kind: "CALLS" });
    const processes = traceProcesses(graph);
    expect(processes.length).toBeGreaterThanOrEqual(1);
    const mainProcess = processes.find(p => p.entryPoint === "main.ts::main");
    expect(mainProcess).toBeDefined();
    expect(mainProcess!.nodeIds).toContain("svc.ts::handle");
    expect(mainProcess!.nodeIds).toContain("db.ts::query");
  });

  test("identifies entry points (functions with no callers)", async () => {
    const { traceProcesses } = await import("../src/indexer/process-tracer.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a::entry", kind: "function", name: "entry", file: "a.ts", line: 1 });
    graph.addNode({ id: "b::helper", kind: "function", name: "helper", file: "b.ts", line: 1 });
    graph.addEdge({ sourceId: "a::entry", targetId: "b::helper", kind: "CALLS" });
    const processes = traceProcesses(graph);
    const entryProcess = processes.find(p => p.entryPoint === "a::entry");
    expect(entryProcess).toBeDefined();
  });

  test("limits trace depth to prevent infinite loops", async () => {
    const { traceProcesses } = await import("../src/indexer/process-tracer.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a::x", kind: "function", name: "x", file: "a.ts", line: 1 });
    graph.addNode({ id: "b::y", kind: "function", name: "y", file: "b.ts", line: 1 });
    graph.addEdge({ sourceId: "a::x", targetId: "b::y", kind: "CALLS" });
    graph.addEdge({ sourceId: "b::y", targetId: "a::x", kind: "CALLS" });
    const processes = traceProcesses(graph);
    expect(processes).toBeDefined();
  });
});
