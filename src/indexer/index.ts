import { join } from "path";
import { CodeGraph } from "./graph.js";
import { analyzeImpact } from "./impact.js";
import { SymbolExtractor } from "./parser.js";
import { type PipelineOutcome, runFullPipeline, runIncrementalPipeline } from "./pipeline.js";
import { commitExists, getChangedFiles, headCommit, isGitRepo } from "./scanner.js";
import { type IndexStats, IndexStore } from "./store.js";
import type { FileNode, GraphEdge, ImpactResult, ImportSpecifier, SymbolNode, SymbolReference } from "./types.js";

export { IndexStore, INDEX_FORMAT } from "./store.js";
export type { IndexManifest, IndexStats } from "./store.js";

/** Where a project's index lives. Derived data — gitignored, never committed. */
export function indexDir(projectRoot: string): string {
  return join(projectRoot, ".reap", ".index");
}

export interface UpdateResult {
  /** Why this run did what it did — reported so a caller can explain itself. */
  mode: "full" | "incremental" | "up-to-date";
  filesProcessed: number;
  nodes: number;
  edges: number;
  commit: string | null;
  duration: number;
}

export class NotAGitRepoError extends Error {
  constructor(root: string) {
    super(
      `${root} is not a git repository. The index is keyed by commit, so it needs one — run 'git init' and make a commit first.`,
    );
    this.name = "NotAGitRepoError";
  }
}

/**
 * The project's code index: build it, keep it current, ask it questions.
 *
 * There is no process here. The daemon this replaces existed to keep a graph
 * warm, and at this repository's size loading the whole graph costs single-digit
 * milliseconds against a CLI start of 40-70 ms — the thing being avoided was
 * cheaper than the machinery avoiding it. What the daemon actually cost was a
 * port, a registry, a PID file, an idle timer, a separate npm package, and an
 * orphaned process nothing could find.
 */
export class Indexer {
  private readonly store: IndexStore;
  private graph = new CodeGraph();
  private loaded = false;

  constructor(private readonly projectRoot: string, store?: IndexStore) {
    this.store = store ?? new IndexStore(indexDir(projectRoot));
  }

  get storePath(): string {
    return this.store.path;
  }

  /** The manifest as written, or null when there is no usable index. */
  manifest() {
    return this.store.readManifest();
  }

  /**
   * Bring the index level with HEAD.
   *
   * The unit of change is a commit, not a file timestamp: the index records the
   * SHA it describes, so deciding what to redo is one `git diff` and deciding
   * whether to bother is one string comparison. The daemon had this pipeline
   * too — it was simply never reached, because the only caller never passed the
   * flag that selected it, and so every trigger did a full rebuild.
   */
  async update(options: { full?: boolean } = {}): Promise<UpdateResult> {
    if (!isGitRepo(this.projectRoot)) throw new NotAGitRepoError(this.projectRoot);

    const head = headCommit(this.projectRoot);
    const manifest = options.full ? null : this.store.readManifest();
    const recorded = manifest?.lastIndexedCommit ?? null;

    if (manifest && recorded && head && recorded === head) {
      return {
        mode: "up-to-date",
        filesProcessed: 0,
        nodes: manifest.stats.nodes,
        edges: Object.values(manifest.stats.edges).reduce((a, b) => a + b, 0),
        commit: head,
        duration: 0,
      };
    }

    const extractor = new SymbolExtractor();
    await extractor.init();
    try {
      // Incremental only when the recorded commit is still reachable. A
      // rewritten history or a shallow clone makes `git diff` fail, and an
      // empty diff is indistinguishable from "nothing changed" — so ask
      // whether the commit exists rather than reading silence as agreement.
      const canIncrement =
        manifest !== null && recorded !== null && head !== null && commitExists(this.projectRoot, recorded);

      let outcome: PipelineOutcome;
      let mode: UpdateResult["mode"];
      if (canIncrement && this.load()) {
        const previous = this.store.readSnapshot(manifest!);
        const previousRefs: SymbolReference[] = previous?.refs ?? [];
        const previousSpecifiers: ImportSpecifier[] = previous?.specifiers ?? [];
        const changed = getChangedFiles(this.projectRoot, recorded!);
        outcome = await runIncrementalPipeline(
          this.projectRoot,
          this.graph,
          extractor,
          changed,
          previousRefs,
          previousSpecifiers,
        );
        mode = "incremental";
      } else {
        this.graph = new CodeGraph();
        outcome = await runFullPipeline(this.projectRoot, this.graph, extractor);
        mode = "full";
        this.loaded = true;
      }

      // `outcome.parsed` already covers every scanned file — `installImports`
      // resolves the whole specifier set and reports per-file stats for all of
      // them, so there is nothing left to carry forward by hand.
      const files = outcome.parsed;
      this.store.write(
        {
          nodes: this.graph.allNodes(),
          edges: this.graph.allEdges(),
          files,
          refs: outcome.refs,
          specifiers: outcome.specifiers,
        },
        { lastIndexedCommit: head, stats: buildStats(files, outcome.languageFailures, this.graph) },
      );

      return {
        mode,
        filesProcessed: outcome.filesProcessed,
        nodes: outcome.nodes,
        edges: outcome.edges,
        commit: head,
        duration: outcome.duration,
      };
    } finally {
      extractor.dispose();
    }
  }

  /**
   * Load the index into memory, refreshing it first when HEAD has moved.
   *
   * This is what makes branch switches, rebases and commits made outside REAP
   * work without a trigger of their own: every query answers about the code
   * that is checked out, not about whenever the index was last written.
   */
  async ready(): Promise<void> {
    const manifest = this.store.readManifest();
    const head = headCommit(this.projectRoot);
    if (!manifest || manifest.lastIndexedCommit !== head) {
      await this.update();
      return;
    }
    if (!this.load()) await this.update();
  }

  private load(): boolean {
    if (this.loaded) return true;
    const manifest = this.store.readManifest();
    if (!manifest) return false;
    const snapshot = this.store.readSnapshot(manifest);
    if (!snapshot) return false;

    this.graph = new CodeGraph();
    for (const node of snapshot.nodes) this.graph.addNode(node);
    for (const edge of snapshot.edges) this.graph.addEdge(edge);
    this.loaded = true;
    return true;
  }

  search(query: string, kind?: string): SymbolNode[] {
    return this.graph.searchNodes(query, kind);
  }

  callers(symbolId: string): GraphEdge[] {
    return this.graph.getEdgesTo(symbolId, "CALLS");
  }

  callees(symbolId: string): GraphEdge[] {
    return this.graph.getEdgesFrom(symbolId, "CALLS");
  }

  impact(files: string[]): ImpactResult {
    return analyzeImpact(files, this.graph);
  }

  /** Total and distinct edge counts — the P2-b regression guard, queryable. */
  edgeCounts(): { total: number; distinct: number } {
    return this.graph.edgeCounts();
  }
}

function buildStats(
  files: FileNode[],
  languageFailures: Record<string, string>,
  graph: CodeGraph,
): IndexStats {
  const kinds: Record<string, number> = {};
  for (const node of graph.allNodes()) kinds[node.kind] = (kinds[node.kind] ?? 0) + 1;

  const edges: Record<string, number> = {};
  for (const edge of graph.allEdges()) edges[edge.kind] = (edges[edge.kind] ?? 0) + 1;

  const imports = { attempted: 0, resolved: 0 };
  for (const file of files) {
    imports.attempted += file.imports.attempted;
    imports.resolved += file.imports.resolved;
  }

  return {
    files: files.length,
    nodes: graph.allNodes().length,
    kinds,
    edges,
    imports,
    ...(Object.keys(languageFailures).length > 0 ? { languageFailures } : {}),
  };
}

/**
 * Bring the index level with HEAD after REAP has just made a commit.
 *
 * Best-effort and silent: an index is an accelerator, and a project without a
 * grammar for its language, without git, or on a read-only checkout must still
 * complete its generation. Failures surface where they are asked for —
 * `reap index status` — not by interrupting the lifecycle.
 *
 * There is exactly one eager trigger left, and it is here, because a commit is
 * the only event that changes what a commit-keyed index describes. The daemon
 * had four, all of them full rebuilds.
 */
export async function refreshIndexAfterCommit(projectRoot: string): Promise<boolean> {
  try {
    await new Indexer(projectRoot).update();
    return true;
  } catch {
    return false;
  }
}
