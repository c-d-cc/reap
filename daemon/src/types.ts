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
  /**
   * Git commit hash (HEAD) at the moment of the most recent successful
   * indexing run. `null` (or absent for legacy entries) means either the
   * project has never been indexed or the indexing pipeline could not read
   * the commit (e.g. non-git project).
   *
   * Added in gen-068 — exposed via `/projects/:id/status` so agents can
   * compare against the project's current `HEAD` to decide whether
   * `triggerIndexing` is needed before querying symbols/impact.
   */
  lastIndexedCommit?: string | null;
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

// === Graph Types ===

export type SymbolKind = "function" | "method" | "class" | "interface" | "type" | "enum" | "module";
export type EdgeKind = "CONTAINS" | "CALLS" | "IMPORTS" | "EXTENDS" | "IMPLEMENTS";

export interface SymbolNode {
  id: string;
  kind: SymbolKind;
  name: string;
  file: string;
  line: number;
  parent?: string;
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  kind: EdgeKind;
}

export interface FileNode {
  path: string;
  language: string;
  mtime: number;
  lastCommit: string;
}

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
  blastRadius: number;
}
