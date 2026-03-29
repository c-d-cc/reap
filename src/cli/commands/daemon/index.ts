import { emitOutput, emitError } from "../../../core/output.js";
import { daemonRequest } from "./client.js";
import { createPaths } from "../../../core/paths.js";
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

async function statusCmd(): Promise<void> {
  try {
    const result = await daemonRequest<{
      pid: number;
      uptime: number;
      idleTime: number;
      projectCount: number;
    }>("GET", "/health");

    if (result.status === "ok" && result.data) {
      const d = result.data;
      const uptimeMin = Math.floor(d.uptime / 60_000);
      const idleMin = Math.floor(d.idleTime / 60_000);
      emitOutput({
        status: "ok",
        command: "daemon",
        context: {
          pid: d.pid,
          uptime: `${uptimeMin}m`,
          idle: `${idleMin}m`,
          projects: d.projectCount,
        },
        message: `Daemon running (pid: ${d.pid}, uptime: ${uptimeMin}m, idle: ${idleMin}m, ${d.projectCount} projects)`,
      });
    } else {
      emitError("daemon", "Daemon is not running");
    }
  } catch {
    emitError("daemon", "Daemon is not running");
  }
}

async function stopCmd(): Promise<void> {
  try {
    const result = await daemonRequest("GET", "/health");
    if (result.status === "ok") {
      const pid = (result.data as { pid: number }).pid;
      process.kill(pid, "SIGTERM");
      emitOutput({
        status: "ok",
        command: "daemon",
        message: `Daemon stopped (pid: ${pid})`,
      });
    }
  } catch {
    emitOutput({
      status: "ok",
      command: "daemon",
      message: "Daemon is not running",
    });
  }
}

async function indexCmd(): Promise<void> {
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
  emitOutput({
    status: "ok",
    command: "daemon",
    message: "Query not yet implemented (Phase 3)",
  });
}
