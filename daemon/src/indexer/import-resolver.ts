import { dirname, join, normalize } from "path";

interface ImportEdge {
  from: string;
  to: string;
  names: string[];
}

export function resolveImports(
  filePath: string,
  language: string,
  source: string,
  allFiles: string[],
): ImportEdge[] {
  switch (language) {
    case "typescript":
    case "tsx":
    case "javascript":
      return resolveJsImports(filePath, source, allFiles);
    case "python":
      return resolvePythonImports(filePath, source, allFiles);
    default:
      return [];
  }
}

function resolveJsImports(filePath: string, source: string, allFiles: string[]): ImportEdge[] {
  const edges: ImportEdge[] = [];
  const importRe = /(?:import|export)\s+(?:\{([^}]*)\}|(\w+))\s+from\s+["']([^"']+)["']/g;
  const sideEffectRe = /import\s+["']([^"']+)["']/g;
  const fileDir = dirname(filePath);
  const fileSet = new Set(allFiles);

  let match: RegExpExecArray | null;
  while ((match = importRe.exec(source)) !== null) {
    const names = match[1]
      ? match[1].split(",").map((n) => n.trim().split(" as ")[0].trim()).filter(Boolean)
      : match[2] ? [match[2]] : [];
    const specifier = match[3];
    if (!specifier.startsWith(".")) continue;
    const resolved = resolveJsPath(fileDir, specifier, fileSet);
    if (resolved) edges.push({ from: filePath, to: resolved, names });
  }

  while ((match = sideEffectRe.exec(source)) !== null) {
    const specifier = match[1];
    if (!specifier.startsWith(".")) continue;
    const resolved = resolveJsPath(fileDir, specifier, fileSet);
    if (resolved) edges.push({ from: filePath, to: resolved, names: [] });
  }

  return edges;
}

function resolveJsPath(fromDir: string, specifier: string, fileSet: Set<string>): string | null {
  const base = normalize(join(fromDir, specifier));
  const candidates = [
    base,
    `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.jsx`, `${base}.mts`, `${base}.mjs`,
    join(base, "index.ts"), join(base, "index.tsx"), join(base, "index.js"),
  ];
  for (const c of candidates) {
    if (fileSet.has(c)) return c;
  }
  return null;
}

function resolvePythonImports(filePath: string, source: string, allFiles: string[]): ImportEdge[] {
  const edges: ImportEdge[] = [];
  const fileDir = dirname(filePath);
  const fileSet = new Set(allFiles);
  const fromRe = /from\s+(\.+[\w.]*)\s+import\s+([\w, ]+)/g;
  let match: RegExpExecArray | null;
  while ((match = fromRe.exec(source)) !== null) {
    const modulePath = match[1];
    const names = match[2].split(",").map((n) => n.trim()).filter(Boolean);
    const dots = modulePath.match(/^\.+/)![0].length;
    const parts = modulePath.slice(dots).split(".").filter(Boolean);
    let baseDir = fileDir;
    for (let i = 1; i < dots; i++) baseDir = dirname(baseDir);
    const candidates = [join(baseDir, ...parts) + ".py", join(baseDir, ...parts, "__init__.py")];
    for (const c of candidates) {
      if (fileSet.has(c)) { edges.push({ from: filePath, to: c, names }); break; }
    }
  }
  return edges;
}
