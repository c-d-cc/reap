import { describe, test, expect } from "bun:test";
import { CodeGraph } from "../src/indexer/graph.js";

describe("CallResolver", () => {
  test("matches reference to definition by name", async () => {
    const { resolveCalls } = await import("../src/indexer/call-resolver.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a.ts::createUser", kind: "function", name: "createUser", file: "a.ts", line: 1 });
    graph.addNode({ id: "b.ts::main", kind: "function", name: "main", file: "b.ts", line: 1 });

    const refs = [{ name: "createUser", kind: "call", line: 5, file: "b.ts" }];
    const edges = resolveCalls(refs, graph);
    expect(edges).toHaveLength(1);
    expect(edges[0].sourceId).toBe("b.ts::main");
    expect(edges[0].targetId).toBe("a.ts::createUser");
    expect(edges[0].kind).toBe("CALLS");
  });

  test("matches class reference", async () => {
    const { resolveCalls } = await import("../src/indexer/call-resolver.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a.ts::Base", kind: "class", name: "Base", file: "a.ts", line: 1 });
    graph.addNode({ id: "b.ts::Child", kind: "class", name: "Child", file: "b.ts", line: 1 });

    const refs = [{ name: "Base", kind: "class", line: 1, file: "b.ts" }];
    const edges = resolveCalls(refs, graph);
    expect(edges.length).toBeGreaterThanOrEqual(1);
  });

  test("ignores unresolvable references", async () => {
    const { resolveCalls } = await import("../src/indexer/call-resolver.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a.ts::foo", kind: "function", name: "foo", file: "a.ts", line: 1 });

    const refs = [{ name: "nonexistent", kind: "call", line: 1, file: "b.ts" }];
    const edges = resolveCalls(refs, graph);
    expect(edges).toHaveLength(0);
  });
});
