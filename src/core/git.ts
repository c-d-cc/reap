import { execSync } from "child_process";

/** Read a file from a git ref: `git show {ref}:{path}` */
export function gitShow(ref: string, path: string, cwd: string): string | null {
  try {
    return execSync(`git show ${ref}:${path}`, { cwd, encoding: "utf-8", timeout: 10_000 });
  } catch {
    return null;
  }
}

/** List files under a path in a git ref: `git ls-tree -r --name-only` */
export function gitLsTree(ref: string, path: string, cwd: string): string[] {
  try {
    const output = execSync(`git ls-tree -r --name-only ${ref} -- ${path}`, {
      cwd, encoding: "utf-8", timeout: 10_000,
    });
    return output.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

/** Check if a git ref (branch/tag/commit) exists */
export function gitRefExists(ref: string, cwd: string): boolean {
  try {
    execSync(`git rev-parse --verify ${ref}`, { cwd, encoding: "utf-8", timeout: 5_000 });
    return true;
  } catch {
    return false;
  }
}

/** Get all local + remote branch names */
export function gitAllBranches(cwd: string): string[] {
  try {
    const output = execSync("git branch -a --format='%(refname:short)'", {
      cwd, encoding: "utf-8", timeout: 10_000,
    });
    return output.trim().split("\n").filter(Boolean).map(b => b.replace(/^origin\//, ""));
  } catch {
    return [];
  }
}

/** Get the HEAD commit hash (full SHA) */
export function gitHeadCommit(cwd: string): string | null {
  try {
    return execSync("git rev-parse HEAD", { cwd, encoding: "utf-8", timeout: 5_000 }).trim();
  } catch {
    return null;
  }
}

/** Get the current branch name */
export function gitCurrentBranch(cwd: string): string | null {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { cwd, encoding: "utf-8", timeout: 5_000 }).trim();
  } catch {
    return null;
  }
}
