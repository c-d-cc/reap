import type { ReapPaths } from "../../../core/paths.js";
import { writeTextFile } from "../../../core/fs.js";
import { emitOutput } from "../../../core/output.js";
import { initCommon } from "./common.js";

const DEFAULT_APPLICATION = `# Application

## Project Identity
<!-- What is this project? -->

## Architecture Decisions
<!-- Key architectural choices -->

## Tech Stack
<!-- Technology selections -->

## Conventions
<!-- Code conventions and standards -->

## Constraints
<!-- Technical constraints -->
`;

export async function execute(paths: ReapPaths, projectName: string): Promise<void> {
  const config = await initCommon(paths, projectName);

  // Write empty genome template
  await writeTextFile(paths.application, DEFAULT_APPLICATION);

  // Write environment
  await writeTextFile(paths.environmentSummary, `# ${config.project} Environment\n\n<!-- Project environment summary -->\n`);

  emitOutput({
    status: "ok",
    command: "init",
    phase: "greenfield",
    completed: ["create-dirs", "write-config", "write-genome", "write-environment", "write-vision"],
    context: {
      project: config.project,
      mode: "greenfield",
      reapDir: paths.reap,
    },
    message: `Project '${config.project}' initialized (greenfield). .reap/ structure created.`,
    prompt: [
      "## Greenfield Init Complete",
      "",
      "Project initialized. Next steps:",
      "1. Fill in genome/application.md through conversation with the human",
      "2. Record project information in environment/summary.md",
      "3. Start the first embryo generation with `reap run start --goal \"<goal>\"`",
    ].join("\n"),
  });
}
