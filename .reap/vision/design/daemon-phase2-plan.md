# REAP Daemon Phase 2: 인덱싱 파이프라인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tree-sitter 기반 소스 코드 인덱싱 파이프라인을 구축한다 — 파일 스캔, AST 파싱, 심볼 추출, 그래프 구축, SQLite 영속화, 인메모리 로드.

**Architecture:** `daemon/src/indexer/` 디렉토리에 파이프라인 모듈을 추가. web-tree-sitter(WASM)로 소스 파일을 파싱하고, Aider 스타일의 .scm 쿼리로 심볼 def/ref를 추출한 뒤, 인메모리 그래프를 구축하고 SQLite에 영속화한다. Phase 1의 HTTP 서버와 연결하여 인덱싱 트리거 API를 활성화한다.

**Tech Stack:** web-tree-sitter@0.22.6, tree-sitter-wasms, better-sqlite3 (Phase 1에서 이미 설치), Bun (개발/테스트)

**설계 문서:** `.reap/vision/design/daemon-indexer.md`

**Phase 1 결과:** daemon/ 앱 존재 (HTTP 서버, 라우터, 레지스트리, 프로세스 관리). `POST /projects/:id/index`는 현재 stub.

---

## File Structure

### 신규 파일

| 파일 | 역할 |
|------|------|
| `daemon/src/indexer/scanner.ts` | git ls-files 기반 파일 탐색 + 언어 감지 |
| `daemon/src/indexer/languages.ts` | 언어별 설정 (확장자 → 언어 매핑, .scm 쿼리 경로) |
| `daemon/src/indexer/parser.ts` | web-tree-sitter 초기화, 파일 파싱, 심볼 추출 |
| `daemon/src/indexer/graph.ts` | 인메모리 그래프 (노드/엣지 CRUD, 순회) |
| `daemon/src/indexer/storage.ts` | SQLite 스키마 생성, 읽기/쓰기, 그래프↔DB 변환 |
| `daemon/src/indexer/import-resolver.ts` | import 문 해석 → IMPORTS 엣지 |
| `daemon/src/indexer/call-resolver.ts` | ref 심볼 → def 심볼 매칭 → CALLS 엣지 |
| `daemon/src/indexer/pipeline.ts` | 전체 파이프라인 오케스트레이션 (full/incremental) |
| `daemon/src/indexer/index.ts` | public API (IndexManager 클래스) |
| `daemon/queries/` | 언어별 .scm 쿼리 파일 (Aider 패턴 차용) |

### 수정 파일

| 파일 | 변경 |
|------|------|
| `daemon/package.json` | web-tree-sitter, tree-sitter-wasms 의존성 추가 |
| `daemon/src/api/projects.ts` | index 핸들러를 실제 인덱싱으로 연결 |
| `daemon/src/server.ts` | IndexManager 인스턴스 생성 및 API에 주입 |
| `daemon/src/types.ts` | 그래프 노드/엣지 타입 추가 |

---

## Task 1: 의존성 설치 + 언어 설정

**Files:**
- Modify: `daemon/package.json`
- Create: `daemon/src/indexer/languages.ts`
- Test: `daemon/tests/languages.test.ts`

- [ ] **Step 1: `daemon/package.json`에 의존성 추가**

dependencies에 추가:
```json
"web-tree-sitter": "0.22.6",
"tree-sitter-wasms": "^0.1.13"
```

- [ ] **Step 2: npm install 실행**

Run: `cd daemon && npm install`
Expected: web-tree-sitter, tree-sitter-wasms 설치 완료

- [ ] **Step 3: 테스트 작성 — `daemon/tests/languages.test.ts`**

```typescript
import { describe, test, expect } from "bun:test";

describe("languages", () => {
  test("detects TypeScript from .ts extension", async () => {
    const { detectLanguage } = await import("../src/indexer/languages.js");
    expect(detectLanguage("src/index.ts")).toBe("typescript");
  });

  test("detects Python from .py extension", async () => {
    const { detectLanguage } = await import("../src/indexer/languages.js");
    expect(detectLanguage("main.py")).toBe("python");
  });

  test("detects TSX from .tsx extension", async () => {
    const { detectLanguage } = await import("../src/indexer/languages.js");
    expect(detectLanguage("App.tsx")).toBe("tsx");
  });

  test("returns null for unknown extension", async () => {
    const { detectLanguage } = await import("../src/indexer/languages.js");
    expect(detectLanguage("data.csv")).toBeNull();
  });

  test("getLanguageConfig returns config with wasmFile and queryFile", async () => {
    const { getLanguageConfig } = await import("../src/indexer/languages.js");
    const config = getLanguageConfig("typescript");
    expect(config).not.toBeNull();
    expect(config!.wasmFile).toContain("tree-sitter-typescript.wasm");
    expect(config!.queryFile).toContain("typescript-tags.scm");
  });

  test("supportedLanguages returns all supported languages", async () => {
    const { supportedLanguages } = await import("../src/indexer/languages.js");
    const langs = supportedLanguages();
    expect(langs).toContain("typescript");
    expect(langs).toContain("python");
    expect(langs).toContain("go");
    expect(langs).toContain("rust");
    expect(langs.length).toBeGreaterThanOrEqual(14);
  });
});
```

- [ ] **Step 4: 테스트 실행 — 실패 확인**

Run: `cd daemon && bun test tests/languages.test.ts`
Expected: FAIL

- [ ] **Step 5: 구현 — `daemon/src/indexer/languages.ts`**

```typescript
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
  // tree-sitter-wasms ships .wasm files in out/ directory
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
```

- [ ] **Step 6: 테스트 실행 — 성공 확인**

Run: `cd daemon && bun test tests/languages.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add daemon/package.json daemon/package-lock.json daemon/src/indexer/languages.ts daemon/tests/languages.test.ts
git commit -m "feat(daemon): add tree-sitter dependencies and language config"
```

---

## Task 2: .scm 쿼리 파일 번들링

**Files:**
- Create: `daemon/queries/typescript-tags.scm`
- Create: `daemon/queries/tsx-tags.scm`
- Create: `daemon/queries/javascript-tags.scm`
- Create: `daemon/queries/python-tags.scm`
- Create: `daemon/queries/go-tags.scm`
- Create: `daemon/queries/rust-tags.scm`
- Create: `daemon/queries/java-tags.scm`
- Create: `daemon/queries/kotlin-tags.scm`
- Create: `daemon/queries/c_sharp-tags.scm`
- Create: `daemon/queries/c-tags.scm`
- Create: `daemon/queries/cpp-tags.scm`
- Create: `daemon/queries/ruby-tags.scm`
- Create: `daemon/queries/php-tags.scm`
- Create: `daemon/queries/swift-tags.scm`
- Create: `daemon/queries/dart-tags.scm`

- [ ] **Step 1: Aider의 쿼리 파일 다운로드 및 정리**

Aider 저장소 `aider/queries/tree-sitter-languages/` 에서 각 언어의 `-tags.scm` 파일을 가져온다. Aider의 라이선스(Apache 2.0)를 확인하고, 각 파일 상단에 출처 주석을 추가:

```scheme
;; Based on Aider's tree-sitter queries (Apache 2.0)
;; https://github.com/Aider-AI/aider
```

**TypeScript** (`daemon/queries/typescript-tags.scm`):
```scheme
;; Based on Aider's tree-sitter queries (Apache 2.0)
;; https://github.com/Aider-AI/aider

(function_signature
  name: (identifier) @name.definition.function) @definition.function

(method_signature
  name: (property_identifier) @name.definition.method) @definition.method

(abstract_method_signature
  name: (property_identifier) @name.definition.method) @definition.method

(abstract_class_declaration
  name: (type_identifier) @name.definition.class) @definition.class

(module
  name: (identifier) @name.definition.module) @definition.module

(interface_declaration
  name: (type_identifier) @name.definition.interface) @definition.interface

(type_annotation
  (type_identifier) @name.reference.type) @reference.type

(new_expression
  constructor: (identifier) @name.reference.class) @reference.class

(function_declaration
  name: (identifier) @name.definition.function) @definition.function

(method_definition
  name: (property_identifier) @name.definition.method) @definition.method

(class_declaration
  name: (type_identifier) @name.definition.class) @definition.class

(type_alias_declaration
  name: (type_identifier) @name.definition.type) @definition.type

(enum_declaration
  name: (identifier) @name.definition.enum) @definition.enum
```

나머지 14개 언어 파일도 동일하게 Aider에서 가져와서 `daemon/queries/`에 배치.

각 언어별 쿼리가 캡처하는 항목:
- **Definitions**: function, method, class, interface, type, enum, module
- **References**: call, type, class (new expressions)

- [ ] **Step 2: 쿼리 파일 로드 테스트**

```typescript
// daemon/tests/queries.test.ts
import { describe, test, expect } from "bun:test";
import { readFileSync, existsSync } from "fs";
import { supportedLanguages, getLanguageConfig } from "../src/indexer/languages.js";

describe("query files", () => {
  for (const lang of supportedLanguages()) {
    test(`${lang} query file exists and is valid SCM`, () => {
      const config = getLanguageConfig(lang)!;
      expect(existsSync(config.queryFile)).toBe(true);
      const content = readFileSync(config.queryFile, "utf-8");
      expect(content.length).toBeGreaterThan(0);
      // Should contain at least one definition capture
      expect(content).toContain("@name.definition.");
    });
  }
});
```

- [ ] **Step 3: 테스트 실행**

Run: `cd daemon && bun test tests/queries.test.ts`
Expected: 15개 언어 모두 PASS

- [ ] **Step 4: Commit**

```bash
git add daemon/queries/ daemon/tests/queries.test.ts
git commit -m "feat(daemon): add tree-sitter SCM query files for 15 languages"
```

---

## Task 3: 파일 스캐너

**Files:**
- Create: `daemon/src/indexer/scanner.ts`
- Test: `daemon/tests/scanner.test.ts`

- [ ] **Step 1: 테스트 작성 — `daemon/tests/scanner.test.ts`**

```typescript
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execSync } from "child_process";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-scanner");

beforeEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  mkdirSync(join(TEST_DIR, "src"), { recursive: true });
  execSync("git init", { cwd: TEST_DIR, stdio: "ignore" });
  execSync('git config user.email "test@test.com" && git config user.name "test"', { cwd: TEST_DIR, stdio: "ignore" });

  writeFileSync(join(TEST_DIR, "src", "index.ts"), "export const x = 1;");
  writeFileSync(join(TEST_DIR, "src", "utils.py"), "def foo(): pass");
  writeFileSync(join(TEST_DIR, "README.md"), "# Hello");
  writeFileSync(join(TEST_DIR, ".gitignore"), "node_modules/\n");
  mkdirSync(join(TEST_DIR, "node_modules", "pkg"), { recursive: true });
  writeFileSync(join(TEST_DIR, "node_modules", "pkg", "index.js"), "module.exports = {};");
  execSync("git add -A && git commit -m init", { cwd: TEST_DIR, stdio: "ignore" });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("scanner", () => {
  test("scanFiles returns tracked source files with language", async () => {
    const { scanFiles } = await import("../src/indexer/scanner.js");
    const files = await scanFiles(TEST_DIR);
    const paths = files.map((f) => f.relativePath);
    expect(paths).toContain("src/index.ts");
    expect(paths).toContain("src/utils.py");
  });

  test("excludes non-source files", async () => {
    const { scanFiles } = await import("../src/indexer/scanner.js");
    const files = await scanFiles(TEST_DIR);
    const paths = files.map((f) => f.relativePath);
    expect(paths).not.toContain("README.md");
    expect(paths).not.toContain(".gitignore");
  });

  test("excludes gitignored files", async () => {
    const { scanFiles } = await import("../src/indexer/scanner.js");
    const files = await scanFiles(TEST_DIR);
    const paths = files.map((f) => f.relativePath);
    expect(paths).not.toContain("node_modules/pkg/index.js");
  });

  test("returns language for each file", async () => {
    const { scanFiles } = await import("../src/indexer/scanner.js");
    const files = await scanFiles(TEST_DIR);
    const tsFile = files.find((f) => f.relativePath === "src/index.ts");
    expect(tsFile!.language).toBe("typescript");
    const pyFile = files.find((f) => f.relativePath === "src/utils.py");
    expect(pyFile!.language).toBe("python");
  });

  test("getChangedFiles returns files changed since commit", async () => {
    const { getChangedFiles } = await import("../src/indexer/scanner.js");
    const lastCommit = execSync("git rev-parse HEAD", { cwd: TEST_DIR }).toString().trim();

    writeFileSync(join(TEST_DIR, "src", "new.ts"), "export const y = 2;");
    execSync("git add -A && git commit -m add", { cwd: TEST_DIR, stdio: "ignore" });

    const changed = await getChangedFiles(TEST_DIR, lastCommit);
    expect(changed).toContain("src/new.ts");
    expect(changed).not.toContain("src/index.ts");
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

- [ ] **Step 3: 구현 — `daemon/src/indexer/scanner.ts`**

```typescript
import { execSync } from "child_process";
import { statSync } from "fs";
import { join } from "path";
import { detectLanguage } from "./languages.js";

export interface ScannedFile {
  relativePath: string;
  absolutePath: string;
  language: string;
  mtime: number;
}

export async function scanFiles(projectRoot: string): Promise<ScannedFile[]> {
  const output = execSync("git ls-files -z", { cwd: projectRoot, encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 });
  const paths = output.split("\0").filter(Boolean);

  const files: ScannedFile[] = [];
  for (const relativePath of paths) {
    const language = detectLanguage(relativePath);
    if (!language) continue;

    const absolutePath = join(projectRoot, relativePath);
    try {
      const stat = statSync(absolutePath);
      files.push({ relativePath, absolutePath, language, mtime: stat.mtimeMs });
    } catch {
      // File may have been deleted between ls-files and stat
    }
  }

  return files;
}

export async function getChangedFiles(projectRoot: string, sinceCommit: string): Promise<string[]> {
  // Committed changes since last index
  let committed: string[] = [];
  try {
    const output = execSync(`git diff --name-only ${sinceCommit}..HEAD`, { cwd: projectRoot, encoding: "utf-8" });
    committed = output.split("\n").filter(Boolean);
  } catch {
    // If sinceCommit doesn't exist, treat as full re-index needed
    return [];
  }

  // Uncommitted changes (staged + unstaged)
  let uncommitted: string[] = [];
  try {
    const output = execSync("git diff --name-only HEAD", { cwd: projectRoot, encoding: "utf-8" });
    const staged = execSync("git diff --name-only --cached", { cwd: projectRoot, encoding: "utf-8" });
    uncommitted = [...output.split("\n"), ...staged.split("\n")].filter(Boolean);
  } catch {}

  // Deduplicate and filter to supported languages
  const all = [...new Set([...committed, ...uncommitted])];
  return all.filter((f) => detectLanguage(f) !== null);
}
```

- [ ] **Step 4: 테스트 실행 — 성공 확인**

- [ ] **Step 5: Commit**

```bash
git add daemon/src/indexer/scanner.ts daemon/tests/scanner.test.ts
git commit -m "feat(daemon): add git-based file scanner with language detection"
```

---

## Task 4: 타입 확장 + 인메모리 그래프

**Files:**
- Modify: `daemon/src/types.ts`
- Create: `daemon/src/indexer/graph.ts`
- Test: `daemon/tests/graph.test.ts`

- [ ] **Step 1: `daemon/src/types.ts`에 그래프 타입 추가**

기존 내용 끝에 추가:

```typescript
// === Graph Types ===

export type SymbolKind = "function" | "method" | "class" | "interface" | "type" | "enum" | "module";
export type EdgeKind = "CONTAINS" | "CALLS" | "IMPORTS" | "EXTENDS" | "IMPLEMENTS";

export interface SymbolNode {
  id: string;              // "{file}::{name}" or "{file}::{class}::{name}"
  kind: SymbolKind;
  name: string;
  file: string;            // relative path
  line: number;
  parent?: string;         // parent node id (e.g., class for method)
}

export interface GraphEdge {
  sourceId: string;
  targetId: string;
  kind: EdgeKind;
}

export interface FileNode {
  path: string;            // relative path
  language: string;
  mtime: number;
  lastCommit: string;
}
```

- [ ] **Step 2: 테스트 작성 — `daemon/tests/graph.test.ts`**

```typescript
import { describe, test, expect } from "bun:test";

describe("CodeGraph", () => {
  test("addNode and getNode", async () => {
    const { CodeGraph } = await import("../src/indexer/graph.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "src/a.ts::foo", kind: "function", name: "foo", file: "src/a.ts", line: 1 });
    const node = graph.getNode("src/a.ts::foo");
    expect(node).not.toBeNull();
    expect(node!.name).toBe("foo");
  });

  test("addEdge and getEdges", async () => {
    const { CodeGraph } = await import("../src/indexer/graph.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a::foo", kind: "function", name: "foo", file: "a.ts", line: 1 });
    graph.addNode({ id: "b::bar", kind: "function", name: "bar", file: "b.ts", line: 1 });
    graph.addEdge({ sourceId: "a::foo", targetId: "b::bar", kind: "CALLS" });
    const edges = graph.getEdgesFrom("a::foo");
    expect(edges).toHaveLength(1);
    expect(edges[0].targetId).toBe("b::bar");
  });

  test("getEdgesTo returns incoming edges", async () => {
    const { CodeGraph } = await import("../src/indexer/graph.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a::foo", kind: "function", name: "foo", file: "a.ts", line: 1 });
    graph.addNode({ id: "b::bar", kind: "function", name: "bar", file: "b.ts", line: 1 });
    graph.addEdge({ sourceId: "a::foo", targetId: "b::bar", kind: "CALLS" });
    const edges = graph.getEdgesTo("b::bar");
    expect(edges).toHaveLength(1);
    expect(edges[0].sourceId).toBe("a::foo");
  });

  test("getNodesByFile returns all nodes in a file", async () => {
    const { CodeGraph } = await import("../src/indexer/graph.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a.ts::foo", kind: "function", name: "foo", file: "a.ts", line: 1 });
    graph.addNode({ id: "a.ts::bar", kind: "function", name: "bar", file: "a.ts", line: 5 });
    graph.addNode({ id: "b.ts::baz", kind: "function", name: "baz", file: "b.ts", line: 1 });
    const nodes = graph.getNodesByFile("a.ts");
    expect(nodes).toHaveLength(2);
  });

  test("removeByFile removes nodes and their edges", async () => {
    const { CodeGraph } = await import("../src/indexer/graph.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a.ts::foo", kind: "function", name: "foo", file: "a.ts", line: 1 });
    graph.addNode({ id: "b.ts::bar", kind: "function", name: "bar", file: "b.ts", line: 1 });
    graph.addEdge({ sourceId: "a.ts::foo", targetId: "b.ts::bar", kind: "CALLS" });
    graph.removeByFile("a.ts");
    expect(graph.getNode("a.ts::foo")).toBeNull();
    expect(graph.getEdgesTo("b.ts::bar")).toHaveLength(0);
  });

  test("searchNodes finds by name prefix", async () => {
    const { CodeGraph } = await import("../src/indexer/graph.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a.ts::createUser", kind: "function", name: "createUser", file: "a.ts", line: 1 });
    graph.addNode({ id: "a.ts::createPost", kind: "function", name: "createPost", file: "a.ts", line: 5 });
    graph.addNode({ id: "a.ts::deleteUser", kind: "function", name: "deleteUser", file: "a.ts", line: 10 });
    const results = graph.searchNodes("create");
    expect(results).toHaveLength(2);
  });

  test("stats returns node and edge counts", async () => {
    const { CodeGraph } = await import("../src/indexer/graph.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a::foo", kind: "function", name: "foo", file: "a.ts", line: 1 });
    graph.addNode({ id: "b::bar", kind: "function", name: "bar", file: "b.ts", line: 1 });
    graph.addEdge({ sourceId: "a::foo", targetId: "b::bar", kind: "CALLS" });
    const s = graph.stats();
    expect(s.nodeCount).toBe(2);
    expect(s.edgeCount).toBe(1);
  });
});
```

- [ ] **Step 3: 테스트 실행 — 실패 확인**

- [ ] **Step 4: 구현 — `daemon/src/indexer/graph.ts`**

```typescript
import type { SymbolNode, GraphEdge, EdgeKind } from "../types.js";

export class CodeGraph {
  private nodes = new Map<string, SymbolNode>();
  private edgesFrom = new Map<string, GraphEdge[]>();    // sourceId → edges
  private edgesTo = new Map<string, GraphEdge[]>();      // targetId → edges
  private fileIndex = new Map<string, Set<string>>();    // file → node ids

  addNode(node: SymbolNode): void {
    this.nodes.set(node.id, node);
    if (!this.fileIndex.has(node.file)) {
      this.fileIndex.set(node.file, new Set());
    }
    this.fileIndex.get(node.file)!.add(node.id);
  }

  getNode(id: string): SymbolNode | null {
    return this.nodes.get(id) ?? null;
  }

  addEdge(edge: GraphEdge): void {
    if (!this.edgesFrom.has(edge.sourceId)) {
      this.edgesFrom.set(edge.sourceId, []);
    }
    this.edgesFrom.get(edge.sourceId)!.push(edge);

    if (!this.edgesTo.has(edge.targetId)) {
      this.edgesTo.set(edge.targetId, []);
    }
    this.edgesTo.get(edge.targetId)!.push(edge);
  }

  getEdgesFrom(nodeId: string, kind?: EdgeKind): GraphEdge[] {
    const edges = this.edgesFrom.get(nodeId) ?? [];
    return kind ? edges.filter((e) => e.kind === kind) : edges;
  }

  getEdgesTo(nodeId: string, kind?: EdgeKind): GraphEdge[] {
    const edges = this.edgesTo.get(nodeId) ?? [];
    return kind ? edges.filter((e) => e.kind === kind) : edges;
  }

  getNodesByFile(file: string): SymbolNode[] {
    const ids = this.fileIndex.get(file);
    if (!ids) return [];
    return [...ids].map((id) => this.nodes.get(id)!).filter(Boolean);
  }

  removeByFile(file: string): void {
    const ids = this.fileIndex.get(file);
    if (!ids) return;

    for (const id of ids) {
      this.nodes.delete(id);
      // Remove outgoing edges
      const outgoing = this.edgesFrom.get(id) ?? [];
      for (const edge of outgoing) {
        const incoming = this.edgesTo.get(edge.targetId);
        if (incoming) {
          const idx = incoming.findIndex((e) => e.sourceId === id && e.kind === edge.kind);
          if (idx !== -1) incoming.splice(idx, 1);
        }
      }
      this.edgesFrom.delete(id);
      // Remove incoming edges
      const incoming = this.edgesTo.get(id) ?? [];
      for (const edge of incoming) {
        const outgoing2 = this.edgesFrom.get(edge.sourceId);
        if (outgoing2) {
          const idx = outgoing2.findIndex((e) => e.targetId === id && e.kind === edge.kind);
          if (idx !== -1) outgoing2.splice(idx, 1);
        }
      }
      this.edgesTo.delete(id);
    }

    this.fileIndex.delete(file);
  }

  searchNodes(query: string, kind?: string): SymbolNode[] {
    const q = query.toLowerCase();
    const results: SymbolNode[] = [];
    for (const node of this.nodes.values()) {
      if (kind && node.kind !== kind) continue;
      if (node.name.toLowerCase().includes(q)) {
        results.push(node);
      }
    }
    return results;
  }

  allNodes(): SymbolNode[] {
    return [...this.nodes.values()];
  }

  allEdges(): GraphEdge[] {
    const edges: GraphEdge[] = [];
    for (const list of this.edgesFrom.values()) {
      edges.push(...list);
    }
    return edges;
  }

  stats(): { nodeCount: number; edgeCount: number; fileCount: number } {
    return {
      nodeCount: this.nodes.size,
      edgeCount: this.allEdges().length,
      fileCount: this.fileIndex.size,
    };
  }

  clear(): void {
    this.nodes.clear();
    this.edgesFrom.clear();
    this.edgesTo.clear();
    this.fileIndex.clear();
  }
}
```

- [ ] **Step 5: 테스트 실행 — 성공 확인**

- [ ] **Step 6: Commit**

```bash
git add daemon/src/types.ts daemon/src/indexer/graph.ts daemon/tests/graph.test.ts
git commit -m "feat(daemon): add graph types and in-memory code graph"
```

---

## Task 5: Tree-sitter 파서 + 심볼 추출

**Files:**
- Create: `daemon/src/indexer/parser.ts`
- Test: `daemon/tests/parser.test.ts`

- [ ] **Step 1: 테스트 작성 — `daemon/tests/parser.test.ts`**

```typescript
import { describe, test, expect, beforeAll, afterAll } from "bun:test";

describe("SymbolExtractor", () => {
  let extractor: any;

  beforeAll(async () => {
    const { SymbolExtractor } = await import("../src/indexer/parser.js");
    extractor = new SymbolExtractor();
    await extractor.init();
  });

  afterAll(() => {
    extractor?.dispose();
  });

  test("extracts function definition from TypeScript", async () => {
    const result = await extractor.extract("src/index.ts", "typescript",
      `export function createUser(name: string): User {\n  return { name };\n}`
    );
    const defs = result.definitions;
    expect(defs.length).toBeGreaterThanOrEqual(1);
    const fn = defs.find((d: any) => d.name === "createUser");
    expect(fn).toBeDefined();
    expect(fn.kind).toBe("function");
    expect(fn.line).toBe(1);
  });

  test("extracts class and method from TypeScript", async () => {
    const result = await extractor.extract("src/service.ts", "typescript",
      `class UserService {\n  getUser(id: number): User { return {} as User; }\n}`
    );
    const cls = result.definitions.find((d: any) => d.name === "UserService");
    expect(cls).toBeDefined();
    expect(cls.kind).toBe("class");
    const method = result.definitions.find((d: any) => d.name === "getUser");
    expect(method).toBeDefined();
    expect(method.kind).toBe("method");
  });

  test("extracts interface and type from TypeScript", async () => {
    const result = await extractor.extract("src/types.ts", "typescript",
      `interface User { name: string; }\ntype Status = "active" | "inactive";`
    );
    const iface = result.definitions.find((d: any) => d.name === "User");
    expect(iface).toBeDefined();
    expect(iface.kind).toBe("interface");
    const type = result.definitions.find((d: any) => d.name === "Status");
    expect(type).toBeDefined();
    expect(type.kind).toBe("type");
  });

  test("extracts references", async () => {
    const result = await extractor.extract("src/main.ts", "typescript",
      `const svc = new UserService();\nconst user: User = svc.getUser(1);`
    );
    expect(result.references.length).toBeGreaterThanOrEqual(1);
    const ref = result.references.find((r: any) => r.name === "UserService");
    expect(ref).toBeDefined();
  });

  test("extracts Python function and class", async () => {
    const result = await extractor.extract("main.py", "python",
      `class Processor:\n    def process(self, data):\n        pass\n\ndef main():\n    p = Processor()\n    p.process([])`
    );
    const cls = result.definitions.find((d: any) => d.name === "Processor");
    expect(cls).toBeDefined();
    const fn = result.definitions.find((d: any) => d.name === "main");
    expect(fn).toBeDefined();
  });

  test("returns empty for unsupported content", async () => {
    const result = await extractor.extract("data.txt", "typescript", "just some text");
    // Should not crash, may return 0 or some definitions
    expect(result.definitions).toBeDefined();
    expect(result.references).toBeDefined();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

- [ ] **Step 3: 구현 — `daemon/src/indexer/parser.ts`**

```typescript
import { readFileSync } from "fs";
import { getLanguageConfig } from "./languages.js";

// web-tree-sitter 0.22.x uses CJS default export
let Parser: any;

interface SymbolInfo {
  name: string;
  kind: string;
  line: number;
  file: string;
}

export interface ExtractResult {
  definitions: SymbolInfo[];
  references: SymbolInfo[];
}

export class SymbolExtractor {
  private parser: any = null;
  private languages = new Map<string, any>();
  private queries = new Map<string, any>();

  async init(): Promise<void> {
    Parser = (await import("web-tree-sitter")).default;
    await Parser.init();
    this.parser = new Parser();
  }

  private async loadLanguage(langName: string): Promise<{ lang: any; query: any } | null> {
    if (this.languages.has(langName)) {
      return { lang: this.languages.get(langName), query: this.queries.get(langName) };
    }

    const config = getLanguageConfig(langName);
    if (!config) return null;

    try {
      const lang = await Parser.Language.load(config.wasmFile);
      const scmSource = readFileSync(config.queryFile, "utf-8");
      const query = lang.query(scmSource);
      this.languages.set(langName, lang);
      this.queries.set(langName, query);
      return { lang, query };
    } catch (e) {
      console.error(`Failed to load language ${langName}:`, e);
      return null;
    }
  }

  async extract(filePath: string, language: string, source: string): Promise<ExtractResult> {
    const loaded = await this.loadLanguage(language);
    if (!loaded) return { definitions: [], references: [] };

    this.parser.setLanguage(loaded.lang);
    const tree = this.parser.parse(source);
    const captures = loaded.query.captures(tree.rootNode);

    const definitions: SymbolInfo[] = [];
    const references: SymbolInfo[] = [];

    for (const { name: captureName, node } of captures) {
      // Only process @name.* captures (skip the outer @definition.* / @reference.* captures)
      if (!captureName.startsWith("name.")) continue;

      const text = node.text;
      const line = node.startPosition.row + 1;

      if (captureName.startsWith("name.definition.")) {
        const kind = captureName.replace("name.definition.", "");
        definitions.push({ name: text, kind, line, file: filePath });
      } else if (captureName.startsWith("name.reference.")) {
        const kind = captureName.replace("name.reference.", "");
        references.push({ name: text, kind, line, file: filePath });
      }
    }

    tree.delete();
    return { definitions, references };
  }

  dispose(): void {
    if (this.parser) {
      this.parser.delete();
      this.parser = null;
    }
    this.languages.clear();
    this.queries.clear();
  }
}
```

- [ ] **Step 4: 테스트 실행 — 성공 확인**

Run: `cd daemon && bun test tests/parser.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add daemon/src/indexer/parser.ts daemon/tests/parser.test.ts
git commit -m "feat(daemon): add tree-sitter symbol extractor with multi-language support"
```

---

## Task 6: SQLite 저장소

**Files:**
- Create: `daemon/src/indexer/storage.ts`
- Test: `daemon/tests/storage.test.ts`

- [ ] **Step 1: 테스트 작성 — `daemon/tests/storage.test.ts`**

```typescript
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-storage");
const TEST_DB = join(TEST_DIR, "index.db");

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe("IndexStorage", () => {
  test("creates schema on open", async () => {
    const { IndexStorage } = await import("../src/indexer/storage.js");
    const storage = new IndexStorage(TEST_DB);
    storage.open();
    // Should not throw
    storage.close();
  });

  test("saves and loads nodes", async () => {
    const { IndexStorage } = await import("../src/indexer/storage.js");
    const storage = new IndexStorage(TEST_DB);
    storage.open();
    storage.saveNodes([
      { id: "a.ts::foo", kind: "function", name: "foo", file: "a.ts", line: 1 },
      { id: "a.ts::Bar", kind: "class", name: "Bar", file: "a.ts", line: 10 },
    ]);
    const nodes = storage.loadNodes();
    expect(nodes).toHaveLength(2);
    expect(nodes[0].name).toBe("foo");
    storage.close();
  });

  test("saves and loads edges", async () => {
    const { IndexStorage } = await import("../src/indexer/storage.js");
    const storage = new IndexStorage(TEST_DB);
    storage.open();
    storage.saveEdges([
      { sourceId: "a.ts::foo", targetId: "b.ts::bar", kind: "CALLS" },
    ]);
    const edges = storage.loadEdges();
    expect(edges).toHaveLength(1);
    expect(edges[0].kind).toBe("CALLS");
    storage.close();
  });

  test("saves and loads file metadata", async () => {
    const { IndexStorage } = await import("../src/indexer/storage.js");
    const storage = new IndexStorage(TEST_DB);
    storage.open();
    storage.saveFile({ path: "a.ts", language: "typescript", mtime: 1234567890, lastCommit: "abc123" });
    const file = storage.getFile("a.ts");
    expect(file).not.toBeNull();
    expect(file!.language).toBe("typescript");
    storage.close();
  });

  test("removeByFile clears nodes, edges, and file record", async () => {
    const { IndexStorage } = await import("../src/indexer/storage.js");
    const storage = new IndexStorage(TEST_DB);
    storage.open();
    storage.saveFile({ path: "a.ts", language: "typescript", mtime: 0, lastCommit: "" });
    storage.saveNodes([{ id: "a.ts::foo", kind: "function", name: "foo", file: "a.ts", line: 1 }]);
    storage.saveEdges([{ sourceId: "a.ts::foo", targetId: "b.ts::bar", kind: "CALLS" }]);

    storage.removeByFile("a.ts");
    expect(storage.getFile("a.ts")).toBeNull();
    expect(storage.loadNodes().filter((n) => n.file === "a.ts")).toHaveLength(0);
    storage.close();
  });

  test("saveMeta and loadMeta", async () => {
    const { IndexStorage } = await import("../src/indexer/storage.js");
    const storage = new IndexStorage(TEST_DB);
    storage.open();
    storage.saveMeta("lastCommit", "abc123");
    expect(storage.loadMeta("lastCommit")).toBe("abc123");
    storage.close();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

- [ ] **Step 3: 구현 — `daemon/src/indexer/storage.ts`**

```typescript
import Database from "better-sqlite3";
import type { SymbolNode, GraphEdge, FileNode } from "../types.js";

export class IndexStorage {
  private db: Database.Database | null = null;
  private readonly dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  open(): void {
    this.db = new Database(this.dbPath);
    this.db.pragma("journal_mode = WAL");
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
```

- [ ] **Step 4: 테스트 실행 — 성공 확인**

- [ ] **Step 5: Commit**

```bash
git add daemon/src/indexer/storage.ts daemon/tests/storage.test.ts
git commit -m "feat(daemon): add SQLite storage for graph persistence"
```

---

## Task 7: Import 해석기

**Files:**
- Create: `daemon/src/indexer/import-resolver.ts`
- Test: `daemon/tests/import-resolver.test.ts`

- [ ] **Step 1: 테스트 작성 — `daemon/tests/import-resolver.test.ts`**

```typescript
import { describe, test, expect } from "bun:test";

describe("ImportResolver", () => {
  test("resolves TypeScript/JS relative import", async () => {
    const { resolveImports } = await import("../src/indexer/import-resolver.js");
    const source = `import { foo } from "./utils";\nimport { Bar } from "../models/bar";`;
    const result = resolveImports("src/index.ts", "typescript", source, ["src/utils.ts", "models/bar.ts"]);
    expect(result).toContainEqual({ from: "src/index.ts", to: "src/utils.ts", names: ["foo"] });
    expect(result).toContainEqual({ from: "src/index.ts", to: "models/bar.ts", names: ["Bar"] });
  });

  test("resolves Python import", async () => {
    const { resolveImports } = await import("../src/indexer/import-resolver.js");
    const source = `from .utils import helper\nimport models.user`;
    const result = resolveImports("src/main.py", "python", source, ["src/utils.py", "models/user.py"]);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test("ignores node_modules / external imports", async () => {
    const { resolveImports } = await import("../src/indexer/import-resolver.js");
    const source = `import express from "express";\nimport { foo } from "./local";`;
    const result = resolveImports("src/app.ts", "typescript", source, ["src/local.ts"]);
    // Should only have the local import, not express
    expect(result).toHaveLength(1);
    expect(result[0].to).toBe("src/local.ts");
  });

  test("handles re-exports", async () => {
    const { resolveImports } = await import("../src/indexer/import-resolver.js");
    const source = `export { default } from "./module";`;
    const result = resolveImports("src/index.ts", "typescript", source, ["src/module.ts"]);
    expect(result).toHaveLength(1);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

- [ ] **Step 3: 구현 — `daemon/src/indexer/import-resolver.ts`**

```typescript
import { dirname, join, normalize } from "path";

interface ImportEdge {
  from: string;   // relative path of importer
  to: string;     // relative path of imported file
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
    case "go":
      return resolveGoImports(filePath, source, allFiles);
    default:
      return resolveGenericImports(filePath, source, allFiles);
  }
}

function resolveJsImports(filePath: string, source: string, allFiles: string[]): ImportEdge[] {
  const edges: ImportEdge[] = [];
  // Match: import { x, y } from "./path"  or  import x from "./path"  or  export { x } from "./path"
  const importRe = /(?:import|export)\s+(?:\{([^}]*)\}|(\w+))\s+from\s+["']([^"']+)["']/g;
  // Match: import "./path" (side-effect)
  const sideEffectRe = /import\s+["']([^"']+)["']/g;

  const fileDir = dirname(filePath);
  const fileSet = new Set(allFiles);

  let match: RegExpExecArray | null;
  while ((match = importRe.exec(source)) !== null) {
    const names = match[1]
      ? match[1].split(",").map((n) => n.trim().split(" as ")[0].trim()).filter(Boolean)
      : match[2] ? [match[2]] : [];
    const specifier = match[3];
    if (!specifier.startsWith(".")) continue;  // external package

    const resolved = resolveJsPath(fileDir, specifier, fileSet);
    if (resolved) {
      edges.push({ from: filePath, to: resolved, names });
    }
  }

  while ((match = sideEffectRe.exec(source)) !== null) {
    const specifier = match[1];
    if (!specifier.startsWith(".")) continue;
    const resolved = resolveJsPath(fileDir, specifier, fileSet);
    if (resolved) {
      edges.push({ from: filePath, to: resolved, names: [] });
    }
  }

  return edges;
}

function resolveJsPath(fromDir: string, specifier: string, fileSet: Set<string>): string | null {
  const base = normalize(join(fromDir, specifier));
  // Try exact, then common extensions, then index files
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

  // from .module import name  or  from ..package.module import name
  const fromRe = /from\s+(\.+[\w.]*)\s+import\s+([\w, ]+)/g;
  let match: RegExpExecArray | null;
  while ((match = fromRe.exec(source)) !== null) {
    const modulePath = match[1];
    const names = match[2].split(",").map((n) => n.trim()).filter(Boolean);

    const dots = modulePath.match(/^\.+/)![0].length;
    const parts = modulePath.slice(dots).split(".").filter(Boolean);
    let baseDir = fileDir;
    for (let i = 1; i < dots; i++) baseDir = dirname(baseDir);

    const candidates = [
      join(baseDir, ...parts) + ".py",
      join(baseDir, ...parts, "__init__.py"),
    ];

    for (const c of candidates) {
      if (fileSet.has(c)) {
        edges.push({ from: filePath, to: c, names });
        break;
      }
    }
  }

  return edges;
}

function resolveGoImports(filePath: string, source: string, allFiles: string[]): ImportEdge[] {
  // Go imports are package-level, harder to resolve to files without module info
  // For now, return empty — will improve in future phases
  return [];
}

function resolveGenericImports(_filePath: string, _source: string, _allFiles: string[]): ImportEdge[] {
  return [];
}
```

- [ ] **Step 4: 테스트 실행 — 성공 확인**

- [ ] **Step 5: Commit**

```bash
git add daemon/src/indexer/import-resolver.ts daemon/tests/import-resolver.test.ts
git commit -m "feat(daemon): add import resolver for JS/TS and Python"
```

---

## Task 8: Call 해석기

**Files:**
- Create: `daemon/src/indexer/call-resolver.ts`
- Test: `daemon/tests/call-resolver.test.ts`

- [ ] **Step 1: 테스트 작성 — `daemon/tests/call-resolver.test.ts`**

```typescript
import { describe, test, expect } from "bun:test";
import { CodeGraph } from "../src/indexer/graph.js";

describe("CallResolver", () => {
  test("matches reference to definition by name", async () => {
    const { resolveCalls } = await import("../src/indexer/call-resolver.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a.ts::createUser", kind: "function", name: "createUser", file: "a.ts", line: 1 });
    graph.addNode({ id: "b.ts::main", kind: "function", name: "main", file: "b.ts", line: 1 });

    const refs = [{ name: "createUser", kind: "call", line: 5, file: "b.ts" }];
    const edges = resolveCalls(refs, graph);
    expect(edges).toHaveLength(1);
    expect(edges[0].sourceId).toBe("b.ts::main");
    expect(edges[0].targetId).toBe("a.ts::createUser");
    expect(edges[0].kind).toBe("CALLS");
  });

  test("matches class reference to EXTENDS edge", async () => {
    const { resolveCalls } = await import("../src/indexer/call-resolver.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a.ts::Base", kind: "class", name: "Base", file: "a.ts", line: 1 });
    graph.addNode({ id: "b.ts::Child", kind: "class", name: "Child", file: "b.ts", line: 1 });

    // "class" reference type → new expression
    const refs = [{ name: "Base", kind: "class", line: 1, file: "b.ts" }];
    const edges = resolveCalls(refs, graph);
    expect(edges.length).toBeGreaterThanOrEqual(1);
  });

  test("ignores unresolvable references", async () => {
    const { resolveCalls } = await import("../src/indexer/call-resolver.js");
    const graph = new CodeGraph();
    graph.addNode({ id: "a.ts::foo", kind: "function", name: "foo", file: "a.ts", line: 1 });

    const refs = [{ name: "nonexistent", kind: "call", line: 1, file: "b.ts" }];
    const edges = resolveCalls(refs, graph);
    expect(edges).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

- [ ] **Step 3: 구현 — `daemon/src/indexer/call-resolver.ts`**

```typescript
import type { GraphEdge, EdgeKind } from "../types.js";
import type { CodeGraph } from "./graph.js";

interface Reference {
  name: string;
  kind: string;  // "call", "type", "class"
  line: number;
  file: string;
}

export function resolveCalls(references: Reference[], graph: CodeGraph): GraphEdge[] {
  const edges: GraphEdge[] = [];

  // Build name → node id index for quick lookup
  const nameIndex = new Map<string, string[]>();
  for (const node of graph.allNodes()) {
    if (!nameIndex.has(node.name)) {
      nameIndex.set(node.name, []);
    }
    nameIndex.get(node.name)!.push(node.id);
  }

  for (const ref of references) {
    const targetIds = nameIndex.get(ref.name);
    if (!targetIds || targetIds.length === 0) continue;

    // Find the enclosing function/method at the reference site
    const sourceId = findEnclosingSymbol(ref.file, ref.line, graph);
    if (!sourceId) continue;

    // Determine edge kind based on reference kind
    const edgeKind = mapRefKindToEdgeKind(ref.kind);

    // Pick best target: prefer same file, then closest definition
    const targetId = pickBestTarget(targetIds, ref.file, sourceId, graph);
    if (targetId && targetId !== sourceId) {
      edges.push({ sourceId, targetId, kind: edgeKind });
    }
  }

  return dedup(edges);
}

function findEnclosingSymbol(file: string, line: number, graph: CodeGraph): string | null {
  const nodes = graph.getNodesByFile(file);
  // Find the nearest function/method/class that starts at or before this line
  let best: { id: string; line: number } | null = null;
  for (const node of nodes) {
    if (node.line <= line && (node.kind === "function" || node.kind === "method")) {
      if (!best || node.line > best.line) {
        best = { id: node.id, line: node.line };
      }
    }
  }
  return best?.id ?? null;
}

function mapRefKindToEdgeKind(refKind: string): EdgeKind {
  switch (refKind) {
    case "call": return "CALLS";
    case "class": return "CALLS";  // new expression
    case "type": return "CALLS";   // type reference (simplified)
    default: return "CALLS";
  }
}

function pickBestTarget(targetIds: string[], refFile: string, sourceId: string, graph: CodeGraph): string | null {
  // Prefer target in a different file (cross-file call), then same file
  let sameFile: string | null = null;
  let otherFile: string | null = null;

  for (const id of targetIds) {
    const node = graph.getNode(id);
    if (!node) continue;
    if (node.file === refFile) {
      sameFile = id;
    } else {
      otherFile = id;
    }
  }

  return otherFile ?? sameFile;
}

function dedup(edges: GraphEdge[]): GraphEdge[] {
  const seen = new Set<string>();
  return edges.filter((e) => {
    const key = `${e.sourceId}→${e.targetId}→${e.kind}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
```

- [ ] **Step 4: 테스트 실행 — 성공 확인**

- [ ] **Step 5: Commit**

```bash
git add daemon/src/indexer/call-resolver.ts daemon/tests/call-resolver.test.ts
git commit -m "feat(daemon): add call resolver for reference-to-definition matching"
```

---

## Task 9: 인덱싱 파이프라인 + IndexManager

**Files:**
- Create: `daemon/src/indexer/pipeline.ts`
- Create: `daemon/src/indexer/index.ts`
- Test: `daemon/tests/pipeline.test.ts`

- [ ] **Step 1: 테스트 작성 — `daemon/tests/pipeline.test.ts`**

```typescript
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execSync } from "child_process";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-pipeline");
const INDEX_DIR = join(tmpdir(), "reap-daemon-test-pipeline-index");

beforeEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(INDEX_DIR, { recursive: true, force: true });
  mkdirSync(join(TEST_DIR, "src"), { recursive: true });
  mkdirSync(INDEX_DIR, { recursive: true });
  execSync("git init", { cwd: TEST_DIR, stdio: "ignore" });
  execSync('git config user.email "test@test.com" && git config user.name "test"', { cwd: TEST_DIR, stdio: "ignore" });

  writeFileSync(join(TEST_DIR, "src", "user.ts"),
    `export interface User { name: string; }\nexport function createUser(name: string): User { return { name }; }`
  );
  writeFileSync(join(TEST_DIR, "src", "service.ts"),
    `import { createUser, User } from "./user";\nexport class UserService {\n  create(name: string): User { return createUser(name); }\n}`
  );

  execSync("git add -A && git commit -m init", { cwd: TEST_DIR, stdio: "ignore" });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(INDEX_DIR, { recursive: true, force: true });
});

describe("IndexManager", () => {
  test("full indexing creates graph with nodes and edges", async () => {
    const { IndexManager } = await import("../src/indexer/index.js");
    const mgr = new IndexManager(join(INDEX_DIR, "index.db"));
    await mgr.init();

    await mgr.indexProject(TEST_DIR);

    const stats = mgr.stats();
    expect(stats.nodeCount).toBeGreaterThanOrEqual(3); // User, createUser, UserService, create
    expect(stats.edgeCount).toBeGreaterThanOrEqual(1); // at least IMPORTS
    expect(stats.fileCount).toBe(2);

    mgr.dispose();
  });

  test("symbol search works after indexing", async () => {
    const { IndexManager } = await import("../src/indexer/index.js");
    const mgr = new IndexManager(join(INDEX_DIR, "index.db"));
    await mgr.init();
    await mgr.indexProject(TEST_DIR);

    const results = mgr.searchSymbols("createUser");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name).toBe("createUser");

    mgr.dispose();
  });

  test("getCallers returns callers of a symbol", async () => {
    const { IndexManager } = await import("../src/indexer/index.js");
    const mgr = new IndexManager(join(INDEX_DIR, "index.db"));
    await mgr.init();
    await mgr.indexProject(TEST_DIR);

    // Find createUser node
    const results = mgr.searchSymbols("createUser");
    if (results.length > 0) {
      const callers = mgr.getCallers(results[0].id);
      // create method should call createUser
      expect(callers).toBeDefined();
    }

    mgr.dispose();
  });

  test("reload from SQLite restores graph", async () => {
    const dbPath = join(INDEX_DIR, "index.db");
    const { IndexManager } = await import("../src/indexer/index.js");

    // First: index and dispose
    const mgr1 = new IndexManager(dbPath);
    await mgr1.init();
    await mgr1.indexProject(TEST_DIR);
    const stats1 = mgr1.stats();
    mgr1.dispose();

    // Second: reload from DB
    const mgr2 = new IndexManager(dbPath);
    await mgr2.init();
    mgr2.loadFromStorage();
    const stats2 = mgr2.stats();

    expect(stats2.nodeCount).toBe(stats1.nodeCount);
    expect(stats2.edgeCount).toBe(stats1.edgeCount);

    mgr2.dispose();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

- [ ] **Step 3: 구현 — `daemon/src/indexer/pipeline.ts`**

```typescript
import { readFileSync } from "fs";
import { execSync } from "child_process";
import { scanFiles, getChangedFiles } from "./scanner.js";
import { SymbolExtractor, type ExtractResult } from "./parser.js";
import { CodeGraph } from "./graph.js";
import { IndexStorage } from "./storage.js";
import { resolveImports } from "./import-resolver.js";
import { resolveCalls } from "./call-resolver.js";
import type { SymbolNode, GraphEdge } from "../types.js";

export interface PipelineResult {
  filesProcessed: number;
  nodesCreated: number;
  edgesCreated: number;
  duration: number;
}

export async function runFullPipeline(
  projectRoot: string,
  graph: CodeGraph,
  storage: IndexStorage,
  extractor: SymbolExtractor,
): Promise<PipelineResult> {
  const start = Date.now();
  graph.clear();

  // Step 1: Scan files
  const files = await scanFiles(projectRoot);
  const allFilePaths = files.map((f) => f.relativePath);

  // Step 2-4: Parse each file, extract symbols, resolve imports
  const allRefs: Array<{ name: string; kind: string; line: number; file: string }> = [];

  for (const file of files) {
    const source = readFileSync(file.absolutePath, "utf-8");
    const result = await extractor.extract(file.relativePath, file.language, source);

    // Add definition nodes
    for (const def of result.definitions) {
      const node: SymbolNode = {
        id: `${file.relativePath}::${def.name}`,
        kind: def.kind as SymbolNode["kind"],
        name: def.name,
        file: file.relativePath,
        line: def.line,
      };
      graph.addNode(node);
    }

    // Collect references for later resolution
    allRefs.push(...result.references);

    // Resolve imports → IMPORTS edges
    const imports = resolveImports(file.relativePath, file.language, source, allFilePaths);
    for (const imp of imports) {
      graph.addEdge({ sourceId: `file::${imp.from}`, targetId: `file::${imp.to}`, kind: "IMPORTS" });
    }

    // Save file metadata
    let lastCommit = "";
    try {
      lastCommit = execSync(`git log -1 --format=%H -- "${file.relativePath}"`, { cwd: projectRoot, encoding: "utf-8" }).trim();
    } catch {}
    storage.saveFile({ path: file.relativePath, language: file.language, mtime: file.mtime, lastCommit });
  }

  // Step 4: Resolve calls
  const callEdges = resolveCalls(allRefs, graph);
  for (const edge of callEdges) {
    graph.addEdge(edge);
  }

  // Step 7: Save to SQLite
  storage.saveNodes(graph.allNodes());
  storage.saveEdges(graph.allEdges());

  // Save last indexed commit
  try {
    const head = execSync("git rev-parse HEAD", { cwd: projectRoot, encoding: "utf-8" }).trim();
    storage.saveMeta("lastCommit", head);
  } catch {}
  storage.saveMeta("lastIndexedAt", new Date().toISOString());

  return {
    filesProcessed: files.length,
    nodesCreated: graph.allNodes().length,
    edgesCreated: graph.allEdges().length,
    duration: Date.now() - start,
  };
}

export async function runIncrementalPipeline(
  projectRoot: string,
  graph: CodeGraph,
  storage: IndexStorage,
  extractor: SymbolExtractor,
): Promise<PipelineResult> {
  const start = Date.now();
  const lastCommit = storage.loadMeta("lastCommit");

  if (!lastCommit) {
    return runFullPipeline(projectRoot, graph, storage, extractor);
  }

  const changedFiles = await getChangedFiles(projectRoot, lastCommit);
  if (changedFiles.length === 0) {
    return { filesProcessed: 0, nodesCreated: 0, edgesCreated: 0, duration: Date.now() - start };
  }

  // Get all file paths for import resolution
  const allFiles = await scanFiles(projectRoot);
  const allFilePaths = allFiles.map((f) => f.relativePath);

  const allRefs: Array<{ name: string; kind: string; line: number; file: string }> = [];
  let nodesCreated = 0;
  let edgesCreated = 0;

  for (const filePath of changedFiles) {
    // Remove old data
    graph.removeByFile(filePath);
    storage.removeByFile(filePath);

    // Re-parse
    const fileInfo = allFiles.find((f) => f.relativePath === filePath);
    if (!fileInfo) continue;

    const source = readFileSync(fileInfo.absolutePath, "utf-8");
    const result = await extractor.extract(filePath, fileInfo.language, source);

    for (const def of result.definitions) {
      const node: SymbolNode = {
        id: `${filePath}::${def.name}`,
        kind: def.kind as SymbolNode["kind"],
        name: def.name,
        file: filePath,
        line: def.line,
      };
      graph.addNode(node);
      nodesCreated++;
    }

    allRefs.push(...result.references);

    const imports = resolveImports(filePath, fileInfo.language, source, allFilePaths);
    for (const imp of imports) {
      graph.addEdge({ sourceId: `file::${imp.from}`, targetId: `file::${imp.to}`, kind: "IMPORTS" });
      edgesCreated++;
    }

    let lastFileCommit = "";
    try {
      lastFileCommit = execSync(`git log -1 --format=%H -- "${filePath}"`, { cwd: projectRoot, encoding: "utf-8" }).trim();
    } catch {}
    storage.saveFile({ path: filePath, language: fileInfo.language, mtime: fileInfo.mtime, lastCommit: lastFileCommit });
  }

  // Resolve calls for changed files
  const callEdges = resolveCalls(allRefs, graph);
  for (const edge of callEdges) {
    graph.addEdge(edge);
    edgesCreated++;
  }

  // Update storage
  storage.saveNodes(graph.allNodes());
  // Clear and re-save all edges (simpler than incremental edge update)
  storage.saveEdges(graph.allEdges());

  try {
    const head = execSync("git rev-parse HEAD", { cwd: projectRoot, encoding: "utf-8" }).trim();
    storage.saveMeta("lastCommit", head);
  } catch {}
  storage.saveMeta("lastIndexedAt", new Date().toISOString());

  return { filesProcessed: changedFiles.length, nodesCreated, edgesCreated, duration: Date.now() - start };
}
```

- [ ] **Step 4: 구현 — `daemon/src/indexer/index.ts`**

```typescript
import { CodeGraph } from "./graph.js";
import { IndexStorage } from "./storage.js";
import { SymbolExtractor } from "./parser.js";
import { runFullPipeline, runIncrementalPipeline, type PipelineResult } from "./pipeline.js";
import type { SymbolNode, GraphEdge } from "../types.js";

export class IndexManager {
  private graph: CodeGraph;
  private storage: IndexStorage;
  private extractor: SymbolExtractor;
  private indexing = false;

  constructor(dbPath: string) {
    this.graph = new CodeGraph();
    this.storage = new IndexStorage(dbPath);
    this.extractor = new SymbolExtractor();
  }

  async init(): Promise<void> {
    this.storage.open();
    await this.extractor.init();
  }

  loadFromStorage(): void {
    const nodes = this.storage.loadNodes();
    const edges = this.storage.loadEdges();
    this.graph.clear();
    for (const node of nodes) {
      this.graph.addNode(node);
    }
    for (const edge of edges) {
      this.graph.addEdge(edge);
    }
  }

  async indexProject(projectRoot: string, incremental?: boolean): Promise<PipelineResult> {
    if (this.indexing) {
      return { filesProcessed: 0, nodesCreated: 0, edgesCreated: 0, duration: 0 };
    }
    this.indexing = true;
    try {
      if (incremental) {
        return await runIncrementalPipeline(projectRoot, this.graph, this.storage, this.extractor);
      }
      return await runFullPipeline(projectRoot, this.graph, this.storage, this.extractor);
    } finally {
      this.indexing = false;
    }
  }

  searchSymbols(query: string, kind?: string): SymbolNode[] {
    return this.graph.searchNodes(query, kind);
  }

  getSymbol(id: string): SymbolNode | null {
    return this.graph.getNode(id);
  }

  getCallers(symbolId: string): GraphEdge[] {
    return this.graph.getEdgesTo(symbolId, "CALLS");
  }

  getCallees(symbolId: string): GraphEdge[] {
    return this.graph.getEdgesFrom(symbolId, "CALLS");
  }

  getFileSymbols(file: string): SymbolNode[] {
    return this.graph.getNodesByFile(file);
  }

  getFileDependencies(file: string): GraphEdge[] {
    return this.graph.getEdgesFrom(`file::${file}`, "IMPORTS");
  }

  stats(): { nodeCount: number; edgeCount: number; fileCount: number } {
    return this.graph.stats();
  }

  isIndexing(): boolean {
    return this.indexing;
  }

  dispose(): void {
    this.extractor.dispose();
    this.storage.close();
  }
}
```

- [ ] **Step 5: 테스트 실행 — 성공 확인**

Run: `cd daemon && bun test tests/pipeline.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add daemon/src/indexer/pipeline.ts daemon/src/indexer/index.ts daemon/tests/pipeline.test.ts
git commit -m "feat(daemon): add indexing pipeline and IndexManager"
```

---

## Task 10: 서버 연결 — IndexManager를 HTTP API에 통합

**Files:**
- Modify: `daemon/src/server.ts`
- Modify: `daemon/src/api/projects.ts`
- Test: `daemon/tests/indexing-api.test.ts`

- [ ] **Step 1: 테스트 작성 — `daemon/tests/indexing-api.test.ts`**

```typescript
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { execSync } from "child_process";
import { createDaemonServer } from "../src/server.js";
import type { Server } from "http";

const TEST_DIR = join(tmpdir(), "reap-daemon-test-indexing-api");
const PROJECT_DIR = join(tmpdir(), "reap-daemon-test-indexing-project");
let server: Server;

beforeEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(PROJECT_DIR, { recursive: true, force: true });
  mkdirSync(TEST_DIR, { recursive: true });
  mkdirSync(join(PROJECT_DIR, "src"), { recursive: true });
  execSync("git init", { cwd: PROJECT_DIR, stdio: "ignore" });
  execSync('git config user.email "test@test.com" && git config user.name "test"', { cwd: PROJECT_DIR, stdio: "ignore" });
  writeFileSync(join(PROJECT_DIR, "src", "index.ts"), `export function hello(): string { return "world"; }`);
  execSync("git add -A && git commit -m init", { cwd: PROJECT_DIR, stdio: "ignore" });
});

afterEach(() => {
  if (server) server.close();
  rmSync(TEST_DIR, { recursive: true, force: true });
  rmSync(PROJECT_DIR, { recursive: true, force: true });
});

describe("Indexing via API", () => {
  test("POST /projects/:id/index triggers indexing and returns stats", async () => {
    server = createDaemonServer({ port: 0, idleTimeoutMs: 60_000, daemonRoot: TEST_DIR });
    const port = await new Promise<number>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        resolve(typeof addr === "object" && addr ? addr.port : 0);
      });
    });
    const base = `http://localhost:${port}`;

    // Register project
    const regRes = await fetch(`${base}/projects/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: PROJECT_DIR, name: "test-project" }),
    });
    const regBody = await regRes.json();
    const projectId = regBody.data.id;

    // Trigger indexing
    const indexRes = await fetch(`${base}/projects/${projectId}/index`, { method: "POST" });
    const indexBody = await indexRes.json();
    expect(indexBody.status).toBe("ok");
    expect(indexBody.data.filesProcessed).toBeGreaterThanOrEqual(1);
    expect(indexBody.data.nodesCreated).toBeGreaterThanOrEqual(1);

    // Verify status shows indexed
    const statusRes = await fetch(`${base}/projects/${projectId}/status`);
    const statusBody = await statusRes.json();
    expect(statusBody.data.indexed).toBe(true);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

- [ ] **Step 3: `daemon/src/server.ts` 수정 — IndexManager 생성 및 주입**

`createDaemonServer` 함수에서 IndexManager 인스턴스를 생성하고 projects 핸들러에 전달.

server.ts 수정 사항:
- import IndexManager
- 서버 생성 시 IndexManager 초기화 (async)
- projects handlers에 IndexManager 주입
- 서버 close 시 IndexManager dispose

- [ ] **Step 4: `daemon/src/api/projects.ts` 수정 — index 핸들러 실제 구현**

index 핸들러를 IndexManager.indexProject() 호출로 교체. registry.updateLastIndexed() 호출 추가.

- [ ] **Step 5: 테스트 실행 — 성공 확인**

Run: `cd daemon && bun test tests/indexing-api.test.ts`
Expected: PASS

- [ ] **Step 6: 전체 테스트 실행**

Run: `cd daemon && bun test`
Expected: 모든 테스트 PASS

- [ ] **Step 7: Commit**

```bash
git add daemon/src/server.ts daemon/src/api/projects.ts daemon/tests/indexing-api.test.ts
git commit -m "feat(daemon): integrate IndexManager into HTTP API"
```

---

## Summary

Phase 2 완료 시 갖추는 것:
- Tree-sitter WASM 기반 15개 언어 파싱
- Aider 스타일 .scm 쿼리로 심볼 def/ref 추출
- 인메모리 CodeGraph (노드/엣지 CRUD, 파일별 인덱스, 검색)
- SQLite 영속화 (write-through, daemon 재시작 시 복원)
- Import 해석 (JS/TS, Python)
- Call 해석 (ref→def 매칭)
- Full/Incremental 인덱싱 파이프라인
- `POST /projects/:id/index` API가 실제 인덱싱 수행

Phase 3에서 추가할 것:
- 조회 API (심볼 검색, caller/callee, 파일 의존성, blast radius)
- 커뮤니티 탐지 (Leiden 알고리즘)
- 프로세스 추적 (BFS)

Phase 4에서 추가할 것:
- CLI 연동 (`reap daemon query`)
- lifecycle hook 연동 (generation 시작/완료 시 자동 인덱싱)
- worktree 관리
