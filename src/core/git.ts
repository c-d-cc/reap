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
