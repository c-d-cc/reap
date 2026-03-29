import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execSync } from "child_process";
import { createDaemonServer } from "../src/server.js";
import type { Server } from "http";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-indexing-api");
const PROJECT_DIR = join(tmpdir(), "reap-daemon-test-indexing-project");
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
  // Small delay to let server fully close
  await new Promise(r => setTimeout(r, 100));
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(PROJECT_DIR, { recursive: true, force: true });
});

describe("Indexing via API", () => {
  test("POST /projects/:id/index triggers indexing and returns stats", async () => {
    server = createDaemonServer({ port: 0, idleTimeoutMs: 60_000, daemonRoot: TEST_DIR });
    const port = await new Promise<number>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        resolve(typeof addr === "object" && addr ? addr.port : 0);
      });
    });
    const base = `http://localhost:${port}`;

    // Register project
    const regRes = await fetch(`${base}/projects/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: PROJECT_DIR, name: "test-project" }),
    });
    const regBody = await regRes.json();
    const projectId = regBody.data.id;

    // Trigger indexing
    const indexRes = await fetch(`${base}/projects/${projectId}/index`, { method: "POST" });
    const indexBody = await indexRes.json();
    expect(indexBody.status).toBe("ok");
    expect(indexBody.data.filesProcessed).toBeGreaterThanOrEqual(1);
    expect(indexBody.data.nodesCreated).toBeGreaterThanOrEqual(1);
  });
});
