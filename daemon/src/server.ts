import { createServer, type IncomingMessage, type ServerResponse, type Server } from "http";
import { join } from "path";
import { mkdirSync } from "fs";
import { Router } from "./router.js";
import { IdleTimer } from "./process.js";
import { RegistryManager } from "./registry.js";
import { createHealthHandler } from "./api/health.js";
import { createProjectsHandlers } from "./api/projects.js";
import { createQueryHandlers } from "./api/query.js";
import { IndexManager } from "./indexer/index.js";

interface ServerConfig {
  port: number;
  idleTimeoutMs: number;
  daemonRoot: string;
}

export function createDaemonServer(config: ServerConfig): Server {
  const registryPath = join(config.daemonRoot, "registry.json");
  const idleTimer = new IdleTimer(config.idleTimeoutMs);
  const registry = new RegistryManager(registryPath);

  const indexManagers = new Map<string, IndexManager>();

  async function getIndexManager(projectId: string): Promise<IndexManager> {
    if (indexManagers.has(projectId)) return indexManagers.get(projectId)!;
    const indexDir = join(config.daemonRoot, "indexes", projectId, "main");
    mkdirSync(indexDir, { recursive: true });
    const mgr = new IndexManager(join(indexDir, "index.db"));
    await mgr.init();
    indexManagers.set(projectId, mgr);
    return mgr;
  }

  const router = new Router();

  // Register routes
  const healthHandler = createHealthHandler(idleTimer, registry);
  router.get("/health", healthHandler);

  const projectsHandlers = createProjectsHandlers(registry, getIndexManager);
  router.get("/projects", projectsHandlers.list);
  router.post("/projects/register", projectsHandlers.register);
  router.delete("/projects/:id", projectsHandlers.unregister);
  router.get("/projects/:id/status", projectsHandlers.status);
  router.post("/projects/:id/index", projectsHandlers.index);

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
