#!/usr/bin/env bun
import { program } from "commander";
import { initProject } from "./commands/init";
import { evolve, advanceStage, regressStage } from "./commands/evolve";
import { getStatus } from "./commands/status";
import { fixProject } from "./commands/fix";
import { LifeCycle } from "../core/lifecycle";

program
  .name("reap")
  .description("REAP — Recursive Evolutionary Application Pipeline")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize a new REAP project (Genesis)")
  .argument("<project-name>", "Project name")
  .option("-m, --mode <mode>", "Entry mode: greenfield, migration, adoption", "greenfield")
  .action(async (projectName: string, options: { mode: string }) => {
    try {
      const mode = options.mode as "greenfield" | "migration" | "adoption";
      await initProject(process.cwd(), projectName, mode);
      console.log(`✓ REAP project "${projectName}" initialized (${mode} mode)`);
      console.log(`  .reap/ directory created with genome, environment, life, lineage`);
      console.log(`\nNext: run 'reap evolve' to start your first Generation`);
    } catch (e: any) {
      console.error(`Error: ${e.message}`);
      process.exit(1);
    }
  });

program
  .command("evolve")
  .description("Start a new Generation or advance the current Life Cycle stage")
  .argument("[goal]", "Goal for the new Generation")
  .option("--advance", "Advance to the next Life Cycle stage")
  .option("--back", "Go back to the previous stage (Growth ↔ Validation loop)")
  .action(async (goal, options) => {
    try {
      if (options.back) {
        const state = await regressStage(process.cwd());
        console.log(`✓ Returned to ${state.stage} (${LifeCycle.label(state.stage)})`);
      } else if (options.advance) {
        const state = await advanceStage(process.cwd());
        console.log(`✓ Advanced to ${state.stage} (${LifeCycle.label(state.stage)})`);
      } else if (goal) {
        const state = await evolve(process.cwd(), goal);
        console.log(`✓ Generation ${state.id} started`);
        console.log(`  Goal: ${state.goal}`);
        console.log(`  Stage: ${state.stage} (${LifeCycle.label(state.stage)})`);
      } else {
        console.error("Error: provide a goal or use --advance");
        process.exit(1);
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
      const status = await getStatus(process.cwd());
      console.log(`Project: ${status.project} (${status.entryMode})`);
      console.log(`Completed Generations: ${status.totalGenerations}`);
      if (status.generation) {
        console.log(`\nActive Generation: ${status.generation.id}`);
        console.log(`  Goal: ${status.generation.goal}`);
        console.log(`  Stage: ${status.generation.stage} (${LifeCycle.label(status.generation.stage as any)})`);
        console.log(`  Started: ${status.generation.startedAt}`);
      } else {
        console.log(`\nNo active Generation. Run 'reap evolve "<goal>"' to start one.`);
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

program.parse();
