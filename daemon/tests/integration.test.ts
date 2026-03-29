import { describe, test, expect, afterEach } from "bun:test";
import { mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { createDaemonServer } from "../src/server.js";
import type { Server } from "http";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-integration");
let server: Server;
let port: number;

afterEach(() => {
  if (server) server.close();
  rmSync(TEST_DIR, { recursive: true, force: true });
});

async function startServer(): Promise<number> {
  mkdirSync(TEST_DIR, { recursive: true });
  server = createDaemonServer({
    port: 0,
    idleTimeoutMs: 60_000,
    daemonRoot: TEST_DIR,
  });
  return new Promise<number>((resolve) => {
    server.listen(0, () => {
      const addr = server.address();
      port = typeof addr === "object" && addr ? addr.port : 0;
      resolve(port);
    });
  });
}

describe("Full daemon workflow", () => {
  test("register → status → index → list → unregister", async () => {
    const p = await startServer();
    const base = `http://localhost:${p}`;

    // 1. Register project
    const regRes = await fetch(`${base}/projects/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/tmp/test-project", name: "test-project" }),
    });
    const regBody = await regRes.json();
    expect(regBody.status).toBe("ok");
    const projectId = regBody.data.id;
    expect(projectId).toMatch(/^proj-/);

    // 2. Status
    const statusRes = await fetch(`${base}/projects/${projectId}/status`);
    const statusBody = await statusRes.json();
    expect(statusBody.status).toBe("ok");
    expect(statusBody.data.name).toBe("test-project");
    expect(statusBody.data.indexed).toBe(false);

    // 3. Index (stub for now)
    const indexRes = await fetch(`${base}/projects/${projectId}/index`, { method: "POST" });
    const indexBody = await indexRes.json();
    expect(indexBody.status).toBe("ok");

    // 4. List
    const listRes = await fetch(`${base}/projects`);
    const listBody = await listRes.json();
    expect(listBody.data).toHaveLength(1);
    expect(listBody.data[0].id).toBe(projectId);

    // 5. Unregister
    const delRes = await fetch(`${base}/projects/${projectId}`, { method: "DELETE" });
    const delBody = await delRes.json();
    expect(delBody.status).toBe("ok");

    // 6. Verify empty
    const listRes2 = await fetch(`${base}/projects`);
    const listBody2 = await listRes2.json();
    expect(listBody2.data).toEqual([]);
  });

  test("health returns correct structure", async () => {
    const p = await startServer();
    const res = await fetch(`http://localhost:${p}/health`);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(typeof body.data.pid).toBe("number");
    expect(typeof body.data.uptime).toBe("number");
    expect(typeof body.data.idleTime).toBe("number");
    expect(typeof body.data.projectCount).toBe("number");
  });

  test("404 for unknown routes", async () => {
    const p = await startServer();
    const res = await fetch(`http://localhost:${p}/nonexistent`);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.status).toBe("error");
  });
});
