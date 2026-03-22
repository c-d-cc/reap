import type { ReapPaths } from "../../../core/paths";
import type { GenerationState } from "../../../types";
import { GenerationManager } from "../../../core/generation";
import { ConfigManager } from "../../../core/config";
import { readTextFile } from "../../../core/fs";
import { scanBacklog } from "../../../core/backlog";
import { emitOutput, emitError } from "../../../core/run-output";

/**
 * Build the full prompt string that the parent agent passes to a subagent
 * via the Agent tool.
 */
function buildSubagentPrompt(
  paths: ReapPaths,
  state: GenerationState | null,
  genomeSummaries: { principles: string; conventions: string; constraints: string },
  backlogSummary: string,
): string {
  const lines: string[] = [];

  // 1. REAP lifecycle rules
  lines.push("# REAP Subagent Instructions");
  lines.push("");
  lines.push("## FIRST: Load REAP Context");
  lines.push("Before doing anything else, run `reap run refreshKnowledge` to load full REAP context (Genome, Environment, Generation state, Workflow Guide).");
  lines.push("Incorporate the returned context into your working knowledge before proceeding.");
  lines.push("");
  lines.push("## Rules");
  lines.push("- ALWAYS use `reap run <cmd>` commands to drive lifecycle. NEVER modify `current.yml` directly.");
  lines.push("- Use `/reap.next` to advance stages and `/reap.back` to regress.");
  lines.push("- Each stage command runs its own hook automatically at completion.");
  lines.push("- `/reap.completion` handles archiving and the final commit.");
  lines.push("");

  // 2. Current state
  lines.push("## Current State");
  if (state) {
    lines.push(`- Generation ID: ${state.id}`);
    lines.push(`- Goal: ${state.goal}`);
    lines.push(`- Stage: ${state.stage}`);
  } else {
    lines.push("- No active generation. Start one first.");
  }
  lines.push("");

  // 3. Genome summary (first 500 chars each)
  lines.push("## Genome Summary");
  lines.push("");
  lines.push("### Principles");
  lines.push(genomeSummaries.principles);
  lines.push("");
  lines.push("### Conventions");
  lines.push(genomeSummaries.conventions);
  lines.push("");
  lines.push("### Constraints");
  lines.push(genomeSummaries.constraints);
  lines.push("");

  // 4. Backlog
  lines.push("## Backlog");
  lines.push(backlogSummary || "(empty)");
  lines.push("");

  // 5. Lifecycle execution instructions
  lines.push("## Lifecycle Execution");
  lines.push("");
  if (!state || !state.id) {
    lines.push("1. Run `reap run start` to scan and create a new generation.");
    lines.push("2. Then follow the stage loop below.");
  } else {
    lines.push(`Resume from stage: **${state.stage}**`);
  }
  lines.push("");
  lines.push("### Stage Loop");
  lines.push("1. Read `current.yml` to confirm the current stage.");
  lines.push("2. Execute the stage command:");
  lines.push("   - `objective` -> `/reap.objective`");
  lines.push("   - `planning` -> `/reap.planning`");
  lines.push("   - `implementation` -> `/reap.implementation`");
  lines.push("   - `validation` -> `/reap.validation`");
  lines.push("   - `completion` -> `/reap.completion`");
  lines.push("3. Write the required artifact BEFORE completing the stage.");
  lines.push("4. Run the stage complete phase if applicable (e.g., `reap run <stage> --phase complete`).");
  lines.push("5. If current stage is NOT `completion`: run `/reap.next` to advance, then go to step 1.");
  lines.push("6. If current stage IS `completion`: `/reap.completion` auto-archives after feedKnowledge phase. Done.");
  lines.push("");
  lines.push("Note: `/reap.next` is a transition command, NOT a lifecycle stage.");
  lines.push("");

  // 6. Project path
  lines.push("## Project");
  lines.push(`- Path: ${paths.projectRoot}`);
  lines.push("");

  // 7. Commit rules
  lines.push("## Stage Chain Token");
  lines.push("- Each stage command returns a `stageToken` in its output context.");
  lines.push("- You MUST pass this token to `/reap.next --token <TOKEN>` (or set `REAP_STAGE_TOKEN` env var).");
  lines.push("- Without a valid token, stage transition will be REJECTED.");
  lines.push("- If token is missing or mismatched, re-run the current stage command to obtain a new token.");
  lines.push("");

  lines.push("## Commit Rules");
  lines.push("- Create a git commit after implementation and after completion.");
  lines.push("- Use conventional commit format: `feat|fix|chore(scope): description`");
  lines.push("- Include the generation ID in the commit message.");
  lines.push("");

  // Hook prompt execution instructions
  lines.push("## Hook Prompt Execution");
  lines.push("- completion output의 `prompt` 필드에 '## Hook Prompts' 섹션이 포함되어 있으면, 해당 hook prompt를 반드시 순서대로 실행하라.");
  lines.push("- Hook prompt는 `.md` hook 파일의 내용으로, AI가 따라야 할 지시사항이다.");
  lines.push("- Hook prompt에 유저 확인이 필요한 경우(예: 프리뷰+컨펌), autonomous mode에서도 이를 존중하라.");
  lines.push("");

  // Interrupt protection instructions
  lines.push("## Interrupt Protection");
  lines.push("- 사용자의 새 메시지가 중간에 들어와도, 명시적 kill/중단 요청(\"중단\", \"stop\", \"abort\")이 아닌 한 현재 작업을 끝까지 완료하라.");
  lines.push("- 작업을 shortcut으로 건너뛰거나 결과를 추정하지 마라. 모든 validation은 실제 실행 결과를 확인하라.");
  lines.push("- E2E 테스트 등 외부 실행이 포함된 작업은 반드시 실제 실행하고 결과를 확인하라.");

  return lines.join("\n");
}

/** Truncate text to maxLen characters */
function truncate(text: string | null, maxLen: number): string {
  if (!text) return "(not found)";
  return text.length <= maxLen ? text : text.slice(0, maxLen) + "...";
}

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!phase || phase === "start") {
    // Phase 1: Gate — active generation 확인 또는 start 안내

    // Read config to check autoSubagent
    let autoSubagent = true;
    try {
      const config = await ConfigManager.read(paths);
      autoSubagent = ConfigManager.resolveAutoSubagent(config.autoSubagent);
    } catch {
      // config read failed — use default
    }

    // autoSubagent=true → delegate phase
    if (autoSubagent) {
      // Read genome summaries
      const [principles, conventions, constraints] = await Promise.all([
        readTextFile(paths.principles),
        readTextFile(paths.conventions),
        readTextFile(paths.constraints),
      ]);
      const genomeSummaries = {
        principles: truncate(principles, 500),
        conventions: truncate(conventions, 500),
        constraints: truncate(constraints, 500),
      };

      // Read backlog
      const backlogItems = await scanBacklog(paths.backlog);
      const pendingItems = backlogItems.filter(b => b.status === "pending");
      const backlogSummary = pendingItems.length > 0
        ? pendingItems.map(b => `- [${b.type}] ${b.title}`).join("\n")
        : "(no pending items)";

      const subagentPrompt = buildSubagentPrompt(paths, state, genomeSummaries, backlogSummary);

      emitOutput({
        status: "prompt",
        command: "evolve",
        phase: "delegate",
        completed: ["gate", "config-check"],
        context: {
          autoSubagent: true,
          subagentPrompt,
          generationId: state?.id,
          goal: state?.goal,
        },
        prompt: [
          "## AutoSubagent Mode",
          "",
          "Launch a subagent using the Agent tool with:",
          "- description: generation goal (short)",
          "- prompt: the subagentPrompt from context",
          "- run_in_background: false (wait for result)",
          "",
          "After the subagent completes, report the result summary to the user.",
        ].join("\n"),
      });
    }

    // autoSubagent=false → existing behavior
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
