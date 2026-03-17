#!/usr/bin/env node
import { program } from "commander";
import { initProject } from "./commands/init";
import { updateProject } from "./commands/update";
import { getStatus } from "./commands/status";
import { fixProject } from "./commands/fix";
import { LifeCycle } from "../core/lifecycle";
import { ReapPaths } from "../core/paths";
import { readTextFile } from "../core/fs";
import { join } from "path";

program
  .name("reap")
  .description("REAP — Recursive Evolutionary Autonomous Pipeline")
  .version("0.1.0");

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

      // If no name provided and existing project signals detected, suggest adoption
      if (!projectName && mode === "greenfield") {
        const { existsSync } = require("fs");
        const signals = ["package.json", "go.mod", "Cargo.toml", "pom.xml", "pyproject.toml", "Makefile", "CMakeLists.txt"];
        const hasExistingProject = signals.some(f => existsSync(require("path").join(cwd, f)));
        if (hasExistingProject) {
          console.log(`Existing project detected in current directory.`);
          console.log(`  Consider using --mode adoption to apply REAP to this codebase.`);
          console.log(`  Proceeding with greenfield mode. Use -m adoption to change.\n`);
        }
      }

      await initProject(cwd, name, mode, options.preset);
      console.log(`✓ REAP project "${name}" initialized (${mode} mode)`);
      console.log(`  .reap/ directory created with genome, environment, life, lineage`);
      console.log(`\nNext: run '/reap.start' to start your first Generation`);
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
      const status = await getStatus(process.cwd());
      console.log(`Project: ${status.project} (${status.entryMode})`);
      console.log(`Completed Generations: ${status.totalGenerations}`);
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
  .action(async () => {
    try {
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
    } catch (e: any) {
      console.error(`Error: ${e.message}`);
      process.exit(1);
    }
  });

program
  .command("update")
  .description("Sync slash commands, templates, and hooks to the latest version")
  .option("--dry-run", "Show changes without applying them")
  .action(async (options: { dryRun?: boolean }) => {
    try {
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
    // Detect user language from ~/.claude/settings.json
    let lang = "en";
    const settingsContent = await readTextFile(ReapPaths.userClaudeSettingsJson);
    if (settingsContent) {
      try {
        const settings = JSON.parse(settingsContent);
        if (settings.language) {
          const l = settings.language.toLowerCase();
          if (l === "korean" || l === "ko") lang = "ko";
        }
      } catch { /* ignore */ }
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

program.parse();
