import { dirname, join, normalize } from "path";
import { detectLanguage } from "./languages.js";

import type { ImportSpecifier, ImportStats } from "./types.js";

export interface ImportEdge {
  from: string;
  to: string;
  names: string[];
}

export interface ImportResolution {
  edges: ImportEdge[];
  stats: ImportStats;
}

/**
 * Resolution split into two halves, and the split is the point.
 *
 * Extraction reads one file. Resolution matches what was extracted against the
 * *whole* file list, so its answer changes when any file appears or disappears
 * — which means an incremental run has to redo it for every file, not only the
 * ones it re-parsed. Keeping the halves apart lets the pipeline persist the raw
 * specifiers and re-resolve them all, exactly as it does for call references.
 *
 * Before the split, an incremental run kept an unchanged file's import edge to
 * a file that had since been deleted, and `reap index status` went on calling
 * it resolved — 100% health over a graph with a dangling edge.
 */
export function extractImportSpecifiers(
  filePath: string,
  language: string,
  source: string,
): ImportSpecifier[] {
  switch (language) {
    case "typescript":
    case "tsx":
    case "javascript":
      return extractJsSpecifiers(filePath, language, source);
    case "python":
      return extractPythonSpecifiers(filePath, language, source);
    default:
      return [];
  }
}

/** Resolve extracted specifiers against the current file list. */
export function resolveImportSpecifiers(
  specifiers: ImportSpecifier[],
  allFiles: string[],
): { edges: ImportEdge[]; statsByFile: Map<string, ImportStats> } {
  const fileSet = new Set(allFiles);
  const edges: ImportEdge[] = [];
  const statsByFile = new Map<string, ImportStats>();

  for (const spec of specifiers) {
    const stats = statsByFile.get(spec.file) ?? { attempted: 0, resolved: 0 };
    statsByFile.set(spec.file, stats);
    stats.attempted++;

    const resolved =
      spec.language === "python"
        ? resolvePythonPath(spec.file, spec.specifier, fileSet)
        : resolveJsPath(dirname(spec.file), spec.specifier, fileSet);

    if (resolved) {
      stats.resolved++;
      edges.push({ from: spec.file, to: resolved, names: spec.names });
    }
  }

  return { edges, statsByFile };
}

/**
 * Extract and resolve in one step, against a known file list.
 *
 * Kept because it is the natural unit to test and the shape the resolver's
 * behaviour is stated in.
 */
export function resolveImports(
  filePath: string,
  language: string,
  source: string,
  allFiles: string[],
): ImportResolution {
  const specs = extractImportSpecifiers(filePath, language, source);
  const { edges, statsByFile } = resolveImportSpecifiers(specs, allFiles);
  return { edges, stats: statsByFile.get(filePath) ?? { attempted: 0, resolved: 0 } };
}

function extractJsSpecifiers(filePath: string, language: string, source: string): ImportSpecifier[] {
  const out: ImportSpecifier[] = [];
  const importRe = /(?:import|export)\s+(?:\{([^}]*)\}|(\w+))\s+from\s+["']([^"']+)["']/g;
  const sideEffectRe = /import\s+["']([^"']+)["']/g;

  let match: RegExpExecArray | null;
  while ((match = importRe.exec(source)) !== null) {
    const names = match[1]
      ? match[1].split(",").map((n) => n.trim().split(" as ")[0].trim()).filter(Boolean)
      : match[2] ? [match[2]] : [];
    const specifier = match[3];
    if (!specifier.startsWith(".") || !isCodeSpecifier(specifier)) continue;
    out.push({ file: filePath, language, specifier, names });
  }

  while ((match = sideEffectRe.exec(source)) !== null) {
    const specifier = match[1];
    if (!specifier.startsWith(".") || !isCodeSpecifier(specifier)) continue;
    out.push({ file: filePath, language, specifier, names: [] });
  }

  return out;
}

/**
 * Whether a relative specifier could name a file the indexer knows about.
 *
 * `import "./index.css"` can never resolve to an indexed file, and counting it
 * as an unresolved import would put a ceiling below 100% on the one number
 * that tells you the resolver is working. A rate that cannot reach its own
 * target is a rate people stop reading — which is the failure this metric
 * exists to prevent, reintroduced one level up.
 *
 * A specifier with no extension is always counted: it is the ordinary form and
 * it does name code. The extension is only the part after the final path
 * separator, so `./v1.2/mod` is extensionless rather than `.2/mod`.
 */
function isCodeSpecifier(specifier: string): boolean {
  const lastSlash = specifier.lastIndexOf("/");
  const name = lastSlash === -1 ? specifier : specifier.slice(lastSlash + 1);
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return true;
  const ext = name.slice(dot);
  return ext in JS_TO_TS_EXTENSIONS || detectLanguage(name) !== null;
}

/**
 * What a JavaScript extension in a specifier can name on disk.
 *
 * NodeNext/ESM requires the extension the *emitted* file will have, so a
 * TypeScript project imports `./lifecycle.js` and ships `lifecycle.ts`. Without
 * this mapping the candidate list appended extensions to a base that already
 * ended in `.js` — `lifecycle.js.ts` and friends — and matched nothing, which
 * is why blast radius answered zero for every such project (gen-089).
 */
const JS_TO_TS_EXTENSIONS: Record<string, string[]> = {
  ".js": [".ts", ".tsx", ".js", ".jsx"],
  ".jsx": [".tsx", ".jsx"],
  ".mjs": [".mts", ".mjs"],
  ".cjs": [".cts", ".cjs"],
};

function resolveJsPath(fromDir: string, specifier: string, fileSet: Set<string>): string | null {
  const base = normalize(join(fromDir, specifier));

  const candidates = [base];

  const dot = base.lastIndexOf(".");
  const ext = dot === -1 ? "" : base.slice(dot);
  const mapped = JS_TO_TS_EXTENSIONS[ext];
  if (mapped) {
    const stem = base.slice(0, dot);
    for (const e of mapped) candidates.push(stem + e);
  }

  candidates.push(
    `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.jsx`, `${base}.mts`, `${base}.mjs`,
    join(base, "index.ts"), join(base, "index.tsx"), join(base, "index.js"),
  );

  for (const c of candidates) {
    if (fileSet.has(c)) return c;
  }
  return null;
}

function extractPythonSpecifiers(filePath: string, language: string, source: string): ImportSpecifier[] {
  const out: ImportSpecifier[] = [];
  const fromRe = /from\s+(\.+[\w.]*)\s+import\s+([\w, ]+)/g;
  let match: RegExpExecArray | null;
  while ((match = fromRe.exec(source)) !== null) {
    out.push({
      file: filePath,
      language,
      specifier: match[1],
      names: match[2].split(",").map((n) => n.trim()).filter(Boolean),
    });
  }
  return out;
}

function resolvePythonPath(filePath: string, modulePath: string, fileSet: Set<string>): string | null {
  const dots = modulePath.match(/^\.+/)?.[0].length ?? 0;
  if (dots === 0) return null;
  const parts = modulePath.slice(dots).split(".").filter(Boolean);
  let baseDir = dirname(filePath);
  for (let i = 1; i < dots; i++) baseDir = dirname(baseDir);
  for (const c of [join(baseDir, ...parts) + ".py", join(baseDir, ...parts, "__init__.py")]) {
    if (fileSet.has(c)) return c;
  }
  return null;
}
