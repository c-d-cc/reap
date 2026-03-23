import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { gitRefExists, gitCurrentBranch } from "../../../core/git";
import { emitOutput, emitError } from "../../../core/run-output";
import { execSync } from "child_process";

/**
 * git rev-list --left-right --count HEAD...target 로 ahead/behind 카운트를 반환한다.
 * @returns { ahead: number, behind: number }
 */
function getAheadBehind(target: string, cwd: string): { ahead: number; behind: number } {
  try {
    const result = execSync(`git rev-list --left-right --count HEAD...${target}`, {
      cwd,
      encoding: "utf-8",
    }).trim();
    const [aheadStr, behindStr] = result.split(/\s+/);
    return { ahead: parseInt(aheadStr, 10) || 0, behind: parseInt(behindStr, 10) || 0 };
  } catch {
    throw new Error(`Failed to compare HEAD with ${target}. Ensure both refs exist.`);
  }
}

export async function execute(paths: ReapPaths, phase?: string, argv: string[] = []): Promise<void> {
  const positionals = argv.filter(a => !a.startsWith("--"));
  const targetBranchArg = positionals[0];
  const gm = new GenerationManager(paths);

  if (!phase || phase === "fetch") {
    // Phase 1: Gate + fetch
    const state = await gm.current();
    if (state && state.id) {
      emitError("pull", `Generation ${state.id} is in progress (stage: ${state.stage}). Complete it before pulling.`);
    }

    emitOutput({
      status: "prompt",
      command: "pull",
      phase: "fetch",
      completed: ["gate"],
      context: {
        currentBranch: gitCurrentBranch(paths.projectRoot),
      },
      prompt: [
        "## Pull -- Fetch Remote and Merge",
        "",
        "1. Run `git fetch origin`",
        "2. Ask the human for the target remote branch (e.g., `origin/main`)",
        "3. Then run: reap run pull --phase check <branch-name>",
      ].join("\n"),
      nextCommand: "reap run pull --phase check",
    });
  }

  if (phase === "check") {
    // Phase 2: ahead/behind detection via git rev-list
    const targetBranch = targetBranchArg;
    if (!targetBranch) {
      emitError("pull", "Target branch is required. Usage: reap run pull --phase check <branch>");
    }

    if (!gitRefExists(targetBranch, paths.projectRoot)) {
      emitError("pull", `Branch "${targetBranch}" does not exist. Run \`git fetch\` first.`);
    }

    const currentBranch = gitCurrentBranch(paths.projectRoot);
    const { ahead, behind } = getAheadBehind(targetBranch, paths.projectRoot);

    if (ahead === 0 && behind === 0) {
      emitOutput({
        status: "ok",
        command: "pull",
        phase: "up-to-date",
        completed: ["gate", "fetch", "detect"],
        context: { targetBranch, currentBranch, ahead, behind },
        message: "Already up to date.",
      });
    } else if (ahead > 0 && behind === 0) {
      emitOutput({
        status: "ok",
        command: "pull",
        phase: "ahead",
        completed: ["gate", "fetch", "detect"],
        context: { targetBranch, currentBranch, ahead, behind },
        message: `Local is ${ahead} commit(s) ahead of ${targetBranch}. Consider pushing.`,
        prompt: [
          `## Local is ahead by ${ahead} commit(s)`,
          "",
          `Your branch is ahead of \`${targetBranch}\`. No pull needed.`,
          "Run `git push` to update the remote.",
        ].join("\n"),
      });
    } else if (ahead === 0 && behind > 0) {
      emitOutput({
        status: "prompt",
        command: "pull",
        phase: "fast-forward",
        completed: ["gate", "fetch", "detect"],
        context: { targetBranch, currentBranch, ahead, behind },
        prompt: [
          `## Behind by ${behind} commit(s) -- fast-forward possible`,
          "",
          `Run \`git merge --ff ${targetBranch}\`, then \`git submodule update --init\`.`,
          "No merge generation needed.",
        ].join("\n"),
      });
    } else {
      // ahead > 0 && behind > 0 — diverged
    emitOutput({
      status: "prompt",
      command: "pull",
      phase: "start-merge",
      completed: ["gate", "fetch", "detect"],
      context: {
        targetBranch,
        currentBranch,
        ahead,
        behind,
        diverged: true,
      },
      prompt: [
        `## Branches have diverged (ahead: ${ahead}, behind: ${behind}) -- full merge required`,
        "",
        "Execute the following sequence:",
        `1. Run /reap.merge.start ${targetBranch} (creates merge generation + detect report)`,
        "2. Run /reap.merge.evolve (runs detect -> mate -> merge -> sync -> validation -> completion)",
        "3. Run `git submodule update --init` after merge completes",
      ].join("\n"),
    });
    }
  }
}
