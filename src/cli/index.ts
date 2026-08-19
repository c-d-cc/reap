#!/usr/bin/env node

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Command } from "../libs/cli.js";

function readVersion(): string {
  const __dir = dirname(fileURLToPath(import.meta.url));
  let version = "0.0.0";
  for (const rel of [join(__dir, "..", "..", "package.json"), join(__dir, "..", "package.json")]) {
    try { version = JSON.parse(readFileSync(rel, "utf-8")).version; break; } catch {}
  }
  // Check for dev build marker (created by build.sh for local builds)
  try {
    const hash = readFileSync(join(__dir, "..", ".dev-build"), "utf-8").trim();
    if (hash) version += `+dev.${hash}`;
  } catch {}
  return version;
}
import { execute as initExecute } from "./commands/init/index.js";
import { execute as statusExecute } from "./commands/status.js";
import { execute as runExecute } from "./commands/run/index.js";
import { execute as makeExecute } from "./commands/make/index.js";
import { execute as cruiseExecute } from "./commands/cruise.js";
import { execute as installSkillsExecute } from "./commands/install-skills.js";
import { execute as fixExecute } from "./commands/fix.js";
import { execute as destroyExecute } from "./commands/destroy.js";
import { execute as cleanExecute } from "./commands/clean.js";
import { execute as checkVersionExecute } from "./commands/check-version.js";
import { execute as configExecute } from "./commands/config.js";
import { execute as updateExecute } from "./commands/update.js";
import { execute as helpExecute } from "./commands/help.js";
import { execute as daemonExecute } from "./commands/daemon/index.js";
import { execute as loadContextExecute } from "./commands/load-context.js";
import { execute as dumpStateExecute } from "./commands/dump-state.js";
import { ensureUserLevelAssets } from "../adapters/index.js";

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
  .option("--backlog <backlog>", "Backlog filename to consume for this generation (use --no-backlog to explicitly declare no relevant backlog)")
  .option("--no-backlog", "Explicitly declare no backlog item is relevant to this generation (suppresses pending-backlog prompt). Negates --backlog.")
  .option("--source-action <sourceAction>", "Source action for abort/early-close (rollback, stash, hold, none — rollback only for abort)")
  .option("--save-backlog", "Save progress to backlog on abort")
  .option("--defer-tasks <value>", "For early-close: auto-defer unchecked tasks to new backlog (true|false, default true)")
  .option("--severity <severity>", "For validation --phase report-evaluator: evaluator concern severity (high|low|none — none is a no-op)")
  .option("--summary <summary>", "For validation --phase report-evaluator: one-line evaluator concern summary")
  .action(async (stage: string, options: { phase?: string; goal?: string; type?: string; parents?: string; feedback?: string; reason?: string; backlog?: string | false; sourceAction?: string; saveBacklog?: boolean; deferTasks?: string; severity?: string; summary?: string }) => {
    await runExecute(stage, options);
  });

program
  .command("make <resource>")
  .description("Create a resource from template (backlog, hook)")
  .option("--type <type>", "Resource type (backlog: genome-change/environment-change/task, hook: sh/md)")
  .option("--title <title>", "Resource title")
  .option("--body <body>", "Optional description body")
  .option("--priority <priority>", "Priority (high, medium, low)")
  .option("--event <event>", "Hook event (e.g. onLifeCompleted)")
  .option("--name <name>", "Hook name")
  .option("--condition <condition>", "Hook condition (default: always)")
  .option("--order <order>", "Hook execution order (default: 50)")
  .action(async (resource: string, options: { type?: string; title?: string; body?: string; priority?: string; event?: string; name?: string; condition?: string; order?: string }) => {
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
  .option("--post-upgrade", "Run project sync only (called by previous binary after self-upgrade)")
  .option("--mark-migrated", "Mark this project as migrated for the current REAP version (gen-071 migration layer)")
  .action(async (options: { phase?: string; postUpgrade?: boolean; markMigrated?: boolean }) => {
    await updateExecute(options.phase, options.postUpgrade, options.markMigrated);
  });

program
  .command("load-context")
  .description("Output REAP project knowledge for SessionStart hook injection")
  .action(async () => {
    await loadContextExecute();
  });

program
  .command("dump-state")
  .description("Dump dynamic REAP context to .reap/.session-state.md (for OpenCode and external tools)")
  .option("--stdout", "Write to stdout instead of the file")
  .option("--silent", "Exit 0 silently on any error / non-REAP project")
  .action(async (options: { stdout?: boolean; silent?: boolean }) => {
    await dumpStateExecute({ stdout: options.stdout, silent: options.silent });
  });

program
  .command("daemon <subcommand>")
  .description("Manage the REAP daemon (status, stop, index, query)")
  .option("--query <query>", "Search query for daemon query subcommand")
  .action(async (subcommand: string, options: { query?: string }) => {
    await daemonExecute(subcommand, options);
  });

// Before anything is dispatched, make sure this machine actually has the
// user-level assets REAP needs — slash commands, agent definitions, the guide,
// the SessionStart hook. `scripts/postinstall.sh` used to be the only thing
// that installed them, and npm 12 blocks install scripts for global installs by
// default, so the binary a user runs may be all they got (gen-087).
//
// Silent, and a no-op after the first run at a given version. Awaited rather
// than fired off: a command that reads those files must not race the write.
await ensureUserLevelAssets({ cwd: process.cwd(), version: readVersion() });

program.parse();
