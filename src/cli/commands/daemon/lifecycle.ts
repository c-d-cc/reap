import { daemonRequest } from "./client.js";

/**
 * Trigger daemon indexing for the current project.
 *
 * Returns `true` when the index request was sent and acknowledged.
 * Silently returns `false` if the daemon is unreachable or the project
 * is not registered. Silent-fail policy preserved (no throw); the
 * boolean lets callers surface readiness in their emit context
 * (`daemonReady` in learning work output — gen-069).
 */
export async function triggerIndexing(projectRoot: string): Promise<boolean> {
  try {
    const result = await daemonRequest<Array<{ id: string; path: string }>>("GET", "/projects");
    if (result.status !== "ok" || !result.data) return false;
    const project = result.data.find((p) => p.path === projectRoot);
    if (!project) return false;
    const indexResult = await daemonRequest("POST", `/projects/${project.id}/index`);
    return indexResult.status === "ok";
  } catch {
    // Daemon not running or not reachable — silent fail
    return false;
  }
}

/**
 * Register project with daemon if not already registered.
 *
 * Returns `true` when the project is either pre-registered or freshly
 * registered. Silently returns `false` if the daemon is unreachable.
 * See {@link triggerIndexing} for the rationale behind the boolean
 * return (gen-069).
 */
export async function ensureRegistered(projectRoot: string, name: string): Promise<boolean> {
  try {
    const result = await daemonRequest<Array<{ id: string; path: string }>>("GET", "/projects");
    if (result.status === "ok" && result.data) {
      const existing = result.data.find((p) => p.path === projectRoot);
      if (existing) return true;
    }
    const regResult = await daemonRequest("POST", "/projects/register", { path: projectRoot, name });
    return regResult.status === "ok";
  } catch {
    // Daemon not running — silent fail
    return false;
  }
}
