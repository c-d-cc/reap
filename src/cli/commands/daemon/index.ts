import { emitOutput, emitError } from "../../../core/output.js";
import {
  daemonRequest,
  findProjectId,
  resolveDaemonAvailability,
  missingDaemonRemedy,
  stopDaemonIfRunning,
} from "./client.js";
import { createPaths } from "../../../core/paths.js";
import type { DaemonAvailability } from "../../../types/index.js";
import { fileExists } from "../../../core/fs.js";

export async function execute(
  subcommand: string,
  options: { query?: string },
): Promise<void> {
  switch (subcommand) {
    case "status":
      return statusCmd();
    case "stop":
      return stopCmd();
    case "index":
      return indexCmd();
    case "query":
      return queryCmd(options.query);
    default:
      emitError("daemon", `Unknown subcommand: ${subcommand}. Use: status, stop, index, query`);
  }
}

/**
 * Stop with an accurate reason when the daemon package cannot be used at all.
 *
 * "Not running" was previously the answer to three different situations: not
 * installed, installed but unusable, and simply stopped. Only the last one is
 * fixed by starting it, so collapsing them told users to retry something that
 * could never work. Each now says what it is and, where relevant, what to run.
 */
function requireUsableDaemon(): void {
  const avail = resolveDaemonAvailability();
  if (!avail.installed) {
    // Wording lives in `missingDaemonRemedy` so that this and the exception
    // thrown from the spawn path cannot drift apart — they answer the same
    // question and used to answer it differently.
    emitError("daemon", `The daemon is not installed. ${missingDaemonRemedy(avail.explicitMiss)}`);
  }
  if (avail.outdated) {
    // A named location or a checkout is not fixed by a global install — reap
    // would resolve the same old file on the next command and repeat this
    // message verbatim.
    emitError(
      "daemon",
      `The installed daemon is ${avail.version}, but this version of REAP needs ${avail.required} or newer. ${avail.staleRemedy}`,
    );
  }
}

async function statusCmd(): Promise<void> {
  requireUsableDaemon();
  const avail = resolveDaemonAvailability();

  try {
    const result = await daemonRequest<{
      pid: number;
      uptime: number;
      idleTime: number;
      projectCount: number;
      version?: string;
    }>("GET", "/health");

    if (result.status === "ok" && result.data) {
      const d = result.data;
      const uptimeMin = Math.floor(d.uptime / 60_000);
      const idleMin = Math.floor(d.idleTime / 60_000);
      // Both versions are shown because they can legitimately differ: the
      // daemon stays resident for thirty idle minutes, so an upgrade does not
      // replace the process that is answering.
      const running = d.version ?? "unknown";
      emitOutput({
        status: "ok",
        command: "daemon",
        context: {
          pid: d.pid,
          uptime: `${uptimeMin}m`,
          idle: `${idleMin}m`,
          projects: d.projectCount,
          runningVersion: running,
          installedVersion: avail.version,
          // Which daemon, and how reap arrived at it. Someone who has just set
          // `daemonBin` to work around a failed lookup has no other way to
          // confirm the setting took effect — and a workaround you cannot
          // verify is barely a workaround.
          bin: avail.bin,
          binSource: avail.source,
          ...(avail.explicitMiss ? { explicitMiss: avail.explicitMiss } : {}),
        },
        message: `Daemon running (pid: ${d.pid}, uptime: ${uptimeMin}m, idle: ${idleMin}m, ${d.projectCount} projects, running ${running} / installed ${avail.version ?? "unknown"})`,
      });
    } else {
      emitError("daemon", notRunningMessage(avail));
    }
  } catch {
    emitError("daemon", notRunningMessage(avail));
  }
}

/**
 * "Not running" — plus which daemon reap was going to run.
 *
 * A location REAP was pointed at is taken at its word: it is checked for being
 * a file and nothing more, because demanding a matching manifest would reject
 * the legitimate case of naming a source checkout. The cost is that a path to
 * some *other* file resolves happily and then fails to start, and without this
 * the only thing said about it is "not running" — the user's own setting, the
 * thing most likely to be wrong, would go unmentioned.
 */
function notRunningMessage(avail: DaemonAvailability): string {
  if (avail.bin === null) return "Daemon is not running";
  const miss = avail.explicitMiss
    ? ` ${avail.explicitMiss.label} points at ${avail.explicitMiss.path}, where there is no file.`
    : "";
  return `Daemon is not running. REAP would start ${avail.bin} (from ${avail.source}).${miss}`;
}

async function stopCmd(): Promise<void> {
  // Deliberately not gated: stopping is meaningful even when the installed
  // package is too old, and reporting "not installed" for a stop request would
  // leave a stray process with no way to reach it.
  //
  // `stopDaemonIfRunning` rather than `daemonRequest`, whose first line is
  // `ensureDaemon` — asking a stopped daemon for its health used to start one
  // and then kill it. Harmless here and not harmless in `reap uninstall`,
  // which deletes the daemon's data next (gen-088).
  const pid = await stopDaemonIfRunning();
  emitOutput({
    status: "ok",
    command: "daemon",
    context: pid === null ? {} : { pid },
    message: pid === null ? "Daemon is not running" : `Daemon stopped (pid: ${pid})`,
  });
}

async function indexCmd(): Promise<void> {
  requireUsableDaemon();
  const root = process.cwd();
  const paths = createPaths(root);

  if (!(await fileExists(paths.config))) {
    emitError("daemon", "Not a reap project. Run 'reap init' first.");
  }

  const findResult = await daemonRequest<Array<{ id: string; path: string }>>("GET", "/projects");
  if (findResult.status !== "ok" || !findResult.data) {
    emitError("daemon", "Failed to query daemon");
  }

  const project = findResult.data!.find((p) => p.path === root);
  if (!project) {
    emitError("daemon", "Project not registered with daemon. Run 'reap init' to register.");
  }

  const result = await daemonRequest("POST", `/projects/${project!.id}/index`);
  emitOutput({
    status: "ok",
    command: "daemon",
    context: result.data as Record<string, unknown>,
    message: `Indexing triggered for ${root}`,
  });
}

async function queryCmd(query?: string): Promise<void> {
  if (!query) {
    emitError("daemon", "Usage: reap daemon query <search-term>");
  }

  requireUsableDaemon();
  const root = process.cwd();
  const projectId = await findProjectId(root);
  if (!projectId) {
    emitError("daemon", "Project not registered. Run 'reap init' first.");
  }

  const result = await daemonRequest<Array<{ id: string; name: string; kind: string; file: string; line: number }>>(
    "GET",
    `/projects/${projectId}/symbols?q=${encodeURIComponent(query!)}`,
  );

  if (result.status !== "ok" || !result.data) {
    emitError("daemon", result.error ?? "Query failed");
  }

  const symbols = result.data!;
  if (symbols.length === 0) {
    emitOutput({
      status: "ok",
      command: "daemon",
      message: `No symbols found for "${query}"`,
    });
  }

  const lines = symbols.map((s) => `${s.kind.padEnd(10)} ${s.name.padEnd(30)} ${s.file}:${s.line}`);
  emitOutput({
    status: "ok",
    command: "daemon",
    context: { query, resultCount: symbols.length },
    message: `Found ${symbols.length} symbol(s) for "${query}":\n${lines.join("\n")}`,
  });
}
