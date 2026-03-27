import { emitOutput } from "../../core/output.js";

export async function execute(): Promise<void> {
  const helpText = `REAP — Recursive Evolutionary Autonomous Pipeline

Slash Commands (in Claude Code):
  /reap.evolve         Run a full generation lifecycle (recommended)
  /reap.start          Start a new generation
  /reap.next           Advance to the next stage
  /reap.back           Return to a previous stage
  /reap.abort          Abort current generation (2-phase)
  /reap.knowledge      Manage genome, environment, context
  /reap.init           Initialize REAP in a project
  /reap.config         View/edit project configuration
  /reap.status         Check current generation state
  /reap.merge          Merge lifecycle for parallel branches
  /reap.pull           Fetch remote + merge lifecycle
  /reap.push           Validate state + push
  /reap.update         Upgrade project structure
  /reap.help           Show this help

Quick Start:
  1. npm install -g @c-d-cc/reap
  2. claude
     > /reap.init
     > /reap.evolve

Docs: https://reap.cc`;

  emitOutput({
    status: "ok",
    command: "help",
    context: {},
    message: helpText,
  });
}
