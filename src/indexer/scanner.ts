import { execFileSync } from "child_process";
import { join } from "path";
import { detectLanguage } from "./languages.js";

export interface ScannedFile {
  relativePath: string;
  absolutePath: string;
  language: string;
}

function git(projectRoot: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd: projectRoot,
    encoding: "utf-8",
    maxBuffer: 50 * 1024 * 1024,
  });
}

/** Whether `projectRoot` is inside a git work tree. */
export function isGitRepo(projectRoot: string): boolean {
  try {
    return git(projectRoot, ["rev-parse", "--is-inside-work-tree"]).trim() === "true";
  } catch {
    return false;
  }
}

/** `git rev-parse HEAD`, or null when there is no commit yet / no repository. */
export function headCommit(projectRoot: string): string | null {
  try {
    return git(projectRoot, ["rev-parse", "HEAD"]).trim() || null;
  } catch {
    return null;
  }
}

/** Every tracked file whose extension maps to a supported language. */
export function scanFiles(projectRoot: string): ScannedFile[] {
  let paths: string[];
  try {
    paths = git(projectRoot, ["ls-files", "-z"]).split("\0").filter(Boolean);
  } catch {
    return [];
  }

  const files: ScannedFile[] = [];
  for (const relativePath of paths) {
    const language = detectLanguage(relativePath);
    if (!language) continue;
    files.push({ relativePath, absolutePath: join(projectRoot, relativePath), language });
  }
  return files;
}

/**
 * Files that changed between `sinceCommit` and HEAD.
 *
 * Commits only — the working tree and the index are deliberately not consulted.
 * The index's identity is a commit SHA (`manifest.lastIndexedCommit`), and
 * mixing in uncommitted edits would make that identity a lie: two runs at the
 * same commit could disagree, and "nothing changed" would almost never hold on
 * a machine where someone is working. The cost is the documented trade-off —
 * symbols added since the last commit are not in the index, while the question
 * blast radius answers ("what depends on this?") is about committed code and
 * stays correct.
 */
export function getChangedFiles(projectRoot: string, sinceCommit: string): string[] {
  let changed: string[];
  try {
    // `--no-renames` is not a detail. With rename detection on, `--name-only`
    // prints only the destination of a rename, so the old path never reaches
    // `removeByFile` and its symbols stay in the graph forever — a `foo` that
    // moved answers `impact` from a file that no longer exists, and the stale
    // per-file import stats keep reporting it as resolved. Turning detection
    // off makes a rename what the index needs it to be: one deletion and one
    // addition.
    changed = git(projectRoot, ["diff", "--no-renames", "--name-only", `${sinceCommit}..HEAD`])
      .split("\n")
      .filter(Boolean);
  } catch {
    // Unknown commit (history rewritten, shallow clone, index from another
    // branch). The caller treats an empty answer as "cannot tell" only because
    // it also compares SHAs — see `Indexer.update`, which falls back to a full
    // rebuild when the recorded commit is not reachable.
    return [];
  }
  return changed.filter((f) => detectLanguage(f) !== null);
}

/** Whether `commit` exists in this repository. */
export function commitExists(projectRoot: string, commit: string): boolean {
  try {
    git(projectRoot, ["cat-file", "-e", `${commit}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}
