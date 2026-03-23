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
  backlogFilenames: string[] = [],
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
  lines.push("- Each `--phase complete` auto-transitions to the next stage. No explicit `/reap.next` needed.");
  lines.push("- Use `/reap.back` to regress to a previous stage.");
  lines.push("- Each stage command verifies the stage chain token at entry (auto-verified from lastNonce).");
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

  // 4.5. Backlog 원본 참조 지시
  if (backlogFilenames.length > 0) {
    lines.push("## CRITICAL: Read the backlog file");
    lines.push("BEFORE starting objective, read the backlog file directly:");
    for (const fn of backlogFilenames) {
      lines.push(`\`.reap/life/backlog/${fn}\``);
    }
    lines.push("This file contains ALL implementation points. Do NOT skip any of them.");
    lines.push("");
  }

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
  lines.push("### Stage Loop (Auto-Transition)");
  lines.push("1. Read `current.yml` to confirm the current stage.");
  lines.push("2. Execute the stage command:");
  lines.push("   - `objective` -> `/reap.objective`");
  lines.push("   - `planning` -> `/reap.planning`");
  lines.push("   - `implementation` -> `/reap.implementation`");
  lines.push("   - `validation` -> `/reap.validation`");
  lines.push("   - `completion` -> `/reap.completion`");
  lines.push("3. Write the required artifact BEFORE completing the stage.");
  lines.push("4. Run `--phase complete` — this auto-transitions to the next stage.");
  lines.push("5. If current stage IS `completion`: `/reap.completion` auto-archives after feedKnowledge phase. Done.");
  lines.push("6. Otherwise: the output tells you the next command — go to step 1.");
  lines.push("");
  lines.push("Note: `--phase complete` auto-transitions. `/reap.next` is a fallback, not required.");
  lines.push("");

  // 6. Project path
  lines.push("## Project");
  lines.push(`- Path: ${paths.projectRoot}`);
  lines.push("");

  // 7. Commit rules
  lines.push("## Stage Chain Token (Auto-Transition)");
  lines.push("- Each `--phase complete` generates a stage chain token and auto-transitions to the next stage.");
  lines.push("- The next stage command verifies the token at entry — this ensures stages were not skipped.");
  lines.push("- `/reap.next` is maintained as a fallback but is no longer required in the normal flow.");
  lines.push("");

  lines.push("## Commit Rules");
  lines.push("- Create a git commit after implementation and after completion.");
  lines.push("- Use conventional commit format: `feat|fix|chore(scope): description`");
  lines.push("- Include the generation ID in the commit message.");
  lines.push("");

  // Backlog creation rules
  lines.push("## Backlog Creation Rules");
  lines.push("- backlog 생성 시 반드시 `reap make backlog --type <type> --title <title> --body <body>` 명령을 사용하라.");
  lines.push("- Write 도구로 backlog 파일을 직접 생성하지 마라 (frontmatter 형식 오류 방지).");
  lines.push("- 생성된 backlog 파일에 상세 내용을 추가해야 하면, 생성 후 해당 파일을 편집하라.");
  lines.push("");

  // Submodule commit rules
  lines.push("## Submodule Commit Rules");
  lines.push("- 커밋 전 반드시 `git -C tests status -s` 로 tests submodule의 dirty 상태를 확인하라.");
  lines.push("- dirty 파일이 있으면:");
  lines.push("  1. `git -C tests add -A && git -C tests commit -m \"...\" && git -C tests push`");
  lines.push("  2. parent repo에서 `git add tests` 로 submodule ref 업데이트");
  lines.push("  3. 그 다음 parent repo의 나머지 파일과 함께 커밋");
  lines.push("- completion의 prompt에 \"Dirty submodules detected\"가 있으면 반드시 위 절차를 따르라.");
  lines.push("");

  // Hook prompt execution instructions
  lines.push("## Hook Prompt Execution");
  lines.push("- completion output의 `prompt` 필드에 '## Hook Prompts' 섹션이 포함되어 있으면, 해당 hook prompt를 반드시 순서대로 실행하라.");
  lines.push("- Hook prompt는 `.md` hook 파일의 내용으로, AI가 따라야 할 지시사항이다.");
  lines.push("- Hook prompt에 유저 확인이 필요한 경우(예: 프리뷰+컨펌), autonomous mode에서도 이를 존중하라.");
  lines.push("");

  // Artifact consistency & design pivot detection
  lines.push("## Artifact Consistency & Design Pivot Detection");
  lines.push("- Before proceeding to a new stage, verify that previous stage artifacts align with the current design direction.");
  lines.push("- If the prompt context contains design corrections that contradict existing artifacts:");
  lines.push("  1. Prioritize prompt instructions over the goal text.");
  lines.push("  2. Use `/reap.back` to regress to the stage with the inconsistent artifact and rewrite it.");
  lines.push("- Regression triggers (use `/reap.back` in these situations):");
  lines.push("  - Artifacts contradict the design direction given in the prompt");
  lines.push("  - Implementation approach differs from what objective/planning described");
  lines.push("  - Prompt provides explicit design changes but earlier artifacts still reflect the old design");
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

      const backlogFilenames = pendingItems.map(b => b.filename);
      const subagentPrompt = buildSubagentPrompt(paths, state, genomeSummaries, backlogSummary, backlogFilenames);

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
          "Stage transitions happen automatically via `--phase complete`. Use `/reap.back` to regress.",
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
          "`--phase complete` auto-transitions to the next stage. `/reap.next` is a fallback.",
          "`/reap.completion` handles archiving and the final commit.",
          "",
          "### Lifecycle Loop (Auto-Transition)",
          "Execute the following loop until the generation is complete:",
          "1. Read `current.yml` to determine the current stage",
          "2. Execute the corresponding stage command:",
          "   - `objective` -> `/reap.objective`",
          "   - `planning` -> `/reap.planning`",
          "   - `implementation` -> `/reap.implementation`",
          "   - `validation` -> `/reap.validation`",
          "   - `completion` -> `/reap.completion`",
          "3. `--phase complete` auto-transitions to the next stage.",
          "   - If the stage is `completion`: the loop ends.",
          "   - Otherwise: follow the `nextCommand` in the output to run the next stage.",
          "",
          "### Handling Issues",
          "- If validation fails: `/reap.back` to return to implementation (or earlier), then resume the loop",
          "- If artifacts contradict the design direction in the prompt: `/reap.back` to fix the inconsistent artifact",
          "- If implementation approach differs from what objective/planning described: `/reap.back` to objective or planning",
          "- If the prompt provides design corrections that differ from existing artifacts: prioritize prompt instructions, `/reap.back` to rewrite artifacts with the corrected design",
          "- If the human wants to pause: stop the loop",
        ].join("\n"),
      });
    }
  }
}
