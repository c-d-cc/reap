import { basename, join } from "path";
import YAML from "yaml";
import { createPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { fileExists, readTextFile } from "../../../core/fs.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { executeHooks } from "../../../core/hooks.js";
import { scanBacklog, consumeBacklog } from "../../../core/backlog.js";
import { getLastLineageEntry } from "../../../core/lineage.js";
import { listMilestones, candidateMilestones, mainMilestone, findMilestone, uncheckedGenerations } from "../../../core/milestone.js";
import type { ReapConfig } from "../../../types/index.js";

export async function execute(phase?: string, goal?: string, type?: string, parents?: string, backlog?: string | boolean, milestone?: string): Promise<void> {
  const paths = createPaths(process.cwd());

  if (!(await fileExists(paths.config))) {
    emitError("start", "Not a reap project. Run 'reap init' first.");
  }

  const gm = new GenerationManager(paths);

  // Normalize backlog tri-state (libs/cli.ts negate option semantics):
  //   undefined / true  → flag not explicitly given (treated as missing)
  //   false             → --no-backlog explicitly given (suppress prompt)
  //   string            → --backlog <filename> given
  const backlogFilename = typeof backlog === "string" ? backlog : undefined;
  const noBacklogFlag = backlog === false;

  // Backward compatibility: if goal is provided without phase, treat as "create"
  const effectivePhase = (!phase && goal) ? "create" : phase;

  if (!effectivePhase || effectivePhase === "scan") {
    // Phase 1: Gate check + backlog scan
    const existing = await gm.current();
    if (existing) {
      emitError("start", `Generation ${existing.id} is already active at stage '${existing.stage}'. Abort or complete it first.`);
    }

    // Scan backlog for pending items
    const backlogItems = await scanBacklog(paths.backlog);
    const pendingBacklog = backlogItems.filter(b => b.status === "pending");

    // Detect previous early-close to surface a hint
    const lastEntry = await getLastLineageEntry(paths);
    const previousEarlyClose = lastEntry?.status === "partial"
      ? {
          id: lastEntry.id,
          closedAtStage: lastEntry.closeMeta?.closedAtStage,
          reason: lastEntry.closeMeta?.reason,
          deferredBacklogFile: lastEntry.closeMeta?.deferredBacklogFile,
          deferredTasks: lastEntry.closeMeta?.deferredTasks,
        }
      : null;

    const promptParts: string[] = [];
    if (previousEarlyClose) {
      promptParts.push(
        `## Previous generation was early-closed (${previousEarlyClose.id}, stage: ${previousEarlyClose.closedAtStage ?? "unknown"})`,
        previousEarlyClose.reason ? `Close reason: ${previousEarlyClose.reason}` : "",
        previousEarlyClose.deferredBacklogFile
          ? `Deferred backlog file: \`${previousEarlyClose.deferredBacklogFile}\` (${previousEarlyClose.deferredTasks ?? 0} task(s))`
          : "Deferred backlog: 없음 (defer-tasks=false 또는 미완 task 없음).",
        "이전 generation의 미완 작업을 이어가려면 위 deferred backlog를 source backlog로 선택하세요.",
        "",
      );
    }

    // Goal candidates from the milestones. Every valid open milestone offers
    // them, main first — pulling an item forward from a later plan is ordinary.
    const allMilestones = await listMilestones(paths.visionMilestones);
    const candidates = candidateMilestones(allMilestones);
    const milestoneCandidates: Array<{ milestone: string; title: string; main: boolean; text: string }> = [];
    for (const m of candidates) {
      for (const g of uncheckedGenerations(m)) {
        milestoneCandidates.push({ milestone: m.slug, title: m.title, main: m.main, text: g.text });
      }
    }

    if (milestoneCandidates.length > 0) {
      promptParts.push(`## Milestone goal candidates (${milestoneCandidates.length})`, "");
      for (const m of candidates) {
        const left = uncheckedGenerations(m);
        if (left.length === 0) continue;
        promptParts.push(`**${m.title}** (\`${m.slug}\`)${m.main ? " — main" : ""}`);
        for (const g of left) promptParts.push(`- ${g.text}`);
        promptParts.push("");
      }
      promptParts.push(
        "Present these to the human alongside any backlog items below.",
        'Chosen from a milestone → `reap run start --phase create --goal "<goal>" --milestone <slug>`',
        "`--milestone` may be omitted only when the main milestone is the right owner; it is then used automatically.",
        "An item from a non-main milestone is a legitimate choice — say so rather than steering to main.",
        "",
      );
    }

    if (pendingBacklog.length > 0) {
      promptParts.push(
        `Pending backlog items (${pendingBacklog.length}):`,
        ...pendingBacklog.map((b) => `- [${b.type}] ${b.title} (\`${b.filename}\`)`),
        "",
        "Present these to the human. Ask: select one as the goal or enter a new goal.",
        "If a backlog item is selected, include --backlog <filename> in the start command.",
        'Then run: reap run start --phase create --goal "<goal>" [--backlog <filename>]',
      );
    } else if (milestoneCandidates.length === 0) {
      promptParts.push('Ask the human for the goal of this generation. Then run: reap run start --phase create --goal "<goal>"');
    }

    emitOutput({
      status: "prompt",
      command: "start",
      phase: "collect-goal",
      completed: ["gate", "backlog-scan"],
      context: {
        backlogItems: pendingBacklog.map(b => ({ type: b.type, title: b.title, filename: b.filename })),
        milestoneCandidates,
        mainMilestone: mainMilestone(allMilestones)?.slug ?? null,
        previousEarlyClose,
      },
      prompt: promptParts.filter(Boolean).join("\n"),
      nextCommand: "reap run start --phase create",
    });
  }

  if (effectivePhase === "create") {
    if (!goal) {
      emitError("start", 'Goal is required. Usage: reap run start --phase create --goal "<goal>" [--backlog <filename> | --no-backlog]');
    }

    const existing = await gm.current();
    if (existing) {
      emitError("start", `Generation ${existing.id} is already active at stage '${existing.stage}'. Abort or complete it first.`);
    }

    // Issue #18 fix — guard against silent backlog skip.
    // If neither --backlog nor --no-backlog is given AND pending backlog exists,
    // emit a prompt and ask AI/human to decide. Idempotent: re-call with one of
    // the two flags advances. Skipped for merge (parents-driven).
    if (type !== "merge" && !backlogFilename && !noBacklogFlag) {
      const allItems = await scanBacklog(paths.backlog);
      const pendingItems = allItems.filter((b) => b.status === "pending");
      if (pendingItems.length > 0) {
        const promptLines: string[] = [
          `Goal: "${goal}"`,
          "",
          `Pending backlog items (${pendingItems.length}):`,
          ...pendingItems.map((b) => `- [${b.type}] ${b.title} (\`${b.filename}\`)`),
          "",
          "본 goal과 관련된 backlog가 있는지 검토하세요.",
          "- 관련된 backlog 있음 → `--backlog <filename>` 추가하여 재호출",
          "- 관련된 backlog 없음 → `--no-backlog` 추가하여 재호출",
          "",
          "두 flag 중 하나가 명시되어야 generation이 생성됩니다. (Issue #18 fix)",
        ];
        emitOutput({
          status: "prompt",
          command: "start",
          phase: "select-backlog",
          completed: ["gate"],
          context: {
            goal,
            pendingBacklog: pendingItems.map((b) => ({ type: b.type, title: b.title, filename: b.filename })),
          },
          prompt: promptLines.join("\n"),
          nextCommand: `reap run start --phase create --goal "${goal}" --backlog <filename>`,
        });
      }
    }

    if (type === "merge") {
      if (!parents) {
        emitError("start", "Merge requires --parents. Usage: reap run start --phase create --type merge --parents \"id1,id2\" --goal \"<goal>\"");
      }
      const parentIds = parents!.split(",").map((p) => p.trim());
      if (parentIds.length < 2) {
        emitError("start", "Merge requires at least 2 parent IDs.");
      }

      const state = await gm.createMerge(goal!, parentIds);
      await executeHooks(paths.hooks, "onMergeStarted", paths.root).catch(() => {});

      emitOutput({
        status: "ok",
        command: "start",
        completed: ["gate", "create-merge-generation"],
        context: {
          generationId: state.id,
          goal: state.goal,
          type: state.type,
          parents: state.parents,
        },
        message: `Merge generation ${state.id} created. Run: reap run detect`,
        nextCommand: "reap run detect",
      });
    }

    // Which plan does this generation serve? `--milestone` names it; otherwise
    // the main milestone owns it. An unknown slug is refused rather than
    // silently recorded — a wrong milestoneId misreports progress for good.
    const allMilestones = await listMilestones(paths.visionMilestones);
    let milestoneId: string | undefined;
    if (milestone) {
      const target = findMilestone(allMilestones, milestone);
      if (!target) {
        emitError("start", `No milestone '${milestone}'. Run 'reap milestone list' to see what exists.`);
      }
      if (target!.status === "completed") {
        emitError("start", `Milestone '${milestone}' is completed — a finished plan cannot take new generations.`);
      }
      milestoneId = target!.slug;
    } else {
      milestoneId = mainMilestone(allMilestones)?.slug;
    }

    const genType = (type === "normal" ? "normal" : "embryo") as import("../../../types/index.js").GenerationType;
    const state = await gm.create(goal!, genType);

    if (milestoneId) {
      state.milestoneId = milestoneId;
      await gm.save(state);
    }

    // Mark backlog as consumed (after ID generation)
    let consumeWarning: string | undefined;
    if (backlogFilename) {
      const backlogPath = join(paths.backlog, backlogFilename);
      if (await fileExists(backlogPath)) {
        const result = await consumeBacklog(backlogPath, state.id);
        if (result.status === "warning" && result.warning) {
          consumeWarning = result.warning;
        }
        state.sourceBacklog = backlogFilename;
        await gm.save(state);
      } else {
        consumeWarning = `backlog file not found: ${backlogPath}`;
      }
    }

    // Run onLifeStarted hooks
    await executeHooks(paths.hooks, "onLifeStarted", paths.root).catch(() => {});

    // No indexing here. The index is keyed by commit (gen-089), and creating a
    // generation does not make one — the trigger that matters is the commit at
    // the end of completion, and any query in between refreshes itself.

    const messageLines = [`Generation ${state.id} created. Run: reap run learning`];
    if (consumeWarning) {
      messageLines.unshift(`[backlog warning] ${consumeWarning}`);
    }

    emitOutput({
      status: "ok",
      command: "start",
      completed: backlogFilename
        ? ["gate", "create-generation", "backlog-consumed"]
        : ["gate", "create-generation"],
      context: {
        generationId: state.id,
        goal: state.goal,
        type: state.type,
        parents: state.parents,
        sourceBacklog: state.sourceBacklog,
        milestoneId: state.milestoneId ?? null,
        ...(consumeWarning ? { backlogWarning: consumeWarning } : {}),
      },
      message: messageLines.join("\n"),
      nextCommand: "reap run learning",
    });
  }

  emitError("start", `Unknown phase '${phase}'. Use 'scan' or 'create'.`);
}
