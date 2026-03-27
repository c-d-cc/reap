import YAML from "yaml";
import { readdir } from "fs/promises";
import type { ReapPaths } from "../../../core/paths.js";
import type { ReapConfig } from "../../../types/index.js";
import { GenerationManager } from "../../../core/generation.js";
import { readTextFile, fileExists } from "../../../core/fs.js";
import { emitOutput } from "../../../core/output.js";
import { loadReapKnowledge, buildBasePrompt } from "../../../core/prompt.js";
import { parseCruiseCount } from "../../../core/cruise.js";
import { parseGoals } from "../../../core/vision.js";
import { scanBacklog } from "../../../core/backlog.js";
import { calculateClarity } from "../../../core/clarity.js";
import type { ClarityInput } from "../../../core/clarity.js";

async function collectClarityInput(paths: ReapPaths, generationType: "embryo" | "normal" | "merge"): Promise<ClarityInput> {
  // Vision goals
  const goalsContent = await readTextFile(paths.visionGoals);
  const goals = goalsContent ? parseGoals(goalsContent) : [];
  const uncheckedGoals = goals.filter((g) => !g.checked).length;
  const totalGoals = goals.length;

  // Backlog
  const backlogItems = await scanBacklog(paths.backlog);
  const pendingItems = backlogItems.filter((b) => b.status === "pending");
  const pendingBacklog = pendingItems.length;
  const highPriorityBacklog = pendingItems.filter((b) => b.priority === "high").length;

  // Lineage count
  let lineageCount = 0;
  try {
    const entries = await readdir(paths.lineage);
    lineageCount = entries.filter((e) => e.endsWith(".md")).length;
  } catch {
    // lineage dir may not exist
  }

  // Memory existence
  const [hasShortterm, hasMidterm, hasLongterm] = await Promise.all([
    fileExists(paths.memoryShortterm),
    fileExists(paths.memoryMidterm),
    fileExists(paths.memoryLongterm),
  ]);
  const hasMemory = hasShortterm || hasMidterm || hasLongterm;

  return {
    uncheckedGoals,
    totalGoals,
    pendingBacklog,
    highPriorityBacklog,
    generationType,
    lineageCount,
    hasMemory,
  };
}

export async function execute(paths: ReapPaths, _phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  const configContent = await readTextFile(paths.config);
  const config = configContent ? (YAML.parse(configContent) as ReapConfig) : null;
  const autoSubagent = config?.autoSubagent ?? true;

  // Parse cruise mode status
  const cruise = config ? parseCruiseCount(config) : null;

  // Calculate clarity
  const generationType = state?.type ?? "normal";
  const clarityInput = await collectClarityInput(paths, generationType);
  const clarityResult = calculateClarity(clarityInput);

  const knowledge = await loadReapKnowledge(paths);
  const subagentPrompt = buildBasePrompt(knowledge, paths, state, config?.cruiseCount, clarityResult);

  if (autoSubagent) {
    const promptLines = [
      "## AutoSubagent Mode",
      "",
      "Launch a subagent using the Agent tool with:",
      '- subagent_type: "reap-evolve"',
      "- description: generation goal",
      "- prompt: the subagentPrompt from context",
      "",
      "After the subagent completes, report the result.",
    ];

    if (cruise) {
      promptLines.push("");
      promptLines.push("## Cruise Mode Active");
      promptLines.push("");
      promptLines.push(`Cruise: ${config!.cruiseCount} (${cruise.total - cruise.current} generations remaining after current)`);
      promptLines.push("");
      promptLines.push("The subagent prompt includes cruise loop instructions.");
      promptLines.push("The subagent will automatically continue to the next generation after completing the current one,");
      promptLines.push("until the cruise count is exhausted or a stop condition is met.");
    }

    emitOutput({
      status: "prompt",
      command: "evolve",
      phase: "delegate",
      completed: ["gate", "genome-load", "clarity-calc"],
      context: {
        autoSubagent: true,
        subagentPrompt,
        generationId: state?.id,
        goal: state?.goal,
        clarity: clarityResult,
        cruiseMode: !!cruise,
        ...(cruise ? { cruiseCurrent: cruise.current, cruiseTotal: cruise.total } : {}),
      },
      prompt: promptLines.join("\n"),
    });
  } else {
    emitOutput({
      status: "prompt",
      command: "evolve",
      phase: "manual",
      completed: ["gate", "clarity-calc"],
      context: {
        id: state?.id,
        goal: state?.goal,
        stage: state?.stage,
        clarity: clarityResult,
        cruiseMode: !!cruise,
        ...(cruise ? { cruiseCurrent: cruise.current, cruiseTotal: cruise.total } : {}),
      },
      prompt: state
        ? `Generation ${state.id} active (stage: ${state.stage}). Execute stages sequentially until completion.`
        : "No active generation. Run `reap run start --goal \"<goal>\"` first.",
    });
  }
}
