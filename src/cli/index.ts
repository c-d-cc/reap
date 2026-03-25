#!/usr/bin/env node

import { Command } from "../libs/cli.js";
import { execute as initExecute } from "./commands/init/index.js";
import { execute as statusExecute } from "./commands/status.js";
import { execute as runExecute } from "./commands/run/index.js";

const program = new Command();

program
  .name("reap")
  .description("Recursive Evolutionary Autonomous Pipeline — Self-Evolving")
  .version("0.0.1");

program
  .command("init [project-name]")
  .description("Initialize a new reap project")
  .option("--mode <mode>", "Override auto-detected mode (greenfield or adoption)")
  .action(async (projectName: string | undefined, options: { mode?: string }) => {
    await initExecute(projectName, options.mode);
  });

program
  .command("status")
  .description("Show current project status")
  .action(async () => {
    await statusExecute();
  });

program
  .command("run <stage>")
  .description("Run a lifecycle stage (start, learning, planning, ...)")
  .option("--phase <phase>", "Stage phase (work, complete, reflect, fitness, adapt, commit)")
  .option("--goal <goal>", "Goal for start command")
  .option("--type <type>", "Generation type (embryo, normal, merge)")
  .option("--parents <parents>", "Parent generation IDs for merge (comma-separated)")
  .option("--feedback <feedback>", "Fitness feedback text")
  .option("--reason <reason>", "Reason for back regression")
  .action(async (stage: string, options: { phase?: string; goal?: string; type?: string; parents?: string; feedback?: string; reason?: string }) => {
    await runExecute(stage, options);
  });

program
  .command("install-skills")
  .description("Install Claude Code skill files to .claude/commands/")
  .action(async () => {
    const { installSkills } = await import("../adapters/claude-code/install.js");
    await installSkills(process.cwd());
  });

program
  .command("cruise <count>")
  .description("Enable cruise mode for N generations")
  .action(async (count: string) => {
    const n = parseInt(count);
    if (isNaN(n) || n < 1) {
      const { emitError } = await import("../core/output.js");
      emitError("cruise", "Count must be a positive integer.");
    }
    const { setCruise } = await import("../core/cruise.js");
    const { createPaths } = await import("../core/paths.js");
    const paths = createPaths(process.cwd());
    await setCruise(paths.config, n);
    const { emitOutput } = await import("../core/output.js");
    emitOutput({
      status: "ok",
      command: "cruise",
      context: { cruiseCount: `1/${n}` },
      message: `Cruise mode enabled: ${n} generations.`,
    });
  });

program.parse();
