import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { RegistryManager } from "../src/registry.js";
import { IdleTimer } from "../src/process.js";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-api");
const TEST_REGISTRY = join(TEST_DIR, "registry.json");

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("health handler", () => {
  test("returns daemon status", async () => {
    const { createHealthHandler } = await import("../src/api/health.js");
    const timer = new IdleTimer(60_000);
    const registry = new RegistryManager(TEST_REGISTRY);
    const handler = createHealthHandler(timer, registry);
    const result = await handler({}, null, {});
    expect(result.status).toBe("ok");
    expect(result.data).toHaveProperty("pid");
    expect(result.data).toHaveProperty("uptime");
    expect(result.data).toHaveProperty("idleTime");
    expect(result.data).toHaveProperty("projectCount");
  });
});

describe("projects handlers", () => {
  test("list returns empty initially", async () => {
    const { createProjectsHandlers } = await import("../src/api/projects.js");
    const registry = new RegistryManager(TEST_REGISTRY);
    const handlers = createProjectsHandlers(registry);
    const result = await handlers.list({}, null, {});
    expect(result.status).toBe("ok");
    expect(result.data).toEqual([]);
  });

  test("register adds project", async () => {
    const { createProjectsHandlers } = await import("../src/api/projects.js");
    const registry = new RegistryManager(TEST_REGISTRY);
    const handlers = createProjectsHandlers(registry);
    const result = await handlers.register({}, { path: "/test/app", name: "app" }, {});
    expect(result.status).toBe("ok");
    expect(result.data).toHaveProperty("id");

    const listResult = await handlers.list({}, null, {});
    expect(listResult.data).toHaveLength(1);
  });

  test("register rejects missing path", async () => {
    const { createProjectsHandlers } = await import("../src/api/projects.js");
    const registry = new RegistryManager(TEST_REGISTRY);
    const handlers = createProjectsHandlers(registry);
    const result = await handlers.register({}, {}, {});
    expect(result.status).toBe("error");
  });

  test("unregister removes project", async () => {
    const { createProjectsHandlers } = await import("../src/api/projects.js");
    const registry = new RegistryManager(TEST_REGISTRY);
    const handlers = createProjectsHandlers(registry);
    const regResult = await handlers.register({}, { path: "/test/app", name: "app" }, {});
    const id = (regResult.data as { id: string }).id;

    const delResult = await handlers.unregister({ id }, null, {});
    expect(delResult.status).toBe("ok");

    const listResult = await handlers.list({}, null, {});
    expect(listResult.data).toEqual([]);
  });

  test("status returns project info", async () => {
    const { createProjectsHandlers } = await import("../src/api/projects.js");
    const registry = new RegistryManager(TEST_REGISTRY);
    const handlers = createProjectsHandlers(registry);
    const regResult = await handlers.register({}, { path: "/test/app", name: "app" }, {});
    const id = (regResult.data as { id: string }).id;

    const statusResult = await handlers.status({ id }, null, {});
    expect(statusResult.status).toBe("ok");
    expect(statusResult.data).toHaveProperty("name", "app");
  });

  test("status returns error for unknown project", async () => {
    const { createProjectsHandlers } = await import("../src/api/projects.js");
    const registry = new RegistryManager(TEST_REGISTRY);
    const handlers = createProjectsHandlers(registry);
    const result = await handlers.status({ id: "proj-nonexistent" }, null, {});
    expect(result.status).toBe("error");
  });
});
