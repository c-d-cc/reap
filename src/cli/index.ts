#!/usr/bin/env node

import { Command } from "../libs/cli.js";
import { execute as initExecute } from "./commands/init/index.js";
import { execute as statusExecute } from "./commands/status.js";
import { execute as runExecute } from "./commands/run/index.js";
import { execute as makeExecute } from "./commands/make.js";
import { execute as cruiseExecute } from "./commands/cruise.js";
import { execute as installSkillsExecute } from "./commands/install-skills.js";

const program = new Command();

program
  .name("reap")
  .description("Recursive Evolutionary Autonomous Pipeline — Self-Evolving")
  .version("0.0.1");

program
  .command("init [project-name]")
  .description("Initialize a new reap project")
  .option("--mode <mode>", "Override auto-detected mode (greenfield or adoption)")
  .option("--repair", "Repair an existing project — supplement missing files (e.g., CLAUDE.md)")
  .action(async (projectName: string | undefined, options: { mode?: string; repair?: boolean }) => {
    await initExecute(projectName, options.mode, options.repair);
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
  .option("--reason <reason>", "Reason for back regression or abort")
  .option("--backlog <backlog>", "Backlog filename to consume for this generation")
  .option("--source-action <sourceAction>", "Source action for abort (rollback, stash, hold, none)")
  .option("--save-backlog", "Save progress to backlog on abort")
  .action(async (stage: string, options: { phase?: string; goal?: string; type?: string; parents?: string; feedback?: string; reason?: string; backlog?: string; sourceAction?: string; saveBacklog?: boolean }) => {
    await runExecute(stage, options);
  });

program
  .command("make <resource>")
  .description("Create a resource from template (backlog)")
  .option("--type <type>", "Backlog type (genome-change, environment-change, task)")
  .option("--title <title>", "Resource title")
  .option("--body <body>", "Optional description body")
  .option("--priority <priority>", "Priority (high, medium, low)")
  .action(async (resource: string, options: { type?: string; title?: string; body?: string; priority?: string }) => {
    await makeExecute(resource, options);
  });

program
  .command("cruise <count>")
  .description("Enable cruise mode for N generations")
  .action(async (count: string) => {
    await cruiseExecute(count);
  });

program
  .command("install-skills")
  .description("Install Claude Code skill files to .claude/commands/")
  .action(async () => {
    await installSkillsExecute();
  });

program.parse();
