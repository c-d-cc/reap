#!/usr/bin/env bun
import { program } from "commander";
import { initProject } from "./commands/init";

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

program.parse();
