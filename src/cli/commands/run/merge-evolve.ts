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
      "`/reap.next` only handles stage transitions -- it does NOT execute hooks or archiving.",
      "`/reap.merge.completion` handles archiving and the final commit.",
      "",
      "### Merge Lifecycle Loop",
      "Execute the following loop until the generation is complete:",
      "1. Read `current.yml` to determine the current stage",
      "2. Execute the corresponding merge stage command:",
      "   - `detect` -> `/reap.merge.detect`",
      "   - `mate` -> `/reap.merge.mate`",
      "   - `merge` -> `/reap.merge.merge`",
      "   - `sync` -> `/reap.merge.sync`",
      "   - `validation` -> `/reap.merge.validation`",
      "   - `completion` -> `/reap.merge.completion`",
      "3. When a stage command completes (hooks already executed by the stage command):",
      "   - If the current stage is `completion`: the loop ends.",
      "   - Otherwise: run `/reap.next` to advance, then return to step 1.",
      "",
      "### Handling Issues",
      "- If validation fails: `/reap.back merge` or `/reap.back mate`, then resume the loop",
      "- If sync finds inconsistencies: present to human, fix, then re-run sync",
    ].join("\n"),
  });
}
