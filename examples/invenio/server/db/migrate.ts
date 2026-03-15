import { sql } from "drizzle-orm";
import type { DbInstance } from "./index";

export function runMigrations(db: DbInstance) {
  db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    )
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL DEFAULT 'uncategorized',
      quantity INTEGER NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT 'EA',
      unit_price REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (current_timestamp),
      updated_at TEXT NOT NULL DEFAULT (current_timestamp),
      deleted_at TEXT,
      created_by INTEGER NOT NULL REFERENCES users(id)
    )
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    )
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    )
  `);

  db.run(sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL REFERENCES items(id),
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      memo TEXT,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (current_timestamp)
    )
  `);

  // ALTER TABLE for existing databases that don't have the unit column
  try {
    db.run(sql`ALTER TABLE items ADD COLUMN unit TEXT NOT NULL DEFAULT 'EA'`);
  } catch {
    // Column already exists
  }

  // Seed default units
  const defaultUnits = [
    { name: "EA", label: "개" },
    { name: "BOX", label: "박스" },
    { name: "KG", label: "킬로그램" },
    { name: "L", label: "리터" },
    { name: "SET", label: "세트" },
  ];

  for (const u of defaultUnits) {
    db.run(
      sql`INSERT OR IGNORE INTO units (name, label) VALUES (${u.name}, ${u.label})`
    );
  }
}
