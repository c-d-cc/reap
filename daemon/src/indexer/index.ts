import { CodeGraph } from "./graph.js";
import { IndexStorage } from "./storage.js";
import { SymbolExtractor } from "./parser.js";
import { runFullPipeline, runIncrementalPipeline, type PipelineResult } from "./pipeline.js";
import { analyzeImpact } from "./impact.js";
import { detectCommunities } from "./community.js";
import { traceProcesses } from "./process-tracer.js";
import type { SymbolNode, GraphEdge, Community, ProcessFlow, ImpactResult } from "../types.js";

export class IndexManager {
  private graph: CodeGraph;
  private storage: IndexStorage;
  private extractor: SymbolExtractor;
  private indexing = false;
  private communities: Community[] = [];
  private processes: ProcessFlow[] = [];

  constructor(dbPath: string) {
    this.graph = new CodeGraph();
    this.storage = new IndexStorage(dbPath);
    this.extractor = new SymbolExtractor();
  }

  async init(): Promise<void> {
    await this.storage.open();
    await this.extractor.init();
  }

  loadFromStorage(): void {
    const nodes = this.storage.loadNodes();
    const edges = this.storage.loadEdges();
    this.graph.clear();
    for (const node of nodes) this.graph.addNode(node);
    for (const edge of edges) this.graph.addEdge(edge);
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
      this.communities = detectCommunities(this.graph);
      this.processes = traceProcesses(this.graph);
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

  getImpact(files: string[]): ImpactResult {
    return analyzeImpact(files, this.graph);
  }

  getCommunities(): Community[] { return this.communities; }
  getCommunity(id: string): Community | null { return this.communities.find(c => c.id === id) ?? null; }
  getProcesses(): ProcessFlow[] { return this.processes; }
  getProcess(id: string): ProcessFlow | null { return this.processes.find(p => p.id === id) ?? null; }

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
