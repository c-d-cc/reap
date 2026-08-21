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
import { parseCruiseCount, advanceCruise, clearCruise } from "../../../core/cruise.js";
import { gitCommitAll, checkSubmoduleDirty, pushSubmodules } from "../../../core/git.js";
import { buildEvaluatorPrompt, loadReapKnowledge } from "../../../core/prompt.js";
import { execute as executeReportEvaluator } from "./report-evaluator.js";
import { recordEvaluatorSilenceIfUnreported, formatEvaluatorRun, hasUnreviewedStage } from "../../../core/evaluator-run.js";
import { listMilestones } from "../../../core/milestone.js";
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

  // ── Sub-phase: report-evaluator (gen-100) ─────────────────
  // The fitness evaluator's channel. Same owner as validation's — see
  // ./report-evaluator.ts. Advances nothing; `feedback` carries the
  // JSON-encoded {severity, summary} that run/index.ts packed.
  if (phase === "report-evaluator") {
    await executeReportEvaluator(paths, feedback);
    return;
  }

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

    // Milestone this generation served, so reflect can record what moved.
    const reflectMilestones = await listMilestones(paths.visionMilestones);
    const servedMilestone = s.milestoneId
      ? reflectMilestones.find((m) => m.slug === s.milestoneId) ?? null
      : null;
    if (servedMilestone) {
      context.milestone = {
        slug: servedMilestone.slug,
        title: servedMilestone.title,
        path: servedMilestone.path,
        exitCriteria: servedMilestone.exitCriteria,
        unchecked: servedMilestone.generations.filter((g) => !g.checked).map((g) => g.text),
      };
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
        // reap:carrier(environment-refresh-targets-b4a95f5d)
        "2. Update environment/ — reflect what changed AND remove what is superseded:",
        "   - `summary.md` — tech stack, tests, dependencies, build: what is loaded every session",
        "   - `source-map.md` — the code's structure: modules added or removed, and what each is for. Whichever file holds the structure description is the one to update; do not maintain it in both",
        "   - **Delete statements that are no longer true** (removed files/modules, abandoned decisions)",
        "   - **Do NOT accumulate per-generation changelog entries.** environment describes the CURRENT state; lineage and git history own the history",
        // reap:carrier(memory-tier-classification-fa69f636)
        "3. Update memory (`.reap/vision/memory/`). Tiers are classified by **content-type** (what the content is for), NOT by lifespan:",
        "   - Decision tree — apply top-to-bottom:",
        "     1. Needed in the next session immediately? → `shortterm.md`",
        "     2. An ongoing, incomplete track or plan? → `midterm.md`",
        "     3. A finished design lesson worth preserving? → `longterm.md`",
        "     4. Finished with no special lesson? → **do NOT record** (lineage and git history preserve it)",
        "   - **Shortterm** — session handoff (update every generation — mandatory):",
        "     - Write: summary of this generation, handoff context, undecided matters, backlog state",
        "     - **Prune: delete handoff items already acted on, and REPLACE (overwrite) with this generation's handoff. No accumulation.**",
        "   - **Midterm** — ongoing tracks (update when a track's state changes):",
        "     - Write: flow of large ongoing tasks, multi-generation plans, agreed directions",
        "     - **Prune: when a track completes, promote key decisions to longterm and DELETE the section. Rule: \"Does this track have a next step?\" — No → delete.**",
        "   - **Longterm** — design lessons (update only when a lesson emerges):",
        "     - Write: design lessons worth repeating, background behind architecture decisions",
        "     - **Prune (periodic, or whenever bloat is detected): delete sections already documented in genome (duplicates), and stale transition context. Rule: \"Without this lesson, would the next agent make the same mistake?\" — No → delete.**",
        "   - **Bloat check**: longterm over ~30~50 lines or midterm over ~50~70 lines means pruning was skipped — clean up now",
        "   - **Do NOT write**: code change details (environment handles), test numbers (artifact handles), principles already in genome (no duplication), generation-specific debug logs (lineage handles)",
        "",
        ...(servedMilestone
          ? [
              `4. **Milestone Progress** — this generation served **${servedMilestone.title}** (\`${servedMilestone.slug}\`).`,
              `   - Open \`${servedMilestone.path}\` and check off in \`## Generations\` whatever this generation finished.`,
              "   - The list is a plan, not a contract — add, split or drop entries if the work turned out differently.",
              `   - Exit criteria: ${servedMilestone.exitCriteria.join(" / ") || "(none recorded)"}`,
              "   - If those are now met, say so in the artifact's `## Milestone Progress` section and propose `reap milestone close`. **Do not close it yourself — the human decides.**",
              "   - A milestone is NOT a memory tier. Whatever belongs to the plan goes in the milestone file, not in midterm.",
              "",
            ]
          : []),
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
      const evaluatorEnabled = config?.evaluator === true;

      // Re-set fitness nonce (self-loop: completion:fitness -> completion:fitness)
      setTransitionNonces(s, "completion:fitness");
      await gm.save(s);

      // gen-067: detect unresolved high-impact concerns from earlier stages
      // (recorded by `validation --phase report-evaluator --severity high`).
      // In cruise mode this auto-aborts the cruise so the evaluator's
      // recommendation is not silently overridden by self-assessment.
      const highConcerns = (s.evaluatorConcerns ?? []).filter((c) => c.severity === "high");

      // gen-067: in fitness phase, prepare an evaluator prompt for the
      // builder to invoke. Reuses the shared builder; only the framing message
      // and verification tasks differ between stages.
      let fitnessEvaluatorPrompt: string | undefined;
      if (evaluatorEnabled) {
        const knowledge = await loadReapKnowledge(paths);
        fitnessEvaluatorPrompt = buildEvaluatorPrompt(knowledge, paths, s, { stage: "fitness" });
      }

      const evaluatorSection: string[] = [];
      if (evaluatorEnabled) {
        evaluatorSection.push("");
        evaluatorSection.push("### Evaluator Subagent Invocation (opt-in via `evaluator: true`)");
        evaluatorSection.push("");
        evaluatorSection.push("Before composing the final fitness feedback, launch the independent reviewer using the Agent tool:");
        evaluatorSection.push("");
        evaluatorSection.push("- subagent_type: `reap-evaluate`");
        evaluatorSection.push("- description: independent fitness assessment");
        evaluatorSection.push("- prompt: the `evaluator.prompt` value from the context above");
        evaluatorSection.push("");
        evaluatorSection.push("The evaluator scores the generation along the 6 fitness dimensions (qualitative — no numeric scores).");
        evaluatorSection.push("Surface every concern to the user in your fitness summary; the human owns the final feedback.");
        evaluatorSection.push("");
        evaluatorSection.push("**Have the evaluator record its own verdict too.** `reap-evaluate` has `Bash`, so add");
        evaluatorSection.push("this line to the prompt you send it:");
        evaluatorSection.push("");
        evaluatorSection.push("> When you have reached your verdict, record it yourself before replying:");
        evaluatorSection.push("> `reap run completion --phase report-evaluator --severity <high|low|none> --summary \"<one line>\"`");
        evaluatorSection.push("");
        evaluatorSection.push("**Fallback** — if no verdict reaches you, for any reason (the Agent tool is absent,");
        evaluatorSection.push("the subagent errors, the reply is malformed, or it simply never answers):");
        evaluatorSection.push("- Tell the user the evaluator produced no verdict, and say which of those you observed.");
        evaluatorSection.push("- Continue. Fitness is not gated on the evaluator.");
        evaluatorSection.push("- **Record it** — do not leave it silent:");
        evaluatorSection.push("  `reap run completion --phase report-evaluator --severity unreachable --summary \"launched, no reply after N checks\"`");
      }

      // gen-100: the human about to give fitness feedback needs to know whether
      // this generation was independently reviewed at all. Before this, a
      // generation that received no review looked exactly like one that was
      // reviewed and came back clean, and the only reason gen-099's user learned
      // otherwise is that its builder typed the fact in by hand.
      const evaluatorHistorySection: string[] = [];
      if (evaluatorEnabled && (s.evaluatorRuns ?? []).length > 0) {
        evaluatorHistorySection.push("");
        evaluatorHistorySection.push("### Independent Review — what actually happened");
        evaluatorHistorySection.push("");
        for (const r of s.evaluatorRuns!) evaluatorHistorySection.push(formatEvaluatorRun(r));
        if (hasUnreviewedStage(s)) {
          evaluatorHistorySection.push("");
          evaluatorHistorySection.push("**This generation went without an independent review at one or more stages.**");
          evaluatorHistorySection.push("Its adversarial review was the builder's own. Tell the user this in your fitness");
          evaluatorHistorySection.push("summary — it changes how much a clean validation is worth, and REAP's own longterm");
          evaluatorHistorySection.push("memory records three generations where every review round found its defects inside");
          evaluatorHistorySection.push("the previous round's repair.");
        }
      }

      const priorConcernsSection: string[] = [];
      if ((s.evaluatorConcerns ?? []).length > 0) {
        priorConcernsSection.push("");
        priorConcernsSection.push("### Prior Evaluator Concerns (carried from earlier stages)");
        priorConcernsSection.push("");
        for (const c of s.evaluatorConcerns!) {
          priorConcernsSection.push(`- [${c.severity}] (${c.stage}) ${c.summary}`);
        }
        priorConcernsSection.push("");
        priorConcernsSection.push("Surface each of the above to the user with your fitness summary.");
      }

      if (cruise && highConcerns.length > 0) {
        // Cruise mode + unresolved high-impact concern → auto-abort cruise.
        // Clear cruiseCount in config so the next-generation auto-start path is
        // disengaged, then route the builder back to supervised fitness.
        await clearCruise(paths.config);

        const fallbackPrompt: string[] = [
          "## Cruise Aborted by Evaluator Concern",
          "",
          "Cruise mode has been **disengaged** because the evaluator raised a high-impact concern:",
          "",
        ];
        for (const c of highConcerns) {
          fallbackPrompt.push(`- [${c.severity}] (${c.stage}) ${c.summary}`);
        }
        fallbackPrompt.push("");
        fallbackPrompt.push("The remaining cruise generations will NOT auto-start. This fitness phase now follows the supervised flow:");
        fallbackPrompt.push("");
        fallbackPrompt.push("1. Present the concern(s) above to the human together with a summary of this generation.");
        fallbackPrompt.push("2. Wait for the human's decision (continue, override, abort generation, etc.).");
        fallbackPrompt.push("3. Submit: `reap run completion --phase fitness --feedback \"<human feedback>\"`");
        fallbackPrompt.push("");
        fallbackPrompt.push("Cruise can be resumed manually with `reap cruise <N>` once the concern is resolved.");
        fallbackPrompt.push(...evaluatorHistorySection);
        fallbackPrompt.push(...evaluatorSection);

        emitOutput({
          status: "prompt",
          command: "completion",
          phase: "fitness",
          completed: ["gate", "reflect", "cruise-aborted"],
          context: {
            id: s.id,
            goal: s.goal,
            cruiseMode: false,
            cruiseAborted: true,
            previousCruiseCount: config!.cruiseCount,
            evaluatorConcerns: s.evaluatorConcerns,
            evaluatorRuns: s.evaluatorRuns ?? [],
            evaluator: evaluatorEnabled
              ? { enabled: true, prompt: fitnessEvaluatorPrompt }
              : { enabled: false },
          },
          prompt: fallbackPrompt.join("\n"),
          nextCommand: "reap run completion --phase fitness",
        });
      }

      if (cruise) {
        // Cruise mode — self-assessment prompt
        const cruisePrompt: string[] = [
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
        ];
        cruisePrompt.push(...priorConcernsSection);
        cruisePrompt.push(...evaluatorHistorySection);
        cruisePrompt.push(...evaluatorSection);

        emitOutput({
          status: "prompt",
          command: "completion",
          phase: "fitness",
          completed: ["gate", "reflect"],
          context: {
            id: s.id,
            goal: s.goal,
            cruiseMode: true,
            cruiseCount: config!.cruiseCount,
            evaluatorConcerns: s.evaluatorConcerns ?? [],
            evaluatorRuns: s.evaluatorRuns ?? [],
            evaluator: evaluatorEnabled
              ? { enabled: true, prompt: fitnessEvaluatorPrompt }
              : { enabled: false },
          },
          prompt: cruisePrompt.join("\n"),
          nextCommand: "reap run completion --phase fitness",
        });
      } else {
        // Supervised mode — human feedback
        const supervisedPrompt: string[] = [
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
        ];
        supervisedPrompt.push(...priorConcernsSection);
        supervisedPrompt.push(...evaluatorHistorySection);
        supervisedPrompt.push(...evaluatorSection);

        emitOutput({
          status: "prompt",
          command: "completion",
          phase: "fitness",
          completed: ["gate", "reflect"],
          context: {
            id: s.id,
            goal: s.goal,
            cruiseMode: false,
            evaluatorConcerns: s.evaluatorConcerns ?? [],
            evaluatorRuns: s.evaluatorRuns ?? [],
            evaluator: evaluatorEnabled
              ? { enabled: true, prompt: fitnessEvaluatorPrompt }
              : { enabled: false },
          },
          prompt: supervisedPrompt.join("\n"),
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

    // gen-100: fitness is over by the time adapt runs, so this is the last
    // point at which "no fitness verdict arrived" is still a fact about a stage
    // that has happened. Recorded, never enforced — adapt proceeds identically.
    const fitnessSilence = recordEvaluatorSilenceIfUnreported(s, "fitness", config?.evaluator === true);

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

      const milestones = await listMilestones(paths.visionMilestones);
      const gapAnalysis = buildVisionGapAnalysis(parsedGoals, pendingItems, s.goal, genResult, milestones);
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
    if ((s.evaluatorRuns ?? []).length > 0) {
      promptSections.push("");
      promptSections.push("### Independent Review — what actually happened");
      promptSections.push("");
      for (const r of s.evaluatorRuns!) promptSections.push(formatEvaluatorRun(r));
      if (hasUnreviewedStage(s)) {
        promptSections.push("");
        promptSections.push("**Record in the completion artifact that this generation went without an independent");
        promptSections.push("review at one or more stages**, and say what its adversarial review consisted of");
        promptSections.push("instead. Lineage is where a later generation reads how much this one was checked.");
      }
    }

    promptSections.push("");
    promptSections.push("When done: reap run completion --phase commit");

    emitOutput({
      status: "prompt",
      command: "completion",
      phase: "adapt",
      completed: ["gate", "reflect", "fitness", ...(fitnessSilence ? ["evaluator-silence-recorded"] : [])],
      context: {
        id: s.id,
        goal: s.goal,
        type: s.type,
        maturity,
        generationCount,
        fitnessFeedback,
        evaluatorRuns: s.evaluatorRuns ?? [],
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

    // The generation's commit just landed, which is the one moment a
    // commit-keyed index goes stale (gen-089). Best-effort — see
    // `refreshIndexAfterCommit`.
    const { refreshIndexAfterCommit } = await import("../../../indexer/index.js");
    await refreshIndexAfterCommit(paths.root);

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
