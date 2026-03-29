import { describe, test, expect } from "bun:test";
import { CodeGraph } from "../src/indexer/graph.js";

describe("Impact analysis", () => {
  test("finds direct importers", async () => {
    const { analyzeImpact } = await import("../src/indexer/impact.js");
    const graph = new CodeGraph();
    graph.addEdge({ sourceId: "file::a.ts", targetId: "file::b.ts", kind: "IMPORTS" });
    graph.addEdge({ sourceId: "file::b.ts", targetId: "file::c.ts", kind: "IMPORTS" });
    graph.addNode({ id: "c.ts::foo", kind: "function", name: "foo", file: "c.ts", line: 1 });
    const result = analyzeImpact(["c.ts"], graph);
    expect(result.directFiles).toContain("b.ts");
  });

  test("finds indirect importers via BFS", async () => {
    const { analyzeImpact } = await import("../src/indexer/impact.js");
    const graph = new CodeGraph();
    graph.addEdge({ sourceId: "file::a.ts", targetId: "file::b.ts", kind: "IMPORTS" });
    graph.addEdge({ sourceId: "file::b.ts", targetId: "file::c.ts", kind: "IMPORTS" });
    graph.addNode({ id: "c.ts::foo", kind: "function", name: "foo", file: "c.ts", line: 1 });
    const result = analyzeImpact(["c.ts"], graph);
    expect(result.indirectFiles).toContain("a.ts");
  });

  test("computes blast radius as ratio", async () => {
    const { analyzeImpact } = await import("../src/indexer/impact.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a.ts::x", kind: "function", name: "x", file: "a.ts", line: 1 });
    graph.addNode({ id: "b.ts::y", kind: "function", name: "y", file: "b.ts", line: 1 });
    graph.addNode({ id: "c.ts::z", kind: "function", name: "z", file: "c.ts", line: 1 });
    graph.addEdge({ sourceId: "file::a.ts", targetId: "file::b.ts", kind: "IMPORTS" });
    const result = analyzeImpact(["b.ts"], graph);
    expect(result.blastRadius).toBeGreaterThan(0);
    expect(result.blastRadius).toBeLessThanOrEqual(1);
  });
});
