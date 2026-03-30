import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execSync } from "child_process";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-incremental");
const INDEX_DIR = join(tmpdir(), "reap-daemon-test-incremental-index");

function gitInit(dir: string) {
  execSync("git init", { cwd: dir, stdio: "ignore" });
  execSync('git config user.email "test@test.com" && git config user.name "test"', { cwd: dir, stdio: "ignore" });
}

function gitCommit(dir: string, msg: string) {
  execSync("git add -A", { cwd: dir, stdio: "ignore" });
  execSync(`git commit -m "${msg}"`, { cwd: dir, stdio: "ignore" });
}

beforeEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(INDEX_DIR, { recursive: true, force: true });
  mkdirSync(join(TEST_DIR, "src"), { recursive: true });
  mkdirSync(INDEX_DIR, { recursive: true });
  gitInit(TEST_DIR);

  writeFileSync(
    join(TEST_DIR, "src", "user.ts"),
    `export interface User { name: string; }\nexport function createUser(name: string): User { return { name }; }`,
  );
  writeFileSync(
    join(TEST_DIR, "src", "service.ts"),
    `import { createUser } from "./user";\nexport function getUser() { return createUser("test"); }`,
  );
  gitCommit(TEST_DIR, "init");
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(INDEX_DIR, { recursive: true, force: true });
});

describe("Incremental indexing", () => {
  test("incremental index processes only changed files", async () => {
    const { IndexManager } = await import("../src/indexer/index.js");
    const mgr = new IndexManager(join(INDEX_DIR, "index.db"));
    await mgr.init();

    // Full index
    const fullResult = await mgr.indexProject(TEST_DIR);
    expect(fullResult.filesProcessed).toBe(2);
    expect(fullResult.nodesCreated).toBeGreaterThanOrEqual(2);

    // Modify only one file and commit
    writeFileSync(
      join(TEST_DIR, "src", "service.ts"),
      `import { createUser } from "./user";\nexport function getUser() { return createUser("updated"); }\nexport function newHelper() { return 42; }`,
    );
    gitCommit(TEST_DIR, "update service");

    // Incremental index should only process the changed file
    const incResult = await mgr.indexProject(TEST_DIR, true);
    expect(incResult.filesProcessed).toBe(1);

    // Existing symbols from user.ts should still be searchable
    const userSymbols = mgr.searchSymbols("createUser");
    expect(userSymbols.length).toBeGreaterThanOrEqual(1);
    expect(userSymbols[0].name).toBe("createUser");

    // New symbol from service.ts should be found
    const newSymbols = mgr.searchSymbols("newHelper");
    expect(newSymbols.length).toBeGreaterThanOrEqual(1);
    expect(newSymbols[0].name).toBe("newHelper");

    mgr.dispose();
  });

  test("incremental with no changes returns zero files processed", async () => {
    const { IndexManager } = await import("../src/indexer/index.js");
    const mgr = new IndexManager(join(INDEX_DIR, "index.db"));
    await mgr.init();

    await mgr.indexProject(TEST_DIR);

    // No changes, incremental should process nothing
    const incResult = await mgr.indexProject(TEST_DIR, true);
    expect(incResult.filesProcessed).toBe(0);
    expect(incResult.nodesCreated).toBe(0);
    expect(incResult.edgesCreated).toBe(0);

    mgr.dispose();
  });

  test("incremental falls back to full index when no lastCommit", async () => {
    const { IndexManager } = await import("../src/indexer/index.js");
    const mgr = new IndexManager(join(INDEX_DIR, "index.db"));
    await mgr.init();

    // Call incremental without a prior full index -- should fall back to full
    const result = await mgr.indexProject(TEST_DIR, true);
    expect(result.filesProcessed).toBe(2);
    expect(result.nodesCreated).toBeGreaterThanOrEqual(2);

    mgr.dispose();
  });

  test("incremental handles file deletion", async () => {
    const { IndexManager } = await import("../src/indexer/index.js");
    const mgr = new IndexManager(join(INDEX_DIR, "index.db"));
    await mgr.init();

    // Full index with 2 files
    await mgr.indexProject(TEST_DIR);
    const beforeStats = mgr.stats();
    expect(beforeStats.fileCount).toBe(2);

    // Delete service.ts and commit
    rmSync(join(TEST_DIR, "src", "service.ts"));
    gitCommit(TEST_DIR, "remove service");

    // Incremental should detect the change
    const incResult = await mgr.indexProject(TEST_DIR, true);
    expect(incResult.filesProcessed).toBeGreaterThanOrEqual(1);

    // service.ts symbols should be removed -- getUser should not be found
    const removed = mgr.searchSymbols("getUser");
    expect(removed.length).toBe(0);

    // user.ts symbols should still exist
    const kept = mgr.searchSymbols("createUser");
    expect(kept.length).toBeGreaterThanOrEqual(1);

    mgr.dispose();
  });
});
