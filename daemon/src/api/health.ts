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
