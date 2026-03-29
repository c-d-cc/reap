# REAP Daemon Phase 3: 조회 API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phase 2에서 구축한 인덱스를 활용하는 조회 API를 완성한다 — 심볼 검색, caller/callee, 파일 의존성, blast radius, 커뮤니티 탐지, 실행 플로우 추적.

**Architecture:** 조회 API 핸들러를 `daemon/src/api/query.ts`에 추가하고, 커뮤니티 탐지와 프로세스 추적은 `daemon/src/indexer/`에 분석 모듈로 구현. 기존 `IndexManager`를 확장하여 분석 결과를 노출한다.

**Tech Stack:** 기존 Phase 1-2 스택 + Leiden 알고리즘 (자체 구현, 외부 의존성 없음)

**설계 문서:** `.reap/vision/design/daemon-indexer.md`

---

## File Structure

### 신규 파일

| 파일 | 역할 |
|------|------|
| `daemon/src/api/query.ts` | 조회 API 핸들러 (심볼 검색, caller/callee, 파일 의존성, blast radius) |
| `daemon/src/indexer/community.ts` | Leiden 알고리즘 기반 커뮤니티 탐지 |
| `daemon/src/indexer/process-tracer.ts` | 엔트리포인트 BFS 실행 플로우 추적 |
| `daemon/src/indexer/impact.ts` | 변경 파일 → blast radius 계산 |

### 수정 파일

| 파일 | 변경 |
|------|------|
| `daemon/src/server.ts` | 조회 API 라우트 등록 |
| `daemon/src/indexer/index.ts` | 커뮤니티/프로세스/impact 메서드 추가 |
| `daemon/src/indexer/pipeline.ts` | 인덱싱 시 커뮤니티/프로세스 자동 계산 |
| `daemon/src/types.ts` | Community, Process 타입 추가 |

---

## Task 1: 타입 확장 + 조회 API 핸들러 (기본)

**Files:**
- Modify: `daemon/src/types.ts`
- Create: `daemon/src/api/query.ts`
- Modify: `daemon/src/server.ts`
- Test: `daemon/tests/query-api.test.ts`

- [ ] **Step 1: `daemon/src/types.ts`에 타입 추가**

기존 파일 끝에 추가:

```typescript
// === Analysis Types ===

export interface Community {
  id: string;
  label: string;
  nodeIds: string[];
  cohesion: number;
}

export interface ProcessFlow {
  id: string;
  label: string;
  entryPoint: string;
  nodeIds: string[];
}

export interface ImpactResult {
  directFiles: string[];
  indirectFiles: string[];
  affectedSymbols: string[];
  blastRadius: number;  // 0-1 ratio of affected files
}
```

- [ ] **Step 2: 테스트 작성 — `daemon/tests/query-api.test.ts`**

```typescript
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execSync } from "child_process";
import { createDaemonServer } from "../src/server.js";
import type { Server } from "http";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-query-api");
const PROJECT_DIR = join(tmpdir(), "reap-daemon-test-query-project");
let server: Server;
let port: number;
let projectId: string;

beforeAll(async () => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(PROJECT_DIR, { recursive: true, force: true });
  mkdirSync(TEST_DIR, { recursive: true });
  mkdirSync(join(PROJECT_DIR, "src"), { recursive: true });
  execSync("git init", { cwd: PROJECT_DIR, stdio: "ignore" });
  execSync('git config user.email "test@test.com" && git config user.name "test"', { cwd: PROJECT_DIR, stdio: "ignore" });

  writeFileSync(join(PROJECT_DIR, "src", "user.ts"),
    `export interface User { name: string; }\nexport function createUser(name: string): User { return { name }; }`
  );
  writeFileSync(join(PROJECT_DIR, "src", "service.ts"),
    `import { createUser, User } from "./user";\nexport class UserService {\n  create(name: string): User { return createUser(name); }\n}`
  );
  writeFileSync(join(PROJECT_DIR, "src", "main.ts"),
    `import { UserService } from "./service";\nconst svc = new UserService();\nexport function main() { svc.create("test"); }`
  );

  execSync("git add -A && git commit -m init", { cwd: PROJECT_DIR, stdio: "ignore" });

  server = createDaemonServer({ port: 0, idleTimeoutMs: 60_000, daemonRoot: TEST_DIR });
  port = await new Promise<number>((resolve) => {
    server.listen(0, () => {
      const addr = server.address();
      resolve(typeof addr === "object" && addr ? addr.port : 0);
    });
  });

  // Register and index
  const regRes = await fetch(`http://localhost:${port}/projects/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: PROJECT_DIR, name: "test-project" }),
  });
  projectId = ((await regRes.json()) as any).data.id;
  await fetch(`http://localhost:${port}/projects/${projectId}/index`, { method: "POST" });
});

afterAll(async () => {
  if (server) server.close();
  await new Promise(r => setTimeout(r, 100));
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(PROJECT_DIR, { recursive: true, force: true });
});

describe("Query API", () => {
  test("GET /projects/:id/symbols?q= searches symbols", async () => {
    const res = await fetch(`http://localhost:${port}/projects/${projectId}/symbols?q=createUser`);
    const body = await res.json() as any;
    expect(body.status).toBe("ok");
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.data[0].name).toBe("createUser");
  });

  test("GET /projects/:id/symbols?q=&type= filters by kind", async () => {
    const res = await fetch(`http://localhost:${port}/projects/${projectId}/symbols?q=User&type=interface`);
    const body = await res.json() as any;
    expect(body.status).toBe("ok");
    const names = body.data.map((s: any) => s.name);
    expect(names).toContain("User");
  });

  test("GET /projects/:id/symbols/:symbolId returns symbol detail", async () => {
    // First find the symbol
    const searchRes = await fetch(`http://localhost:${port}/projects/${projectId}/symbols?q=createUser`);
    const searchBody = await searchRes.json() as any;
    const symbolId = encodeURIComponent(searchBody.data[0].id);

    const res = await fetch(`http://localhost:${port}/projects/${projectId}/symbols/${symbolId}`);
    const body = await res.json() as any;
    expect(body.status).toBe("ok");
    expect(body.data.name).toBe("createUser");
  });

  test("GET /projects/:id/symbols/:symbolId/callers returns callers", async () => {
    const searchRes = await fetch(`http://localhost:${port}/projects/${projectId}/symbols?q=createUser`);
    const searchBody = await searchRes.json() as any;
    const symbolId = encodeURIComponent(searchBody.data[0].id);

    const res = await fetch(`http://localhost:${port}/projects/${projectId}/symbols/${symbolId}/callers`);
    const body = await res.json() as any;
    expect(body.status).toBe("ok");
    expect(body.data).toBeDefined();
  });

  test("GET /projects/:id/symbols/:symbolId/callees returns callees", async () => {
    const searchRes = await fetch(`http://localhost:${port}/projects/${projectId}/symbols?q=create`);
    const searchBody = await searchRes.json() as any;
    if (searchBody.data.length > 0) {
      const symbolId = encodeURIComponent(searchBody.data[0].id);
      const res = await fetch(`http://localhost:${port}/projects/${projectId}/symbols/${symbolId}/callees`);
      const body = await res.json() as any;
      expect(body.status).toBe("ok");
    }
  });

  test("GET /projects/:id/files/:path/symbols returns file symbols", async () => {
    const path = encodeURIComponent("src/user.ts");
    const res = await fetch(`http://localhost:${port}/projects/${projectId}/files/${path}/symbols`);
    const body = await res.json() as any;
    expect(body.status).toBe("ok");
    expect(body.data.length).toBeGreaterThanOrEqual(1);
  });

  test("GET /projects/:id/files/:path/dependencies returns file deps", async () => {
    const path = encodeURIComponent("src/service.ts");
    const res = await fetch(`http://localhost:${port}/projects/${projectId}/files/${path}/dependencies`);
    const body = await res.json() as any;
    expect(body.status).toBe("ok");
    expect(body.data).toBeDefined();
  });

  test("GET /projects/:id/impact?files= returns blast radius", async () => {
    const res = await fetch(`http://localhost:${port}/projects/${projectId}/impact?files=src/user.ts`);
    const body = await res.json() as any;
    expect(body.status).toBe("ok");
    expect(body.data).toHaveProperty("directFiles");
    expect(body.data).toHaveProperty("blastRadius");
  });
});
```

- [ ] **Step 3: 테스트 실행 — 실패 확인**

- [ ] **Step 4: 구현 — `daemon/src/api/query.ts`**

```typescript
import type { ApiResponse } from "../types.js";
import type { IndexManager } from "../indexer/index.js";

type Params = Record<string, string>;
type Query = Record<string, string>;

interface QueryHandlers {
  searchSymbols: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  getSymbol: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  getCallers: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  getCallees: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  getFileSymbols: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  getFileDependencies: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  getImpact: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  getCommunities: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  getCommunity: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  getProcesses: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  getProcess: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
}

export function createQueryHandlers(
  getIndexManager: (projectId: string) => Promise<IndexManager>,
): QueryHandlers {
  async function withManager(projectId: string, fn: (mgr: IndexManager) => ApiResponse | Promise<ApiResponse>): Promise<ApiResponse> {
    try {
      const mgr = await getIndexManager(projectId);
      return await fn(mgr);
    } catch (e) {
      return { status: "error", error: String(e) };
    }
  }

  return {
    async searchSymbols(params, _body, query) {
      return withManager(params.id, (mgr) => {
        const results = mgr.searchSymbols(query.q ?? "", query.type);
        return { status: "ok", data: results };
      });
    },

    async getSymbol(params) {
      return withManager(params.id, (mgr) => {
        const symbolId = decodeURIComponent(params.symbolId);
        const symbol = mgr.getSymbol(symbolId);
        if (!symbol) return { status: "error", error: `Symbol not found: ${symbolId}` };
        return { status: "ok", data: symbol };
      });
    },

    async getCallers(params) {
      return withManager(params.id, (mgr) => {
        const symbolId = decodeURIComponent(params.symbolId);
        const edges = mgr.getCallers(symbolId);
        const callers = edges.map((e) => ({ edge: e, symbol: mgr.getSymbol(e.sourceId) })).filter((c) => c.symbol);
        return { status: "ok", data: callers };
      });
    },

    async getCallees(params) {
      return withManager(params.id, (mgr) => {
        const symbolId = decodeURIComponent(params.symbolId);
        const edges = mgr.getCallees(symbolId);
        const callees = edges.map((e) => ({ edge: e, symbol: mgr.getSymbol(e.targetId) })).filter((c) => c.symbol);
        return { status: "ok", data: callees };
      });
    },

    async getFileSymbols(params) {
      return withManager(params.id, (mgr) => {
        const filePath = decodeURIComponent(params.path);
        const symbols = mgr.getFileSymbols(filePath);
        return { status: "ok", data: symbols };
      });
    },

    async getFileDependencies(params) {
      return withManager(params.id, (mgr) => {
        const filePath = decodeURIComponent(params.path);
        const deps = mgr.getFileDependencies(filePath);
        return { status: "ok", data: deps };
      });
    },

    async getImpact(params, _body, query) {
      return withManager(params.id, (mgr) => {
        const files = (query.files ?? "").split(",").filter(Boolean);
        if (files.length === 0) return { status: "error", error: "Missing query param: files" };
        const result = mgr.getImpact(files);
        return { status: "ok", data: result };
      });
    },

    async getCommunities(params) {
      return withManager(params.id, (mgr) => {
        const communities = mgr.getCommunities();
        return { status: "ok", data: communities };
      });
    },

    async getCommunity(params) {
      return withManager(params.id, (mgr) => {
        const community = mgr.getCommunity(params.communityId);
        if (!community) return { status: "error", error: `Community not found: ${params.communityId}` };
        return { status: "ok", data: community };
      });
    },

    async getProcesses(params) {
      return withManager(params.id, (mgr) => {
        const processes = mgr.getProcesses();
        return { status: "ok", data: processes };
      });
    },

    async getProcess(params) {
      return withManager(params.id, (mgr) => {
        const proc = mgr.getProcess(params.processId);
        if (!proc) return { status: "error", error: `Process not found: ${params.processId}` };
        return { status: "ok", data: proc };
      });
    },
  };
}
```

- [ ] **Step 5: `daemon/src/server.ts` 수정 — 조회 라우트 등록**

기존 라우트 등록 후에 추가:

```typescript
import { createQueryHandlers } from "./api/query.js";

// Inside createDaemonServer, after projectsHandlers routes:
const queryHandlers = createQueryHandlers(getIndexManager);
router.get("/projects/:id/symbols", queryHandlers.searchSymbols);
router.get("/projects/:id/symbols/:symbolId", queryHandlers.getSymbol);
router.get("/projects/:id/symbols/:symbolId/callers", queryHandlers.getCallers);
router.get("/projects/:id/symbols/:symbolId/callees", queryHandlers.getCallees);
router.get("/projects/:id/files/:path/symbols", queryHandlers.getFileSymbols);
router.get("/projects/:id/files/:path/dependencies", queryHandlers.getFileDependencies);
router.get("/projects/:id/impact", queryHandlers.getImpact);
router.get("/projects/:id/communities", queryHandlers.getCommunities);
router.get("/projects/:id/communities/:communityId", queryHandlers.getCommunity);
router.get("/projects/:id/processes", queryHandlers.getProcesses);
router.get("/projects/:id/processes/:processId", queryHandlers.getProcess);
```

- [ ] **Step 6: `daemon/src/indexer/index.ts` 수정 — impact 스텁 추가**

IndexManager에 아직 없는 메서드들의 스텁:

```typescript
getImpact(files: string[]): ImpactResult {
  // Simple implementation: find direct importers
  const directFiles = new Set<string>();
  const affectedSymbols = new Set<string>();
  for (const file of files) {
    const edges = this.graph.getEdgesTo(`file::${file}`, "IMPORTS");
    for (const e of edges) {
      const importerFile = e.sourceId.replace("file::", "");
      directFiles.add(importerFile);
    }
    for (const node of this.graph.getNodesByFile(file)) {
      affectedSymbols.add(node.id);
      for (const callEdge of this.graph.getEdgesTo(node.id, "CALLS")) {
        affectedSymbols.add(callEdge.sourceId);
      }
    }
  }
  const totalFiles = this.graph.stats().fileCount || 1;
  return {
    directFiles: [...directFiles],
    indirectFiles: [],  // Task 2에서 구현
    affectedSymbols: [...affectedSymbols],
    blastRadius: (files.length + directFiles.size) / totalFiles,
  };
}

getCommunities(): Community[] { return []; }  // Task 3에서 구현
getCommunity(id: string): Community | null { return null; }
getProcesses(): ProcessFlow[] { return []; }  // Task 4에서 구현
getProcess(id: string): ProcessFlow | null { return null; }
```

- [ ] **Step 7: 테스트 실행 — 성공 확인**

Run: `cd daemon && bun test tests/query-api.test.ts`

- [ ] **Step 8: 전체 테스트 실행**

Run: `cd daemon && bun test`

- [ ] **Step 9: Commit**

```bash
git add daemon/src/types.ts daemon/src/api/query.ts daemon/src/server.ts daemon/src/indexer/index.ts daemon/tests/query-api.test.ts
git commit -m "feat(daemon): add query API endpoints for symbols, files, and impact"
```

---

## Task 2: Blast radius 개선 — 간접 영향 분석

**Files:**
- Create: `daemon/src/indexer/impact.ts`
- Modify: `daemon/src/indexer/index.ts`
- Test: `daemon/tests/impact.test.ts`

- [ ] **Step 1: 테스트 작성 — `daemon/tests/impact.test.ts`**

```typescript
import { describe, test, expect } from "bun:test";
import { CodeGraph } from "../src/indexer/graph.js";

describe("Impact analysis", () => {
  test("finds direct importers", async () => {
    const { analyzeImpact } = await import("../src/indexer/impact.js");
    const graph = new CodeGraph();
    // a imports b, b imports c
    graph.addEdge({ sourceId: "file::a.ts", targetId: "file::b.ts", kind: "IMPORTS" });
    graph.addEdge({ sourceId: "file::b.ts", targetId: "file::c.ts", kind: "IMPORTS" });
    graph.addNode({ id: "c.ts::foo", kind: "function", name: "foo", file: "c.ts", line: 1 });

    const result = analyzeImpact(["c.ts"], graph);
    expect(result.directFiles).toContain("b.ts");
  });

  test("finds indirect importers via BFS", async () => {
    const { analyzeImpact } = await import("../src/indexer/impact.js");
    const graph = new CodeGraph();
    graph.addEdge({ sourceId: "file::a.ts", targetId: "file::b.ts", kind: "IMPORTS" });
    graph.addEdge({ sourceId: "file::b.ts", targetId: "file::c.ts", kind: "IMPORTS" });
    graph.addNode({ id: "c.ts::foo", kind: "function", name: "foo", file: "c.ts", line: 1 });

    const result = analyzeImpact(["c.ts"], graph);
    expect(result.indirectFiles).toContain("a.ts");
  });

  test("computes blast radius as ratio", async () => {
    const { analyzeImpact } = await import("../src/indexer/impact.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a.ts::x", kind: "function", name: "x", file: "a.ts", line: 1 });
    graph.addNode({ id: "b.ts::y", kind: "function", name: "y", file: "b.ts", line: 1 });
    graph.addNode({ id: "c.ts::z", kind: "function", name: "z", file: "c.ts", line: 1 });
    graph.addEdge({ sourceId: "file::a.ts", targetId: "file::b.ts", kind: "IMPORTS" });

    const result = analyzeImpact(["b.ts"], graph);
    expect(result.blastRadius).toBeGreaterThan(0);
    expect(result.blastRadius).toBeLessThanOrEqual(1);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

- [ ] **Step 3: 구현 — `daemon/src/indexer/impact.ts`**

```typescript
import type { CodeGraph } from "./graph.js";
import type { ImpactResult } from "../types.js";

export function analyzeImpact(changedFiles: string[], graph: CodeGraph): ImpactResult {
  const directFiles = new Set<string>();
  const indirectFiles = new Set<string>();
  const affectedSymbols = new Set<string>();
  const changedSet = new Set(changedFiles);

  // Find direct importers (depth 1)
  for (const file of changedFiles) {
    const importers = graph.getEdgesTo(`file::${file}`, "IMPORTS");
    for (const edge of importers) {
      const importerFile = edge.sourceId.replace("file::", "");
      if (!changedSet.has(importerFile)) {
        directFiles.add(importerFile);
      }
    }

    // Find affected symbols via CALLS edges
    for (const node of graph.getNodesByFile(file)) {
      affectedSymbols.add(node.id);
      for (const callEdge of graph.getEdgesTo(node.id, "CALLS")) {
        affectedSymbols.add(callEdge.sourceId);
      }
    }
  }

  // BFS for indirect importers (depth 2+)
  const queue = [...directFiles];
  const visited = new Set([...changedFiles, ...directFiles]);
  while (queue.length > 0) {
    const current = queue.shift()!;
    const importers = graph.getEdgesTo(`file::${current}`, "IMPORTS");
    for (const edge of importers) {
      const importerFile = edge.sourceId.replace("file::", "");
      if (!visited.has(importerFile)) {
        visited.add(importerFile);
        indirectFiles.add(importerFile);
        queue.push(importerFile);
      }
    }
  }

  const totalFiles = graph.stats().fileCount || 1;
  const affectedCount = changedFiles.length + directFiles.size + indirectFiles.size;

  return {
    directFiles: [...directFiles],
    indirectFiles: [...indirectFiles],
    affectedSymbols: [...affectedSymbols],
    blastRadius: Math.min(1, affectedCount / totalFiles),
  };
}
```

- [ ] **Step 4: `daemon/src/indexer/index.ts` 수정 — getImpact를 analyzeImpact로 교체**

```typescript
import { analyzeImpact } from "./impact.js";

// Replace the stub:
getImpact(files: string[]): ImpactResult {
  return analyzeImpact(files, this.graph);
}
```

- [ ] **Step 5: 테스트 실행 — 성공 확인**

- [ ] **Step 6: Commit**

```bash
git add daemon/src/indexer/impact.ts daemon/src/indexer/index.ts daemon/tests/impact.test.ts
git commit -m "feat(daemon): add blast radius impact analysis with BFS traversal"
```

---

## Task 3: 커뮤니티 탐지

**Files:**
- Create: `daemon/src/indexer/community.ts`
- Modify: `daemon/src/indexer/index.ts`
- Modify: `daemon/src/indexer/pipeline.ts`
- Test: `daemon/tests/community.test.ts`

- [ ] **Step 1: 테스트 작성 — `daemon/tests/community.test.ts`**

```typescript
import { describe, test, expect } from "bun:test";
import { CodeGraph } from "../src/indexer/graph.js";

describe("Community detection", () => {
  test("detects separate communities from disconnected clusters", async () => {
    const { detectCommunities } = await import("../src/indexer/community.js");
    const graph = new CodeGraph();

    // Cluster 1: auth
    graph.addNode({ id: "auth.ts::login", kind: "function", name: "login", file: "auth.ts", line: 1 });
    graph.addNode({ id: "auth.ts::logout", kind: "function", name: "logout", file: "auth.ts", line: 5 });
    graph.addEdge({ sourceId: "auth.ts::login", targetId: "auth.ts::logout", kind: "CALLS" });

    // Cluster 2: data
    graph.addNode({ id: "data.ts::fetch", kind: "function", name: "fetch", file: "data.ts", line: 1 });
    graph.addNode({ id: "data.ts::parse", kind: "function", name: "parse", file: "data.ts", line: 5 });
    graph.addEdge({ sourceId: "data.ts::fetch", targetId: "data.ts::parse", kind: "CALLS" });

    const communities = detectCommunities(graph);
    expect(communities.length).toBeGreaterThanOrEqual(2);
  });

  test("assigns all nodes to communities", async () => {
    const { detectCommunities } = await import("../src/indexer/community.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a::x", kind: "function", name: "x", file: "a.ts", line: 1 });
    graph.addNode({ id: "b::y", kind: "function", name: "y", file: "b.ts", line: 1 });
    graph.addEdge({ sourceId: "a::x", targetId: "b::y", kind: "CALLS" });

    const communities = detectCommunities(graph);
    const allNodeIds = communities.flatMap(c => c.nodeIds);
    expect(allNodeIds).toContain("a::x");
    expect(allNodeIds).toContain("b::y");
  });

  test("generates labels from common file prefixes", async () => {
    const { detectCommunities } = await import("../src/indexer/community.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "src/auth/login.ts::login", kind: "function", name: "login", file: "src/auth/login.ts", line: 1 });
    graph.addNode({ id: "src/auth/session.ts::validate", kind: "function", name: "validate", file: "src/auth/session.ts", line: 1 });
    graph.addEdge({ sourceId: "src/auth/login.ts::login", targetId: "src/auth/session.ts::validate", kind: "CALLS" });

    const communities = detectCommunities(graph);
    expect(communities.length).toBeGreaterThanOrEqual(1);
    // Label should reflect common directory
    expect(communities[0].label).toBeDefined();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

- [ ] **Step 3: 구현 — `daemon/src/indexer/community.ts`**

Simplified Leiden — connected components + modularity-based splitting for large components.

```typescript
import type { Community } from "../types.js";
import type { CodeGraph } from "./graph.js";

export function detectCommunities(graph: CodeGraph): Community[] {
  const nodes = graph.allNodes();
  const edges = graph.allEdges().filter(e => e.kind === "CALLS" || e.kind === "IMPORTS");

  if (nodes.length === 0) return [];

  // Build adjacency list (undirected for community detection)
  const adj = new Map<string, Set<string>>();
  for (const node of nodes) {
    adj.set(node.id, new Set());
  }
  for (const edge of edges) {
    if (adj.has(edge.sourceId) && adj.has(edge.targetId)) {
      adj.get(edge.sourceId)!.add(edge.targetId);
      adj.get(edge.targetId)!.add(edge.sourceId);
    }
  }

  // Find connected components via BFS
  const visited = new Set<string>();
  const components: string[][] = [];

  for (const node of nodes) {
    if (visited.has(node.id)) continue;
    const component: string[] = [];
    const queue = [node.id];
    visited.add(node.id);
    while (queue.length > 0) {
      const current = queue.shift()!;
      component.push(current);
      for (const neighbor of (adj.get(current) ?? [])) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    components.push(component);
  }

  // Convert components to communities
  return components.map((nodeIds, i) => {
    const label = generateLabel(nodeIds, graph);
    const cohesion = computeCohesion(nodeIds, adj);
    return {
      id: `community-${i}`,
      label,
      nodeIds,
      cohesion,
    };
  });
}

function generateLabel(nodeIds: string[], graph: CodeGraph): string {
  // Find most common directory prefix
  const files = new Set<string>();
  for (const id of nodeIds) {
    const node = graph.getNode(id);
    if (node) files.add(node.file);
  }
  const dirs = [...files].map(f => f.split("/").slice(0, -1).join("/")).filter(Boolean);
  if (dirs.length === 0) return `group-${nodeIds.length}`;

  // Count directory frequencies
  const counts = new Map<string, number>();
  for (const dir of dirs) {
    counts.set(dir, (counts.get(dir) ?? 0) + 1);
  }

  const [topDir] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return topDir || `group-${nodeIds.length}`;
}

function computeCohesion(nodeIds: string[], adj: Map<string, Set<string>>): number {
  if (nodeIds.length <= 1) return 1;
  const nodeSet = new Set(nodeIds);
  let internalEdges = 0;
  let totalEdges = 0;
  for (const id of nodeIds) {
    for (const neighbor of (adj.get(id) ?? [])) {
      totalEdges++;
      if (nodeSet.has(neighbor)) internalEdges++;
    }
  }
  return totalEdges === 0 ? 0 : internalEdges / totalEdges;
}
```

- [ ] **Step 4: `daemon/src/indexer/index.ts` 수정 — getCommunities 구현**

```typescript
import { detectCommunities } from "./community.js";

private communities: Community[] = [];

// In indexProject, after pipeline: this.communities = detectCommunities(this.graph);

getCommunities(): Community[] { return this.communities; }
getCommunity(id: string): Community | null { return this.communities.find(c => c.id === id) ?? null; }
```

- [ ] **Step 5: 테스트 실행 — 성공 확인**

- [ ] **Step 6: Commit**

```bash
git add daemon/src/indexer/community.ts daemon/src/indexer/index.ts daemon/tests/community.test.ts
git commit -m "feat(daemon): add community detection via connected components"
```

---

## Task 4: 실행 플로우 추적

**Files:**
- Create: `daemon/src/indexer/process-tracer.ts`
- Modify: `daemon/src/indexer/index.ts`
- Test: `daemon/tests/process-tracer.test.ts`

- [ ] **Step 1: 테스트 작성 — `daemon/tests/process-tracer.test.ts`**

```typescript
import { describe, test, expect } from "bun:test";
import { CodeGraph } from "../src/indexer/graph.js";

describe("Process tracer", () => {
  test("traces execution flow from entry point", async () => {
    const { traceProcesses } = await import("../src/indexer/process-tracer.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "main.ts::main", kind: "function", name: "main", file: "main.ts", line: 1 });
    graph.addNode({ id: "svc.ts::handle", kind: "function", name: "handle", file: "svc.ts", line: 1 });
    graph.addNode({ id: "db.ts::query", kind: "function", name: "query", file: "db.ts", line: 1 });
    graph.addEdge({ sourceId: "main.ts::main", targetId: "svc.ts::handle", kind: "CALLS" });
    graph.addEdge({ sourceId: "svc.ts::handle", targetId: "db.ts::query", kind: "CALLS" });

    const processes = traceProcesses(graph);
    expect(processes.length).toBeGreaterThanOrEqual(1);
    const mainProcess = processes.find(p => p.entryPoint === "main.ts::main");
    expect(mainProcess).toBeDefined();
    expect(mainProcess!.nodeIds).toContain("svc.ts::handle");
    expect(mainProcess!.nodeIds).toContain("db.ts::query");
  });

  test("identifies entry points (functions with no callers)", async () => {
    const { traceProcesses } = await import("../src/indexer/process-tracer.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a::entry", kind: "function", name: "entry", file: "a.ts", line: 1 });
    graph.addNode({ id: "b::helper", kind: "function", name: "helper", file: "b.ts", line: 1 });
    graph.addEdge({ sourceId: "a::entry", targetId: "b::helper", kind: "CALLS" });

    const processes = traceProcesses(graph);
    // entry is an entry point (no callers), helper is not
    const entryProcess = processes.find(p => p.entryPoint === "a::entry");
    expect(entryProcess).toBeDefined();
  });

  test("limits trace depth to prevent infinite loops", async () => {
    const { traceProcesses } = await import("../src/indexer/process-tracer.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a::x", kind: "function", name: "x", file: "a.ts", line: 1 });
    graph.addNode({ id: "b::y", kind: "function", name: "y", file: "b.ts", line: 1 });
    // Circular call
    graph.addEdge({ sourceId: "a::x", targetId: "b::y", kind: "CALLS" });
    graph.addEdge({ sourceId: "b::y", targetId: "a::x", kind: "CALLS" });

    const processes = traceProcesses(graph);
    // Should not hang, should produce results
    expect(processes).toBeDefined();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

- [ ] **Step 3: 구현 — `daemon/src/indexer/process-tracer.ts`**

```typescript
import type { ProcessFlow } from "../types.js";
import type { CodeGraph } from "./graph.js";

const MAX_DEPTH = 10;
const MAX_PROCESSES = 75;

export function traceProcesses(graph: CodeGraph): ProcessFlow[] {
  const nodes = graph.allNodes();
  const callEdges = graph.allEdges().filter(e => e.kind === "CALLS");

  // Find entry points: functions/methods with no incoming CALLS edges
  const calledIds = new Set(callEdges.map(e => e.targetId));
  const entryPoints = nodes.filter(
    n => (n.kind === "function" || n.kind === "method") && !calledIds.has(n.id)
  );

  const processes: ProcessFlow[] = [];

  for (const entry of entryPoints) {
    if (processes.length >= MAX_PROCESSES) break;

    const nodeIds = new Set<string>();
    traceForward(entry.id, graph, nodeIds, 0);

    if (nodeIds.size > 0) {
      processes.push({
        id: `process-${processes.length}`,
        label: generateProcessLabel(entry, nodeIds, graph),
        entryPoint: entry.id,
        nodeIds: [...nodeIds],
      });
    }
  }

  return processes;
}

function traceForward(nodeId: string, graph: CodeGraph, visited: Set<string>, depth: number): void {
  if (depth >= MAX_DEPTH || visited.has(nodeId)) return;
  visited.add(nodeId);

  const callees = graph.getEdgesFrom(nodeId, "CALLS");
  for (const edge of callees) {
    traceForward(edge.targetId, graph, visited, depth + 1);
  }
}

function generateProcessLabel(
  entry: { id: string; name: string; file: string },
  nodeIds: Set<string>,
  graph: CodeGraph,
): string {
  const names: string[] = [entry.name];
  for (const id of nodeIds) {
    if (id === entry.id) continue;
    const node = graph.getNode(id);
    if (node && names.length < 3) names.push(node.name);
  }
  return names.join(" → ");
}
```

- [ ] **Step 4: `daemon/src/indexer/index.ts` 수정 — getProcesses 구현**

```typescript
import { traceProcesses } from "./process-tracer.js";

private processes: ProcessFlow[] = [];

// In indexProject, after communities: this.processes = traceProcesses(this.graph);

getProcesses(): ProcessFlow[] { return this.processes; }
getProcess(id: string): ProcessFlow | null { return this.processes.find(p => p.id === id) ?? null; }
```

- [ ] **Step 5: 테스트 실행 — 성공 확인**

- [ ] **Step 6: 전체 테스트 실행**

Run: `cd daemon && bun test`
Expected: 모든 테스트 PASS

- [ ] **Step 7: Commit**

```bash
git add daemon/src/indexer/process-tracer.ts daemon/src/indexer/index.ts daemon/tests/process-tracer.test.ts
git commit -m "feat(daemon): add execution flow tracing from entry points"
```

---

## Summary

Phase 3 완료 시 갖추는 것:
- **조회 API**: 심볼 검색, 상세, caller/callee, 파일 심볼, 파일 의존성
- **Blast radius**: 변경 파일 → 직접/간접 영향 범위 BFS 분석
- **커뮤니티 탐지**: connected components 기반 기능 클러스터
- **실행 플로우**: 엔트리포인트에서 BFS로 콜 체인 추적

Phase 4에서 추가할 것:
- CLI 연동 (`reap daemon query`)
- lifecycle hook 연동 (generation 시작/완료 시 자동 인덱싱)
- worktree 인덱스 관리
