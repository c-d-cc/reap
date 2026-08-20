import { join } from "path";
import { grammarsDir, queriesDir } from "./assets.js";

export interface LanguageConfig {
  name: string;
  wasmFile: string;
  queryFile: string;
  extensions: string[];
}

/**
 * The languages REAP indexes, and the file extensions that select them.
 *
 * The *set* of languages is shared rather than restated: `scripts/build.sh`
 * derives which grammars to bundle from the `*-tags.scm` files, and
 * `tests/unit/indexer-assets.test.ts` asserts every entry here has both a query
 * and a grammar. Extensions cannot be derived from a filename, so they live
 * here and nowhere else.
 */
const LANGUAGE_EXTENSIONS: Array<{ name: string; extensions: string[] }> = [
  { name: "typescript", extensions: [".ts", ".mts", ".cts"] },
  { name: "tsx", extensions: [".tsx"] },
  { name: "javascript", extensions: [".js", ".mjs", ".cjs"] },
  { name: "python", extensions: [".py"] },
  { name: "go", extensions: [".go"] },
  { name: "rust", extensions: [".rs"] },
  { name: "java", extensions: [".java"] },
  { name: "kotlin", extensions: [".kt", ".kts"] },
  { name: "c_sharp", extensions: [".cs"] },
  { name: "c", extensions: [".c", ".h"] },
  { name: "cpp", extensions: [".cpp", ".hpp", ".cc", ".hh", ".cxx"] },
  { name: "ruby", extensions: [".rb"] },
  { name: "php", extensions: [".php"] },
  { name: "swift", extensions: [".swift"] },
  { name: "dart", extensions: [".dart"] },
];

const EXT_MAP = new Map<string, string>();
for (const lang of LANGUAGE_EXTENSIONS) {
  for (const ext of lang.extensions) {
    EXT_MAP.set(ext, lang.name);
  }
}

export function detectLanguage(filePath: string): string | null {
  const dot = filePath.lastIndexOf(".");
  if (dot === -1) return null;
  return EXT_MAP.get(filePath.slice(dot)) ?? null;
}

/**
 * Asset paths are resolved on demand rather than at module load: in a source
 * checkout `dist/grammars/` appears only after a build, and a constant captured
 * at import time would freeze whichever answer happened to be true first.
 */
export function getLanguageConfig(name: string): LanguageConfig | null {
  const entry = LANGUAGE_EXTENSIONS.find((l) => l.name === name);
  if (!entry) return null;
  return {
    name: entry.name,
    wasmFile: join(grammarsDir(), `tree-sitter-${entry.name}.wasm`),
    queryFile: join(queriesDir(), `${entry.name}-tags.scm`),
    extensions: entry.extensions,
  };
}

export function supportedLanguages(): string[] {
  return LANGUAGE_EXTENSIONS.map((l) => l.name);
}
