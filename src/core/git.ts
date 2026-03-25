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
