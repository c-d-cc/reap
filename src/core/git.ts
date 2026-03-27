import { execSync } from "child_process";

/**
 * Check if the given directory is inside a git repository.
 */
export function isGitRepo(cwd: string): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree", {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Stage all changes and commit with the given message.
 * Returns the commit hash on success, null on failure or if not a git repo.
 */
export function gitCommitAll(cwd: string, message: string): string | null {
  if (!isGitRepo(cwd)) return null;

  try {
    execSync("git add -A", { cwd, stdio: ["pipe", "pipe", "pipe"] });

    // Check if there are staged changes
    const status = execSync("git diff --cached --quiet || echo changed", {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    if (!status) return null; // nothing to commit

    execSync(`git commit -m ${JSON.stringify(message)}`, {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    const hash = execSync("git rev-parse --short HEAD", {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    return hash;
  } catch {
    return null;
  }
}

/**
 * Get the diff of all uncommitted changes (staged + unstaged) against HEAD.
 * Returns the diff string, or null if no changes or not a git repo.
 */
export function gitDiff(cwd: string): string | null {
  if (!isGitRepo(cwd)) return null;

  try {
    const diff = execSync("git diff HEAD", {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    return diff || null;
  } catch {
    return null;
  }
}

/**
 * Reset the working directory to HEAD (git reset --hard HEAD).
 * Returns true on success, false on failure or if not a git repo.
 */
export function gitResetHard(cwd: string): boolean {
  if (!isGitRepo(cwd)) return false;

  try {
    execSync("git reset --hard HEAD", {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Push to remote. Returns true on success.
 */
/**
 * Check if any git submodules have uncommitted changes.
 * Returns an array of { name, dirty } for each submodule.
 * Detects both:
 * - HEAD mismatch: submodule HEAD differs from recorded commit ('+' prefix in `git submodule status`)
 * - Working tree changes: uncommitted modifications inside the submodule
 */
export function checkSubmoduleDirty(cwd: string): { name: string; dirty: boolean }[] {
  if (!isGitRepo(cwd)) return [];

  try {
    const output = execSync("git submodule status", {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    if (!output) return [];

    const submodules = output.split("\n").map((line) => {
      // Format: " <hash> <name> (<desc>)" or "+<hash> <name> (<desc>)"
      const headDirty = line.startsWith("+");
      const name = line.replace(/^[+ -]/, "").replace(/^[a-f0-9]+ /, "").replace(/ \(.*\)$/, "").trim();
      return { name, dirty: headDirty };
    });

    // Also check for working-tree changes inside each submodule
    for (const sm of submodules) {
      if (sm.dirty) continue; // already dirty
      try {
        const porcelain = execSync("git status --porcelain", {
          cwd: `${cwd}/${sm.name}`,
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
        }).trim();
        if (porcelain) sm.dirty = true;
      } catch {
        // ignore — submodule might not be initialized
      }
    }

    return submodules;
  } catch {
    return [];
  }
}

/**
 * Get the current branch name.
 * Returns null if detached HEAD or not a git repo.
 */
export function gitCurrentBranch(cwd: string): string | null {
  if (!isGitRepo(cwd)) return null;

  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim() || null;
  } catch {
    return null;
  }
}

/**
 * Run git fetch --all. Returns true on success.
 */
export function gitFetchAll(cwd: string): boolean {
  try {
    execSync("git fetch --all", {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get ahead/behind counts between two refs.
 * Returns { ahead, behind } or null on error.
 */
export function gitAheadBehind(cwd: string, local: string, remote: string): { ahead: number; behind: number } | null {
  try {
    const output = execSync(`git rev-list --left-right --count ${local}...${remote}`, {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    const [ahead, behind] = output.split(/\s+/).map(Number);
    return { ahead, behind };
  } catch {
    return null;
  }
}

/**
 * Check if a remote tracking branch exists for the given branch.
 */
export function gitHasRemoteBranch(cwd: string, branch: string): boolean {
  try {
    execSync(`git rev-parse --verify origin/${branch}`, {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get list of remote branches not merged into the current branch.
 */
export function gitUnmergedRemoteBranches(cwd: string): string[] {
  try {
    const output = execSync("git branch -r --no-merged", {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    if (!output) return [];

    return output
      .split("\n")
      .map((b) => b.trim())
      .filter((b) => b && !b.includes("->"));
  } catch {
    return [];
  }
}

/**
 * Execute git pull --ff-only. Returns true on success.
 */
export function gitPullFfOnly(cwd: string): boolean {
  try {
    execSync("git pull --ff-only", {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return true;
  } catch {
    return false;
  }
}

export function gitPush(cwd: string): boolean {
  try {
    execSync("git push", {
      cwd,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Push all submodules that have unpushed commits.
 * Returns list of { name, success } for submodules that were pushed.
 */
export function pushSubmodules(cwd: string): { name: string; success: boolean }[] {
  const submodules = checkSubmoduleDirty(cwd);
  if (submodules.length === 0) return [];

  const results: { name: string; success: boolean }[] = [];

  for (const sm of submodules) {
    const smPath = `${cwd}/${sm.name}`;
    // Check if submodule has unpushed commits
    try {
      const ahead = execSync("git rev-list --count @{u}..HEAD", {
        cwd: smPath,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      }).trim();
      if (parseInt(ahead, 10) > 0) {
        const success = gitPush(smPath);
        results.push({ name: sm.name, success });
      }
    } catch {
      // No upstream or not initialized — skip
    }
  }

  return results;
}
