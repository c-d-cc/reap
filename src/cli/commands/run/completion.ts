import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { readTextFile } from "../../../core/fs.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { verifyTransition, setTransitionNonces } from "../../../core/stage-transition.js";
import { copyArtifactTemplate } from "../../../core/template.js";
import { archiveGeneration } from "../../../core/archive.js";
import { consumeBacklog, scanBacklog } from "../../../core/backlog.js";
import {
  parseGoals,
  buildVisionGapAnalysis,
  buildDiagnosisPrompt,
  buildVisionDevelopmentSuggestions,
} from "../../../core/vision.js";
import { executeHooks } from "../../../core/hooks.js";
import { parseCruiseCount, advanceCruise } from "../../../core/cruise.js";
import { gitCommitAll, checkSubmoduleDirty, pushSubmodules } from "../../../core/git.js";
import {
  detectMaturity,
  getTransitionUrgency,
  buildTransitionCheckPrompt,
  getMaturityBehaviorGuide,
} from "../../../core/maturity.js";
import YAML from "yaml";
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
    verifyTransition("completion", s, "completion:entry");
    await copyArtifactTemplate("completion", paths.artifact, isMerge);

    // Load context artifacts based on lifecycle type
    const completionArtifact = isMerge ? "06-completion.md" : "05-completion.md";
    const context: Record<string, unknown> = {
      id: s.id,
      goal: s.goal,
      artifactPath: paths.artifact(completionArtifact),
    };

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

    setTransitionNonces(s, "completion:entry");
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
        `### Artifact: Write \`.reap/life/${completionArtifact}\``,
        "",
        `1. Write ${completionArtifact}: Summary, Lessons Learned, Next Generation Hints`,
        "2. Update environment/summary.md with new knowledge from this generation",
        "3. Update memory (`.reap/vision/memory/`) following these criteria:",
        "   - **Shortterm** (update every generation — mandatory):",
        "     - Summary of what was done in this generation",
        "     - Context to hand off to the next session",
        "     - Undecided matters, ongoing discussions",
        "     - Current backlog state snapshot",
        "   - **Midterm** (update when context changes):",
        "     - Flow of large ongoing tasks",
        "     - Multi-generation plans",
        "     - Directions agreed with the user",
        "   - **Longterm** (update only when lessons emerge):",
        "     - Design lessons worth repeating",
        "     - Background behind architecture decisions",
        "     - Lessons from project transitions",
        "   - **Do NOT write**: code change details (environment handles), test numbers (artifact handles), principles already in genome (no duplication)",
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
      verifyTransition("completion", s, "completion:fitness");

      s.fitnessFeedback = feedback;
      setTransitionNonces(s, "completion:fitness");
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
      verifyTransition("completion", s, "completion:fitness");

      const configContent = await readTextFile(paths.config);
      const config = configContent ? (YAML.parse(configContent) as ReapConfig) : null;
      const cruise = config ? parseCruiseCount(config) : null;

      // Re-set fitness nonce (self-loop: completion:fitness -> completion:fitness)
      setTransitionNonces(s, "completion:fitness");
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
    verifyTransition("completion", s, "completion:adapt");

    const fitnessFeedback = s.fitnessFeedback;
    const visionGoals = await readTextFile(paths.visionGoals);

    // Load config for maturity detection
    const configContent = await readTextFile(paths.config);
    const config = configContent ? (YAML.parse(configContent) as ReapConfig) : null;
    const maturity = detectMaturity(s.type, config?.cruiseCount);
    const generationCount = await gm.countLineage();

    setTransitionNonces(s, "completion:adapt");
    await gm.save(s);

    // Build adapt prompt sections
    const promptSections: string[] = [
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
    ];

    // ── Maturity behavior guide ──
    promptSections.push(getMaturityBehaviorGuide(maturity));
    promptSections.push("");

    // ── Embryo → Normal transition check (Task 1: §2.1) ──
    if (s.type === "embryo") {
      const urgency = getTransitionUrgency(generationCount);
      promptSections.push(buildTransitionCheckPrompt(generationCount, urgency));
      promptSections.push("");
    }

    // ── Project Diagnosis Framework ──
    promptSections.push(buildDiagnosisPrompt());
    promptSections.push("");

    // ── Gap-driven Evolution with Clarity (Task 4: §3.1) ──
    promptSections.push("### Gap-driven Next Generation Selection");
    promptSections.push("");
    promptSections.push("Assess the current clarity level and adjust your interaction accordingly:");
    promptSections.push("");
    promptSections.push("**High clarity** (vision + backlog with clear tasks):");
    promptSections.push("- Quick confirm current direction → pick next backlog task → propose as next generation goal.");
    promptSections.push("");
    promptSections.push("**Medium clarity** (vision exists, details unclear):");
    promptSections.push("- Vision + lineage analysis → identify gaps → present options:");
    promptSections.push("  \"Gap A, B, C identified. Which should we address first?\"");
    promptSections.push("");
    promptSections.push("**Low clarity** (direction unknown):");
    promptSections.push("- Summarize current project state → ask \"What direction do you want?\"");
    promptSections.push("- Use Software Completion Criteria to diagnose gaps and present weak areas.");
    promptSections.push("- Structured conversation to build clarity before proposing next steps.");
    promptSections.push("");

    // ── Steps ──
    promptSections.push("### Steps:");
    promptSections.push("1. **Genome Review**: Based on fitness feedback, determine if application.md or evolution.md need modifications");
    promptSections.push("2. **Vision Check**: Review vision/goals.md — mark completed goals with [x], identify next goals");

    // ── Vision gap analysis (automated) ──
    if (visionGoals) {
      const parsedGoals = parseGoals(visionGoals);
      const pendingBacklog = await scanBacklog(paths.backlog);
      const pendingItems = pendingBacklog.filter((b) => b.status === "pending");

      // Load completion artifact summary for better matching
      const completionArtifact = isMerge ? "06-completion.md" : "05-completion.md";
      const completionContent = await readTextFile(paths.artifact(completionArtifact));
      const genResult = completionContent?.slice(0, 1500);

      const gapAnalysis = buildVisionGapAnalysis(parsedGoals, pendingItems, s.goal, genResult);
      promptSections.push("");
      promptSections.push(gapAnalysis);
      promptSections.push("**Vision Auto-Update**: Check off any goals completed in this generation.");
      promptSections.push("Update vision/goals.md directly to mark completed items with [x].");
      promptSections.push("");

      // ── Vision development suggestions ──
      const devSuggestions = buildVisionDevelopmentSuggestions(parsedGoals);
      if (devSuggestions) {
        promptSections.push(devSuggestions);
      }
    }

    promptSections.push("3. **Suggest Next Generation Candidates**: Write suggestions in the completion artifact's \"Next Generation Hints\" section as plain text. Do NOT create backlog items.");
    promptSections.push("");
    promptSections.push("### CRITICAL — Backlog Creation Prohibited in Adapt Phase");
    promptSections.push("- Do NOT run `reap make backlog` during the adapt phase.");
    promptSections.push("- Do NOT create backlog files by any means.");
    promptSections.push("- Next generation candidates and improvement ideas go in the **artifact text only** (Next Generation Hints section).");
    promptSections.push("- The human will decide which suggestions become backlog items after reviewing the artifact.");
    promptSections.push("");
    promptSections.push("When done: reap run completion --phase commit");

    emitOutput({
      status: "prompt",
      command: "completion",
      phase: "adapt",
      completed: ["gate", "reflect", "fitness"],
      context: {
        id: s.id,
        goal: s.goal,
        type: s.type,
        maturity,
        generationCount,
        fitnessFeedback,
        visionGoals: visionGoals?.slice(0, 2000),
      },
      prompt: promptSections.filter(Boolean).join("\n"),
      nextCommand: "reap run completion --phase commit",
    });
  }

  // ── Phase 4: commit ───────────────────────────────────────
  if (phase === "commit") {
    verifyTransition("completion", s, "completion:commit");

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

    // Check submodule dirty state BEFORE archive (so generation state is preserved on failure)
    const dirtySubmodules = checkSubmoduleDirty(paths.root).filter((sm) => sm.dirty);
    if (dirtySubmodules.length > 0) {
      const names = dirtySubmodules.map((sm) => sm.name).join(", ");
      emitError(
        "completion",
        `Submodule(s) have uncommitted changes: ${names}. Commit inside the submodule(s) first, then retry.`,
      );
    }

    // Push submodules before archiving (so remote has the refs parent commit will reference)
    pushSubmodules(paths.root);

    const archiveDir = await archiveGeneration(paths, s, fitnessFeedback);

    // Auto-commit generation
    const goalSummary = s.goal.length > 60 ? s.goal.slice(0, 57) + "..." : s.goal;
    const commitMsg = `feat(${s.id.replace(/-[a-f0-9]+$/, "")}): ${goalSummary}`;
    const commitHash = gitCommitAll(paths.root, commitMsg);

    // Run completion hooks
    const completionEvent = isMerge ? "onMergeCompleted" : "onLifeCompleted";
    await executeHooks(paths.hooks, completionEvent, paths.root).catch(() => {});

    // Trigger daemon indexing after generation completion
    const { triggerIndexing } = await import("../daemon/lifecycle.js");
    await triggerIndexing(paths.root);

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
