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
      return withManager(params.id, (mgr) => ({
        status: "ok", data: mgr.searchSymbols(query.q ?? "", query.type),
      }));
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
        const callers = edges.map(e => ({ edge: e, symbol: mgr.getSymbol(e.sourceId) })).filter(c => c.symbol);
        return { status: "ok", data: callers };
      });
    },
    async getCallees(params) {
      return withManager(params.id, (mgr) => {
        const symbolId = decodeURIComponent(params.symbolId);
        const edges = mgr.getCallees(symbolId);
        const callees = edges.map(e => ({ edge: e, symbol: mgr.getSymbol(e.targetId) })).filter(c => c.symbol);
        return { status: "ok", data: callees };
      });
    },
    async getFileSymbols(params) {
      return withManager(params.id, (mgr) => ({
        status: "ok", data: mgr.getFileSymbols(decodeURIComponent(params.path)),
      }));
    },
    async getFileDependencies(params) {
      return withManager(params.id, (mgr) => ({
        status: "ok", data: mgr.getFileDependencies(decodeURIComponent(params.path)),
      }));
    },
    async getImpact(params, _body, query) {
      return withManager(params.id, (mgr) => {
        const files = (query.files ?? "").split(",").filter(Boolean);
        if (files.length === 0) return { status: "error", error: "Missing query param: files" };
        return { status: "ok", data: mgr.getImpact(files) };
      });
    },
    async getCommunities(params) {
      return withManager(params.id, (mgr) => ({ status: "ok", data: mgr.getCommunities() }));
    },
    async getCommunity(params) {
      return withManager(params.id, (mgr) => {
        const c = mgr.getCommunity(params.communityId);
        if (!c) return { status: "error", error: `Community not found` };
        return { status: "ok", data: c };
      });
    },
    async getProcesses(params) {
      return withManager(params.id, (mgr) => ({ status: "ok", data: mgr.getProcesses() }));
    },
    async getProcess(params) {
      return withManager(params.id, (mgr) => {
        const p = mgr.getProcess(params.processId);
        if (!p) return { status: "error", error: `Process not found` };
        return { status: "ok", data: p };
      });
    },
  };
}
