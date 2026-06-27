import type { ApiResponse } from "../types.js";
import type { RegistryManager } from "../registry.js";
import type { IndexManager } from "../indexer/index.js";

type Params = Record<string, string>;
type Query = Record<string, string>;

interface ProjectsHandlers {
  list: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  register: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  unregister: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  status: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
  index: (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;
}

export function createProjectsHandlers(
  registry: RegistryManager,
  getIndexManager: (projectId: string, worktree?: string) => Promise<IndexManager>,
): ProjectsHandlers {
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

    async index(params, _body, query) {
      const entry = registry.get(params.id);
      if (!entry) {
        return { status: "error", error: `Project not found: ${params.id}` };
      }
      try {
        const mgr = await getIndexManager(params.id, query.worktree);
        const result = await mgr.indexProject(entry.path);
        // gen-068: propagate the pipeline's HEAD commit to the registry so
        // staleness can be queried via /projects/:id/status.
        registry.updateLastIndexed(params.id, result.lastCommit ?? null);
        return { status: "ok", data: result };
      } catch (e) {
        return { status: "error", error: `Indexing failed: ${String(e)}` };
      }
    },
  };
}
