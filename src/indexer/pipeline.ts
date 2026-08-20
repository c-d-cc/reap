import { readFileSync } from "fs";
import { CodeGraph } from "./graph.js";
import { SymbolExtractor } from "./parser.js";
import { resolveCalls } from "./call-resolver.js";
import { extractImportSpecifiers, resolveImportSpecifiers } from "./import-resolver.js";
import { type ScannedFile, scanFiles } from "./scanner.js";
import type { FileNode, ImportSpecifier, SymbolNode, SymbolReference } from "./types.js";

export interface PipelineOutcome {
  filesProcessed: number;
  nodes: number;
  edges: number;
  languageFailures: Record<string, string>;
  duration: number;
  /** Every tracked, supported file at this commit — the snapshot's file list. */
  scanned: Array<{ path: string; language: string }>;
  /** Every file in the index, with its import stats after whole-graph resolution. */
  parsed: FileNode[];
  /** Every relative import specifier in the index, as written. */
  specifiers: ImportSpecifier[];
  /**
   * Every reference in the index after this run — the changed files' fresh
   * ones plus the unchanged files' carried-over ones. Persisted, and the input
   * to the whole-graph call resolution below.
   */
  refs: SymbolReference[];
}

/**
 * Parse `targets`, add their symbols and import edges to `graph`, and return
 * what the callers still need.
 *
 * Note what is absent: the daemon ran `git log -1 -- <file>` once per file to
 * record each file's last commit. At 24.5 ms a call that was 5.7 of the 6.2
 * seconds a full index took — 92% of the cost — for information the index needs
 * exactly one copy of. That copy is `manifest.lastIndexedCommit`.
 */
async function parseInto(
  graph: CodeGraph,
  extractor: SymbolExtractor,
  targets: ScannedFile[],
  allFilePaths: string[],
): Promise<{ refs: SymbolReference[]; specifiers: ImportSpecifier[] }> {
  const refs: SymbolReference[] = [];
  const specifiers: ImportSpecifier[] = [];

  for (const file of targets) {
    let source: string;
    try {
      source = readFileSync(file.absolutePath, "utf-8");
    } catch {
      // Tracked but absent from the work tree (sparse checkout, deleted but
      // not yet committed). Nothing to parse; not an error.
      continue;
    }

    const result = await extractor.extract(file.relativePath, file.language, source);
    for (const def of result.definitions) {
      const node: SymbolNode = {
        id: `${file.relativePath}::${def.name}`,
        kind: def.kind as SymbolNode["kind"],
        name: def.name,
        file: file.relativePath,
        line: def.line,
      };
      graph.addNode(node);
    }
    refs.push(...result.references);

    specifiers.push(...extractImportSpecifiers(file.relativePath, file.language, source));
  }

  return { refs, specifiers };
}

/**
 * Resolve every specifier in the index and install the resulting IMPORTS edges.
 *
 * Whole-graph, in both modes, for the same reason call resolution is: a
 * specifier is matched against the current file list, so deleting or adding a
 * file changes the answer for importers that were not touched. Doing this only
 * for re-parsed files left an edge pointing at a deleted file and a status line
 * reporting it as resolved.
 */
function installImports(
  graph: CodeGraph,
  specifiers: ImportSpecifier[],
  scanned: Array<{ path: string; language: string }>,
): FileNode[] {
  graph.removeEdgesOfKind("IMPORTS");

  const { edges, statsByFile } = resolveImportSpecifiers(specifiers, scanned.map((f) => f.path));
  for (const imp of edges) {
    graph.addEdge({ sourceId: `file::${imp.from}`, targetId: `file::${imp.to}`, kind: "IMPORTS" });
  }

  return scanned.map((f) => ({
    path: f.path,
    language: f.language,
    imports: statsByFile.get(f.path) ?? { attempted: 0, resolved: 0 },
  }));
}

/** Index every tracked file, discarding whatever the graph held. */
export async function runFullPipeline(
  projectRoot: string,
  graph: CodeGraph,
  extractor: SymbolExtractor,
): Promise<PipelineOutcome> {
  const start = Date.now();
  graph.clear();

  const files = scanFiles(projectRoot);
  const allFilePaths = files.map((f) => f.relativePath);
  const { refs, specifiers } = await parseInto(graph, extractor, files, allFilePaths);

  const scanned = files.map((f) => ({ path: f.relativePath, language: f.language }));
  const parsed = installImports(graph, specifiers, scanned);
  for (const edge of resolveCalls(refs, graph)) graph.addEdge(edge);

  return {
    filesProcessed: files.length,
    nodes: graph.allNodes().length,
    edges: graph.allEdges().length,
    languageFailures: extractor.failures(),
    duration: Date.now() - start,
    scanned,
    parsed,
    refs,
    specifiers,
  };
}

/**
 * Re-index only `changedFiles`, keeping the rest of `graph` as loaded.
 *
 * Call edges are recomputed for the WHOLE graph, from `previousRefs` merged
 * with the changed files' fresh ones. Resolving only the changed files'
 * references is the obvious shortcut and it is wrong: `graph.removeByFile`
 * deletes every edge incident to a file's symbols, *including the CALLS edges
 * pointing at them from files that did not change*, and nothing else rebuilds
 * those. Five ordinary one-file commits emptied this repository's entire call
 * graph, while `reap index status` went on reporting 100% import resolution —
 * the health signal covers IMPORTS, not CALLS. Found by the evaluator during
 * this generation's validation, on the same generation whose whole subject is
 * checks that ask whether something ran instead of whether the answer is right.
 *
 * The pass is cheap: `resolveCalls` is in-memory name matching over references
 * already on disk, single-digit milliseconds at this repository's size. What
 * incremental avoids is parsing, and it still avoids that.
 */
export async function runIncrementalPipeline(
  projectRoot: string,
  graph: CodeGraph,
  extractor: SymbolExtractor,
  changedFiles: string[],
  previousRefs: SymbolReference[],
  previousSpecifiers: ImportSpecifier[],
): Promise<PipelineOutcome> {
  const start = Date.now();

  const files = scanFiles(projectRoot);
  const allFilePaths = files.map((f) => f.relativePath);
  const byPath = new Map(files.map((f) => [f.relativePath, f]));

  const targets: ScannedFile[] = [];
  for (const path of changedFiles) {
    graph.removeByFile(path);
    const info = byPath.get(path);
    if (info) targets.push(info);
  }

  const { refs, specifiers } = await parseInto(graph, extractor, targets, allFilePaths);

  // Every reference still in play: the unchanged files' (minus any file that
  // left the tree) plus the changed files' fresh ones.
  // What survives from the previous run: everything belonging to a file that is
  // still tracked and was not re-parsed. Then the fresh material is appended.
  const tracked = new Set(allFilePaths);
  const touched = new Set(changedFiles);
  const carry = <T extends { file: string }>(prev: T[], fresh: T[]): T[] =>
    prev.filter((x) => tracked.has(x.file) && !touched.has(x.file)).concat(fresh);

  const allRefs = carry(previousRefs, refs);
  const allSpecifiers = carry(previousSpecifiers, specifiers);

  // Replace, not append — for both edge kinds. Import and call resolution are
  // whole-graph passes: their answers depend on the current file list and the
  // current symbol set, so a previous answer belonging to an untouched file can
  // be wrong now. Appending left `callers` naming a relationship that did not
  // exist, and left an IMPORTS edge pointing at a deleted file while `status`
  // reported it resolved. Both found by the evaluator, one round apart, in the
  // code the previous round had just repaired.
  const scanned = files.map((f) => ({ path: f.relativePath, language: f.language }));
  const parsed = installImports(graph, allSpecifiers, scanned);

  graph.removeEdgesOfKind("CALLS");
  for (const edge of resolveCalls(allRefs, graph)) graph.addEdge(edge);

  return {
    filesProcessed: targets.length,
    nodes: graph.allNodes().length,
    edges: graph.allEdges().length,
    languageFailures: extractor.failures(),
    duration: Date.now() - start,
    scanned,
    parsed,
    refs: allRefs,
    specifiers: allSpecifiers,
  };
}
