import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execSync } from "child_process";
import { createDaemonServer } from "../src/server.js";
import type { Server } from "http";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-worktree-server");
const PROJECT_DIR = join(tmpdir(), "reap-daemon-test-worktree-project");
let server: Server;

beforeEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(PROJECT_DIR, { recursive: true, force: true });
  mkdirSync(TEST_DIR, { recursive: true });
  mkdirSync(join(PROJECT_DIR, "src"), { recursive: true });
  execSync("git init", { cwd: PROJECT_DIR, stdio: "ignore" });
  execSync('git config user.email "test@test.com" && git config user.name "test"', { cwd: PROJECT_DIR, stdio: "ignore" });
  writeFileSync(join(PROJECT_DIR, "src", "index.ts"), `export function hello(): string { return "world"; }`);
  execSync("git add -A && git commit -m init", { cwd: PROJECT_DIR, stdio: "ignore" });
});

afterEach(async () => {
  if (server) server.close();
  await new Promise(r => setTimeout(r, 100));
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(PROJECT_DIR, { recursive: true, force: true });
});

describe("Worktree index management", () => {
  test("indexing with worktree param creates separate index", async () => {
    server = createDaemonServer({ port: 0, idleTimeoutMs: 60_000, daemonRoot: TEST_DIR });
    const port = await new Promise<number>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        resolve(typeof addr === "object" && addr ? addr.port : 0);
      });
    });
    const base = `http://localhost:${port}`;

    // Register
    const regRes = await fetch(`${base}/projects/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: PROJECT_DIR, name: "test" }),
    });
    const projectId = ((await regRes.json()) as any).data.id;

    // Index main
    const mainRes = await fetch(`${base}/projects/${projectId}/index`, { method: "POST" });
    expect((await mainRes.json() as any).status).toBe("ok");

    // Index with worktree param
    const wtRes = await fetch(`${base}/projects/${projectId}/index?worktree=feature-branch`, { method: "POST" });
    expect((await wtRes.json() as any).status).toBe("ok");

    // Query main
    const mainSymbols = await fetch(`${base}/projects/${projectId}/symbols?q=hello`);
    expect((await mainSymbols.json() as any).status).toBe("ok");

    // Query worktree
    const wtSymbols = await fetch(`${base}/projects/${projectId}/symbols?q=hello&worktree=feature-branch`);
    expect((await wtSymbols.json() as any).status).toBe("ok");
  });
});
