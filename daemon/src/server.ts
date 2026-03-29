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
