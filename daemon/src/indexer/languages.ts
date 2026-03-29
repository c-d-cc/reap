import { join, dirname } from "path";
import { fileURLToPath } from "url";

export interface LanguageConfig {
  name: string;
  wasmFile: string;
  queryFile: string;
  extensions: string[];
}

const QUERIES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "queries");

function wasmPath(name: string): string {
  try {
    const wasmsDir = join(dirname(require.resolve("tree-sitter-wasms/package.json")), "out");
    return join(wasmsDir, `tree-sitter-${name}.wasm`);
  } catch {
    return join("node_modules", "tree-sitter-wasms", "out", `tree-sitter-${name}.wasm`);
  }
}

const LANGUAGES: LanguageConfig[] = [
  { name: "typescript", wasmFile: wasmPath("typescript"), queryFile: join(QUERIES_DIR, "typescript-tags.scm"), extensions: [".ts", ".mts", ".cts"] },
  { name: "tsx", wasmFile: wasmPath("tsx"), queryFile: join(QUERIES_DIR, "tsx-tags.scm"), extensions: [".tsx"] },
  { name: "javascript", wasmFile: wasmPath("javascript"), queryFile: join(QUERIES_DIR, "javascript-tags.scm"), extensions: [".js", ".mjs", ".cjs"] },
  { name: "python", wasmFile: wasmPath("python"), queryFile: join(QUERIES_DIR, "python-tags.scm"), extensions: [".py"] },
  { name: "go", wasmFile: wasmPath("go"), queryFile: join(QUERIES_DIR, "go-tags.scm"), extensions: [".go"] },
  { name: "rust", wasmFile: wasmPath("rust"), queryFile: join(QUERIES_DIR, "rust-tags.scm"), extensions: [".rs"] },
  { name: "java", wasmFile: wasmPath("java"), queryFile: join(QUERIES_DIR, "java-tags.scm"), extensions: [".java"] },
  { name: "kotlin", wasmFile: wasmPath("kotlin"), queryFile: join(QUERIES_DIR, "kotlin-tags.scm"), extensions: [".kt", ".kts"] },
  { name: "c_sharp", wasmFile: wasmPath("c_sharp"), queryFile: join(QUERIES_DIR, "c_sharp-tags.scm"), extensions: [".cs"] },
  { name: "c", wasmFile: wasmPath("c"), queryFile: join(QUERIES_DIR, "c-tags.scm"), extensions: [".c", ".h"] },
  { name: "cpp", wasmFile: wasmPath("cpp"), queryFile: join(QUERIES_DIR, "cpp-tags.scm"), extensions: [".cpp", ".hpp", ".cc", ".hh", ".cxx"] },
  { name: "ruby", wasmFile: wasmPath("ruby"), queryFile: join(QUERIES_DIR, "ruby-tags.scm"), extensions: [".rb"] },
  { name: "php", wasmFile: wasmPath("php"), queryFile: join(QUERIES_DIR, "php-tags.scm"), extensions: [".php"] },
  { name: "swift", wasmFile: wasmPath("swift"), queryFile: join(QUERIES_DIR, "swift-tags.scm"), extensions: [".swift"] },
  { name: "dart", wasmFile: wasmPath("dart"), queryFile: join(QUERIES_DIR, "dart-tags.scm"), extensions: [".dart"] },
];

const EXT_MAP = new Map<string, string>();
for (const lang of LANGUAGES) {
  for (const ext of lang.extensions) {
    EXT_MAP.set(ext, lang.name);
  }
}

const LANG_MAP = new Map<string, LanguageConfig>();
for (const lang of LANGUAGES) {
  LANG_MAP.set(lang.name, lang);
}

export function detectLanguage(filePath: string): string | null {
  const dot = filePath.lastIndexOf(".");
  if (dot === -1) return null;
  const ext = filePath.slice(dot);
  return EXT_MAP.get(ext) ?? null;
}

export function getLanguageConfig(name: string): LanguageConfig | null {
  return LANG_MAP.get(name) ?? null;
}

export function supportedLanguages(): string[] {
  return LANGUAGES.map((l) => l.name);
}
