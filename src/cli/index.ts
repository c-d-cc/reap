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
  .option("--backlog <backlog>", "Backlog filename to consume for this generation")
  .action(async (stage: string, options: { phase?: string; goal?: string; type?: string; parents?: string; feedback?: string; reason?: string; backlog?: string }) => {
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
  .command("backlog <action>")
  .description("Manage backlog items (create, list)")
  .option("--type <type>", "Backlog type (genome-change, environment-change, task)")
  .option("--title <title>", "Backlog item title")
  .option("--body <body>", "Optional description body")
  .option("--priority <priority>", "Priority (high, medium, low)")
  .action(async (action: string, options: { type?: string; title?: string; body?: string; priority?: string }) => {
    const { createPaths } = await import("../core/paths.js");
    const { emitOutput, emitError } = await import("../core/output.js");
    const paths = createPaths(process.cwd());

    if (action === "create") {
      if (!options.type || !options.title) {
        emitError("backlog", 'Usage: reap backlog create --type <type> --title "<title>" [--body "<body>"] [--priority <priority>]');
      }
      const { createBacklog } = await import("../core/backlog.js");
      const filename = await createBacklog(paths.backlog, {
        type: options.type!,
        title: options.title!,
        body: options.body,
        priority: options.priority,
      });
      emitOutput({
        status: "ok",
        command: "backlog",
        context: { action: "create", filename },
        message: `Backlog item created: ${filename}`,
      });
    } else if (action === "list") {
      const { scanBacklog } = await import("../core/backlog.js");
      const items = await scanBacklog(paths.backlog);
      emitOutput({
        status: "ok",
        command: "backlog",
        context: { action: "list", items: items.map((i) => ({ type: i.type, title: i.title, status: i.status, priority: i.priority, filename: i.filename })) },
        message: `${items.length} backlog items.`,
      });
    } else {
      emitError("backlog", `Unknown action '${action}'. Available: create, list`);
    }
  });

program
  .command("make <resource>")
  .description("Create a resource from template (backlog)")
  .option("--type <type>", "Backlog type (genome-change, environment-change, task)")
  .option("--title <title>", "Resource title")
  .option("--body <body>", "Optional description body")
  .option("--priority <priority>", "Priority (high, medium, low)")
  .action(async (resource: string, options: { type?: string; title?: string; body?: string; priority?: string }) => {
    const { createPaths } = await import("../core/paths.js");
    const { emitOutput, emitError } = await import("../core/output.js");
    const paths = createPaths(process.cwd());

    if (resource === "backlog") {
      if (!options.type || !options.title) {
        emitError("make", 'Usage: reap make backlog --type <type> --title "<title>" [--body "<body>"] [--priority <priority>]');
      }
      const { createBacklog } = await import("../core/backlog.js");
      const filename = await createBacklog(paths.backlog, {
        type: options.type!,
        title: options.title!,
        body: options.body,
        priority: options.priority,
      });
      emitOutput({
        status: "ok",
        command: "make",
        context: { resource: "backlog", filename },
        message: `Backlog item created: ${filename}`,
      });
    } else {
      emitError("make", `Unknown resource '${resource}'. Available: backlog`);
    }
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
