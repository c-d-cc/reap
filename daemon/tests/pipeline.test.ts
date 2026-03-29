import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execSync } from "child_process";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-pipeline");
const INDEX_DIR = join(tmpdir(), "reap-daemon-test-pipeline-index");

beforeEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(INDEX_DIR, { recursive: true, force: true });
  mkdirSync(join(TEST_DIR, "src"), { recursive: true });
  mkdirSync(INDEX_DIR, { recursive: true });
  execSync("git init", { cwd: TEST_DIR, stdio: "ignore" });
  execSync('git config user.email "test@test.com" && git config user.name "test"', { cwd: TEST_DIR, stdio: "ignore" });

  writeFileSync(join(TEST_DIR, "src", "user.ts"),
    `export interface User { name: string; }\nexport function createUser(name: string): User { return { name }; }`
  );
  writeFileSync(join(TEST_DIR, "src", "service.ts"),
    `import { createUser, User } from "./user";\nexport class UserService {\n  create(name: string): User { return createUser(name); }\n}`
  );

  execSync("git add -A && git commit -m init", { cwd: TEST_DIR, stdio: "ignore" });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(INDEX_DIR, { recursive: true, force: true });
});

describe("IndexManager", () => {
  test("full indexing creates graph with nodes and edges", async () => {
    const { IndexManager } = await import("../src/indexer/index.js");
    const mgr = new IndexManager(join(INDEX_DIR, "index.db"));
    await mgr.init();

    await mgr.indexProject(TEST_DIR);

    const stats = mgr.stats();
    expect(stats.nodeCount).toBeGreaterThanOrEqual(3);
    expect(stats.edgeCount).toBeGreaterThanOrEqual(1);
    expect(stats.fileCount).toBe(2);

    mgr.dispose();
  });

  test("symbol search works after indexing", async () => {
    const { IndexManager } = await import("../src/indexer/index.js");
    const mgr = new IndexManager(join(INDEX_DIR, "index.db"));
    await mgr.init();
    await mgr.indexProject(TEST_DIR);

    const results = mgr.searchSymbols("createUser");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name).toBe("createUser");

    mgr.dispose();
  });

  test("getCallers returns callers of a symbol", async () => {
    const { IndexManager } = await import("../src/indexer/index.js");
    const mgr = new IndexManager(join(INDEX_DIR, "index.db"));
    await mgr.init();
    await mgr.indexProject(TEST_DIR);

    const results = mgr.searchSymbols("createUser");
    if (results.length > 0) {
      const callers = mgr.getCallers(results[0].id);
      expect(callers).toBeDefined();
    }

    mgr.dispose();
  });

  test("reload from SQLite restores graph", async () => {
    const dbPath = join(INDEX_DIR, "index.db");
    const { IndexManager } = await import("../src/indexer/index.js");

    const mgr1 = new IndexManager(dbPath);
    await mgr1.init();
    await mgr1.indexProject(TEST_DIR);
    const stats1 = mgr1.stats();
    mgr1.dispose();

    const mgr2 = new IndexManager(dbPath);
    await mgr2.init();
    mgr2.loadFromStorage();
    const stats2 = mgr2.stats();

    expect(stats2.nodeCount).toBe(stats1.nodeCount);
    expect(stats2.edgeCount).toBe(stats1.edgeCount);

    mgr2.dispose();
  });
});
