import coreWasm from "../../node_modules/web-tree-sitter/tree-sitter.wasm" with { type: "file" };
import cWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-c.wasm" with { type: "file" };
import cSharpWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-c_sharp.wasm" with { type: "file" };
import cppWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-cpp.wasm" with { type: "file" };
import dartWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-dart.wasm" with { type: "file" };
import goWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-go.wasm" with { type: "file" };
import javaWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-java.wasm" with { type: "file" };
import javascriptWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-javascript.wasm" with { type: "file" };
import kotlinWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-kotlin.wasm" with { type: "file" };
import phpWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-php.wasm" with { type: "file" };
import pythonWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-python.wasm" with { type: "file" };
import rubyWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-ruby.wasm" with { type: "file" };
import rustWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-rust.wasm" with { type: "file" };
import swiftWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-swift.wasm" with { type: "file" };
import tsxWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-tsx.wasm" with { type: "file" };
import typescriptWasm from "../../node_modules/tree-sitter-wasms/out/tree-sitter-typescript.wasm" with { type: "file" };
import cQuery from "./queries/c-tags.scm" with { type: "text" };
import cSharpQuery from "./queries/c_sharp-tags.scm" with { type: "text" };
import cppQuery from "./queries/cpp-tags.scm" with { type: "text" };
import dartQuery from "./queries/dart-tags.scm" with { type: "text" };
import goQuery from "./queries/go-tags.scm" with { type: "text" };
import javaQuery from "./queries/java-tags.scm" with { type: "text" };
import javascriptQuery from "./queries/javascript-tags.scm" with { type: "text" };
import kotlinQuery from "./queries/kotlin-tags.scm" with { type: "text" };
import phpQuery from "./queries/php-tags.scm" with { type: "text" };
import pythonQuery from "./queries/python-tags.scm" with { type: "text" };
import rubyQuery from "./queries/ruby-tags.scm" with { type: "text" };
import rustQuery from "./queries/rust-tags.scm" with { type: "text" };
import swiftQuery from "./queries/swift-tags.scm" with { type: "text" };
import tsxQuery from "./queries/tsx-tags.scm" with { type: "text" };
import typescriptQuery from "./queries/typescript-tags.scm" with { type: "text" };

export type Language = { name: string; extensions: string[]; wasm: string; query: string };

/** web-tree-sitter 런타임. 문법과 함께 바이너리에 실린다. */
export const CORE_WASM = coreWasm;

/**
 * 파서는 바이너리가 싣는다 — 설치 즉시 동작해야 하고, 사용자 환경에서 찾는 모델은
 * "없으면 조용히 꺼진다"가 된다. 확장자는 파일명에서 유도할 수 없으므로 여기에만 산다.
 */
export const LANGUAGES: readonly Language[] = [
  { name: "typescript", extensions: [".ts", ".mts", ".cts"], wasm: typescriptWasm, query: typescriptQuery },
  { name: "tsx", extensions: [".tsx"], wasm: tsxWasm, query: tsxQuery },
  { name: "javascript", extensions: [".js", ".mjs", ".cjs", ".jsx"], wasm: javascriptWasm, query: javascriptQuery },
  { name: "python", extensions: [".py"], wasm: pythonWasm, query: pythonQuery },
  { name: "go", extensions: [".go"], wasm: goWasm, query: goQuery },
  { name: "rust", extensions: [".rs"], wasm: rustWasm, query: rustQuery },
  { name: "java", extensions: [".java"], wasm: javaWasm, query: javaQuery },
  { name: "kotlin", extensions: [".kt", ".kts"], wasm: kotlinWasm, query: kotlinQuery },
  { name: "c_sharp", extensions: [".cs"], wasm: cSharpWasm, query: cSharpQuery },
  { name: "c", extensions: [".c", ".h"], wasm: cWasm, query: cQuery },
  { name: "cpp", extensions: [".cpp", ".hpp", ".cc", ".hh", ".cxx"], wasm: cppWasm, query: cppQuery },
  { name: "ruby", extensions: [".rb"], wasm: rubyWasm, query: rubyQuery },
  { name: "php", extensions: [".php"], wasm: phpWasm, query: phpQuery },
  { name: "swift", extensions: [".swift"], wasm: swiftWasm, query: swiftQuery },
  { name: "dart", extensions: [".dart"], wasm: dartWasm, query: dartQuery },
];

const BY_EXT = new Map<string, Language>();
for (const lang of LANGUAGES) for (const ext of lang.extensions) BY_EXT.set(ext, lang);

export function languageOf(path: string): Language | null {
  const dot = path.lastIndexOf(".");
  if (dot < 0) return null;
  return BY_EXT.get(path.slice(dot)) ?? null;
}
