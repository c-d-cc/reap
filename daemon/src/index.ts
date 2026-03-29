#!/usr/bin/env node

import { daemonPaths } from "./paths.js";
import { writePid, removePid } from "./process.js";
import { createDaemonServer } from "./server.js";
import { DEFAULT_CONFIG } from "./types.js";

const config = {
  port: DEFAULT_CONFIG.port,
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
