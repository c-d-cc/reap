#!/usr/bin/env bun
import { program } from "commander";
import { initProject } from "./commands/init";
import { evolve, advanceStage, regressStage } from "./commands/evolve";
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

program.parse();
