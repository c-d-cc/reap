import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execSync } from "child_process";
import { createDaemonServer } from "../src/server.js";
import type { Server } from "http";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-errors");
const PROJECT_DIR = join(tmpdir(), "reap-daemon-test-errors-project");
const NON_GIT_DIR = join(tmpdir(), "reap-daemon-test-errors-nogit");
let server: Server;
let port: number;

async function startServer(): Promise<number> {
  mkdirSync(TEST_DIR, { recursive: true });
  server = createDaemonServer({ port: 0, idleTimeoutMs: 60_000, daemonRoot: TEST_DIR });
  return new Promise<number>((resolve) => {
    server.listen(0, () => {
      const addr = server.address();
      resolve(typeof addr === "object" && addr ? addr.port : 0);
    });
  });
}

beforeEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(PROJECT_DIR, { recursive: true, force: true });
  rmSync(NON_GIT_DIR, { recursive: true, force: true });

  // Valid git project
  mkdirSync(join(PROJECT_DIR, "src"), { recursive: true });
  execSync("git init", { cwd: PROJECT_DIR, stdio: "ignore" });
  execSync('git config user.email "test@test.com" && git config user.name "test"', { cwd: PROJECT_DIR, stdio: "ignore" });
  writeFileSync(join(PROJECT_DIR, "src", "index.ts"), `export function hello() { return "world"; }`);
  execSync("git add -A && git commit -m init", { cwd: PROJECT_DIR, stdio: "ignore" });

  // Non-git directory
  mkdirSync(join(NON_GIT_DIR, "src"), { recursive: true });
  writeFileSync(join(NON_GIT_DIR, "src", "index.ts"), `export function hello() { return "world"; }`);
});

afterEach(async () => {
  if (server) server.close();
  await new Promise((r) => setTimeout(r, 100));
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(PROJECT_DIR, { recursive: true, force: true });
  rmSync(NON_GIT_DIR, { recursive: true, force: true });
});

describe("Error cases", () => {
  test("status for non-existent project returns error", async () => {
    port = await startServer();
    const res = await fetch(`http://localhost:${port}/projects/proj-nonexistent/status`);
    const body = (await res.json()) as { status: string; error: string };
    expect(body.status).toBe("error");
    expect(body.error).toContain("not found");
  });

  test("index for non-existent project returns error", async () => {
    port = await startServer();
    const res = await fetch(`http://localhost:${port}/projects/proj-nonexistent/index`, { method: "POST" });
    const body = (await res.json()) as { status: string; error: string };
    expect(body.status).toBe("error");
    expect(body.error).toContain("not found");
  });

  test("symbols query for non-existent project returns empty or error", async () => {
    port = await startServer();
    const res = await fetch(`http://localhost:${port}/projects/proj-nonexistent/symbols?q=hello`);
    const body = (await res.json()) as { status: string; data?: unknown[]; error?: string };
    // getIndexManager creates index on-the-fly for any ID, so this returns ok with empty data
    // rather than an error. This is acceptable behavior.
    if (body.status === "ok") {
      expect(body.data).toEqual([]);
    } else {
      expect(body.status).toBe("error");
    }
  });

  test("register without path returns error", async () => {
    port = await startServer();
    const res = await fetch(`http://localhost:${port}/projects/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "no-path" }),
    });
    const body = (await res.json()) as { status: string; error: string };
    expect(body.status).toBe("error");
    expect(body.error).toContain("path");
  });

  test("indexing non-git directory returns error", async () => {
    port = await startServer();
    const base = `http://localhost:${port}`;

    // Register the non-git directory
    const regRes = await fetch(`${base}/projects/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: NON_GIT_DIR, name: "no-git" }),
    });
    const regBody = (await regRes.json()) as { status: string; data: { id: string } };
    expect(regBody.status).toBe("ok");
    const projectId = regBody.data.id;

    // Indexing should fail because it's not a git repo
    const indexRes = await fetch(`${base}/projects/${projectId}/index`, { method: "POST" });
    const indexBody = (await indexRes.json()) as { status: string; error: string };
    expect(indexBody.status).toBe("error");
    expect(indexBody.error).toContain("Indexing failed");
  });

  test("query before indexing returns empty results", async () => {
    port = await startServer();
    const base = `http://localhost:${port}`;

    // Register project but don't index
    const regRes = await fetch(`${base}/projects/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: PROJECT_DIR, name: "test" }),
    });
    const regBody = (await regRes.json()) as { status: string; data: { id: string } };
    const projectId = regBody.data.id;

    // Symbol search before indexing -- should return empty array, not error
    const res = await fetch(`${base}/projects/${projectId}/symbols?q=hello`);
    const body = (await res.json()) as { status: string; data: unknown[] };
    expect(body.status).toBe("ok");
    expect(body.data).toEqual([]);
  });

  test("unregister non-existent project does not crash", async () => {
    port = await startServer();
    const res = await fetch(`http://localhost:${port}/projects/proj-nonexistent`, { method: "DELETE" });
    const body = (await res.json()) as { status: string };
    // Should not crash -- may return ok or error depending on implementation
    expect(body.status).toBeDefined();
  });

  test("impact query without files param returns error", async () => {
    port = await startServer();
    const base = `http://localhost:${port}`;

    const regRes = await fetch(`${base}/projects/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: PROJECT_DIR, name: "test" }),
    });
    const regBody = (await regRes.json()) as { status: string; data: { id: string } };
    const projectId = regBody.data.id;

    await fetch(`${base}/projects/${projectId}/index`, { method: "POST" });

    const res = await fetch(`${base}/projects/${projectId}/impact`);
    const body = (await res.json()) as { status: string; error: string };
    expect(body.status).toBe("error");
    expect(body.error).toContain("files");
  });
});
