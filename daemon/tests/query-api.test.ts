import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execSync } from "child_process";
import { createDaemonServer } from "../src/server.js";
import type { Server } from "http";

const TEST_DIR = join(tmpdir(), "reap-daemon-query-api-test");
const PROJECT_DIR = join(tmpdir(), "reap-daemon-query-api-project");

let server: Server;
let port: number;
let projectId: string;

beforeAll(async () => {
  // Set up project directory with TypeScript files
  rmSync(PROJECT_DIR, { recursive: true, force: true });
  mkdirSync(join(PROJECT_DIR, "src"), { recursive: true });
  execSync("git init", { cwd: PROJECT_DIR, stdio: "ignore" });
  execSync('git config user.email "test@test.com" && git config user.name "test"', { cwd: PROJECT_DIR, stdio: "ignore" });

  writeFileSync(
    join(PROJECT_DIR, "src", "user.ts"),
    `export interface User { name: string; }\nexport function createUser(name: string): User { return { name }; }`,
  );
  writeFileSync(
    join(PROJECT_DIR, "src", "service.ts"),
    `import { createUser, User } from "./user";\nexport class UserService {\n  create(name: string): User { return createUser(name); }\n}`,
  );
  writeFileSync(
    join(PROJECT_DIR, "src", "main.ts"),
    `import { UserService } from "./service";\nconst svc = new UserService();\nexport function main() { svc.create("test"); }`,
  );
  execSync("git add -A && git commit -m init", { cwd: PROJECT_DIR, stdio: "ignore" });

  // Start server
  mkdirSync(TEST_DIR, { recursive: true });
  server = createDaemonServer({
    port: 0,
    idleTimeoutMs: 60_000,
    daemonRoot: TEST_DIR,
  });

  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const addr = server.address();
      port = typeof addr === "object" && addr ? addr.port : 0;
      resolve();
    });
  });

  const base = `http://localhost:${port}`;

  // Register project
  const regRes = await fetch(`${base}/projects/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: PROJECT_DIR, name: "query-test-project" }),
  });
  const regBody = await regRes.json() as { status: string; data: { id: string } };
  expect(regBody.status).toBe("ok");
  projectId = regBody.data.id;

  // Trigger indexing
  const indexRes = await fetch(`${base}/projects/${projectId}/index`, { method: "POST" });
  const indexBody = await indexRes.json() as { status: string };
  expect(indexBody.status).toBe("ok");
});

afterAll(() => {
  if (server) server.close();
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(PROJECT_DIR, { recursive: true, force: true });
});

describe("Query API", () => {
  test("GET /projects/:id/symbols?q=createUser finds createUser", async () => {
    const res = await fetch(`http://localhost:${port}/projects/${projectId}/symbols?q=createUser`);
    const body = await res.json() as { status: string; data: Array<{ name: string }> };
    expect(body.status).toBe("ok");
    expect(Array.isArray(body.data)).toBe(true);
    const found = body.data.find((s) => s.name === "createUser");
    expect(found).toBeDefined();
  });

  test("GET /projects/:id/symbols?q=User&type=interface filters by kind", async () => {
    const res = await fetch(`http://localhost:${port}/projects/${projectId}/symbols?q=User&type=interface`);
    const body = await res.json() as { status: string; data: Array<{ name: string; kind: string }> };
    expect(body.status).toBe("ok");
    expect(Array.isArray(body.data)).toBe(true);
    for (const s of body.data) {
      expect(s.kind).toBe("interface");
    }
  });

  test("GET /projects/:id/symbols/:symbolId returns symbol detail", async () => {
    // First search for createUser to get its ID
    const searchRes = await fetch(`http://localhost:${port}/projects/${projectId}/symbols?q=createUser`);
    const searchBody = await searchRes.json() as { status: string; data: Array<{ id: string; name: string }> };
    expect(searchBody.status).toBe("ok");
    const symbol = searchBody.data.find((s) => s.name === "createUser");
    expect(symbol).toBeDefined();

    const symbolRes = await fetch(
      `http://localhost:${port}/projects/${projectId}/symbols/${encodeURIComponent(symbol!.id)}`,
    );
    const symbolBody = await symbolRes.json() as { status: string; data: { id: string; name: string } };
    expect(symbolBody.status).toBe("ok");
    expect(symbolBody.data.name).toBe("createUser");
    expect(symbolBody.data.id).toBe(symbol!.id);
  });

  test("GET /projects/:id/symbols/:symbolId/callers returns callers", async () => {
    // Find createUser
    const searchRes = await fetch(`http://localhost:${port}/projects/${projectId}/symbols?q=createUser`);
    const searchBody = await searchRes.json() as { status: string; data: Array<{ id: string; name: string }> };
    const symbol = searchBody.data.find((s) => s.name === "createUser");
    expect(symbol).toBeDefined();

    const res = await fetch(
      `http://localhost:${port}/projects/${projectId}/symbols/${encodeURIComponent(symbol!.id)}/callers`,
    );
    const body = await res.json() as { status: string; data: unknown[] };
    expect(body.status).toBe("ok");
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("GET /projects/:id/symbols/:symbolId/callees returns callees", async () => {
    // Find main function
    const searchRes = await fetch(`http://localhost:${port}/projects/${projectId}/symbols?q=main`);
    const searchBody = await searchRes.json() as { status: string; data: Array<{ id: string; name: string }> };
    const symbol = searchBody.data.find((s) => s.name === "main");
    expect(symbol).toBeDefined();

    const res = await fetch(
      `http://localhost:${port}/projects/${projectId}/symbols/${encodeURIComponent(symbol!.id)}/callees`,
    );
    const body = await res.json() as { status: string; data: unknown[] };
    expect(body.status).toBe("ok");
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("GET /projects/:id/files/:path/symbols returns file symbols", async () => {
    const res = await fetch(
      `http://localhost:${port}/projects/${projectId}/files/${encodeURIComponent("src/user.ts")}/symbols`,
    );
    const body = await res.json() as { status: string; data: Array<{ name: string; file: string }> };
    expect(body.status).toBe("ok");
    expect(Array.isArray(body.data)).toBe(true);
    const names = body.data.map((s) => s.name);
    expect(names).toContain("createUser");
  });

  test("GET /projects/:id/files/:path/dependencies returns file dependencies", async () => {
    const res = await fetch(
      `http://localhost:${port}/projects/${projectId}/files/${encodeURIComponent("src/service.ts")}/dependencies`,
    );
    const body = await res.json() as { status: string; data: unknown[] };
    expect(body.status).toBe("ok");
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("GET /projects/:id/impact?files=src/user.ts returns blast radius", async () => {
    const res = await fetch(
      `http://localhost:${port}/projects/${projectId}/impact?files=src/user.ts`,
    );
    const body = await res.json() as {
      status: string;
      data: { directFiles: string[]; indirectFiles: string[]; affectedSymbols: string[]; blastRadius: number };
    };
    expect(body.status).toBe("ok");
    expect(Array.isArray(body.data.directFiles)).toBe(true);
    expect(Array.isArray(body.data.indirectFiles)).toBe(true);
    expect(Array.isArray(body.data.affectedSymbols)).toBe(true);
    expect(typeof body.data.blastRadius).toBe("number");
    expect(body.data.blastRadius).toBeGreaterThan(0);
  });

  test("GET /projects/:id/impact without files returns error", async () => {
    const res = await fetch(`http://localhost:${port}/projects/${projectId}/impact`);
    const body = await res.json() as { status: string; error: string };
    expect(body.status).toBe("error");
    expect(body.error).toContain("files");
  });

  test("GET /projects/:id/communities returns array", async () => {
    const res = await fetch(`http://localhost:${port}/projects/${projectId}/communities`);
    const body = await res.json() as { status: string; data: unknown[] };
    expect(body.status).toBe("ok");
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("GET /projects/:id/processes returns array", async () => {
    const res = await fetch(`http://localhost:${port}/projects/${projectId}/processes`);
    const body = await res.json() as { status: string; data: unknown[] };
    expect(body.status).toBe("ok");
    expect(Array.isArray(body.data)).toBe(true);
  });
});
