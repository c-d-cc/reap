import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import {
  isGitRepo,
  gitFetchAll,
  gitCurrentBranch,
  gitHasRemoteBranch,
  gitAheadBehind,
  gitUnmergedRemoteBranches,
  gitPullFfOnly,
} from "../../../core/git.js";
import { emitOutput, emitError } from "../../../core/output.js";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  if (!isGitRepo(paths.root)) {
    emitError("pull", "Not a git repository.");
  }

  // Fetch
  const fetched = gitFetchAll(paths.root);
  if (!fetched) {
    emitError("pull", "git fetch --all failed. Check remote configuration and network.");
  }

  const branch = gitCurrentBranch(paths.root);
  if (!branch) {
    emitError("pull", "Could not determine current branch (detached HEAD?).");
  }

  const currentBranch = branch!;
  const hasRemote = gitHasRemoteBranch(paths.root, currentBranch);

  // Check active generation
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  // Analyze divergence
  if (!hasRemote) {
    const unmerged = gitUnmergedRemoteBranches(paths.root);

    emitOutput({
      status: "prompt",
      command: "pull",
      context: {
        branch: currentBranch,
        hasRemote: false,
        unmergedBranches: unmerged,
        activeGeneration: state?.id ?? null,
      },
      prompt: [
        `Branch '${currentBranch}' has no remote tracking branch.`,
        "",
        unmerged.length > 0
          ? `Unmerged remote branches found: ${unmerged.join(", ")}\nConsider merging if needed.`
          : "No unmerged remote branches.",
      ].join("\n"),
    });
  }

  const counts = gitAheadBehind(paths.root, "HEAD", `origin/${currentBranch}`);
  if (!counts) {
    emitError("pull", `Could not compare HEAD with origin/${currentBranch}.`);
  }

  const { ahead, behind } = counts!;
  const unmerged = gitUnmergedRemoteBranches(paths.root);

  // Case 1: In sync
  if (ahead === 0 && behind === 0) {
    emitOutput({
      status: "ok",
      command: "pull",
      completed: ["fetch", "analyze"],
      context: {
        branch: currentBranch,
        ahead: 0,
        behind: 0,
        unmergedBranches: unmerged,
        activeGeneration: state?.id ?? null,
      },
      prompt: [
        `In sync with origin/${currentBranch}.`,
        "",
        unmerged.length > 0
          ? `Unmerged remote branches: ${unmerged.join(", ")}\nConsider using /reap.merge to start a merge lifecycle if needed.`
          : "No unmerged remote branches.",
      ].join("\n"),
      message: `In sync with origin/${currentBranch}.`,
    });
  }

  // Case 2: Fast-forward possible (only remote has new commits)
  if (ahead === 0 && behind > 0) {
    if (phase === "ff") {
      const success = gitPullFfOnly(paths.root);
      if (!success) {
        emitError("pull", "git pull --ff-only failed.");
      }

      emitOutput({
        status: "ok",
        command: "pull",
        phase: "ff",
        completed: ["fetch", "analyze", "fast-forward"],
        context: {
          branch: currentBranch,
          behind,
          activeGeneration: state?.id ?? null,
        },
        message: `Fast-forwarded ${behind} commit(s) from origin/${currentBranch}.`,
      });
    }

    emitOutput({
      status: "prompt",
      command: "pull",
      completed: ["fetch", "analyze"],
      context: {
        branch: currentBranch,
        ahead: 0,
        behind,
        unmergedBranches: unmerged,
        activeGeneration: state?.id ?? null,
      },
      prompt: [
        `origin/${currentBranch} has ${behind} new commit(s). Fast-forward is possible.`,
        "",
        state
          ? `Active generation ${state.id} exists (stage: ${state.stage}). Proceeding with fast-forward should be safe if the changes are compatible.`
          : "",
        "",
        "To fast-forward, run:",
        "  reap run pull --phase ff",
      ].filter(Boolean).join("\n"),
      nextCommand: "reap run pull --phase ff",
    });
  }

  // Case 3: Diverged (both sides have commits)
  if (ahead > 0 && behind > 0) {
    emitOutput({
      status: "prompt",
      command: "pull",
      completed: ["fetch", "analyze"],
      context: {
        branch: currentBranch,
        ahead,
        behind,
        unmergedBranches: unmerged,
        activeGeneration: state?.id ?? null,
      },
      prompt: [
        `Branches have diverged: ${ahead} local commit(s), ${behind} remote commit(s).`,
        "",
        state
          ? `Active generation ${state.id} exists. Complete or abort it before starting a merge.`
          : "No active generation. A merge lifecycle can be started.",
        "",
        "To merge, use /reap.merge to start a merge lifecycle:",
        `  reap run start --type merge --parents "${currentBranch},origin/${currentBranch}" "<merge goal>"`,
      ].join("\n"),
    });
  }

  // Case 4: Only local has new commits (ahead only)
  if (ahead > 0 && behind === 0) {
    emitOutput({
      status: "ok",
      command: "pull",
      completed: ["fetch", "analyze"],
      context: {
        branch: currentBranch,
        ahead,
        behind: 0,
        unmergedBranches: unmerged,
        activeGeneration: state?.id ?? null,
      },
      prompt: [
        `Local is ${ahead} commit(s) ahead of origin/${currentBranch}. No remote changes to pull.`,
        "",
        unmerged.length > 0
          ? `Unmerged remote branches: ${unmerged.join(", ")}`
          : "",
      ].filter(Boolean).join("\n"),
      message: `Local is ${ahead} commit(s) ahead. Nothing to pull.`,
    });
  }
}
