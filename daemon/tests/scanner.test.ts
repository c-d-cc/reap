import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execSync } from "child_process";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-scanner");

beforeEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  mkdirSync(join(TEST_DIR, "src"), { recursive: true });
  execSync("git init", { cwd: TEST_DIR, stdio: "ignore" });
  execSync('git config user.email "test@test.com" && git config user.name "test"', { cwd: TEST_DIR, stdio: "ignore" });

  writeFileSync(join(TEST_DIR, "src", "index.ts"), "export const x = 1;");
  writeFileSync(join(TEST_DIR, "src", "utils.py"), "def foo(): pass");
  writeFileSync(join(TEST_DIR, "README.md"), "# Hello");
  writeFileSync(join(TEST_DIR, ".gitignore"), "node_modules/\n");
  mkdirSync(join(TEST_DIR, "node_modules", "pkg"), { recursive: true });
  writeFileSync(join(TEST_DIR, "node_modules", "pkg", "index.js"), "module.exports = {};");
  execSync("git add -A && git commit -m init", { cwd: TEST_DIR, stdio: "ignore" });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("scanner", () => {
  test("scanFiles returns tracked source files with language", async () => {
    const { scanFiles } = await import("../src/indexer/scanner.js");
    const files = await scanFiles(TEST_DIR);
    const paths = files.map((f) => f.relativePath);
    expect(paths).toContain("src/index.ts");
    expect(paths).toContain("src/utils.py");
  });

  test("excludes non-source files", async () => {
    const { scanFiles } = await import("../src/indexer/scanner.js");
    const files = await scanFiles(TEST_DIR);
    const paths = files.map((f) => f.relativePath);
    expect(paths).not.toContain("README.md");
    expect(paths).not.toContain(".gitignore");
  });

  test("excludes gitignored files", async () => {
    const { scanFiles } = await import("../src/indexer/scanner.js");
    const files = await scanFiles(TEST_DIR);
    const paths = files.map((f) => f.relativePath);
    expect(paths).not.toContain("node_modules/pkg/index.js");
  });

  test("returns language for each file", async () => {
    const { scanFiles } = await import("../src/indexer/scanner.js");
    const files = await scanFiles(TEST_DIR);
    const tsFile = files.find((f) => f.relativePath === "src/index.ts");
    expect(tsFile!.language).toBe("typescript");
    const pyFile = files.find((f) => f.relativePath === "src/utils.py");
    expect(pyFile!.language).toBe("python");
  });

  test("getChangedFiles returns files changed since commit", async () => {
    const { getChangedFiles } = await import("../src/indexer/scanner.js");
    const lastCommit = execSync("git rev-parse HEAD", { cwd: TEST_DIR }).toString().trim();

    writeFileSync(join(TEST_DIR, "src", "new.ts"), "export const y = 2;");
    execSync("git add -A && git commit -m add", { cwd: TEST_DIR, stdio: "ignore" });

    const changed = await getChangedFiles(TEST_DIR, lastCommit);
    expect(changed).toContain("src/new.ts");
    expect(changed).not.toContain("src/index.ts");
  });
});
