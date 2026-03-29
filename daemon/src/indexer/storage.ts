import { Database } from "bun:sqlite";
import type { SymbolNode, GraphEdge, FileNode } from "../types.js";

export class IndexStorage {
  private db: Database | null = null;
  private readonly dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  open(): void {
    this.db = new Database(this.dbPath);
    this.db.exec("PRAGMA journal_mode = WAL;");
    this.createSchema();
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  private createSchema(): void {
    this.db!.exec(`
      CREATE TABLE IF NOT EXISTS nodes (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        name TEXT NOT NULL,
        file TEXT NOT NULL,
        line INTEGER NOT NULL,
        parent TEXT
      );
      CREATE TABLE IF NOT EXISTS edges (
        source_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        kind TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS files (
        path TEXT PRIMARY KEY,
        language TEXT NOT NULL,
        mtime REAL NOT NULL,
        last_commit TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_nodes_file ON nodes(file);
      CREATE INDEX IF NOT EXISTS idx_nodes_name ON nodes(name);
      CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_id);
      CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_id);
    `);
  }

  saveNodes(nodes: SymbolNode[]): void {
    const stmt = this.db!.prepare("INSERT OR REPLACE INTO nodes (id, kind, name, file, line, parent) VALUES ($id, $kind, $name, $file, $line, $parent)");
    const tx = this.db!.transaction(() => {
      for (const n of nodes) {
        stmt.run({ $id: n.id, $kind: n.kind, $name: n.name, $file: n.file, $line: n.line, $parent: n.parent ?? null });
      }
    });
    tx();
  }

  loadNodes(): SymbolNode[] {
    return this.db!.query("SELECT id, kind, name, file, line, parent FROM nodes").all() as SymbolNode[];
  }

  saveEdges(edges: GraphEdge[]): void {
    const stmt = this.db!.prepare("INSERT INTO edges (source_id, target_id, kind) VALUES ($sourceId, $targetId, $kind)");
    const tx = this.db!.transaction(() => {
      for (const e of edges) {
        stmt.run({ $sourceId: e.sourceId, $targetId: e.targetId, $kind: e.kind });
      }
    });
    tx();
  }

  loadEdges(): GraphEdge[] {
    const rows = this.db!.query("SELECT source_id, target_id, kind FROM edges").all() as Array<{ source_id: string; target_id: string; kind: string }>;
    return rows.map((r) => ({ sourceId: r.source_id, targetId: r.target_id, kind: r.kind as GraphEdge["kind"] }));
  }

  saveFile(file: FileNode): void {
    this.db!.prepare("INSERT OR REPLACE INTO files (path, language, mtime, last_commit) VALUES ($path, $language, $mtime, $lastCommit)").run({
      $path: file.path,
      $language: file.language,
      $mtime: file.mtime,
      $lastCommit: file.lastCommit,
    });
  }

  getFile(path: string): FileNode | null {
    const row = this.db!.query("SELECT path, language, mtime, last_commit FROM files WHERE path = $path").get({ $path: path }) as { path: string; language: string; mtime: number; last_commit: string } | null;
    if (!row) return null;
    return { path: row.path, language: row.language, mtime: row.mtime, lastCommit: row.last_commit };
  }

  removeByFile(file: string): void {
    this.db!.prepare("DELETE FROM edges WHERE source_id IN (SELECT id FROM nodes WHERE file = $file)").run({ $file: file });
    this.db!.prepare("DELETE FROM edges WHERE target_id IN (SELECT id FROM nodes WHERE file = $file)").run({ $file: file });
    this.db!.prepare("DELETE FROM nodes WHERE file = $file").run({ $file: file });
    this.db!.prepare("DELETE FROM files WHERE path = $file").run({ $file: file });
  }

  saveMeta(key: string, value: string): void {
    this.db!.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ($key, $value)").run({ $key: key, $value: value });
  }

  loadMeta(key: string): string | null {
    const row = this.db!.query("SELECT value FROM meta WHERE key = $key").get({ $key: key }) as { value: string } | null;
    return row?.value ?? null;
  }
}
