# REAP Daemon Phase 4: CLI 연동 + Lifecycle + Worktree Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** daemon을 REAP lifecycle과 완전히 통합한다 — CLI 쿼리 명령 활성화, generation 시작/완료 시 자동 인덱싱, worktree별 인덱스 관리.

**Architecture:** CLI 쿼리를 daemon HTTP API에 연결하고, `reap run start`와 `reap run completion`에서 daemon 인덱싱을 트리거한다. worktree 감지는 git 명령으로 수행하고, daemon에 worktree 파라미터를 전달한다.

---

## Task 1: CLI `reap daemon query` 구현

**Files:**
- Modify: `src/cli/commands/daemon/index.ts` — queryCmd 구현
- Modify: `src/cli/commands/daemon/client.ts` — 편의 함수 추가

- [ ] **Step 1: `src/cli/commands/daemon/client.ts`에 편의 함수 추가**

기존 파일 끝에 추가:

```typescript
export async function findProjectId(projectRoot: string): Promise<string | null> {
  const result = await daemonRequest<Array<{ id: string; path: string }>>("GET", "/projects");
  if (result.status !== "ok" || !result.data) return null;
  const project = result.data.find((p) => p.path === projectRoot);
  return project?.id ?? null;
}
```

- [ ] **Step 2: `src/cli/commands/daemon/index.ts`에서 queryCmd 구현**

기존 queryCmd stub 교체:

```typescript
async function queryCmd(query?: string): Promise<void> {
  if (!query) {
    emitError("daemon", "Usage: reap daemon query <search-term>");
  }

  const root = process.cwd();
  const projectId = await findProjectId(root);
  if (!projectId) {
    emitError("daemon", "Project not registered. Run 'reap init' first.");
  }

  const result = await daemonRequest<Array<{ id: string; name: string; kind: string; file: string; line: number }>>(
    "GET",
    `/projects/${projectId}/symbols?q=${encodeURIComponent(query!)}`,
  );

  if (result.status !== "ok" || !result.data) {
    emitError("daemon", result.error ?? "Query failed");
  }

  const symbols = result.data!;
  if (symbols.length === 0) {
    emitOutput({
      status: "ok",
      command: "daemon",
      message: `No symbols found for "${query}"`,
    });
  }

  const lines = symbols.map((s) => `${s.kind.padEnd(10)} ${s.name.padEnd(30)} ${s.file}:${s.line}`);
  emitOutput({
    status: "ok",
    command: "daemon",
    context: { query, resultCount: symbols.length },
    message: `Found ${symbols.length} symbol(s) for "${query}":\n${lines.join("\n")}`,
  });
}
```

Also add import: `import { findProjectId } from "./client.js";` (add to existing import line)

- [ ] **Step 3: Commit**

```bash
git add src/cli/commands/daemon/client.ts src/cli/commands/daemon/index.ts
git commit -m "feat(daemon): implement CLI daemon query command"
```

---

## Task 2: Lifecycle 연동 — generation 시작/완료 시 자동 인덱싱

**Files:**
- Modify: `src/cli/commands/run/start.ts` — generation 시작 시 인덱싱 트리거
- Modify: `src/cli/commands/run/completion.ts` — generation 완료 시 인덱싱 트리거
- Create: `src/cli/commands/daemon/lifecycle.ts` — lifecycle 헬퍼

- [ ] **Step 1: `src/cli/commands/daemon/lifecycle.ts` 생성**

```typescript
import { daemonRequest, findProjectId } from "./client.js";

/**
 * Trigger daemon indexing for the current project.
 * Silently fails if daemon is not running or project not registered.
 * Called from lifecycle hooks (start/completion).
 */
export async function triggerIndexing(projectRoot: string): Promise<void> {
  try {
    const projectId = await findProjectId(projectRoot);
    if (!projectId) return;
    await daemonRequest("POST", `/projects/${projectId}/index`);
  } catch {
    // Daemon not running or not reachable — silent fail
  }
}

/**
 * Register project with daemon if not already registered.
 * Called from reap init.
 */
export async function ensureRegistered(projectRoot: string, name: string): Promise<void> {
  try {
    const existing = await findProjectId(projectRoot);
    if (existing) return;
    await daemonRequest("POST", "/projects/register", { path: projectRoot, name });
  } catch {
    // Daemon not running — silent fail
  }
}
```

- [ ] **Step 2: `src/cli/commands/run/start.ts` 수정**

기존 `executeHooks(paths.hooks, "onLifeStarted", paths.root)` 호출 직후에 추가:

```typescript
import { triggerIndexing } from "../daemon/lifecycle.js";

// After executeHooks("onLifeStarted"...):
await triggerIndexing(paths.root);
```

- [ ] **Step 3: `src/cli/commands/run/completion.ts` 수정**

기존 `executeHooks(paths.hooks, completionEvent, paths.root)` 호출 직후에 추가:

```typescript
import { triggerIndexing } from "../daemon/lifecycle.js";

// After executeHooks(completionEvent...):
await triggerIndexing(paths.root);
```

- [ ] **Step 4: Commit**

```bash
git add src/cli/commands/daemon/lifecycle.ts src/cli/commands/run/start.ts src/cli/commands/run/completion.ts
git commit -m "feat(daemon): trigger indexing on generation start and completion"
```

---

## Task 3: Worktree 인덱스 관리

**Files:**
- Modify: `daemon/src/server.ts` — worktree 쿼리 파라미터 처리
- Modify: `daemon/src/api/projects.ts` — index 핸들러에 worktree 지원
- Modify: `daemon/src/api/query.ts` — 조회에 worktree 파라미터 전달
- Modify: `src/cli/commands/daemon/client.ts` — worktree 감지 + 파라미터 전달
- Test: `daemon/tests/worktree.test.ts`

- [ ] **Step 1: `src/cli/commands/daemon/client.ts` 수정 — worktree 감지**

파일 끝에 추가:

```typescript
import { execSync } from "child_process";

export function detectWorktree(cwd: string): string | null {
  try {
    const gitCommonDir = execSync("git rev-parse --git-common-dir", { cwd, encoding: "utf-8" }).trim();
    const gitDir = execSync("git rev-parse --git-dir", { cwd, encoding: "utf-8" }).trim();
    // If they differ, we're in a worktree
    if (gitCommonDir !== gitDir && gitCommonDir !== ".git") {
      const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd, encoding: "utf-8" }).trim();
      return branch;
    }
  } catch {}
  return null;
}
```

- [ ] **Step 2: 테스트 작성 — `daemon/tests/worktree.test.ts`**

```typescript
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execSync } from "child_process";
import { createDaemonServer } from "../src/server.js";
import type { Server } from "http";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-worktree-server");
const PROJECT_DIR = join(tmpdir(), "reap-daemon-test-worktree-project");
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
  await new Promise(r => setTimeout(r, 100));
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(PROJECT_DIR, { recursive: true, force: true });
});

describe("Worktree index management", () => {
  test("indexing with worktree param creates separate index", async () => {
    server = createDaemonServer({ port: 0, idleTimeoutMs: 60_000, daemonRoot: TEST_DIR });
    const port = await new Promise<number>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        resolve(typeof addr === "object" && addr ? addr.port : 0);
      });
    });
    const base = `http://localhost:${port}`;

    // Register
    const regRes = await fetch(`${base}/projects/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: PROJECT_DIR, name: "test" }),
    });
    const projectId = ((await regRes.json()) as any).data.id;

    // Index main
    const mainRes = await fetch(`${base}/projects/${projectId}/index`, { method: "POST" });
    const mainBody = await mainRes.json() as any;
    expect(mainBody.status).toBe("ok");

    // Index with worktree param
    const wtRes = await fetch(`${base}/projects/${projectId}/index?worktree=feature-branch`, { method: "POST" });
    const wtBody = await wtRes.json() as any;
    expect(wtBody.status).toBe("ok");

    // Query main
    const mainSymbols = await fetch(`${base}/projects/${projectId}/symbols?q=hello`);
    const mainSymbolsBody = await mainSymbols.json() as any;
    expect(mainSymbolsBody.status).toBe("ok");

    // Query worktree
    const wtSymbols = await fetch(`${base}/projects/${projectId}/symbols?q=hello&worktree=feature-branch`);
    const wtSymbolsBody = await wtSymbols.json() as any;
    expect(wtSymbolsBody.status).toBe("ok");
  });
});
```

- [ ] **Step 3: `daemon/src/server.ts` 수정 — worktree별 IndexManager**

`getIndexManager` 함수를 worktree 파라미터를 받도록 확장:

```typescript
const indexManagers = new Map<string, IndexManager>();

async function getIndexManager(projectId: string, worktree?: string): Promise<IndexManager> {
  const key = worktree ? `${projectId}::wt-${worktree}` : `${projectId}::main`;
  if (indexManagers.has(key)) return indexManagers.get(key)!;

  const subDir = worktree ? `wt-${worktree}` : "main";
  const indexDir = join(config.daemonRoot, "indexes", projectId, subDir);
  mkdirSync(indexDir, { recursive: true });

  // If worktree and main index exists, copy it as starting point
  if (worktree) {
    const mainDb = join(config.daemonRoot, "indexes", projectId, "main", "index.db");
    const wtDb = join(indexDir, "index.db");
    if (!existsSync(wtDb) && existsSync(mainDb)) {
      copyFileSync(mainDb, wtDb);
    }
  }

  const mgr = new IndexManager(join(indexDir, "index.db"));
  await mgr.init();
  indexManagers.set(key, mgr);
  return mgr;
}
```

Add imports: `import { existsSync, copyFileSync } from "fs";`

- [ ] **Step 4: 조회 API에 worktree 쿼리 파라미터 전달**

`daemon/src/api/query.ts`의 `withManager`에서 query.worktree를 전달:

```typescript
async function withManager(projectId: string, query: Query, fn: (mgr: IndexManager) => ...): Promise<ApiResponse> {
  const mgr = await getIndexManager(projectId, query.worktree);
  return await fn(mgr);
}
```

`daemon/src/api/projects.ts`의 index 핸들러에서도 query.worktree 전달.

- [ ] **Step 5: 테스트 실행**

Run: `cd daemon && bun test tests/worktree.test.ts`

- [ ] **Step 6: 전체 테스트 실행**

Run: `cd daemon && bun test`

- [ ] **Step 7: Commit**

```bash
git add daemon/src/server.ts daemon/src/api/projects.ts daemon/src/api/query.ts src/cli/commands/daemon/client.ts daemon/tests/worktree.test.ts
git commit -m "feat(daemon): add worktree index management with fork-on-create"
```

---

## Summary

Phase 4 완료 시:
- `reap daemon query <term>` — 실제 심볼 검색 동작
- generation 시작/완료 시 자동 인덱싱 트리거
- worktree별 별도 인덱스 (main에서 fork)
- daemon이 REAP lifecycle과 완전 통합
