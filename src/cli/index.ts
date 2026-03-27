#!/usr/bin/env node

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Command } from "../libs/cli.js";

function readVersion(): string {
  const __dir = dirname(fileURLToPath(import.meta.url));
  // Try bundled location (dist/cli/ → ../../package.json) and dev location (src/cli/ → ../../package.json)
  for (const rel of [join(__dir, "..", "..", "package.json"), join(__dir, "..", "package.json")]) {
    try { return JSON.parse(readFileSync(rel, "utf-8")).version; } catch {}
  }
  return "0.0.0";
}
import { execute as initExecute } from "./commands/init/index.js";
import { execute as statusExecute } from "./commands/status.js";
import { execute as runExecute } from "./commands/run/index.js";
import { execute as makeExecute } from "./commands/make.js";
import { execute as cruiseExecute } from "./commands/cruise.js";
import { execute as installSkillsExecute } from "./commands/install-skills.js";
import { execute as fixExecute } from "./commands/fix.js";
import { execute as destroyExecute } from "./commands/destroy.js";
import { execute as cleanExecute } from "./commands/clean.js";
import { execute as checkVersionExecute } from "./commands/check-version.js";
import { execute as configExecute } from "./commands/config.js";
import { execute as updateExecute } from "./commands/update.js";
import { execute as helpExecute } from "./commands/help.js";

const program = new Command();

program
  .name("reap")
  .description("Recursive Evolutionary Autonomous Pipeline — Self-Evolving")
  .version(readVersion());

program
  .command("init [project-name]")
  .description("Initialize a new reap project")
  .option("--mode <mode>", "Override auto-detected mode (greenfield or adoption)")
  .option("--repair", "Repair an existing project — supplement missing files (e.g., CLAUDE.md)")
  .option("--migrate", "Migrate from v0.15 to v0.16 structure")
  .option("--phase <phase>", "Migration phase (confirm, execute, vision, complete)")
  .action(async (projectName: string | undefined, options: { mode?: string; repair?: boolean; migrate?: boolean; phase?: string }) => {
    await initExecute(projectName, options.mode, options.repair, options.migrate, options.phase);
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

program
  .command("fix")
  .description("Diagnose and repair .reap/ directory structure")
  .option("--check", "Check only — report issues without fixing")
  .action(async (options: { check?: boolean }) => {
    await fixExecute(options.check);
  });

program
  .command("destroy")
  .description("Completely remove REAP from this project")
  .option("--confirm", "Confirm destruction without prompt")
  .action(async (options: { confirm?: boolean }) => {
    await destroyExecute(options.confirm);
  });

program
  .command("clean")
  .description("Selectively reset REAP project state")
  .option("--lineage <mode>", "Lineage action (compress or delete)")
  .option("--life", "Clear current generation and artifacts")
  .option("--backlog", "Delete all backlog items")
  .option("--hooks <mode>", "Hooks action (reset)")
  .action(async (options: { lineage?: string; life?: boolean; backlog?: boolean; hooks?: string }) => {
    await cleanExecute({
      lineage: options.lineage as "compress" | "delete" | undefined,
      life: options.life,
      backlog: options.backlog,
      hooks: options.hooks as "reset" | undefined,
    });
  });

program
  .command("check-version")
  .description("Check for v0.15 project and show migration message")
  .action(async () => {
    await checkVersionExecute();
  });

program
  .command("config")
  .description("Show current REAP project configuration")
  .action(async () => {
    await configExecute();
  });

program
  .command("help [topic]")
  .description("Show REAP commands and workflow overview")
  .action(async (topic: string | undefined) => {
    await helpExecute(topic);
  });

program
  .command("update")
  .description("Update project structure to match current REAP version")
  .option("--phase <phase>", "Migration phase for v0.15 projects (confirm, execute, vision, complete)")
  .action(async (options: { phase?: string }) => {
    await updateExecute(options.phase);
  });

program.parse();
