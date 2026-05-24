import { join } from "path";
import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { readTextFile } from "../../../core/fs.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { archiveEarlyClose } from "../../../core/archive.js";
import {
  createDeferredBacklog,
  extractUncheckedTasks,
  countCheckedTasks,
} from "../../../core/backlog.js";
import { gitCommitAll, checkSubmoduleDirty, pushSubmodules } from "../../../core/git.js";
import { executeHooks } from "../../../core/hooks.js";

interface EarlyCloseExtra {
  reason?: string;
  sourceAction?: string;
  deferTasks?: string; // "true" | "false" (CLI string flag)
}

function parseExtra(extra?: string): EarlyCloseExtra {
  if (!extra) return {};
  try {
    return JSON.parse(extra) as EarlyCloseExtra;
  } catch {
    return {};
  }
}

const ALLOWED_STAGES = new Set(["implementation", "validation"]);
const ALLOWED_SOURCE_ACTIONS = new Set(["hold", "stash", "none"]);

export async function execute(paths: ReapPaths, phase?: string, extra?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("early-close", "No active generation to early-close.");

  const s = state!;

  if (!ALLOWED_STAGES.has(s.stage)) {
    emitError(
      "early-close",
      `early-close는 'implementation' 또는 'validation' 단계에서만 호출 가능합니다. 현재 단계: '${s.stage}'. learning/planning 단계라면 'reap run abort'를 사용하세요.`,
    );
  }

  if (s.type === "merge") {
    emitError(
      "early-close",
      "merge generation에서는 아직 early-close가 지원되지 않습니다. 'reap run abort'를 사용하거나 reconcile 후 정식 completion을 진행하세요.",
    );
  }

  // ── Phase 1: confirm (default) ────────────────────────────
  if (!phase || phase === "confirm") {
    emitOutput({
      status: "prompt",
      command: "early-close",
      phase: "confirm",
      context: { id: s.id, goal: s.goal, stage: s.stage },
      prompt: [
        `Active generation: ${s.id} (goal: ${s.goal}, stage: ${s.stage}).`,
        "",
        "## Early-close — 부분 완료 종료",
        "지금까지 한 작업을 lineage에 보존하고 미완 task는 다음 세대의 backlog로 승계합니다.",
        "fitness/adapt phase는 건너뜁니다.",
        "",
        "### 사용자에게 확인:",
        "1. 정말 early-close할지 (vs continue completion/abort)?",
        "2. early-close 사유 (필수, --reason)",
        "3. source 변경 처리 (--source-action, 기본 hold):",
        "   - hold: 소스 변경 유지 (추천 — early-close의 핵심)",
        "   - stash: git stash로 보관",
        "   - none: 변경 없이 진행",
        "4. 미완 task 자동 승계 여부 (--defer-tasks, 기본 true)",
        "",
        "### Reflect — interactive 질문 (사용자 답을 받아 03-implementation.md 또는 별도 메모에 정리):",
        "- 어디까지 진행됐는가? (completed tasks)",
        "- 무엇이 가치 있었는가? (value preserved)",
        "- 무엇이 남았는가? (deferred — backlog 본문 보강)",
        "- 왜 닫는가? (close reason)",
        "",
        "### 그런 다음 실행:",
        "  reap run early-close --phase execute --reason '<reason>' [--source-action hold|stash|none] [--defer-tasks true|false]",
      ].join("\n"),
      nextCommand: "reap run early-close --phase execute --reason '<reason>'",
    });
  }

  // ── Phase 2: execute ──────────────────────────────────────
  if (phase === "execute") {
    const opts = parseExtra(extra);
    const reason = opts.reason ?? "no reason provided";
    const sourceAction = (opts.sourceAction ?? "hold").toLowerCase();
    const deferTasks = (opts.deferTasks ?? "true").toLowerCase() !== "false";

    if (!ALLOWED_SOURCE_ACTIONS.has(sourceAction)) {
      emitError(
        "early-close",
        `Invalid --source-action '${sourceAction}'. Allowed: hold | stash | none. (rollback은 early-close에서 의미상 부적합합니다 — abort를 사용하세요.)`,
      );
    }

    // Apply source action (stash). hold/none → no-op.
    if (sourceAction === "stash") {
      try {
        const { execSync } = await import("child_process");
        execSync(`git stash push -u -m "early-close ${s.id}"`, {
          cwd: paths.root,
          stdio: ["pipe", "pipe", "pipe"],
        });
      } catch {
        // best-effort: continue even if stash fails (e.g. no changes)
      }
    }

    // Extract task counts from implementation artifact.
    const implArtifactPath = paths.artifact("03-implementation.md");
    const implContent = (await readTextFile(implArtifactPath)) ?? "";
    const uncheckedTasks = extractUncheckedTasks(implContent);
    const completedTasks = countCheckedTasks(implContent);
    const deferredTaskCount = uncheckedTasks.length;

    // Create deferred backlog file if requested.
    let deferredBacklogFile: string | undefined;
    if (deferTasks) {
      deferredBacklogFile = await createDeferredBacklog(paths.backlog, {
        fromGenId: s.id,
        closedAtStage: s.stage,
        goal: s.goal,
        closeReason: reason,
        taskList: uncheckedTasks,
      });
    }

    // Check submodule dirty state BEFORE archive (same guard as completion).
    const dirtySubmodules = checkSubmoduleDirty(paths.root).filter((sm) => sm.dirty);
    if (dirtySubmodules.length > 0) {
      const names = dirtySubmodules.map((sm) => sm.name).join(", ");
      emitError(
        "early-close",
        `Submodule(s) have uncommitted changes: ${names}. Commit inside the submodule(s) first, then retry.`,
      );
    }

    pushSubmodules(paths.root);

    const archiveDir = await archiveEarlyClose(paths, s, {
      reason,
      closedAtStage: s.stage,
      completedTasks,
      deferredTasks: deferredTaskCount,
      deferredBacklogFile,
      sourceAction,
    });

    const goalSummary = s.goal.length > 60 ? s.goal.slice(0, 57) + "..." : s.goal;
    const commitMsg = `feat(${s.id.replace(/-[a-f0-9]+$/, "")}) [early-close]: ${goalSummary}`;
    const commitHash = gitCommitAll(paths.root, commitMsg);

    // Run completion hooks (same event — downstream consumers care about
    // generation finalisation regardless of completed/partial status).
    await executeHooks(paths.hooks, "onLifeCompleted", paths.root).catch(() => {});

    // Trigger daemon indexing.
    try {
      const { triggerIndexing } = await import("../daemon/lifecycle.js");
      await triggerIndexing(paths.root);
    } catch {
      // best-effort
    }

    emitOutput({
      status: "ok",
      command: "early-close",
      phase: "execute",
      completed: [
        "confirm",
        "extract-tasks",
        ...(deferTasks ? ["deferred-backlog"] : []),
        "archive",
        ...(commitHash ? ["git-commit"] : []),
      ],
      context: {
        closedGeneration: s.id,
        closedAtStage: s.stage,
        reason,
        sourceAction,
        completedTasks,
        deferredTasks: deferredTaskCount,
        deferredBacklogFile,
        archiveDir,
        commitHash: commitHash ?? undefined,
      },
      message: [
        `Generation ${s.id} early-closed at stage '${s.stage}' (reason: ${reason}).`,
        `Archived: ${archiveDir}`,
        deferredBacklogFile
          ? `Deferred backlog: ${join(paths.backlog, deferredBacklogFile)} (${deferredTaskCount} task(s))`
          : `Defer skipped — ${deferredTaskCount} unchecked task(s) found but not carried over.`,
        commitHash ? `Commit: ${commitHash}` : "Commit your changes manually.",
      ].join(" "),
    });
  }

  emitError("early-close", `Unknown phase '${phase}'. Use 'confirm' or 'execute'.`);
}
