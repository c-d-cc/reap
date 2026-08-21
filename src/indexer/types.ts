// Graph and analysis types for the built-in code indexer.

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
  /**
   * Import resolution for this file alone.
   *
   * Kept per file rather than only in aggregate so an incremental run can
   * report the whole project's rate: it re-parses a handful of files, and a
   * total computed from just those would make `reap index status` say "2/2"
   * about a project whose real rate had collapsed.
   */
  imports: ImportStats;
}

export interface ImpactResult {
  directFiles: string[];
  indirectFiles: string[];
  affectedSymbols: string[];
  blastRadius: number;
}

/**
 * How many relative import specifiers were seen, and how many found a file.
 *
 * A resolver that stops resolving produces a confident success and an empty
 * graph, which "did indexing run?" cannot tell apart from a correct one.
 * `reap index status` reports this ratio, so the failure is visible on the
 * first run rather than on the day someone finally reads a blast radius.
 */
export interface ImportStats {
  attempted: number;
  resolved: number;
}

/**
 * A relative import specifier as written, before resolution.
 *
 * Persisted for the same reason as {@link SymbolReference}: resolving imports
 * is a whole-graph operation — a specifier is matched against the *current*
 * file list — so an incremental run must redo it for every file, not only the
 * ones it re-parsed. Without these on disk, an import edge to a file that has
 * since been deleted survives forever and `reap index status` goes on
 * reporting it as resolved.
 */
export interface ImportSpecifier {
  file: string;
  language: string;
  specifier: string;
  names: string[];
}

/**
 * A name referenced at a point in a file — the raw material `resolveCalls`
 * turns into CALLS edges.
 *
 * Persisted in the index snapshot, which is not an optimisation. An
 * incremental run re-parses only the changed files, but removing a file's
 * symbols removes the CALLS edges pointing *at* them from files that did not
 * change, and those can only be rebuilt from the unchanged files' references.
 * Without them on disk the graph loses call edges on every incremental run and
 * says nothing about it.
 */
export interface SymbolReference {
  name: string;
  kind: string;
  line: number;
  file: string;
}
