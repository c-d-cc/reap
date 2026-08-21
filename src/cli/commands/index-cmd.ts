import { realpathSync } from "fs";
import { relative, resolve } from "path";
import { emitError, emitOutput } from "../../core/output.js";
import { createPaths } from "../../core/paths.js";
import { fileExists } from "../../core/fs.js";
import { Indexer, NotAGitRepoError } from "../../indexer/index.js";

const SUBCOMMANDS = ["update", "status", "impact", "search", "callers", "callees"] as const;
type Subcommand = (typeof SUBCOMMANDS)[number];

/**
 * `reap index` — the code index, and the questions it can answer.
 */
export async function execute(
  subcommand: string | undefined,
  targets: string[],
  options: { full?: boolean; kind?: string },
): Promise<void> {
  const verb = (subcommand ?? "update") as Subcommand;
  if (!SUBCOMMANDS.includes(verb)) {
    emitError("index", `Unknown subcommand: ${subcommand}. Use: ${SUBCOMMANDS.join(", ")}`);
  }

  const root = process.cwd();
  if (!(await fileExists(createPaths(root).config))) {
    emitError("index", "Not a reap project. Run 'reap init' first.");
  }

  const indexer = new Indexer(root);

  try {
    switch (verb) {
      case "update":
        return await updateCmd(indexer, options.full === true);
      case "status":
        return await statusCmd(indexer);
      case "impact":
        return await impactCmd(indexer, root, targets);
      case "search":
        return await searchCmd(indexer, targets, options.kind);
      case "callers":
      case "callees":
        return await callCmd(indexer, verb, targets);
    }
  } catch (err) {
    if (err instanceof NotAGitRepoError) emitError("index", err.message);
    throw err;
  }
}

async function updateCmd(indexer: Indexer, full: boolean): Promise<void> {
  const result = await indexer.update({ full });
  emitOutput({
    status: "ok",
    command: "index",
    context: { ...result, indexPath: indexer.storePath },
    message:
      result.mode === "up-to-date"
        ? `Index is current at ${short(result.commit)} (${result.nodes} symbols, ${result.edges} edges)`
        : `Indexed ${result.filesProcessed} file(s) — ${result.mode}, ${result.nodes} symbols, ${result.edges} edges at ${short(result.commit)} (${result.duration}ms)`,
  });
}

/**
 * What the index contains, and whether it can be believed.
 *
 * The import resolution rate is the point of this command: everything `impact`
 * knows comes from resolved import edges, so a low rate means an empty blast
 * radius is *unknown* rather than *none*.
 */
async function statusCmd(indexer: Indexer): Promise<void> {
  await indexer.ready();
  const manifest = indexer.manifest();
  if (!manifest) emitError("index", "No index. Run 'reap index update'.");

  const { imports } = manifest!.stats;
  const rate = imports.attempted === 0 ? null : Math.round((imports.resolved / imports.attempted) * 1000) / 10;
  const edges = indexer.edgeCounts();

  const lines = [
    `files:   ${manifest!.stats.files}`,
    `symbols: ${manifest!.stats.nodes}  (${describe(manifest!.stats.kinds)})`,
    `edges:   ${edges.total}  (${describe(manifest!.stats.edges)})`,
    `imports: ${imports.resolved}/${imports.attempted} resolved${rate === null ? "" : ` (${rate}%)`}`,
    `commit:  ${short(manifest!.lastIndexedCommit)}`,
  ];
  if (manifest!.stats.languageFailures) {
    for (const [lang, why] of Object.entries(manifest!.stats.languageFailures)) {
      lines.push(`WARNING: grammar for ${lang} did not load — ${why}`);
    }
  }

  emitOutput({
    status: "ok",
    command: "index",
    context: {
      ...manifest!.stats,
      importResolutionRate: rate,
      lastIndexedCommit: manifest!.lastIndexedCommit,
      lastIndexedAt: manifest!.lastIndexedAt,
      format: manifest!.format,
      // Distinct vs total, made queryable: a store that appends without a key
      // makes the two diverge by one factor per re-index, and the divergence is
      // the only symptom.
      edgeTotal: edges.total,
      edgeDistinct: edges.distinct,
      indexPath: indexer.storePath,
    },
    message: lines.join("\n"),
  });
}

async function impactCmd(indexer: Indexer, root: string, targets: string[]): Promise<void> {
  if (targets.length === 0) emitError("index", "Usage: reap index impact <file> [file...]");
  await indexer.ready();

  // Accept whatever the user has in hand — an absolute path from an editor, a
  // path relative to the current directory — and normalise to the repository
  // -relative form the graph is keyed by.
  //
  // Through `realpath`, because the two can spell one directory differently.
  // On macOS `/var` is a symlink to `/private/var`, so an absolute path a tool
  // handed over and the cwd this process reports disagree, and `relative` then
  // produces a `../../..` walk that matches nothing in the graph. The result is
  // an empty blast radius — indistinguishable from "nothing depends on it",
  // which is the answer this whole generation exists to stop giving wrongly.
  const files = targets.map((t) => relative(realPath(root), realPath(resolve(root, t))));
  const result = indexer.impact(files);

  emitOutput({
    status: "ok",
    command: "index",
    context: { files, ...result },
    message:
      `Changing ${files.join(", ")} affects ` +
      `${result.directFiles.length} file(s) directly, ${result.indirectFiles.length} indirectly ` +
      `(${result.affectedSymbols.length} symbols)` +
      (result.directFiles.length + result.indirectFiles.length > 0
        ? `:\n${[...result.directFiles, ...result.indirectFiles].join("\n")}`
        : ""),
  });
}

async function searchCmd(indexer: Indexer, targets: string[], kind?: string): Promise<void> {
  const query = targets.join(" ").trim();
  if (!query) emitError("index", "Usage: reap index search <query>");
  await indexer.ready();

  const symbols = indexer.search(query, kind);
  emitOutput({
    status: "ok",
    command: "index",
    context: { query, kind, resultCount: symbols.length, symbols },
    message:
      symbols.length === 0
        ? `No symbols found for "${query}"`
        : `Found ${symbols.length} symbol(s) for "${query}":\n` +
          symbols.map((s) => `${s.kind.padEnd(10)} ${s.name.padEnd(30)} ${s.file}:${s.line}`).join("\n"),
  });
}

async function callCmd(indexer: Indexer, verb: "callers" | "callees", targets: string[]): Promise<void> {
  const symbolId = targets[0];
  if (!symbolId) emitError("index", `Usage: reap index ${verb} <symbolId>   (e.g. src/core/lifecycle.ts::nextStage)`);
  await indexer.ready();

  const edges = verb === "callers" ? indexer.callers(symbolId) : indexer.callees(symbolId);
  const ids = edges.map((e) => (verb === "callers" ? e.sourceId : e.targetId));

  emitOutput({
    status: "ok",
    command: "index",
    context: { symbolId, resultCount: ids.length, [verb]: ids },
    message: ids.length === 0 ? `No ${verb} of ${symbolId}` : `${ids.length} ${verb} of ${symbolId}:\n${ids.join("\n")}`,
  });
}

/** `realpathSync`, falling back to the input for paths that do not exist yet. */
function realPath(p: string): string {
  try {
    return realpathSync(p);
  } catch {
    return p;
  }
}

function short(commit: string | null): string {
  return commit ? commit.slice(0, 7) : "none";
}

function describe(counts: Record<string, number>): string {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return entries.length === 0 ? "none" : entries.map(([k, n]) => `${k} ${n}`).join(", ");
}
