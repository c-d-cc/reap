import { daemonRequest } from "./client.js";

/**
 * Trigger daemon indexing for the current project.
 * Silently fails if daemon is not running or project not registered.
 */
export async function triggerIndexing(projectRoot: string): Promise<void> {
  try {
    const result = await daemonRequest<Array<{ id: string; path: string }>>("GET", "/projects");
    if (result.status !== "ok" || !result.data) return;
    const project = result.data.find((p) => p.path === projectRoot);
    if (!project) return;
    await daemonRequest("POST", `/projects/${project.id}/index`);
  } catch {
    // Daemon not running or not reachable — silent fail
  }
}

/**
 * Register project with daemon if not already registered.
 */
export async function ensureRegistered(projectRoot: string, name: string): Promise<void> {
  try {
    const result = await daemonRequest<Array<{ id: string; path: string }>>("GET", "/projects");
    if (result.status === "ok" && result.data) {
      const existing = result.data.find((p) => p.path === projectRoot);
      if (existing) return;
    }
    await daemonRequest("POST", "/projects/register", { path: projectRoot, name });
  } catch {
    // Daemon not running — silent fail
  }
}
