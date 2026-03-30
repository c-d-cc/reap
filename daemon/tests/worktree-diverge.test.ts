import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execSync } from "child_process";
import { createDaemonServer } from "../src/server.js";
import type { Server } from "http";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-wt-diverge");
const PROJECT_DIR = join(tmpdir(), "reap-daemon-test-wt-diverge-project");
let server: Server;
let port: number;
let base: string;

async function startServer(): Promise<void> {
  mkdirSync(TEST_DIR, { recursive: true });
  server = createDaemonServer({ port: 0, idleTimeoutMs: 60_000, daemonRoot: TEST_DIR });
  port = await new Promise<number>((resolve) => {
    server.listen(0, () => {
      const addr = server.address();
      resolve(typeof addr === "object" && addr ? addr.port : 0);
    });
  });
  base = `http://localhost:${port}`;
}

beforeEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(PROJECT_DIR, { recursive: true, force: true });
  mkdirSync(join(PROJECT_DIR, "src"), { recursive: true });
  execSync("git init", { cwd: PROJECT_DIR, stdio: "ignore" });
  execSync('git config user.email "test@test.com" && git config user.name "test"', { cwd: PROJECT_DIR, stdio: "ignore" });
  writeFileSync(
    join(PROJECT_DIR, "src", "index.ts"),
    `export function hello(): string { return "world"; }`,
  );
  writeFileSync(
    join(PROJECT_DIR, "src", "utils.ts"),
    `export function add(a: number, b: number): number { return a + b; }`,
  );
  execSync("git add -A && git commit -m init", { cwd: PROJECT_DIR, stdio: "ignore" });
});

afterEach(async () => {
  if (server) server.close();
  await new Promise((r) => setTimeout(r, 100));
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(PROJECT_DIR, { recursive: true, force: true });
});

describe("Worktree fork and diverge", () => {
  test("worktree index diverges from main after modification", async () => {
    await startServer();

    // Register project
    const regRes = await fetch(`${base}/projects/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: PROJECT_DIR, name: "wt-test" }),
    });
    const regBody = (await regRes.json()) as { status: string; data: { id: string } };
    expect(regBody.status).toBe("ok");
    const projectId = regBody.data.id;

    // Index main
    const mainIndexRes = await fetch(`${base}/projects/${projectId}/index`, { method: "POST" });
    expect(((await mainIndexRes.json()) as any).status).toBe("ok");

    // Fork worktree index from main
    const wtIndexRes = await fetch(`${base}/projects/${projectId}/index?worktree=feature`, { method: "POST" });
    expect(((await wtIndexRes.json()) as any).status).toBe("ok");

    // At this point both main and worktree should have the same symbols
    const mainSymbols1 = await fetch(`${base}/projects/${projectId}/symbols?q=hello`);
    const mainBody1 = (await mainSymbols1.json()) as { status: string; data: Array<{ name: string }> };
    expect(mainBody1.data.length).toBeGreaterThanOrEqual(1);

    const wtSymbols1 = await fetch(`${base}/projects/${projectId}/symbols?q=hello&worktree=feature`);
    const wtBody1 = (await wtSymbols1.json()) as { status: string; data: Array<{ name: string }> };
    expect(wtBody1.data.length).toBeGreaterThanOrEqual(1);

    // Now modify the project (simulating worktree changes) and re-index worktree
    // Add a new file that only the worktree will pick up
    writeFileSync(
      join(PROJECT_DIR, "src", "feature.ts"),
      `export function featureOnly(): boolean { return true; }`,
    );
    execSync("git add -A && git commit -m 'add feature'", { cwd: PROJECT_DIR, stdio: "ignore" });

    // Re-index worktree only
    const wtReindexRes = await fetch(`${base}/projects/${projectId}/index?worktree=feature`, { method: "POST" });
    expect(((await wtReindexRes.json()) as any).status).toBe("ok");

    // Worktree should have the new symbol
    const wtSymbols2 = await fetch(`${base}/projects/${projectId}/symbols?q=featureOnly&worktree=feature`);
    const wtBody2 = (await wtSymbols2.json()) as { status: string; data: Array<{ name: string }> };
    expect(wtBody2.data.length).toBeGreaterThanOrEqual(1);
    expect(wtBody2.data[0].name).toBe("featureOnly");

    // Main should NOT have the new symbol (not re-indexed)
    const mainSymbols2 = await fetch(`${base}/projects/${projectId}/symbols?q=featureOnly`);
    const mainBody2 = (await mainSymbols2.json()) as { status: string; data: Array<{ name: string }> };
    expect(mainBody2.data.length).toBe(0);
  });

  test("multiple worktrees are independent", async () => {
    await startServer();

    const regRes = await fetch(`${base}/projects/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: PROJECT_DIR, name: "multi-wt" }),
    });
    const projectId = ((await regRes.json()) as any).data.id;

    // Index main
    await fetch(`${base}/projects/${projectId}/index`, { method: "POST" });

    // Fork two worktrees
    await fetch(`${base}/projects/${projectId}/index?worktree=wt-a`, { method: "POST" });
    await fetch(`${base}/projects/${projectId}/index?worktree=wt-b`, { method: "POST" });

    // Modify project and re-index only wt-a
    writeFileSync(
      join(PROJECT_DIR, "src", "only-a.ts"),
      `export function onlyInA(): void {}`,
    );
    execSync("git add -A && git commit -m 'add only-a'", { cwd: PROJECT_DIR, stdio: "ignore" });

    await fetch(`${base}/projects/${projectId}/index?worktree=wt-a`, { method: "POST" });

    // wt-a should have the symbol
    const aRes = await fetch(`${base}/projects/${projectId}/symbols?q=onlyInA&worktree=wt-a`);
    const aBody = (await aRes.json()) as { status: string; data: Array<{ name: string }> };
    expect(aBody.data.length).toBeGreaterThanOrEqual(1);

    // wt-b should NOT have it (not re-indexed)
    const bRes = await fetch(`${base}/projects/${projectId}/symbols?q=onlyInA&worktree=wt-b`);
    const bBody = (await bRes.json()) as { status: string; data: Array<{ name: string }> };
    expect(bBody.data.length).toBe(0);

    // main should NOT have it either
    const mainRes = await fetch(`${base}/projects/${projectId}/symbols?q=onlyInA`);
    const mainBody = (await mainRes.json()) as { status: string; data: Array<{ name: string }> };
    expect(mainBody.data.length).toBe(0);
  });
});
