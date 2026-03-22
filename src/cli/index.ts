#!/usr/bin/env node
import { program } from "commander";
import { createInterface } from "readline";
import { initProject } from "./commands/init";
import { updateProject, selfUpgrade } from "./commands/update";
import { getStatus } from "./commands/status";
import { fixProject, checkProject } from "./commands/fix";
import { destroyProject, getProjectName } from "./commands/destroy";
import { cleanProject, hasActiveGeneration } from "./commands/clean";
import type { CleanOptions } from "./commands/clean";
import { updateGenome } from "./commands/update-genome";
import { LifeCycle } from "../core/lifecycle";
import { ReapPaths } from "../core/paths";
import { AgentRegistry } from "../core/agents";
import { readTextFile } from "../core/fs";
import { formatVersionLine } from "../core/version";
import { ConfigManager } from "../core/config";
import { join } from "path";

program
  .name("reap")
  .description("REAP — Recursive Evolutionary Autonomous Pipeline")
  .version(process.env.__REAP_VERSION__ || "0.0.0");

program
  .command("init")
  .description("Initialize a new REAP project (Genesis)")
  .argument("[project-name]", "Project name (defaults to current directory name)")
  .option("-m, --mode <mode>", "Entry mode: greenfield, migration, adoption", "greenfield")
  .option("-p, --preset <preset>", "Bootstrap with a genome preset (e.g., bun-hono-react)")
  .action(async (projectName: string | undefined, options: { mode: string; preset?: string }) => {
    try {
      const cwd = process.cwd();
      const name = projectName ?? require("path").basename(cwd);
      let mode = options.mode as "greenfield" | "migration" | "adoption";

      // If existing project signals detected and mode not explicitly set, auto-switch to adoption
      const modeExplicit = process.argv.some(a => a === "-m" || a === "--mode");
      if (!modeExplicit && mode === "greenfield") {
        const { existsSync } = require("fs");
        const signals = ["package.json", "go.mod", "Cargo.toml", "pom.xml", "pyproject.toml", "Makefile", "CMakeLists.txt"];
        const hasExistingProject = signals.some(f => existsSync(require("path").join(cwd, f)));
        if (hasExistingProject) {
          mode = "adoption";
          console.log(`Existing project detected. Automatically using adoption mode.`);
          console.log(`  To force greenfield mode, use: reap init --mode greenfield\n`);
        }
      }

      console.log(`\nInitializing REAP project "${name}" (${mode} mode)...\n`);
      const initResult = await initProject(cwd, name, mode, options.preset, (msg) => {
        console.log(`  ${msg}`);
      });
      console.log(`\n✓ REAP project "${name}" initialized successfully!\n`);
      console.log(`  Project:  ${name} (${mode})`);
      if (initResult.agents.length > 0) {
        console.log(`  Agents:   ${initResult.agents.join(", ")}`);
      } else {
        console.log(`  Agents:   None detected`);
      }
      console.log(`  Config:   .reap/config.yml`);
      console.log(`  Genome:   .reap/genome/ (principles, conventions, constraints)`);
      console.log(`\n  Getting started:`);
      console.log(`    1. Open your AI agent (${initResult.agents[0] || "Claude Code or OpenCode"})`);
      console.log(`    2. Run /reap.sync to synchronize Genome with your project`);
      console.log(`    3. Run /reap.start to begin your first Generation`);
      console.log(`    4. Or run /reap.evolve for autonomous execution`);
      if (initResult.agents.length === 0) {
        console.log(`\n  ⚠ No AI agents detected. Install Claude Code or OpenCode, then run 'reap update'.`);
      }
    } catch (e: any) {
      console.error(`Error: ${e.message}`);
      process.exit(1);
    }
  });

program
  .command("status")
  .description("Show current project and Generation status")
  .action(async () => {
    try {
      const cwd = process.cwd();
      const status = await getStatus(cwd);

      // Check autoUpdate config to decide whether to check latest
      const paths = new ReapPaths(cwd);
      const config = await ConfigManager.read(paths);
      const skipCheck = config.autoUpdate === false;
      const installedVersion = process.env.__REAP_VERSION__ || "0.0.0";
      const versionLine = formatVersionLine(installedVersion, skipCheck);

      console.log(`${versionLine} | Project: ${status.project} (${status.entryMode})`);
      console.log(`Completed Generations: ${status.totalGenerations}`);
      const syncLabel = status.lastSyncedGeneration
        ? `synced (${status.lastSyncedGeneration})`
        : "never synced";
      console.log(`Genome Sync: ${syncLabel}`);
      if (status.generation) {
        console.log(`\nActive Generation: ${status.generation.id}`);
        console.log(`  Goal: ${status.generation.goal}`);
        console.log(`  Stage: ${status.generation.stage} (${LifeCycle.label(status.generation.stage as any)})`);
        console.log(`  Started: ${status.generation.startedAt}`);
      } else {
        console.log(`\nNo active Generation. Run '/reap.start' to start one.`);
      }
    } catch (e: any) {
      console.error(`Error: ${e.message}`);
      process.exit(1);
    }
  });

program
  .command("fix")
  .description("Diagnose and repair .reap/ directory structure")
  .option("--check", "Check-only mode: report issues without fixing anything")
  .action(async (options: { check?: boolean }) => {
    try {
      if (options.check) {
        const result = await checkProject(process.cwd());
        if (result.errors.length === 0 && result.warnings.length === 0) {
          console.log("✓ Integrity check passed. No issues found.");
        } else {
          if (result.errors.length > 0) {
            console.log("Errors:");
            result.errors.forEach(e => console.log(`  ✗ ${e}`));
          }
          if (result.warnings.length > 0) {
            console.log("Warnings:");
            result.warnings.forEach(w => console.log(`  ⚠ ${w}`));
          }
        }
        if (result.errors.length > 0) {
          process.exit(1);
        }
      } else {
        const result = await fixProject(process.cwd());
        if (result.fixed.length === 0 && result.issues.length === 0) {
          console.log("✓ Project is healthy. No issues found.");
        } else {
          if (result.fixed.length > 0) {
            console.log("Fixed:");
            result.fixed.forEach(f => console.log(`  ✓ ${f}`));
          }
          if (result.issues.length > 0) {
            console.log("Issues (require manual intervention):");
            result.issues.forEach(i => console.log(`  ✗ ${i}`));
          }
        }
      }
    } catch (e: any) {
      console.error(`Error: ${e.message}`);
      process.exit(1);
    }
  });

program
  .command("update")
  .description("Upgrade REAP package and sync slash commands, templates, and hooks")
  .option("--dry-run", "Show changes without applying them")
  .action(async (options: { dryRun?: boolean }) => {
    try {
      // Step 1: Self-upgrade npm package
      if (!options.dryRun) {
        const upgrade = selfUpgrade();
        if (upgrade.upgraded) {
          console.log(`Upgraded: v${upgrade.from} → v${upgrade.to}`);
        }
      }

      // Step 2: Sync project files
      const result = await updateProject(process.cwd(), options.dryRun ?? false);
      if (options.dryRun) {
        console.log("[dry-run] Changes that would be applied:");
      }
      if (result.updated.length === 0 && result.removed.length === 0) {
        console.log("✓ Everything is up to date.");
      } else {
        if (result.updated.length > 0) {
          console.log(`${options.dryRun ? "Would update" : "Updated"}:`);
          result.updated.forEach(f => console.log(`  ✓ ${f}`));
        }
        if (result.removed.length > 0) {
          console.log(`${options.dryRun ? "Would remove" : "Removed"}:`);
          result.removed.forEach(f => console.log(`  ✗ ${f}`));
        }
      }
      if (result.skipped.length > 0) {
        console.log(`Unchanged: ${result.skipped.length} files`);
      }
    } catch (e: any) {
      console.error(`Error: ${e.message}`);
      process.exit(1);
    }
  });

program
  .command("help")
  .description("Show REAP commands, slash commands, and workflow overview")
  .action(async () => {
    // Detect user language from any installed agent
    let lang = "en";
    const detectedLang = await AgentRegistry.readLanguage();
    if (detectedLang) {
      const l = detectedLang.toLowerCase();
      if (l === "korean" || l === "ko") lang = "ko";
    }

    // Load language-specific help text
    const helpDir = join(ReapPaths.packageTemplatesDir, "help");
    let helpText = await readTextFile(join(helpDir, `${lang}.txt`));
    if (!helpText) helpText = await readTextFile(join(helpDir, "en.txt"));
    if (!helpText) {
      console.log("Help file not found. Run 'reap update' to install templates.");
      return;
    }
    console.log(helpText);
  });

program
  .command("destroy")
  .description("Remove all REAP files from this project")
  .action(async () => {
    try {
      const cwd = process.cwd();
      const projectName = await getProjectName(cwd);
      if (!projectName) {
        console.error("Error: Not a REAP project (cannot read .reap/config.yml).");
        process.exit(1);
      }

      const expectedInput = "yes destroy";
      console.log(`\nThis will permanently remove all REAP files from this project.`);
      console.log(`To confirm, type '${expectedInput}':\n`);

      const answer = await prompt("> ");

      if (answer.trim() !== expectedInput) {
        console.log("\nConfirmation mismatch. Destroy cancelled.");
        process.exit(0);
      }

      console.log("");
      const result = await destroyProject(cwd);

      if (result.removed.length > 0) {
        console.log("Removed:");
        result.removed.forEach(f => console.log(`  - ${f}`));
      }
      if (result.skipped.length > 0) {
        console.log("Skipped:");
        result.skipped.forEach(f => console.log(`  - ${f}`));
      }
      console.log("\nREAP has been removed from this project.");
    } catch (e: any) {
      console.error(`Error: ${e.message}`);
      process.exit(1);
    }
  });

program
  .command("clean")
  .description("Reset REAP project with interactive options")
  .action(async () => {
    try {
      const cwd = process.cwd();
      const paths = new ReapPaths(cwd);
      if (!(await paths.isReapProject())) {
        console.error("Error: Not a REAP project (.reap/ not found).");
        process.exit(1);
      }

      // Warn about active generation
      if (await hasActiveGeneration(cwd)) {
        console.log("\n⚠ Warning: There is an active generation in progress.");
        const proceed = await prompt("Continue and discard it? (y/N): ");
        if (proceed.trim().toLowerCase() !== "y") {
          console.log("Clean cancelled.");
          process.exit(0);
        }
      }

      console.log("\n--- REAP Clean ---\n");

      // 1. Lineage
      console.log("1. Lineage (generation history):");
      console.log("   [1] Compress into epoch summary");
      console.log("   [2] Delete entirely");
      const lineageChoice = await prompt("   Choice (1/2): ");
      const lineage: CleanOptions["lineage"] = lineageChoice.trim() === "2" ? "delete" : "compress";

      // 2. Hooks
      console.log("\n2. Hooks:");
      console.log("   [1] Keep existing hooks");
      console.log("   [2] Reset to defaults");
      const hooksChoice = await prompt("   Choice (1/2): ");
      const hooks: CleanOptions["hooks"] = hooksChoice.trim() === "2" ? "reset" : "keep";

      // 3. Genome/Environment
      console.log("\n3. Genome / Environment:");
      console.log("   [1] Override with templates (then run /reap.sync)");
      console.log("   [2] Keep current files");
      console.log("   [3] Manual editing (no changes)");
      const genomeChoice = await prompt("   Choice (1/2/3): ");
      const genome: CleanOptions["genome"] =
        genomeChoice.trim() === "1" ? "template" :
        genomeChoice.trim() === "3" ? "manual" : "keep";

      // 4. Backlog
      console.log("\n4. Backlog:");
      console.log("   [1] Keep existing backlog items");
      console.log("   [2] Delete all");
      const backlogChoice = await prompt("   Choice (1/2): ");
      const backlog: CleanOptions["backlog"] = backlogChoice.trim() === "2" ? "delete" : "keep";

      console.log("\nApplying...\n");
      const result = await cleanProject(cwd, { lineage, hooks, genome, backlog });

      for (const action of result.actions) {
        console.log(`  - ${action}`);
      }
      for (const warning of result.warnings) {
        console.log(`  ⚠ ${warning}`);
      }

      console.log("\nClean complete. Run /reap.start to begin a new generation.");
    } catch (e: any) {
      console.error(`Error: ${e.message}`);
      process.exit(1);
    }
  });

program
  .command("update-genome")
  .description("Apply pending genome-change backlog without creating a generation")
  .option("--apply", "Finalize: mark backlog consumed and bump genomeVersion")
  .action(async (options: { apply?: boolean }) => {
    await updateGenome(process.cwd(), options.apply ?? false);
  });

program
  .command("run <command>")
  .description("Run a REAP command script (internal, used by slash commands)")
  .option("--phase <phase>", "Start from a specific phase")
  .allowUnknownOption()
  .action(async (command: string, options: { phase?: string }, cmd: any) => {
    // Collect pass-through args: everything after "run <command>" except --phase and its value
    const rawArgs = cmd.args.slice(1); // skip command name (already parsed)
    const passArgs: string[] = [];
    for (let i = 0; i < rawArgs.length; i++) {
      if (rawArgs[i] === "--phase") { i++; continue; } // skip --phase and its value
      passArgs.push(rawArgs[i]);
    }
    const { runCommand } = await import("./commands/run/index");
    await runCommand(command, options.phase, passArgs);
  });

function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer: string | null) => {
      rl.close();
      resolve(answer ?? "");
    });
  });
}

program.parse();
