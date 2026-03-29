import { describe, test, expect, afterEach } from "bun:test";
import { mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-server");

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("Server integration", () => {
  test("starts and responds to /health", async () => {
    mkdirSync(TEST_DIR, { recursive: true });
    const { createDaemonServer } = await import("../src/server.js");
    const server = createDaemonServer({
      port: 0, // OS assigns random port
      idleTimeoutMs: 60_000,
      daemonRoot: TEST_DIR,
    });

    const port = await new Promise<number>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        resolve(typeof addr === "object" && addr ? addr.port : 0);
      });
    });

    try {
      const res = await fetch(`http://localhost:${port}/health`);
      const body = await res.json();
      expect(body.status).toBe("ok");
      expect(body.data.pid).toBe(process.pid);
    } finally {
      server.close();
    }
  });

  test("POST /projects/register and GET /projects", async () => {
    mkdirSync(TEST_DIR, { recursive: true });
    const { createDaemonServer } = await import("../src/server.js");
    const server = createDaemonServer({
      port: 0,
      idleTimeoutMs: 60_000,
      daemonRoot: TEST_DIR,
    });

    const port = await new Promise<number>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        resolve(typeof addr === "object" && addr ? addr.port : 0);
      });
    });

    try {
      // Register
      const regRes = await fetch(`http://localhost:${port}/projects/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/test/my-app", name: "my-app" }),
      });
      const regBody = await regRes.json();
      expect(regBody.status).toBe("ok");
      expect(regBody.data.id).toMatch(/^proj-/);

      // List
      const listRes = await fetch(`http://localhost:${port}/projects`);
      const listBody = await listRes.json();
      expect(listBody.status).toBe("ok");
      expect(listBody.data).toHaveLength(1);
      expect(listBody.data[0].name).toBe("my-app");
    } finally {
      server.close();
    }
  });
});
