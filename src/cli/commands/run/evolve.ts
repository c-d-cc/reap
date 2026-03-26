import YAML from "yaml";
import type { ReapPaths } from "../../../core/paths.js";
import type { ReapConfig } from "../../../types/index.js";
import { GenerationManager } from "../../../core/generation.js";
import { readTextFile } from "../../../core/fs.js";
import { emitOutput } from "../../../core/output.js";
import { loadReapKnowledge, buildBasePrompt } from "../../../core/prompt.js";

export async function execute(paths: ReapPaths, _phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  const configContent = await readTextFile(paths.config);
  const config = configContent ? (YAML.parse(configContent) as ReapConfig) : null;
  const autoSubagent = config?.autoSubagent ?? true;

  const knowledge = await loadReapKnowledge(paths);
  const subagentPrompt = buildBasePrompt(knowledge, paths, state, config?.cruiseCount);

  if (autoSubagent) {
    emitOutput({
      status: "prompt",
      command: "evolve",
      phase: "delegate",
      completed: ["gate", "genome-load"],
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
        "- description: generation goal",
        "- prompt: the subagentPrompt from context",
        "",
        "After the subagent completes, report the result.",
      ].join("\n"),
    });
  } else {
    emitOutput({
      status: "prompt",
      command: "evolve",
      phase: "manual",
      completed: ["gate"],
      context: {
        id: state?.id,
        goal: state?.goal,
        stage: state?.stage,
      },
      prompt: state
        ? `Generation ${state.id} active (stage: ${state.stage}). Execute stages sequentially until completion.`
        : "No active generation. Run `reap run start --goal \"<goal>\"` first.",
    });
  }
}
