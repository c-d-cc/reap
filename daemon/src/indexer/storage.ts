import type { SymbolNode, GraphEdge, FileNode } from "../types.js";

// Adapter: use bun:sqlite in Bun, better-sqlite3 in Node
const isBun = typeof globalThis.Bun !== "undefined";

interface DbAdapter {
  exec(sql: string): void;
  prepare(sql: string): StmtAdapter;
  close(): void;
  transaction<T>(fn: () => T): () => T;
}

interface StmtAdapter {
  run(...args: unknown[]): void;
  get(...args: unknown[]): unknown;
  all(...args: unknown[]): unknown[];
}

async function openDatabase(dbPath: string): Promise<DbAdapter> {
  if (isBun) {
    const { Database } = await import("bun:sqlite");
    const db = new Database(dbPath);
    db.exec("PRAGMA journal_mode = WAL;");
    return {
      exec: (sql: string) => db.exec(sql),
      prepare: (sql: string) => {
        const stmt = db.prepare(sql);
        return {
          run: (...args: unknown[]) => stmt.run(...args),
          get: (...args: unknown[]) => stmt.get(...args),
          all: (...args: unknown[]) => stmt.all(...args),
        };
      },
      close: () => db.close(),
      transaction: <T>(fn: () => T) => db.transaction(fn),
    };
  } else {
    const Database = (await import("better-sqlite3")).default;
    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    return {
      exec: (sql: string) => db.exec(sql),
      prepare: (sql: string) => {
        const stmt = db.prepare(sql);
        return {
          run: (...args: unknown[]) => stmt.run(...args),
          get: (...args: unknown[]) => stmt.get(...args) as unknown,
          all: (...args: unknown[]) => stmt.all(...args) as unknown[],
        };
      },
      close: () => db.close(),
      transaction: <T>(fn: () => T) => db.transaction(fn) as () => T,
    };
  }
}

export class IndexStorage {
  private db: DbAdapter | null = null;
  private readonly dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  async open(): Promise<void> {
    this.db = await openDatabase(this.dbPath);
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
    const stmt = this.db!.prepare("INSERT OR REPLACE INTO nodes (id, kind, name, file, line, parent) VALUES (?, ?, ?, ?, ?, ?)");
    const tx = this.db!.transaction(() => {
      for (const n of nodes) {
        stmt.run(n.id, n.kind, n.name, n.file, n.line, n.parent ?? null);
      }
    });
    tx();
  }

  loadNodes(): SymbolNode[] {
    return this.db!.prepare("SELECT id, kind, name, file, line, parent FROM nodes").all() as SymbolNode[];
  }

  saveEdges(edges: GraphEdge[]): void {
    const stmt = this.db!.prepare("INSERT INTO edges (source_id, target_id, kind) VALUES (?, ?, ?)");
    const tx = this.db!.transaction(() => {
      for (const e of edges) {
        stmt.run(e.sourceId, e.targetId, e.kind);
      }
    });
    tx();
  }

  loadEdges(): GraphEdge[] {
    const rows = this.db!.prepare("SELECT source_id, target_id, kind FROM edges").all() as Array<{ source_id: string; target_id: string; kind: string }>;
    return rows.map((r) => ({ sourceId: r.source_id, targetId: r.target_id, kind: r.kind as GraphEdge["kind"] }));
  }

  saveFile(file: FileNode): void {
    this.db!.prepare("INSERT OR REPLACE INTO files (path, language, mtime, last_commit) VALUES (?, ?, ?, ?)").run(file.path, file.language, file.mtime, file.lastCommit);
  }

  getFile(path: string): FileNode | null {
    const row = this.db!.prepare("SELECT path, language, mtime, last_commit FROM files WHERE path = ?").get(path) as { path: string; language: string; mtime: number; last_commit: string } | undefined;
    if (!row) return null;
    return { path: row.path, language: row.language, mtime: row.mtime, lastCommit: row.last_commit };
  }

  removeByFile(file: string): void {
    this.db!.prepare("DELETE FROM edges WHERE source_id IN (SELECT id FROM nodes WHERE file = ?)").run(file);
    this.db!.prepare("DELETE FROM edges WHERE target_id IN (SELECT id FROM nodes WHERE file = ?)").run(file);
    this.db!.prepare("DELETE FROM nodes WHERE file = ?").run(file);
    this.db!.prepare("DELETE FROM files WHERE path = ?").run(file);
  }

  saveMeta(key: string, value: string): void {
    this.db!.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)").run(key, value);
  }

  loadMeta(key: string): string | null {
    const row = this.db!.prepare("SELECT value FROM meta WHERE key = ?").get(key) as { value: string } | undefined;
    return row?.value ?? null;
  }
}
