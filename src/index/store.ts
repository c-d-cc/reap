import { gunzipSync, gzipSync } from "node:zlib";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Edge, SymbolNode } from "./graph.ts";
import type { Found } from "./parser.ts";
import type { ImportStats, Specifier } from "./resolve.ts";

/** 형식이 다르면 옮기지 않고 버린다 — 파생 데이터이고 커밋에서 다시 만들 수 있다. */
export const FORMAT = 1;

export type FileRow = { path: string; language: string; imports: ImportStats };
export type Stats = {
  files: number;
  nodes: number;
  kinds: Record<string, number>;
  edges: Record<string, number>;
  imports: ImportStats;
  languageFailures?: Record<string, string>;
};
export type Manifest = { format: number; commit: string | null; at: string; stats: Stats };
/** refs·specifiers를 함께 저장한다 — 증분 갱신이 전체 해석을 다시 하려면 손대지 않은 파일의 것이 필요하다. */
export type Snapshot = { nodes: SymbolNode[]; edges: Edge[]; files: FileRow[]; refs: Found[]; specifiers: Specifier[] };

export class Store {
  constructor(readonly dir: string) {}

  manifest(): Manifest | null {
    try {
      const m = JSON.parse(readFileSync(join(this.dir, "manifest.json"), "utf8")) as Manifest;
      return m?.format === FORMAT ? m : null;
    } catch {
      return null;
    }
  }

  snapshot(): Snapshot | null {
    try {
      return JSON.parse(gunzipSync(readFileSync(join(this.dir, "graph.json.gz"))).toString("utf8")) as Snapshot;
    } catch {
      return null;
    }
  }

  write(snapshot: Snapshot, commit: string | null, stats: Stats): void {
    if (!existsSync(this.dir)) mkdirSync(this.dir, { recursive: true });
    writeFileSync(join(this.dir, "graph.json.gz"), gzipSync(Buffer.from(JSON.stringify(snapshot))));
    const manifest: Manifest = { format: FORMAT, commit, at: `${new Date().toISOString().slice(0, 19)}Z`, stats };
    writeFileSync(join(this.dir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  }
}
