# REAP Daemon Phase 1: 기본 골격 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** daemon 프로세스의 기본 골격을 구축한다 — HTTP 서버, 프로세스 관리(spawn/pid/idle shutdown), 프로젝트 레지스트리, health/status API.

**Architecture:** `daemon/` 디렉토리를 별도 Node.js 앱으로 구성. HTTP 서버(Node 내장 `http` 모듈)가 localhost:17224에서 동작하며, PID 파일과 idle 타이머로 프로세스 수명을 관리한다. REAP CLI 쪽에는 `src/cli/commands/daemon/` 에 HTTP 클라이언트 + 자동 spawn 로직을 추가한다.

**Tech Stack:** TypeScript, Node.js `http` module, `better-sqlite3` (Phase 2에서 사용 — 이 Phase에서는 dependency만 설정), Bun (개발/테스트)

**설계 문서:** `.reap/vision/design/daemon-indexer.md`

---

## File Structure

### daemon/ (새로운 앱)

| 파일 | 역할 |
|------|------|
| `daemon/package.json` | 패키지 설정, 의존성 |
| `daemon/tsconfig.json` | TypeScript 설정 |
| `daemon/src/index.ts` | 엔트리포인트 — HTTP 서버 시작, PID 파일 작성, idle 타이머 |
| `daemon/src/server.ts` | HTTP 서버 생성, 라우팅, 미들웨어 |
| `daemon/src/router.ts` | 경로 매칭 + 핸들러 디스패치 |
| `daemon/src/registry.ts` | 프로젝트 레지스트리 CRUD (`~/.reap/daemon/registry.json`) |
| `daemon/src/process.ts` | PID 파일 관리, idle 타이머, graceful shutdown |
| `daemon/src/paths.ts` | daemon 경로 상수 (`~/.reap/daemon/`, PID, registry 등) |
| `daemon/src/types.ts` | daemon 타입 정의 |
| `daemon/src/api/health.ts` | `GET /health` 핸들러 |
| `daemon/src/api/projects.ts` | 프로젝트 관련 API 핸들러 |

### src/cli/ (기존 REAP CLI에 추가)

| 파일 | 역할 |
|------|------|
| `src/cli/commands/daemon/index.ts` | `reap daemon` 서브커맨드 진입점 |
| `src/cli/commands/daemon/client.ts` | daemon HTTP 클라이언트 + 자동 spawn |

---

## Task 1: daemon 프로젝트 초기화

**Files:**
- Create: `daemon/package.json`
- Create: `daemon/tsconfig.json`
- Create: `daemon/src/types.ts`
- Create: `daemon/src/paths.ts`

- [ ] **Step 1: `daemon/package.json` 생성**

```json
{
  "name": "@c-d-cc/reap-daemon",
  "version": "0.1.0",
  "description": "REAP Daemon — Code indexing and graph query service",
  "type": "module",
  "bin": {
    "reap-daemon": "dist/index.js"
  },
  "scripts": {
    "dev": "bun src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target node",
    "typecheck": "tsc --noEmit",
    "test": "bun test tests/"
  },
  "dependencies": {
    "better-sqlite3": "^11.0.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.0",
    "@types/bun": "^1.3.11",
    "@types/node": "^22.0.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: `daemon/tsconfig.json` 생성**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: `daemon/src/types.ts` 생성**

```typescript
export interface DaemonConfig {
  port: number;
  idleTimeoutMs: number;
}

export const DEFAULT_CONFIG: DaemonConfig = {
  port: 17224,
  idleTimeoutMs: 30 * 60 * 1000, // 30 minutes
};

export interface ProjectEntry {
  path: string;
  name: string;
  registeredAt: string;
  lastIndexedAt: string | null;
}

export interface Registry {
  projects: Record<string, ProjectEntry>;
}

export interface ApiResponse<T = unknown> {
  status: "ok" | "error";
  data?: T;
  error?: string;
}

export interface HealthData {
  pid: number;
  uptime: number;
  idleTime: number;
  projectCount: number;
}
```

- [ ] **Step 4: `daemon/src/paths.ts` 생성**

```typescript
import { join } from "path";
import { homedir } from "os";

const DAEMON_ROOT = join(homedir(), ".reap", "daemon");

export const daemonPaths = {
  root: DAEMON_ROOT,
  pid: join(DAEMON_ROOT, "daemon.pid"),
  registry: join(DAEMON_ROOT, "registry.json"),
  indexes: join(DAEMON_ROOT, "indexes"),
  projectIndex: (projectId: string) => join(DAEMON_ROOT, "indexes", projectId),
  projectMainIndex: (projectId: string) => join(DAEMON_ROOT, "indexes", projectId, "main"),
  projectWorktreeIndex: (projectId: string, branch: string) =>
    join(DAEMON_ROOT, "indexes", projectId, `wt-${branch}`),
} as const;
```

- [ ] **Step 5: 의존성 설치**

Run: `cd /Users/hichoi/cdws/reap/daemon && npm install`
Expected: `node_modules/` 생성, `better-sqlite3` 네이티브 빌드 성공

- [ ] **Step 6: 타입 체크**

Run: `cd /Users/hichoi/cdws/reap/daemon && npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 7: Commit**

```bash
git add daemon/package.json daemon/tsconfig.json daemon/src/types.ts daemon/src/paths.ts daemon/package-lock.json
git commit -m "feat(daemon): initialize daemon project with types and paths"
```

---

## Task 2: 프로세스 관리 (PID 파일, idle 타이머, shutdown)

**Files:**
- Create: `daemon/src/process.ts`
- Test: `daemon/tests/process.test.ts`

- [ ] **Step 1: 테스트 작성 — `daemon/tests/process.test.ts`**

```typescript
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { writeFileSync, readFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

// We'll test process management with a temp directory
const TEST_DIR = join(tmpdir(), "reap-daemon-test-process");
const TEST_PID_PATH = join(TEST_DIR, "daemon.pid");

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("PID file management", () => {
  test("writePid creates PID file with current process ID", async () => {
    const { writePid } = await import("../src/process.js");
    writePid(TEST_PID_PATH);
    const content = readFileSync(TEST_PID_PATH, "utf-8").trim();
    expect(content).toBe(String(process.pid));
  });

  test("readPid returns PID from file", async () => {
    const { readPid } = await import("../src/process.js");
    writeFileSync(TEST_PID_PATH, "12345");
    expect(readPid(TEST_PID_PATH)).toBe(12345);
  });

  test("readPid returns null when file missing", async () => {
    const { readPid } = await import("../src/process.js");
    expect(readPid(join(TEST_DIR, "nonexistent.pid"))).toBeNull();
  });

  test("removePid deletes PID file", async () => {
    const { writePid, removePid } = await import("../src/process.js");
    writePid(TEST_PID_PATH);
    removePid(TEST_PID_PATH);
    expect(existsSync(TEST_PID_PATH)).toBe(false);
  });

  test("isProcessRunning returns true for current process", async () => {
    const { isProcessRunning } = await import("../src/process.js");
    expect(isProcessRunning(process.pid)).toBe(true);
  });

  test("isProcessRunning returns false for nonexistent PID", async () => {
    const { isProcessRunning } = await import("../src/process.js");
    expect(isProcessRunning(999999)).toBe(false);
  });
});

describe("IdleTimer", () => {
  test("touch resets idle time", async () => {
    const { IdleTimer } = await import("../src/process.js");
    const timer = new IdleTimer(60_000);
    const before = timer.idleMs();
    await new Promise((r) => setTimeout(r, 50));
    timer.touch();
    expect(timer.idleMs()).toBeLessThan(before + 50);
  });

  test("isExpired returns false before timeout", async () => {
    const { IdleTimer } = await import("../src/process.js");
    const timer = new IdleTimer(60_000);
    expect(timer.isExpired()).toBe(false);
  });

  test("isExpired returns true after timeout", async () => {
    const { IdleTimer } = await import("../src/process.js");
    const timer = new IdleTimer(10); // 10ms timeout
    await new Promise((r) => setTimeout(r, 50));
    expect(timer.isExpired()).toBe(true);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `cd /Users/hichoi/cdws/reap/daemon && bun test tests/process.test.ts`
Expected: FAIL — `../src/process.js` 모듈 없음

- [ ] **Step 3: 구현 — `daemon/src/process.ts`**

```typescript
import { readFileSync, writeFileSync, unlinkSync, mkdirSync } from "fs";
import { dirname } from "path";

export function writePid(pidPath: string): void {
  mkdirSync(dirname(pidPath), { recursive: true });
  writeFileSync(pidPath, String(process.pid));
}

export function readPid(pidPath: string): number | null {
  try {
    const content = readFileSync(pidPath, "utf-8").trim();
    const pid = parseInt(content, 10);
    return isNaN(pid) ? null : pid;
  } catch {
    return null;
  }
}

export function removePid(pidPath: string): void {
  try {
    unlinkSync(pidPath);
  } catch {}
}

export function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export class IdleTimer {
  private lastActivity: number;
  private readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    this.timeoutMs = timeoutMs;
    this.lastActivity = Date.now();
  }

  touch(): void {
    this.lastActivity = Date.now();
  }

  idleMs(): number {
    return Date.now() - this.lastActivity;
  }

  isExpired(): boolean {
    return this.idleMs() >= this.timeoutMs;
  }
}
```

- [ ] **Step 4: 테스트 실행 — 성공 확인**

Run: `cd /Users/hichoi/cdws/reap/daemon && bun test tests/process.test.ts`
Expected: 모든 테스트 PASS

- [ ] **Step 5: Commit**

```bash
git add daemon/src/process.ts daemon/tests/process.test.ts
git commit -m "feat(daemon): add PID file management and idle timer"
```

---

## Task 3: 프로젝트 레지스트리

**Files:**
- Create: `daemon/src/registry.ts`
- Test: `daemon/tests/registry.test.ts`

- [ ] **Step 1: 테스트 작성 — `daemon/tests/registry.test.ts`**

```typescript
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
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `cd /Users/hichoi/cdws/reap/daemon && bun test tests/registry.test.ts`
Expected: FAIL — `../src/registry.js` 모듈 없음

- [ ] **Step 3: 구현 — `daemon/src/registry.ts`**

```typescript
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";
import { createHash } from "crypto";
import type { ProjectEntry, Registry } from "./types.js";

export function projectId(projectPath: string): string {
  const hash = createHash("sha256").update(projectPath).digest("hex").slice(0, 12);
  return `proj-${hash}`;
}

export class RegistryManager {
  private readonly path: string;

  constructor(registryPath: string) {
    this.path = registryPath;
  }

  load(): Registry {
    try {
      const content = readFileSync(this.path, "utf-8");
      return JSON.parse(content) as Registry;
    } catch {
      return { projects: {} };
    }
  }

  private save(registry: Registry): void {
    mkdirSync(dirname(this.path), { recursive: true });
    writeFileSync(this.path, JSON.stringify(registry, null, 2));
  }

  register(projectPath: string, name: string): string {
    const id = projectId(projectPath);
    const registry = this.load();
    registry.projects[id] = {
      path: projectPath,
      name,
      registeredAt: new Date().toISOString(),
      lastIndexedAt: null,
    };
    this.save(registry);
    return id;
  }

  unregister(id: string): void {
    const registry = this.load();
    delete registry.projects[id];
    this.save(registry);
  }

  get(id: string): (ProjectEntry & { id: string }) | null {
    const registry = this.load();
    const entry = registry.projects[id];
    return entry ? { ...entry, id } : null;
  }

  list(): Array<ProjectEntry & { id: string }> {
    const registry = this.load();
    return Object.entries(registry.projects).map(([id, entry]) => ({ ...entry, id }));
  }

  findByPath(projectPath: string): string | null {
    const id = projectId(projectPath);
    const registry = this.load();
    return registry.projects[id] ? id : null;
  }

  updateLastIndexed(id: string): void {
    const registry = this.load();
    if (registry.projects[id]) {
      registry.projects[id].lastIndexedAt = new Date().toISOString();
      this.save(registry);
    }
  }
}
```

- [ ] **Step 4: 테스트 실행 — 성공 확인**

Run: `cd /Users/hichoi/cdws/reap/daemon && bun test tests/registry.test.ts`
Expected: 모든 테스트 PASS

- [ ] **Step 5: Commit**

```bash
git add daemon/src/registry.ts daemon/tests/registry.test.ts
git commit -m "feat(daemon): add project registry with CRUD operations"
```

---

## Task 4: HTTP 라우터

**Files:**
- Create: `daemon/src/router.ts`
- Test: `daemon/tests/router.test.ts`

- [ ] **Step 1: 테스트 작성 — `daemon/tests/router.test.ts`**

```typescript
import { describe, test, expect } from "bun:test";

describe("Router", () => {
  test("matches exact path", async () => {
    const { Router } = await import("../src/router.js");
    const router = new Router();
    let called = false;
    router.get("/health", async () => {
      called = true;
      return { status: "ok" as const, data: "healthy" };
    });
    const result = await router.handle("GET", "/health");
    expect(called).toBe(true);
    expect(result).toEqual({ status: "ok", data: "healthy" });
  });

  test("matches path with params", async () => {
    const { Router } = await import("../src/router.js");
    const router = new Router();
    let capturedParams: Record<string, string> = {};
    router.get("/projects/:id", async (params) => {
      capturedParams = params;
      return { status: "ok" as const, data: params.id };
    });
    const result = await router.handle("GET", "/projects/proj-abc123");
    expect(capturedParams.id).toBe("proj-abc123");
  });

  test("matches POST method", async () => {
    const { Router } = await import("../src/router.js");
    const router = new Router();
    let receivedBody = null;
    router.post("/projects/register", async (_params, body) => {
      receivedBody = body;
      return { status: "ok" as const, data: "registered" };
    });
    const result = await router.handle("POST", "/projects/register", { path: "/test" });
    expect(receivedBody).toEqual({ path: "/test" });
  });

  test("returns 404 for unmatched route", async () => {
    const { Router } = await import("../src/router.js");
    const router = new Router();
    const result = await router.handle("GET", "/nonexistent");
    expect(result).toEqual({ status: "error", error: "Not found: GET /nonexistent" });
  });

  test("returns 404 for wrong method", async () => {
    const { Router } = await import("../src/router.js");
    const router = new Router();
    router.get("/health", async () => ({ status: "ok" as const, data: null }));
    const result = await router.handle("POST", "/health");
    expect(result).toEqual({ status: "error", error: "Not found: POST /health" });
  });

  test("parses query string", async () => {
    const { Router } = await import("../src/router.js");
    const router = new Router();
    let capturedQuery: Record<string, string> = {};
    router.get("/projects/:id/symbols", async (params, _body, query) => {
      capturedQuery = query;
      return { status: "ok" as const, data: null };
    });
    await router.handle("GET", "/projects/proj-abc/symbols?q=foo&type=function");
    expect(capturedQuery.q).toBe("foo");
    expect(capturedQuery.type).toBe("function");
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `cd /Users/hichoi/cdws/reap/daemon && bun test tests/router.test.ts`
Expected: FAIL — `../src/router.js` 모듈 없음

- [ ] **Step 3: 구현 — `daemon/src/router.ts`**

```typescript
import type { ApiResponse } from "./types.js";

type Params = Record<string, string>;
type Query = Record<string, string>;
type Handler = (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;

interface Route {
  method: string;
  pattern: string;
  segments: string[];
  handler: Handler;
}

export class Router {
  private routes: Route[] = [];

  get(pattern: string, handler: Handler): void {
    this.addRoute("GET", pattern, handler);
  }

  post(pattern: string, handler: Handler): void {
    this.addRoute("POST", pattern, handler);
  }

  delete(pattern: string, handler: Handler): void {
    this.addRoute("DELETE", pattern, handler);
  }

  private addRoute(method: string, pattern: string, handler: Handler): void {
    const segments = pattern.split("/").filter(Boolean);
    this.routes.push({ method, pattern, segments, handler });
  }

  async handle(method: string, url: string, body?: unknown): Promise<ApiResponse> {
    const [pathname, queryString] = url.split("?");
    const urlSegments = pathname.split("/").filter(Boolean);
    const query = this.parseQuery(queryString ?? "");

    for (const route of this.routes) {
      if (route.method !== method) continue;
      const params = this.match(route.segments, urlSegments);
      if (params !== null) {
        return route.handler(params, body ?? null, query);
      }
    }

    return { status: "error", error: `Not found: ${method} ${pathname}` };
  }

  private match(routeSegments: string[], urlSegments: string[]): Params | null {
    if (routeSegments.length !== urlSegments.length) return null;
    const params: Params = {};
    for (let i = 0; i < routeSegments.length; i++) {
      const rs = routeSegments[i];
      if (rs.startsWith(":")) {
        params[rs.slice(1)] = urlSegments[i];
      } else if (rs !== urlSegments[i]) {
        return null;
      }
    }
    return params;
  }

  private parseQuery(qs: string): Query {
    const query: Query = {};
    if (!qs) return query;
    for (const pair of qs.split("&")) {
      const [key, value] = pair.split("=");
      if (key) query[decodeURIComponent(key)] = decodeURIComponent(value ?? "");
    }
    return query;
  }
}
```

- [ ] **Step 4: 테스트 실행 — 성공 확인**

Run: `cd /Users/hichoi/cdws/reap/daemon && bun test tests/router.test.ts`
Expected: 모든 테스트 PASS

- [ ] **Step 5: Commit**

```bash
git add daemon/src/router.ts daemon/tests/router.test.ts
git commit -m "feat(daemon): add HTTP router with param/query parsing"
```

---

## Task 5: API 핸들러 (health, projects)

**Files:**
- Create: `daemon/src/api/health.ts`
- Create: `daemon/src/api/projects.ts`
- Test: `daemon/tests/api.test.ts`

- [ ] **Step 1: 테스트 작성 — `daemon/tests/api.test.ts`**

```typescript
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
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `cd /Users/hichoi/cdws/reap/daemon && bun test tests/api.test.ts`
Expected: FAIL — 모듈 없음

- [ ] **Step 3: 구현 — `daemon/src/api/health.ts`**

```typescript
import type { ApiResponse, HealthData } from "../types.js";
import type { IdleTimer } from "../process.js";
import type { RegistryManager } from "../registry.js";

const startTime = Date.now();

export function createHealthHandler(
  idleTimer: IdleTimer,
  registry: RegistryManager,
): (params: Record<string, string>, body: unknown, query: Record<string, string>) => Promise<ApiResponse<HealthData>> {
  return async () => ({
    status: "ok",
    data: {
      pid: process.pid,
      uptime: Date.now() - startTime,
      idleTime: idleTimer.idleMs(),
      projectCount: registry.list().length,
    },
  });
}
```

- [ ] **Step 4: 구현 — `daemon/src/api/projects.ts`**

```typescript
import type { ApiResponse, ProjectEntry } from "../types.js";
import type { RegistryManager } from "../registry.js";

type Params = Record<string, string>;
type Query = Record<string, string>;

interface ProjectsHandlers {
  list: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  register: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  unregister: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  status: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  index: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
}

export function createProjectsHandlers(registry: RegistryManager): ProjectsHandlers {
  return {
    async list() {
      return { status: "ok", data: registry.list() };
    },

    async register(_params, body) {
      const { path, name } = (body ?? {}) as { path?: string; name?: string };
      if (!path) {
        return { status: "error", error: "Missing required field: path" };
      }
      const id = registry.register(path, name ?? path.split("/").pop() ?? "unknown");
      return { status: "ok", data: { id } };
    },

    async unregister(params) {
      registry.unregister(params.id);
      return { status: "ok", data: { id: params.id } };
    },

    async status(params) {
      const entry = registry.get(params.id);
      if (!entry) {
        return { status: "error", error: `Project not found: ${params.id}` };
      }
      return {
        status: "ok",
        data: {
          ...entry,
          indexed: entry.lastIndexedAt !== null,
        },
      };
    },

    async index(params) {
      // Phase 2에서 실제 인덱싱 구현. 현재는 stub.
      const entry = registry.get(params.id);
      if (!entry) {
        return { status: "error", error: `Project not found: ${params.id}` };
      }
      return { status: "ok", data: { message: "Indexing not yet implemented", id: params.id } };
    },
  };
}
```

- [ ] **Step 5: 테스트 실행 — 성공 확인**

Run: `cd /Users/hichoi/cdws/reap/daemon && bun test tests/api.test.ts`
Expected: 모든 테스트 PASS

- [ ] **Step 6: Commit**

```bash
git add daemon/src/api/health.ts daemon/src/api/projects.ts daemon/tests/api.test.ts
git commit -m "feat(daemon): add health and projects API handlers"
```

---

## Task 6: HTTP 서버 + 엔트리포인트

**Files:**
- Create: `daemon/src/server.ts`
- Modify: `daemon/src/index.ts`
- Test: `daemon/tests/server.test.ts`

- [ ] **Step 1: 테스트 작성 — `daemon/tests/server.test.ts`**

```typescript
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
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `cd /Users/hichoi/cdws/reap/daemon && bun test tests/server.test.ts`
Expected: FAIL — `../src/server.js` 모듈 없음

- [ ] **Step 3: 구현 — `daemon/src/server.ts`**

```typescript
import { createServer, type IncomingMessage, type ServerResponse, type Server } from "http";
import { join } from "path";
import { Router } from "./router.js";
import { IdleTimer } from "./process.js";
import { RegistryManager } from "./registry.js";
import { createHealthHandler } from "./api/health.js";
import { createProjectsHandlers } from "./api/projects.js";

interface ServerConfig {
  port: number;
  idleTimeoutMs: number;
  daemonRoot: string;
}

export function createDaemonServer(config: ServerConfig): Server {
  const registryPath = join(config.daemonRoot, "registry.json");
  const idleTimer = new IdleTimer(config.idleTimeoutMs);
  const registry = new RegistryManager(registryPath);

  const router = new Router();

  // Register routes
  const healthHandler = createHealthHandler(idleTimer, registry);
  router.get("/health", healthHandler);

  const projectsHandlers = createProjectsHandlers(registry);
  router.get("/projects", projectsHandlers.list);
  router.post("/projects/register", projectsHandlers.register);
  router.delete("/projects/:id", projectsHandlers.unregister);
  router.get("/projects/:id/status", projectsHandlers.status);
  router.post("/projects/:id/index", projectsHandlers.index);

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    idleTimer.touch();

    const method = req.method ?? "GET";
    const url = req.url ?? "/";

    let body: unknown = null;
    if (method === "POST" || method === "PUT") {
      body = await readBody(req);
    }

    const result = await router.handle(method, url, body);

    const statusCode = result.status === "ok" ? 200 : result.error?.startsWith("Not found") ? 404 : 400;
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
  });

  // Idle shutdown check
  const idleCheck = setInterval(() => {
    if (idleTimer.isExpired()) {
      server.close();
      clearInterval(idleCheck);
    }
  }, 60_000);
  idleCheck.unref();

  return server;
}

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf-8");
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(null);
      }
    });
    req.on("error", () => resolve(null));
  });
}
```

- [ ] **Step 4: 구현 — `daemon/src/index.ts`**

```typescript
#!/usr/bin/env node

import { daemonPaths } from "./paths.js";
import { writePid, removePid } from "./process.js";
import { createDaemonServer } from "./server.js";
import { DEFAULT_CONFIG } from "./types.js";

const config = {
  port: DEFAULT_CONFIG.port,
  idleTimeoutMs: DEFAULT_CONFIG.idleTimeoutMs,
  daemonRoot: daemonPaths.root,
};

const server = createDaemonServer(config);

server.listen(config.port, "127.0.0.1", () => {
  writePid(daemonPaths.pid);
  process.stderr.write(`reap-daemon running on http://127.0.0.1:${config.port} (pid: ${process.pid})\n`);
});

function shutdown() {
  removePid(daemonPaths.pid);
  server.close();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
```

- [ ] **Step 5: 테스트 실행 — 성공 확인**

Run: `cd /Users/hichoi/cdws/reap/daemon && bun test tests/server.test.ts`
Expected: 모든 테스트 PASS

- [ ] **Step 6: 전체 테스트 실행**

Run: `cd /Users/hichoi/cdws/reap/daemon && bun test`
Expected: 모든 테스트 PASS

- [ ] **Step 7: Commit**

```bash
git add daemon/src/server.ts daemon/src/index.ts daemon/tests/server.test.ts
git commit -m "feat(daemon): add HTTP server with routing and idle shutdown"
```

---

## Task 7: CLI 클라이언트 — daemon HTTP 클라이언트 + 자동 spawn

**Files:**
- Create: `src/cli/commands/daemon/client.ts`
- Create: `src/cli/commands/daemon/index.ts`
- Modify: `src/cli/index.ts`

- [ ] **Step 1: 구현 — `src/cli/commands/daemon/client.ts`**

daemon에 HTTP 요청을 보내는 클라이언트. daemon이 없으면 자동 spawn.

```typescript
import { spawn } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const DAEMON_ROOT = join(homedir(), ".reap", "daemon");
const PID_PATH = join(DAEMON_ROOT, "daemon.pid");
const DEFAULT_PORT = 17224;
const BASE_URL = `http://127.0.0.1:${DEFAULT_PORT}`;

export async function daemonRequest<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: "ok" | "error"; data?: T; error?: string }> {
  await ensureDaemon();

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
}

async function ensureDaemon(): Promise<void> {
  // Check if already running
  if (await isDaemonRunning()) return;

  // Spawn daemon
  const daemonBin = resolveDaemonBin();
  const runtime = detectRuntime();
  const child = spawn(runtime, [daemonBin], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  // Wait for daemon to be ready (max 3 seconds)
  const deadline = Date.now() + 3_000;
  while (Date.now() < deadline) {
    if (await isDaemonRunning()) return;
    await new Promise((r) => setTimeout(r, 100));
  }

  throw new Error("Failed to start daemon within 3 seconds");
}

async function isDaemonRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(500) });
    return res.ok;
  } catch {
    return false;
  }
}

function resolveDaemonBin(): string {
  // Look for daemon entry point relative to reap-daemon package
  try {
    return require.resolve("@c-d-cc/reap-daemon/dist/index.js");
  } catch {
    // Fallback: try relative path (development mode)
    return join(__dirname, "..", "..", "..", "daemon", "dist", "index.js");
  }
}

function detectRuntime(): string {
  try {
    const { execSync } = require("child_process");
    execSync("bun --version", { stdio: "ignore" });
    return "bun";
  } catch {
    return "node";
  }
}
```

- [ ] **Step 2: 구현 — `src/cli/commands/daemon/index.ts`**

```typescript
import { emitOutput, emitError } from "../../core/output.js";
import { daemonRequest } from "./client.js";
import { createPaths } from "../../core/paths.js";
import { fileExists } from "../../core/fs.js";

export async function execute(
  subcommand: string,
  options: { query?: string },
): Promise<void> {
  switch (subcommand) {
    case "status":
      return statusCmd();
    case "stop":
      return stopCmd();
    case "index":
      return indexCmd();
    case "query":
      return queryCmd(options.query);
    default:
      emitError("daemon", `Unknown subcommand: ${subcommand}. Use: status, stop, index, query`);
  }
}

async function statusCmd(): Promise<void> {
  try {
    const result = await daemonRequest<{
      pid: number;
      uptime: number;
      idleTime: number;
      projectCount: number;
    }>("GET", "/health");

    if (result.status === "ok" && result.data) {
      const d = result.data;
      const uptimeMin = Math.floor(d.uptime / 60_000);
      const idleMin = Math.floor(d.idleTime / 60_000);
      emitOutput({
        status: "ok",
        command: "daemon",
        context: {
          pid: d.pid,
          uptime: `${uptimeMin}m`,
          idle: `${idleMin}m`,
          projects: d.projectCount,
        },
        message: `Daemon running (pid: ${d.pid}, uptime: ${uptimeMin}m, idle: ${idleMin}m, ${d.projectCount} projects)`,
      });
    } else {
      emitError("daemon", "Daemon is not running");
    }
  } catch {
    emitError("daemon", "Daemon is not running");
  }
}

async function stopCmd(): Promise<void> {
  try {
    // Send a request that triggers graceful shutdown
    // For now, we rely on idle timeout or OS signal
    const result = await daemonRequest("GET", "/health");
    if (result.status === "ok") {
      // Kill the process
      const pid = (result.data as { pid: number }).pid;
      process.kill(pid, "SIGTERM");
      emitOutput({
        status: "ok",
        command: "daemon",
        message: `Daemon stopped (pid: ${pid})`,
      });
    }
  } catch {
    emitOutput({
      status: "ok",
      command: "daemon",
      message: "Daemon is not running",
    });
  }
}

async function indexCmd(): Promise<void> {
  const root = process.cwd();
  const paths = createPaths(root);

  if (!(await fileExists(paths.config))) {
    emitError("daemon", "Not a reap project. Run 'reap init' first.");
  }

  // Find project in registry by path
  const findResult = await daemonRequest<Array<{ id: string; path: string }>>("GET", "/projects");
  if (findResult.status !== "ok" || !findResult.data) {
    emitError("daemon", "Failed to query daemon");
  }

  const project = findResult.data!.find((p) => p.path === root);
  if (!project) {
    emitError("daemon", "Project not registered with daemon. Run 'reap init' to register.");
  }

  const result = await daemonRequest("POST", `/projects/${project!.id}/index`);
  emitOutput({
    status: "ok",
    command: "daemon",
    context: result.data as Record<string, unknown>,
    message: `Indexing triggered for ${root}`,
  });
}

async function queryCmd(query?: string): Promise<void> {
  if (!query) {
    emitError("daemon", "Usage: reap daemon query <search-term>");
  }
  // Phase 3에서 구현. 현재는 stub.
  emitOutput({
    status: "ok",
    command: "daemon",
    message: "Query not yet implemented (Phase 3)",
  });
}
```

- [ ] **Step 3: `src/cli/index.ts`에 daemon 명령 등록**

`src/cli/index.ts` 파일에 아래를 추가:

import 추가 (기존 import 블록 끝에):
```typescript
import { execute as daemonExecute } from "./commands/daemon/index.js";
```

`program.parse()` 직전에 명령 등록:
```typescript
program
  .command("daemon <subcommand>")
  .description("Manage the REAP daemon (status, stop, index, query)")
  .option("--query <query>", "Search query for daemon query subcommand")
  .action(async (subcommand: string, options: { query?: string }) => {
    await daemonExecute(subcommand, options);
  });
```

- [ ] **Step 4: 타입 체크**

Run: `cd /Users/hichoi/cdws/reap && npx tsc --noEmit`
Expected: 에러 없음 (또는 daemon/이 exclude되어 무관)

- [ ] **Step 5: Commit**

```bash
git add src/cli/commands/daemon/client.ts src/cli/commands/daemon/index.ts src/cli/index.ts
git commit -m "feat(daemon): add CLI client with auto-spawn and daemon subcommands"
```

---

## Task 8: daemon 빌드 스크립트 및 REAP 의존성 연결

**Files:**
- Create: `daemon/scripts/build.sh`
- Modify: `package.json` (root REAP)

- [ ] **Step 1: `daemon/scripts/build.sh` 생성**

```bash
#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

rm -rf dist
bun build src/index.ts --outdir dist --target node
echo "reap-daemon built → dist/index.js"
```

- [ ] **Step 2: 빌드 실행 권한 부여 및 테스트**

Run: `chmod +x /Users/hichoi/cdws/reap/daemon/scripts/build.sh && cd /Users/hichoi/cdws/reap/daemon && bash scripts/build.sh`
Expected: `dist/index.js` 생성

- [ ] **Step 3: root `package.json`에 `@c-d-cc/reap-daemon` 의존성 추가**

`package.json`의 `dependencies`에 추가:
```json
"@c-d-cc/reap-daemon": "file:./daemon"
```

(개발 단계에서는 file: 참조, 배포 시 npm 버전으로 교체)

- [ ] **Step 4: 의존성 설치**

Run: `cd /Users/hichoi/cdws/reap && npm install`
Expected: daemon 패키지가 로컬 링크로 설치됨

- [ ] **Step 5: Commit**

```bash
git add daemon/scripts/build.sh package.json package-lock.json
git commit -m "feat(daemon): add build script and link daemon as dependency"
```

---

## Task 9: 통합 테스트 — daemon spawn 및 API 호출

**Files:**
- Create: `daemon/tests/integration.test.ts`

- [ ] **Step 1: 통합 테스트 작성 — `daemon/tests/integration.test.ts`**

```typescript
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
```

- [ ] **Step 2: 통합 테스트 실행**

Run: `cd /Users/hichoi/cdws/reap/daemon && bun test tests/integration.test.ts`
Expected: 모든 테스트 PASS

- [ ] **Step 3: 전체 daemon 테스트 실행**

Run: `cd /Users/hichoi/cdws/reap/daemon && bun test`
Expected: 모든 테스트 PASS (process, registry, router, api, server, integration)

- [ ] **Step 4: Commit**

```bash
git add daemon/tests/integration.test.ts
git commit -m "test(daemon): add integration test for full daemon workflow"
```

---

## Summary

Phase 1 완료 시 갖추는 것:
- `daemon/` 별도 앱 (package.json, tsconfig.json, 빌드 스크립트)
- HTTP 서버 (localhost:17224), 라우터, JSON API
- 프로젝트 레지스트리 (등록/해제/목록/상태)
- 프로세스 관리 (PID 파일, idle 타이머, graceful shutdown)
- `reap daemon status/stop/index/query` CLI 명령
- 자동 spawn (daemon 없으면 CLI에서 자동 시작)
- 인덱싱 엔드포인트는 stub (Phase 2에서 구현)

Phase 2에서 추가할 것: Tree-sitter 파싱, 심볼 추출, 그래프 구축, SQLite 영속화, 인메모리 로드
