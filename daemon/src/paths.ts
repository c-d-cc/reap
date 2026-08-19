import { join } from "path";
import { homedir } from "os";

// reap:carrier(reap-home-asset-set)
// Everything under here is removed by `reap uninstall`, which names the entry
// explicitly rather than sweeping `~/.reap` — that directory also holds files
// the user put there. reap cannot import this constant: separate package.
const DAEMON_ROOT = join(homedir(), ".reap", "daemon");

export const daemonPaths = {
  root: DAEMON_ROOT,
  pid: join(DAEMON_ROOT, "daemon.pid"),
  registry: join(DAEMON_ROOT, "registry.json"),
  indexes: join(DAEMON_ROOT, "indexes"),
  projectIndex: (projectId: string) => join(DAEMON_ROOT, "indexes", projectId),
  projectMainIndex: (projectId: string) => join(DAEMON_ROOT, "indexes", projectId, "main"),
  projectWorktreeIndex: (projectId: string, branch: string) =>
    join(DAEMON_ROOT, "indexes", projectId, `wt-${branch}`),
} as const;
