import { describe, test, expect, afterEach } from "bun:test";
import { mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { createDaemonServer } from "../src/server.js";
import type { Server } from "http";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-idle");
let server: Server;

afterEach(() => {
  if (server) {
    try { server.close(); } catch {}
  }
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("Idle timeout", () => {
  test("server closes after idle timeout expires", async () => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });

    server = createDaemonServer({
      port: 0,
      idleTimeoutMs: 200,
      daemonRoot: TEST_DIR,
      idleCheckIntervalMs: 100,
    });

    const port = await new Promise<number>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        resolve(typeof addr === "object" && addr ? addr.port : 0);
      });
    });

    // Server should be reachable initially
    const res = await fetch(`http://localhost:${port}/health`);
    expect((await res.json() as any).status).toBe("ok");

    // Wait for idle timeout + check interval to fire
    const closed = new Promise<boolean>((resolve) => {
      server.on("close", () => resolve(true));
      // Safety timeout in case close doesn't fire
      setTimeout(() => resolve(false), 2000);
    });

    const didClose = await closed;
    expect(didClose).toBe(true);
  });

  test("activity resets idle timer", async () => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });

    server = createDaemonServer({
      port: 0,
      idleTimeoutMs: 300,
      daemonRoot: TEST_DIR,
      idleCheckIntervalMs: 100,
    });

    const port = await new Promise<number>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        resolve(typeof addr === "object" && addr ? addr.port : 0);
      });
    });

    // Send requests to keep the server alive past the initial timeout
    for (let i = 0; i < 3; i++) {
      await new Promise((r) => setTimeout(r, 150));
      const res = await fetch(`http://localhost:${port}/health`);
      expect((await res.json() as any).status).toBe("ok");
    }

    // Server should still be alive after 450ms (3 * 150ms) because each request resets timer
    const res = await fetch(`http://localhost:${port}/health`);
    expect((await res.json() as any).status).toBe("ok");

    // Now stop sending requests and wait for idle shutdown
    const closed = new Promise<boolean>((resolve) => {
      server.on("close", () => resolve(true));
      setTimeout(() => resolve(false), 2000);
    });

    const didClose = await closed;
    expect(didClose).toBe(true);
  });
});
