import { describe, test, expect } from "bun:test";

describe("CodeGraph", () => {
  test("addNode and getNode", async () => {
    const { CodeGraph } = await import("../src/indexer/graph.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "src/a.ts::foo", kind: "function", name: "foo", file: "src/a.ts", line: 1 });
    const node = graph.getNode("src/a.ts::foo");
    expect(node).not.toBeNull();
    expect(node!.name).toBe("foo");
  });

  test("addEdge and getEdges", async () => {
    const { CodeGraph } = await import("../src/indexer/graph.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a::foo", kind: "function", name: "foo", file: "a.ts", line: 1 });
    graph.addNode({ id: "b::bar", kind: "function", name: "bar", file: "b.ts", line: 1 });
    graph.addEdge({ sourceId: "a::foo", targetId: "b::bar", kind: "CALLS" });
    const edges = graph.getEdgesFrom("a::foo");
    expect(edges).toHaveLength(1);
    expect(edges[0].targetId).toBe("b::bar");
  });

  test("getEdgesTo returns incoming edges", async () => {
    const { CodeGraph } = await import("../src/indexer/graph.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a::foo", kind: "function", name: "foo", file: "a.ts", line: 1 });
    graph.addNode({ id: "b::bar", kind: "function", name: "bar", file: "b.ts", line: 1 });
    graph.addEdge({ sourceId: "a::foo", targetId: "b::bar", kind: "CALLS" });
    const edges = graph.getEdgesTo("b::bar");
    expect(edges).toHaveLength(1);
    expect(edges[0].sourceId).toBe("a::foo");
  });

  test("getNodesByFile returns all nodes in a file", async () => {
    const { CodeGraph } = await import("../src/indexer/graph.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a.ts::foo", kind: "function", name: "foo", file: "a.ts", line: 1 });
    graph.addNode({ id: "a.ts::bar", kind: "function", name: "bar", file: "a.ts", line: 5 });
    graph.addNode({ id: "b.ts::baz", kind: "function", name: "baz", file: "b.ts", line: 1 });
    const nodes = graph.getNodesByFile("a.ts");
    expect(nodes).toHaveLength(2);
  });

  test("removeByFile removes nodes and their edges", async () => {
    const { CodeGraph } = await import("../src/indexer/graph.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a.ts::foo", kind: "function", name: "foo", file: "a.ts", line: 1 });
    graph.addNode({ id: "b.ts::bar", kind: "function", name: "bar", file: "b.ts", line: 1 });
    graph.addEdge({ sourceId: "a.ts::foo", targetId: "b.ts::bar", kind: "CALLS" });
    graph.removeByFile("a.ts");
    expect(graph.getNode("a.ts::foo")).toBeNull();
    expect(graph.getEdgesTo("b.ts::bar")).toHaveLength(0);
  });

  test("searchNodes finds by name prefix", async () => {
    const { CodeGraph } = await import("../src/indexer/graph.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a.ts::createUser", kind: "function", name: "createUser", file: "a.ts", line: 1 });
    graph.addNode({ id: "a.ts::createPost", kind: "function", name: "createPost", file: "a.ts", line: 5 });
    graph.addNode({ id: "a.ts::deleteUser", kind: "function", name: "deleteUser", file: "a.ts", line: 10 });
    const results = graph.searchNodes("create");
    expect(results).toHaveLength(2);
  });

  test("stats returns node and edge counts", async () => {
    const { CodeGraph } = await import("../src/indexer/graph.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a::foo", kind: "function", name: "foo", file: "a.ts", line: 1 });
    graph.addNode({ id: "b::bar", kind: "function", name: "bar", file: "b.ts", line: 1 });
    graph.addEdge({ sourceId: "a::foo", targetId: "b::bar", kind: "CALLS" });
    const s = graph.stats();
    expect(s.nodeCount).toBe(2);
    expect(s.edgeCount).toBe(1);
  });
});
