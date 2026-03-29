import { describe, test, expect } from "bun:test";
import { CodeGraph } from "../src/indexer/graph.js";

describe("Community detection", () => {
  test("detects separate communities from disconnected clusters", async () => {
    const { detectCommunities } = await import("../src/indexer/community.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "auth.ts::login", kind: "function", name: "login", file: "auth.ts", line: 1 });
    graph.addNode({ id: "auth.ts::logout", kind: "function", name: "logout", file: "auth.ts", line: 5 });
    graph.addEdge({ sourceId: "auth.ts::login", targetId: "auth.ts::logout", kind: "CALLS" });
    graph.addNode({ id: "data.ts::fetch", kind: "function", name: "fetch", file: "data.ts", line: 1 });
    graph.addNode({ id: "data.ts::parse", kind: "function", name: "parse", file: "data.ts", line: 5 });
    graph.addEdge({ sourceId: "data.ts::fetch", targetId: "data.ts::parse", kind: "CALLS" });
    const communities = detectCommunities(graph);
    expect(communities.length).toBeGreaterThanOrEqual(2);
  });

  test("assigns all nodes to communities", async () => {
    const { detectCommunities } = await import("../src/indexer/community.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a::x", kind: "function", name: "x", file: "a.ts", line: 1 });
    graph.addNode({ id: "b::y", kind: "function", name: "y", file: "b.ts", line: 1 });
    graph.addEdge({ sourceId: "a::x", targetId: "b::y", kind: "CALLS" });
    const communities = detectCommunities(graph);
    const allNodeIds = communities.flatMap(c => c.nodeIds);
    expect(allNodeIds).toContain("a::x");
    expect(allNodeIds).toContain("b::y");
  });

  test("generates labels from common file prefixes", async () => {
    const { detectCommunities } = await import("../src/indexer/community.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "src/auth/login.ts::login", kind: "function", name: "login", file: "src/auth/login.ts", line: 1 });
    graph.addNode({ id: "src/auth/session.ts::validate", kind: "function", name: "validate", file: "src/auth/session.ts", line: 1 });
    graph.addEdge({ sourceId: "src/auth/login.ts::login", targetId: "src/auth/session.ts::validate", kind: "CALLS" });
    const communities = detectCommunities(graph);
    expect(communities.length).toBeGreaterThanOrEqual(1);
    expect(communities[0].label).toBeDefined();
  });
});
