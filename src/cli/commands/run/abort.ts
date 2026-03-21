import { join } from "path";
import { readdir, unlink } from "fs/promises";
import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { readTextFile, writeTextFile, fileExists } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state || !state.id) {
    emitError("abort", "No active Generation to abort.");
  }

  if (!phase || phase === "confirm") {
    // Phase 1: Gate passed — present state, ask AI to confirm with user
    emitOutput({
      status: "prompt",
      command: "abort",
      phase: "confirm",
      completed: ["gate"],
      context: {
        id: state.id,
        goal: state.goal,
        stage: state.stage,
      },
      prompt: [
        `Active generation: ${state.id} (goal: ${state.goal}, stage: ${state.stage}).`,
        "Ask the human: '이 generation을 abort 하시겠습니까?'",
        "If no: STOP.",
        "If yes: ask for abort reason. Then ask about source code handling:",
        "  - Check `git diff --name-only` for uncommitted changes.",
        "  - If changes: offer rollback / stash / hold.",
        "  - If no changes: skip.",
        "Ask: 'Goal과 진행 상황을 backlog에 저장할까요? (yes/no)'",
        "Set env vars: REAP_ABORT_REASON, REAP_ABORT_SOURCE_ACTION (rollback|stash|hold|none), REAP_ABORT_SAVE_BACKLOG (yes|no).",
        "Then run: reap run abort --phase execute",
      ].join("\n"),
      nextCommand: "reap run abort --phase execute",
    });
  }

  if (phase === "execute") {
    const reason = process.env.REAP_ABORT_REASON ?? "No reason provided";
    const sourceAction = process.env.REAP_ABORT_SOURCE_ACTION ?? "none";
    const saveBacklog = process.env.REAP_ABORT_SAVE_BACKLOG === "yes";

    // Save to backlog if requested
    let backlogSaved = false;
    if (saveBacklog) {
      const objectiveContent = await readTextFile(paths.artifact("01-objective.md"));
      const implContent = await readTextFile(paths.artifact("03-implementation.md"));

      const goalText = objectiveContent?.match(/^#\s+(.+)/m)?.[1] ?? state.goal;
      const implSummary = implContent ? implContent.slice(0, 500) : "";

      const backlogContent = [
        "---",
        "type: task",
        "status: pending",
        "aborted: true",
        `abortedFrom: ${state.id}`,
        `abortReason: "${reason}"`,
        `stage: ${state.stage}`,
        `sourceAction: ${sourceAction}`,
        sourceAction === "stash" ? `stashRef: "reap-abort: ${state.id}"` : null,
        "---",
        "",
        `# [Aborted] ${goalText}`,
        "",
        "## Original Goal",
        state.goal,
        "",
        "## Progress",
        `${state.stage} 단계에서 중단.`,
        implSummary ? implSummary : "",
        "",
        "## Resume Guide",
        sourceAction === "stash" ? "git stash pop으로 코드 복구" :
          sourceAction === "hold" ? "코드 변경이 working tree에 유지됨" :
            sourceAction === "rollback" ? "코드 변경이 revert됨. objective부터 재시작 필요" :
              "소스 코드 변경 없음",
      ].filter(line => line !== null).join("\n");

      await writeTextFile(join(paths.backlog, `aborted-${state.id}.md`), backlogContent);
      backlogSaved = true;
    }

    // Delete artifact files from life/
    try {
      const lifeEntries = await readdir(paths.life);
      for (const entry of lifeEntries) {
        if (/^\d{2}-[a-z]+(?:-[a-z]+)*\.md$/.test(entry)) {
          await unlink(join(paths.life, entry));
        }
      }
    } catch { /* no artifacts */ }

    // Clear current.yml
    await writeTextFile(paths.currentYml, "");

    emitOutput({
      status: "ok",
      command: "abort",
      phase: "done",
      completed: ["gate", "confirm", "source-handling", "backlog-save", "cleanup"],
      context: {
        id: state.id,
        reason,
        sourceAction,
        backlogSaved,
      },
      message: `Generation ${state.id} aborted. ${backlogSaved ? "Backlog saved." : "Backlog not saved."}`,
    });
  }
}
