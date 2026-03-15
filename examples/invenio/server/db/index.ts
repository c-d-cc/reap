import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

let db: ReturnType<typeof createDb>;

export function createDb(sqlite?: Database) {
  const database = sqlite ?? new Database("invenio.db");
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  return drizzle(database, { schema });
}

export function getDb() {
  if (!db) {
    db = createDb();
  }
  return db;
}

export type DbInstance = ReturnType<typeof createDb>;
