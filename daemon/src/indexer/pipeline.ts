import { readFileSync } from "fs";
import { execSync } from "child_process";
import { scanFiles, getChangedFiles } from "./scanner.js";
import { SymbolExtractor } from "./parser.js";
import { CodeGraph } from "./graph.js";
import { IndexStorage } from "./storage.js";
import { resolveImports } from "./import-resolver.js";
import { resolveCalls } from "./call-resolver.js";
import type { SymbolNode } from "../types.js";

export interface PipelineResult {
  filesProcessed: number;
  nodesCreated: number;
  edgesCreated: number;
  duration: number;
  /**
   * `git rev-parse HEAD` at the moment the pipeline finished. `null` if the
   * project is not a git repository or the command fails. Propagated to the
   * registry (`updateLastIndexed`) by the `/projects/:id/index` API handler
   * for staleness detection (gen-068).
   */
  lastCommit?: string | null;
}

export async function runFullPipeline(
  projectRoot: string,
  graph: CodeGraph,
  storage: IndexStorage,
  extractor: SymbolExtractor,
): Promise<PipelineResult> {
  const start = Date.now();
  graph.clear();

  const files = await scanFiles(projectRoot);
  const allFilePaths = files.map((f) => f.relativePath);
  const allRefs: Array<{ name: string; kind: string; line: number; file: string }> = [];

  for (const file of files) {
    const source = readFileSync(file.absolutePath, "utf-8");
    const result = await extractor.extract(file.relativePath, file.language, source);

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

    allRefs.push(...result.references);

    const imports = resolveImports(file.relativePath, file.language, source, allFilePaths);
    for (const imp of imports) {
      graph.addEdge({ sourceId: `file::${imp.from}`, targetId: `file::${imp.to}`, kind: "IMPORTS" });
    }

    let lastCommit = "";
    try {
      lastCommit = execSync(`git log -1 --format=%H -- "${file.relativePath}"`, { cwd: projectRoot, encoding: "utf-8" }).trim();
    } catch {}
    storage.saveFile({ path: file.relativePath, language: file.language, mtime: file.mtime, lastCommit });
  }

  const callEdges = resolveCalls(allRefs, graph);
  for (const edge of callEdges) {
    graph.addEdge(edge);
  }

  storage.saveNodes(graph.allNodes());
  storage.saveEdges(graph.allEdges());

  let headCommit: string | null = null;
  try {
    headCommit = execSync("git rev-parse HEAD", { cwd: projectRoot, encoding: "utf-8" }).trim();
    storage.saveMeta("lastCommit", headCommit);
  } catch {}
  storage.saveMeta("lastIndexedAt", new Date().toISOString());

  return {
    filesProcessed: files.length,
    nodesCreated: graph.allNodes().length,
    edgesCreated: graph.allEdges().length,
    duration: Date.now() - start,
    lastCommit: headCommit,
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
    // No changes since last index — preserve the previously-recorded commit
    // so registry staleness check still sees the latest known good hash.
    return { filesProcessed: 0, nodesCreated: 0, edgesCreated: 0, duration: Date.now() - start, lastCommit };
  }

  const allFiles = await scanFiles(projectRoot);
  const allFilePaths = allFiles.map((f) => f.relativePath);
  const allRefs: Array<{ name: string; kind: string; line: number; file: string }> = [];
  let nodesCreated = 0;
  let edgesCreated = 0;

  for (const filePath of changedFiles) {
    graph.removeByFile(filePath);
    storage.removeByFile(filePath);

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

  const callEdges = resolveCalls(allRefs, graph);
  for (const edge of callEdges) {
    graph.addEdge(edge);
    edgesCreated++;
  }

  storage.saveNodes(graph.allNodes());
  storage.saveEdges(graph.allEdges());

  let headCommit: string | null = null;
  try {
    headCommit = execSync("git rev-parse HEAD", { cwd: projectRoot, encoding: "utf-8" }).trim();
    storage.saveMeta("lastCommit", headCommit);
  } catch {}
  storage.saveMeta("lastIndexedAt", new Date().toISOString());

  return { filesProcessed: changedFiles.length, nodesCreated, edgesCreated, duration: Date.now() - start, lastCommit: headCommit };
}
