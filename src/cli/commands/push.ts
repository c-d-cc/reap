import { execSync } from "child_process";
import { ReapPaths } from "../../core/paths";
import { readTextFile } from "../../core/fs";
import { gitCurrentBranch } from "../../core/git";
import YAML from "yaml";
import type { GenerationState } from "../../types";

export async function pushCommand(options: { remote?: string; force?: boolean }): Promise<void> {
  const cwd = process.cwd();
  const paths = new ReapPaths(cwd);

  if (!(await paths.isReapProject())) {
    throw new Error("Not a REAP project. Run 'reap init' first.");
  }

  const remote = options.remote ?? "origin";

  // 1. Check active generation
  const currentContent = await readTextFile(paths.currentYml);
  if (currentContent && currentContent.trim()) {
    const state = YAML.parse(currentContent) as GenerationState;
    if (state.stage !== "completion") {
      if (!options.force) {
        throw new Error(
          `Generation ${state.id} is in progress (stage: ${state.stage}). ` +
          `Complete it before pushing, or use --force to push anyway.`
        );
      }
      console.log(`⚠ Warning: Generation ${state.id} is in progress (stage: ${state.stage}). Pushing anyway.`);
    }
  }

  // 2. Get current branch
  const branch = gitCurrentBranch(cwd);
  if (!branch) throw new Error("Cannot determine current branch");

  // 3. Push
  console.log(`Pushing ${branch} to ${remote}...`);
  try {
    execSync(`git push ${remote} ${branch}`, { cwd, encoding: "utf-8", timeout: 30_000, stdio: "inherit" });
  } catch (err: any) {
    throw new Error(`git push failed: ${err.message}`);
  }

  console.log(`\n✓ Pushed ${branch} to ${remote}.`);
}
