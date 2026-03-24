import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { readTextFile } from "../../../core/fs.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { verifyNonce, setNonce } from "../../../core/stage-transition.js";
import { copyArtifactTemplate } from "../../../core/template.js";
import { archiveGeneration } from "../../../core/archive.js";
import { consumeBacklog } from "../../../core/backlog.js";
import { runHooks } from "../../../core/hooks.js";
import { parseCruiseCount, advanceCruise } from "../../../core/cruise.js";
import { gitCommitAll } from "../../../core/git.js";
import yaml from "js-yaml";
import type { ReapConfig } from "../../../types/index.js";

export async function execute(paths: ReapPaths, phase?: string, feedback?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("completion", "No active generation.");
  if (state!.stage !== "completion") emitError("completion", `Current stage is '${state!.stage}', not 'completion'.`);

  const s = state!;
  const isMerge = s.type === "merge";

  // ── Phase 1: reflect ──────────────────────────────────────
  if (!phase || phase === "reflect") {
    verifyNonce("completion", s, "completion", "entry");
    await copyArtifactTemplate("completion", paths.artifact, isMerge);

    // Load context artifacts based on lifecycle type
    const context: Record<string, unknown> = { id: s.id, goal: s.goal };
    const completionArtifact = isMerge ? "06-completion.md" : "05-completion.md";

    if (isMerge) {
      const mergeContent = await readTextFile(paths.artifact("03-merge.md"));
      const reconcileContent = await readTextFile(paths.artifact("04-reconcile.md"));
      const valContent = await readTextFile(paths.artifact("05-validation.md"));
      context.mergeSummary = mergeContent?.slice(0, 2000);
      context.reconcileSummary = reconcileContent?.slice(0, 2000);
      context.valSummary = valContent?.slice(0, 2000);
    } else {
      const implContent = await readTextFile(paths.artifact("03-implementation.md"));
      const valContent = await readTextFile(paths.artifact("04-validation.md"));
      context.implSummary = implContent?.slice(0, 3000);
      context.valSummary = valContent?.slice(0, 2000);
    }

    setNonce(s, "completion", "fitness");
    await gm.save(s);

    emitOutput({
      status: "prompt",
      command: "completion",
      phase: "reflect",
      completed: ["gate"],
      context,
      prompt: [
        "## Completion — Reflect Phase",
        "",
        "Retrospective + environment update (combined).",
        "",
        `1. Write ${completionArtifact}: Summary, Lessons Learned, Next Generation Hints`,
        "2. Update environment/summary.md with new knowledge from this generation",
        "",
        "When done: reap run completion --phase fitness",
      ].join("\n"),
      nextCommand: "reap run completion --phase fitness",
    });
  }

  // ── Phase 2: fitness ──────────────────────────────────────
  if (phase === "fitness") {
    if (feedback) {
      // Feedback provided — store and advance
      verifyNonce("completion", s, "completion", "fitness");

      s.fitnessFeedback = feedback;
      setNonce(s, "completion", "adapt");
      await gm.save(s);

      emitOutput({
        status: "ok",
        command: "completion",
        phase: "fitness-collected",
        completed: ["gate", "reflect", "fitness"],
        context: { id: s.id },
        message: "Fitness feedback collected.",
        nextCommand: "reap run completion --phase adapt",
      });
    } else {
      // No feedback yet — check cruise mode
      verifyNonce("completion", s, "completion", "fitness");

      const configContent = await readTextFile(paths.config);
      const config = configContent ? (yaml.load(configContent) as ReapConfig) : null;
      const cruise = config ? parseCruiseCount(config) : null;

      // Re-set same nonce (don't consume yet, wait for feedback)
      setNonce(s, "completion", "fitness");
      await gm.save(s);

      if (cruise) {
        // Cruise mode — self-assessment prompt
        emitOutput({
          status: "prompt",
          command: "completion",
          phase: "fitness",
          completed: ["gate", "reflect"],
          context: { id: s.id, goal: s.goal, cruiseMode: true, cruiseCount: config!.cruiseCount },
          prompt: [
            "## Completion — Fitness Phase (Cruise Mode)",
            "",
            `Cruise: ${config!.cruiseCount}`,
            "",
            "### Self-Assessment (not self-fitness, but metacognition):",
            "1. Did this generation proceed as expected?",
            "2. Are there uncertain areas or risks?",
            "3. Are there items that need human confirmation?",
            "",
            "High confidence → auto-proceed: reap run completion --phase fitness --feedback \"self-assessment: OK\"",
            "Uncertain/risky → stop cruise and request human feedback",
          ].join("\n"),
          nextCommand: "reap run completion --phase fitness",
        });
      } else {
        // Supervised mode — human feedback
        emitOutput({
          status: "prompt",
          command: "completion",
          phase: "fitness",
          completed: ["gate", "reflect"],
          context: { id: s.id, goal: s.goal, cruiseMode: false },
          prompt: [
            "## Completion — Fitness Phase",
            "",
            "Collect feedback from the human.",
            "",
            "Present to the human:",
            "1. Summary of what was done in this generation",
            "2. What went well / areas for improvement",
            "3. Suggested next direction",
            "",
            'Submit: reap run completion --phase fitness --feedback "human feedback here"',
          ].join("\n"),
          nextCommand: "reap run completion --phase fitness",
        });
      }
    }
  }

  // ── Phase 3: adapt ────────────────────────────────────────
  if (phase === "adapt") {
    verifyNonce("completion", s, "completion", "adapt");

    const fitnessFeedback = s.fitnessFeedback;
    const visionGoals = await readTextFile(paths.visionGoals);

    setNonce(s, "completion", "commit");
    await gm.save(s);

    emitOutput({
      status: "prompt",
      command: "completion",
      phase: "adapt",
      completed: ["gate", "reflect", "fitness"],
      context: {
        id: s.id,
        goal: s.goal,
        type: s.type,
        fitnessFeedback,
        visionGoals: visionGoals?.slice(0, 2000),
      },
      prompt: [
        "## Completion — Adapt Phase",
        "",
        "Genome modifications + suggest next generation direction.",
        "",
        "### Fitness Feedback:",
        fitnessFeedback ? `> ${fitnessFeedback}` : "> (no feedback)",
        "",
        s.type === "embryo"
          ? "**Embryo mode**: genome (application.md, evolution.md) can be freely modified."
          : "**Normal mode**: propose genome changes via backlog. invariants.md cannot be modified.",
        "",
        "### Steps:",
        "1. **Genome Review**: Based on fitness feedback, determine if application.md or evolution.md need modifications",
        "2. **Vision Check**: Reference vision/goals.md to check completed goals and determine next goals",
        visionGoals ? `\n### Current Vision Goals:\n${visionGoals.slice(0, 1000)}\n` : "",
        "3. **Suggest Next Generation Candidates**: Record as type: task in backlog",
        "4. **Reflect Environment Changes**: Create environment-change backlog if needed",
        "",
        "When done: reap run completion --phase commit",
      ].filter(Boolean).join("\n"),
      nextCommand: "reap run completion --phase commit",
    });
  }

  // ── Phase 4: commit ───────────────────────────────────────
  if (phase === "commit") {
    verifyNonce("completion", s, "completion", "commit");

    // Consume specified backlog items
    if (feedback) {
      // feedback param doubles as consume list (comma-separated filenames)
      const filenames = feedback.split(",").map((f) => f.trim()).filter(Boolean);
      const { join } = await import("path");
      for (const filename of filenames) {
        await consumeBacklog(join(paths.backlog, filename), s.id);
      }
    }

    const fitnessFeedback = s.fitnessFeedback;
    const archiveDir = await archiveGeneration(paths, s, fitnessFeedback);

    // Auto-commit generation
    const goalSummary = s.goal.length > 60 ? s.goal.slice(0, 57) + "..." : s.goal;
    const commitMsg = `feat(${s.id.replace(/-[a-f0-9]+$/, "")}): ${goalSummary}`;
    const commitHash = gitCommitAll(paths.root, commitMsg);

    // Run completion hooks
    const completionEvent = isMerge ? "onMergeCompleted" : "onLifeCompleted";
    await runHooks(paths.hooks, completionEvent, paths.root).catch(() => {});

    // Advance cruise count if in cruise mode
    const cruiseStillActive = await advanceCruise(paths.config).catch(() => false);

    emitOutput({
      status: "ok",
      command: "completion",
      phase: "commit",
      completed: ["gate", "reflect", "fitness", "adapt", "archive", ...(commitHash ? ["git-commit"] : [])],
      context: {
        id: s.id,
        goal: s.goal,
        archiveDir,
        commitHash: commitHash ?? undefined,
        cruiseActive: cruiseStillActive,
      },
      message: commitHash
        ? `Generation ${s.id} archived and committed (${commitHash}).${cruiseStillActive ? " Cruise mode active — start next generation." : ""}`
        : cruiseStillActive
          ? `Generation ${s.id} archived. Cruise mode active — start next generation.`
          : `Generation ${s.id} archived. Commit your changes.`,
    });
  }
}
