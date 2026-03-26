import type { ReapPaths } from "../../../core/paths.js";
import { emitOutput } from "../../../core/output.js";

export async function execute(paths: ReapPaths, _phase?: string, extra?: string): Promise<void> {
  const subcommand = extra ?? "";

  if (subcommand === "reload") {
    emitOutput({
      status: "prompt",
      command: "knowledge",
      phase: "reload",
      completed: ["parse"],
      context: {
        files: [
          paths.application,
          paths.evolution,
          paths.invariants,
          paths.environmentSummary,
          paths.visionGoals,
          paths.memoryShortterm,
          paths.memoryMidterm,
        ],
      },
      prompt: [
        "## Knowledge Reload",
        "",
        "Read the following files to reload project knowledge:",
        "",
        `1. ${paths.application}`,
        `2. ${paths.evolution}`,
        `3. ${paths.invariants}`,
        `4. ${paths.environmentSummary}`,
        `5. ${paths.visionGoals}`,
        `6. ${paths.memoryShortterm}`,
        `7. ${paths.memoryMidterm}`,
        "",
        "After reading, confirm to the user that knowledge has been reloaded.",
      ].join("\n"),
    });
  }

  if (subcommand === "genome") {
    emitOutput({
      status: "prompt",
      command: "knowledge",
      phase: "genome",
      completed: ["parse"],
      context: {
        files: [
          paths.application,
          paths.evolution,
          paths.invariants,
        ],
      },
      prompt: [
        "## Genome Review",
        "",
        "Read the genome files:",
        "",
        `1. ${paths.application}`,
        `2. ${paths.evolution}`,
        `3. ${paths.invariants}`,
        "",
        "Present a concise summary of each file to the user.",
        "Ask if they want to modify anything.",
        "- application.md, evolution.md: modify per user request.",
        "- invariants.md: human-only editable — guide user to edit directly.",
      ].join("\n"),
    });
  }

  if (subcommand === "environment") {
    emitOutput({
      status: "prompt",
      command: "knowledge",
      phase: "environment",
      completed: ["parse"],
      context: {
        files: [
          paths.environmentSummary,
          paths.sourceMap,
        ],
      },
      prompt: [
        "## Environment Review",
        "",
        "Read the environment files:",
        "",
        `1. ${paths.environmentSummary}`,
        `2. ${paths.sourceMap} (if exists)`,
        "",
        "Present a concise summary to the user.",
        "Ask if they want to update anything.",
        "If updates requested, modify the relevant files.",
      ].join("\n"),
    });
  }

  if (subcommand === "memory") {
    emitOutput({
      status: "prompt",
      command: "knowledge",
      phase: "memory",
      completed: ["parse"],
      context: {
        files: [
          paths.memoryShortterm,
          paths.memoryMidterm,
          paths.memoryLongterm,
        ],
      },
      prompt: [
        "## Memory Review",
        "",
        "Read the memory files:",
        "",
        `1. ${paths.memoryShortterm} (shortterm — 1-2 sessions)`,
        `2. ${paths.memoryMidterm} (midterm — multi-generation)`,
        `3. ${paths.memoryLongterm} (longterm — project lifetime)`,
        "",
        "Present current memory content to the user.",
        "Ask if they want to update, reorganize, or clean up any tier.",
        "Memory is freely writable — apply changes directly.",
      ].join("\n"),
    });
    return;
  }

  // No argument — present choices
  emitOutput({
    status: "prompt",
    command: "knowledge",
    completed: ["parse"],
    context: {},
    prompt: [
      "## Knowledge Management",
      "",
      "Ask the user which action they want:",
      "",
      "1. **reload** — Reload genome, environment, vision, memory into context",
      "2. **genome** — Review genome summary + discuss modifications",
      "3. **environment** — Review environment summary + discuss updates",
      "4. **memory** — Review and update memory (shortterm/midterm/longterm)",
      "",
      "Then run: `reap run knowledge --goal <choice>`",
    ].join("\n"),
  });
}
