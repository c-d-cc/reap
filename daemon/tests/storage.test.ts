import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-storage");
const TEST_DB = join(TEST_DIR, "index.db");

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("IndexStorage", () => {
  test("creates schema on open", async () => {
    const { IndexStorage } = await import("../src/indexer/storage.js");
    const storage = new IndexStorage(TEST_DB);
    storage.open();
    storage.close();
  });

  test("saves and loads nodes", async () => {
    const { IndexStorage } = await import("../src/indexer/storage.js");
    const storage = new IndexStorage(TEST_DB);
    storage.open();
    storage.saveNodes([
      { id: "a.ts::foo", kind: "function", name: "foo", file: "a.ts", line: 1 },
      { id: "a.ts::Bar", kind: "class", name: "Bar", file: "a.ts", line: 10 },
    ]);
    const nodes = storage.loadNodes();
    expect(nodes).toHaveLength(2);
    expect(nodes[0].name).toBe("foo");
    storage.close();
  });

  test("saves and loads edges", async () => {
    const { IndexStorage } = await import("../src/indexer/storage.js");
    const storage = new IndexStorage(TEST_DB);
    storage.open();
    storage.saveEdges([
      { sourceId: "a.ts::foo", targetId: "b.ts::bar", kind: "CALLS" },
    ]);
    const edges = storage.loadEdges();
    expect(edges).toHaveLength(1);
    expect(edges[0].kind).toBe("CALLS");
    storage.close();
  });

  test("saves and loads file metadata", async () => {
    const { IndexStorage } = await import("../src/indexer/storage.js");
    const storage = new IndexStorage(TEST_DB);
    storage.open();
    storage.saveFile({ path: "a.ts", language: "typescript", mtime: 1234567890, lastCommit: "abc123" });
    const file = storage.getFile("a.ts");
    expect(file).not.toBeNull();
    expect(file!.language).toBe("typescript");
    storage.close();
  });

  test("removeByFile clears nodes, edges, and file record", async () => {
    const { IndexStorage } = await import("../src/indexer/storage.js");
    const storage = new IndexStorage(TEST_DB);
    storage.open();
    storage.saveFile({ path: "a.ts", language: "typescript", mtime: 0, lastCommit: "" });
    storage.saveNodes([{ id: "a.ts::foo", kind: "function", name: "foo", file: "a.ts", line: 1 }]);
    storage.saveEdges([{ sourceId: "a.ts::foo", targetId: "b.ts::bar", kind: "CALLS" }]);

    storage.removeByFile("a.ts");
    expect(storage.getFile("a.ts")).toBeNull();
    expect(storage.loadNodes().filter((n) => n.file === "a.ts")).toHaveLength(0);
    storage.close();
  });

  test("saveMeta and loadMeta", async () => {
    const { IndexStorage } = await import("../src/indexer/storage.js");
    const storage = new IndexStorage(TEST_DB);
    storage.open();
    storage.saveMeta("lastCommit", "abc123");
    expect(storage.loadMeta("lastCommit")).toBe("abc123");
    storage.close();
  });
});
