import { spawn } from "child_process";
import { join } from "path";
import { homedir } from "os";

const DAEMON_ROOT = join(homedir(), ".reap", "daemon");
const PID_PATH = join(DAEMON_ROOT, "daemon.pid");
const DEFAULT_PORT = 17224;
const BASE_URL = `http://127.0.0.1:${DEFAULT_PORT}`;

export async function daemonRequest<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: "ok" | "error"; data?: T; error?: string }> {
  await ensureDaemon();

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
}

async function ensureDaemon(): Promise<void> {
  // Check if already running
  if (await isDaemonRunning()) return;

  // Spawn daemon
  const daemonBin = resolveDaemonBin();
  const runtime = detectRuntime();
  const child = spawn(runtime, [daemonBin], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();

  // Wait for daemon to be ready (max 3 seconds)
  const deadline = Date.now() + 3_000;
  while (Date.now() < deadline) {
    if (await isDaemonRunning()) return;
    await new Promise((r) => setTimeout(r, 100));
  }

  throw new Error("Failed to start daemon within 3 seconds");
}

async function isDaemonRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(500) });
    return res.ok;
  } catch {
    return false;
  }
}

function resolveDaemonBin(): string {
  // Look for daemon entry point relative to reap-daemon package
  try {
    return require.resolve("@c-d-cc/reap-daemon/dist/index.js");
  } catch {
    // Fallback: try relative path (development mode)
    return join(__dirname, "..", "..", "..", "daemon", "dist", "index.js");
  }
}

function detectRuntime(): string {
  try {
    const { execSync } = require("child_process");
    execSync("bun --version", { stdio: "ignore" });
    return "bun";
  } catch {
    return "node";
  }
}
