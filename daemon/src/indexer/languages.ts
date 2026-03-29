import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUERIES_DIR = join(__dirname, "../../queries");

export interface LanguageConfig {
  name: string;
  extensions: string[];
  queryFile: string;
}

const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  typescript: {
    name: "typescript",
    extensions: [".ts"],
    queryFile: join(QUERIES_DIR, "typescript-tags.scm"),
  },
  tsx: {
    name: "tsx",
    extensions: [".tsx"],
    queryFile: join(QUERIES_DIR, "tsx-tags.scm"),
  },
  javascript: {
    name: "javascript",
    extensions: [".js", ".mjs", ".cjs"],
    queryFile: join(QUERIES_DIR, "javascript-tags.scm"),
  },
  python: {
    name: "python",
    extensions: [".py"],
    queryFile: join(QUERIES_DIR, "python-tags.scm"),
  },
  go: {
    name: "go",
    extensions: [".go"],
    queryFile: join(QUERIES_DIR, "go-tags.scm"),
  },
  rust: {
    name: "rust",
    extensions: [".rs"],
    queryFile: join(QUERIES_DIR, "rust-tags.scm"),
  },
  java: {
    name: "java",
    extensions: [".java"],
    queryFile: join(QUERIES_DIR, "java-tags.scm"),
  },
  kotlin: {
    name: "kotlin",
    extensions: [".kt", ".kts"],
    queryFile: join(QUERIES_DIR, "kotlin-tags.scm"),
  },
  c_sharp: {
    name: "c_sharp",
    extensions: [".cs"],
    queryFile: join(QUERIES_DIR, "c_sharp-tags.scm"),
  },
  c: {
    name: "c",
    extensions: [".c", ".h"],
    queryFile: join(QUERIES_DIR, "c-tags.scm"),
  },
  cpp: {
    name: "cpp",
    extensions: [".cpp", ".cc", ".cxx", ".hpp", ".hh"],
    queryFile: join(QUERIES_DIR, "cpp-tags.scm"),
  },
  ruby: {
    name: "ruby",
    extensions: [".rb"],
    queryFile: join(QUERIES_DIR, "ruby-tags.scm"),
  },
  php: {
    name: "php",
    extensions: [".php"],
    queryFile: join(QUERIES_DIR, "php-tags.scm"),
  },
  swift: {
    name: "swift",
    extensions: [".swift"],
    queryFile: join(QUERIES_DIR, "swift-tags.scm"),
  },
  dart: {
    name: "dart",
    extensions: [".dart"],
    queryFile: join(QUERIES_DIR, "dart-tags.scm"),
  },
};

export function supportedLanguages(): string[] {
  return Object.keys(LANGUAGE_CONFIGS);
}

export function getLanguageConfig(lang: string): LanguageConfig | undefined {
  return LANGUAGE_CONFIGS[lang];
}

export function getLanguageByExtension(ext: string): LanguageConfig | undefined {
  return Object.values(LANGUAGE_CONFIGS).find((config) =>
    config.extensions.includes(ext)
  );
}

export function detectLanguage(filePath: string): string | null {
  const ext = "." + filePath.split(".").pop();
  if (!filePath.includes(".")) return null;
  const config = getLanguageByExtension(ext);
  return config ? config.name : null;
}
