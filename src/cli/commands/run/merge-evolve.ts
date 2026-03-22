import type { ReapPaths } from "../../../core/paths";
import { MergeGenerationManager } from "../../../core/merge-generation";
import { emitOutput, emitError } from "../../../core/run-output";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const mgm = new MergeGenerationManager(paths);
  const state = await mgm.current();

  if (!state) {
    emitError("merge-evolve", "No active Generation. Run /reap.merge.start or /reap.merge first.");
  }
  if (state.type !== "merge") {
    emitError("merge-evolve", `Generation type is '${state.type}', expected 'merge'. Use /reap.evolve for normal generations.`);
  }

  emitOutput({
    status: "prompt",
    command: "merge-evolve",
    phase: "run",
    completed: ["gate"],
    context: {
      id: state.id,
      goal: state.goal,
      stage: state.stage,
      type: state.type,
      parents: state.parents,
    },
    prompt: [
      "## Merge Evolve -- Full Merge Lifecycle Execution",
      "",
      `Generation ${state.id} is active (stage: ${state.stage}).`,
      "Resume from the current stage following the Merge Lifecycle Loop below.",
      "",
      "### HARD-GATE",
      "NEVER modify `current.yml` directly to change the stage.",
      "ALWAYS use `/reap.next` to advance and `/reap.back` to regress.",
      "",
      "### Autonomous Override",
      "- Skip routine human confirmations. Proceed autonomously.",
      "- STOP only when genuinely blocked: ambiguous conflicts, uncertain resolution, or unexpected errors.",
      "- **Exception**: `/reap.merge.sync` inconsistencies always require user confirmation even in autonomous mode.",
      "",
      "### Hook Auto-Execution",
      "Each merge stage command automatically executes its own hook at completion:",
      "- `/reap.merge.detect` -> `onMergeDetected`",
      "- `/reap.merge.mate` -> `onMergeMated`",
      "- `/reap.merge.merge` -> `onMergeMerged`",
      "- `/reap.merge.sync` -> `onMergeSynced`",
      "- `/reap.merge.validation` -> `onMergeValidated`",
      "- `/reap.merge.completion` -> `onMergeCompleted` (before archiving and commit)",
      "",
      "`--phase complete` auto-transitions to the next stage. `/reap.next` is a fallback.",
      "`/reap.merge.completion` handles archiving and the final commit.",
      "",
      "### Merge Lifecycle Loop (Auto-Transition)",
      "Execute the following loop until the generation is complete:",
      "1. Read `current.yml` to determine the current stage",
      "2. Execute the corresponding merge stage command:",
      "   - `detect` -> `/reap.merge.detect`",
      "   - `mate` -> `/reap.merge.mate`",
      "   - `merge` -> `/reap.merge.merge`",
      "   - `sync` -> `/reap.merge.sync`",
      "   - `validation` -> `/reap.merge.validation`",
      "   - `completion` -> `/reap.merge.completion`",
      "3. `--phase complete` auto-transitions to the next stage.",
      "   - If the stage is `completion`: the loop ends.",
      "   - Otherwise: follow the `nextCommand` in the output to run the next stage.",
      "",
      "### Submodule Commit Rules",
      "- 커밋 전 반드시 `git -C tests status -s` 로 tests submodule의 dirty 상태를 확인하라.",
      "- dirty 파일이 있으면:",
      "  1. `git -C tests add -A && git -C tests commit -m \"...\" && git -C tests push`",
      "  2. parent repo에서 `git add tests` 로 submodule ref 업데이트",
      "  3. 그 다음 parent repo의 나머지 파일과 함께 커밋",
      "- completion의 prompt에 \"Dirty submodules detected\"가 있으면 반드시 위 절차를 따르라.",
      "",
      "### Handling Issues",
      "- If validation fails: `/reap.back merge` or `/reap.back mate`, then resume the loop",
      "- If sync finds inconsistencies: present to human, fix, then re-run sync",
    ].join("\n"),
  });
}
