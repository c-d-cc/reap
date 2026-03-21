import type { ReapPaths } from "../../../core/paths";
import { GenerationManager } from "../../../core/generation";
import { readTextFile } from "../../../core/fs";
import { emitOutput, emitError } from "../../../core/run-output";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!phase || phase === "start") {
    // Phase 1: Gate — active generation 확인 또는 start 안내

    // Read config
    const configContent = await readTextFile(paths.config);

    if (!state || !state.id) {
      // No active generation — instruct AI to run /reap.start first
      emitOutput({
        status: "prompt",
        command: "evolve",
        phase: "start",
        completed: ["gate"],
        context: {
          hasActiveGeneration: false,
        },
        prompt: [
          "## Evolve — Full Lifecycle Execution",
          "",
          "No active Generation exists. Run `/reap.start` first to create one.",
          "After start completes, resume evolve with: reap run evolve --phase run",
        ].join("\n"),
        nextCommand: "reap run evolve --phase run",
      });
    } else {
      // Active generation exists — proceed to run phase
      emitOutput({
        status: "prompt",
        command: "evolve",
        phase: "run",
        completed: ["gate"],
        context: {
          hasActiveGeneration: true,
          id: state.id,
          goal: state.goal,
          stage: state.stage,
        },
        prompt: [
          "## Evolve — Full Lifecycle Execution",
          "",
          `Generation ${state.id} is active (stage: ${state.stage}).`,
          "Resume from the current stage following the Lifecycle Loop below.",
          "",
          "### HARD-GATE",
          "NEVER modify `current.yml` directly to change the stage.",
          "ALWAYS use `/reap.next` to advance and `/reap.back` to regress.",
          "",
          "### Autonomous Override",
          "- Skip routine human confirmations. Proceed autonomously.",
          "- Skip environment/genome interactive setup questions. Use existing data.",
          "- STOP only when genuinely blocked: ambiguous goal, uncertain technical decision, genome conflicts, or unexpected errors.",
          "- Escalation sections in each stage still apply.",
          "",
          "### Hook Auto-Execution",
          "Each stage command automatically executes its own hook at completion:",
          "- `/reap.objective` -> `onLifeObjected`",
          "- `/reap.planning` -> `onLifePlanned`",
          "- `/reap.implementation` -> `onLifeImplemented`",
          "- `/reap.validation` -> `onLifeValidated`",
          "- `/reap.completion` -> `onLifeCompleted` (before archiving and commit)",
          "",
          "`/reap.next` only handles stage transitions -- it does NOT execute hooks or archiving.",
          "`/reap.completion` handles archiving and the final commit.",
          "",
          "### Lifecycle Loop",
          "Execute the following loop until the generation is complete:",
          "1. Read `current.yml` to determine the current stage",
          "2. Execute the corresponding stage command:",
          "   - `objective` -> `/reap.objective`",
          "   - `planning` -> `/reap.planning`",
          "   - `implementation` -> `/reap.implementation`",
          "   - `validation` -> `/reap.validation`",
          "   - `completion` -> `/reap.completion`",
          "3. When the stage command completes (hooks already executed by the stage command):",
          "   - If the current stage is `completion`: the loop ends.",
          "   - Otherwise: run `/reap.next` to advance, then return to step 1.",
          "",
          "### Handling Issues",
          "- If validation fails: `/reap.back` to return to implementation (or earlier), then resume the loop",
          "- If the human wants to pause: stop the loop",
          "- If the human wants to skip a stage: advance with `/reap.next` without running the stage command",
        ].join("\n"),
      });
    }
  }
}
