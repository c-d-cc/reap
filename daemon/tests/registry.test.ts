import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-registry");
const TEST_REGISTRY = join(TEST_DIR, "registry.json");

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("Registry", () => {
  test("projectId generates consistent hash from path", async () => {
    const { projectId } = await import("../src/registry.js");
    const id1 = projectId("/Users/test/project");
    const id2 = projectId("/Users/test/project");
    expect(id1).toBe(id2);
    expect(id1).toMatch(/^proj-[a-f0-9]+$/);
  });

  test("projectId generates different hash for different paths", async () => {
    const { projectId } = await import("../src/registry.js");
    const id1 = projectId("/Users/test/project-a");
    const id2 = projectId("/Users/test/project-b");
    expect(id1).not.toBe(id2);
  });

  test("load returns empty registry when file missing", async () => {
    const { RegistryManager } = await import("../src/registry.js");
    const mgr = new RegistryManager(TEST_REGISTRY);
    const reg = mgr.load();
    expect(reg.projects).toEqual({});
  });

  test("register adds project and persists", async () => {
    const { RegistryManager } = await import("../src/registry.js");
    const mgr = new RegistryManager(TEST_REGISTRY);
    const id = mgr.register("/Users/test/my-app", "my-app");
    const reg = mgr.load();
    expect(reg.projects[id]).toBeDefined();
    expect(reg.projects[id].path).toBe("/Users/test/my-app");
    expect(reg.projects[id].name).toBe("my-app");
    expect(reg.projects[id].lastIndexedAt).toBeNull();
  });

  test("unregister removes project", async () => {
    const { RegistryManager } = await import("../src/registry.js");
    const mgr = new RegistryManager(TEST_REGISTRY);
    const id = mgr.register("/Users/test/my-app", "my-app");
    mgr.unregister(id);
    const reg = mgr.load();
    expect(reg.projects[id]).toBeUndefined();
  });

  test("list returns all projects", async () => {
    const { RegistryManager } = await import("../src/registry.js");
    const mgr = new RegistryManager(TEST_REGISTRY);
    mgr.register("/Users/test/app-a", "app-a");
    mgr.register("/Users/test/app-b", "app-b");
    const list = mgr.list();
    expect(list.length).toBe(2);
  });

  test("get returns project by id", async () => {
    const { RegistryManager } = await import("../src/registry.js");
    const mgr = new RegistryManager(TEST_REGISTRY);
    const id = mgr.register("/Users/test/my-app", "my-app");
    const entry = mgr.get(id);
    expect(entry).not.toBeNull();
    expect(entry!.name).toBe("my-app");
  });

  test("get returns null for unknown id", async () => {
    const { RegistryManager } = await import("../src/registry.js");
    const mgr = new RegistryManager(TEST_REGISTRY);
    expect(mgr.get("proj-nonexistent")).toBeNull();
  });

  test("findByPath returns project id for registered path", async () => {
    const { RegistryManager } = await import("../src/registry.js");
    const mgr = new RegistryManager(TEST_REGISTRY);
    const id = mgr.register("/Users/test/my-app", "my-app");
    expect(mgr.findByPath("/Users/test/my-app")).toBe(id);
  });
});
