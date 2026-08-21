import { gunzipSync, gzipSync } from "zlib";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import type { FileNode, GraphEdge, ImportSpecifier, ImportStats, SymbolNode, SymbolReference } from "./types.js";

/**
 * The index format this build writes and understands.
 *
 * An index written by a different format is discarded and rebuilt rather than
 * migrated: it is derived data, ignored by git, and reproducible from the
 * commit it names. Migrating it would be work whose only outcome is saving a
 * rebuild.
 *
 * Bumped to 2 when `IndexSnapshot.refs` was added and to 3 when `specifiers`
 * joined it. An older index parses fine and its missing field reads as "there
 * are none", so the next incremental run would resolve zero call or zero import
 * edges and report success — exactly the failure each field was added to
 * prevent. A snapshot that is missing something must be refused, not read.
 */
export const INDEX_FORMAT = 3;

/**
 * `manifest.json` — the single owner of the index's layout.
 *
 * Nothing else in the code names `graph.json.gz`; readers follow `shards`. v1
 * writes one shard, which is right at this repository's size (253 KB of JSON,
 * ~1 ms to parse). Splitting by source directory becomes worthwhile somewhere
 * around 50k-100k nodes — measured, in the source backlog — and when it does,
 * the change is confined here because no reader has a path rule of its own.
 */
export interface IndexManifest {
  format: number;
  /**
   * The commit this index describes. The index's identity, not a timestamp:
   * staleness is one SHA comparison against `git rev-parse HEAD`.
   */
  lastIndexedCommit: string | null;
  lastIndexedAt: string;
  /** Logical name → file within the index directory. */
  shards: Record<string, string>;
  stats: IndexStats;
}

export interface IndexStats {
  files: number;
  nodes: number;
  /** Node count by symbol kind. */
  kinds: Record<string, number>;
  /** Edge count by edge kind. */
  edges: Record<string, number>;
  /**
   * Relative import specifiers seen vs. resolved to a file. The one line that
   * would have caught gen-089's five-month silent failure on day one.
   */
  imports: ImportStats;
  /** Languages whose grammar or query could not be loaded, and why. */
  languageFailures?: Record<string, string>;
}

export interface IndexSnapshot {
  nodes: SymbolNode[];
  edges: GraphEdge[];
  files: FileNode[];
  /**
   * Every name referenced in the indexed files.
   *
   * Persisted because an incremental run must re-resolve calls across the
   * whole graph, and it only re-parses a handful of files — see
   * `runIncrementalPipeline`. An index written before this field existed reads
   * as `[]`, which is why `INDEX_FORMAT` moved: an empty ref list would
   * silently produce a graph with no call edges.
   */
  refs: SymbolReference[];
  /**
   * Every relative import specifier, as written.
   *
   * Same reason as `refs`: resolving a specifier depends on the whole file
   * list, so an incremental run has to redo it for files it did not re-parse.
   * Absent, an import edge to a deleted file survives and `status` calls it
   * resolved.
   */
  specifiers: ImportSpecifier[];
}

const MANIFEST_FILE = "manifest.json";
const GRAPH_SHARD = "graph";
const GRAPH_FILE = "graph.json.gz";

export class IndexStore {
  constructor(private readonly dir: string) {}

  /** Absolute path of the index directory (`<project>/.reap/.index`). */
  get path(): string {
    return this.dir;
  }

  /**
   * Read the manifest, or null when there is no index, it is unreadable, or it
   * was written by a format this build does not know.
   */
  readManifest(): IndexManifest | null {
    let raw: string;
    try {
      raw = readFileSync(join(this.dir, MANIFEST_FILE), "utf-8");
    } catch {
      return null;
    }
    try {
      const manifest = JSON.parse(raw) as IndexManifest;
      if (manifest?.format !== INDEX_FORMAT) return null;
      return manifest;
    } catch {
      return null;
    }
  }

  /** Read the graph shard, or null when it is missing or unreadable. */
  readSnapshot(manifest: IndexManifest): IndexSnapshot | null {
    const shard = manifest.shards?.[GRAPH_SHARD];
    if (!shard) return null;
    try {
      const buf = readFileSync(join(this.dir, shard));
      return JSON.parse(gunzipSync(buf).toString("utf-8")) as IndexSnapshot;
    } catch {
      return null;
    }
  }

  /**
   * Replace the index with `snapshot`.
   *
   * A whole-snapshot write, not an append. Serialising the whole graph removes
   * the concept of appending, so a storage layer cannot accumulate duplicate
   * edges across runs and leave every count-based figure inflated.
   */
  write(snapshot: IndexSnapshot, meta: { lastIndexedCommit: string | null; stats: IndexStats }): void {
    mkdirSync(this.dir, { recursive: true });
    writeFileSync(join(this.dir, GRAPH_FILE), gzipSync(Buffer.from(JSON.stringify(snapshot))));

    const manifest: IndexManifest = {
      format: INDEX_FORMAT,
      lastIndexedCommit: meta.lastIndexedCommit,
      lastIndexedAt: new Date().toISOString(),
      shards: { [GRAPH_SHARD]: GRAPH_FILE },
      stats: meta.stats,
    };
    writeFileSync(join(this.dir, MANIFEST_FILE), `${JSON.stringify(manifest, null, 2)}\n`);
  }

  /**
   * Remove the index directory.
   *
   * No production caller: a format change is handled by `readManifest`
   * returning null and the next `write` replacing the contents, so nothing
   * needs to delete first. Kept because "throw the index away" is the correct
   * recovery for any corruption a reader cannot classify, and because a test
   * needs it — but the comment used to claim the format path used it, which
   * was not true (reviewer, gen-089).
   */
  clear(): void {
    rmSync(this.dir, { recursive: true, force: true });
  }
}
