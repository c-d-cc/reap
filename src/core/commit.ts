import { execSync } from "child_process";

export interface CommitResult {
  success: boolean;
  commitHash?: string;
  error?: string;
}

export interface SubmoduleStatus {
  path: string;
  dirty: boolean;
  hash: string;
}

export function checkSubmodules(projectRoot: string): SubmoduleStatus[] {
  try {
    const output = execSync("git submodule status", { cwd: projectRoot, stdio: "pipe" }).toString();
    if (!output.trim()) return [];

    return output.trim().split("\n").map(line => {
      const dirty = line.startsWith("+");
      const cleaned = line.replace(/^[+ -]/, "").trim();
      const parts = cleaned.split(/\s+/);
      return {
        hash: parts[0] ?? "",
        path: parts[1] ?? "",
        dirty,
      };
    });
  } catch {
    return [];
  }
}

export function commitSubmodule(submodulePath: string, message: string): CommitResult {
  try {
    execSync("git add -A", { cwd: submodulePath, stdio: "pipe" });
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: submodulePath, stdio: "pipe" });
    const hash = execSync("git rev-parse --short HEAD", { cwd: submodulePath, stdio: "pipe" }).toString().trim();
    return { success: true, commitHash: hash };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function commitChanges(projectRoot: string, message: string, paths?: string[]): CommitResult {
  try {
    const addTarget = paths && paths.length > 0 ? paths.map(p => `"${p}"`).join(" ") : ".";
    execSync(`git add ${addTarget}`, { cwd: projectRoot, stdio: "pipe" });

    // Check if there's anything to commit
    try {
      execSync("git diff --cached --quiet", { cwd: projectRoot, stdio: "pipe" });
      return { success: true, commitHash: undefined, error: "nothing to commit" };
    } catch { /* has staged changes, proceed */ }

    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: projectRoot, stdio: "pipe" });
    const hash = execSync("git rev-parse --short HEAD", { cwd: projectRoot, stdio: "pipe" }).toString().trim();
    return { success: true, commitHash: hash };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
