#!/usr/bin/env node

import { daemonPaths } from "./paths.js";
import { writePid, removePid } from "./process.js";
import { createDaemonServer } from "./server.js";
import { DEFAULT_CONFIG } from "./types.js";

// gen-069: REAP_DAEMON_PORT env override enables test isolation (e2e
// tests spawn a daemon on port 17225 to avoid colliding with a user's
// running daemon on 17224). Falls back to DEFAULT_CONFIG.port (17224)
// when env is unset or non-numeric — preserves byte-identical behavior
// for existing users.
function resolvePort(): number {
  const raw = process.env.REAP_DAEMON_PORT;
  if (!raw) return DEFAULT_CONFIG.port;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_CONFIG.port;
}

const config = {
  port: resolvePort(),
  idleTimeoutMs: DEFAULT_CONFIG.idleTimeoutMs,
  daemonRoot: daemonPaths.root,
};

const server = createDaemonServer(config);

server.listen(config.port, "127.0.0.1", () => {
  writePid(daemonPaths.pid);
  process.stderr.write(`reap-daemon running on http://127.0.0.1:${config.port} (pid: ${process.pid})\n`);
});

function shutdown() {
  removePid(daemonPaths.pid);
  server.close();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
