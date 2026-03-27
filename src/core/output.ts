import type { ReapOutput } from "../types/index.js";

const ARTIFACT_REMINDER = "\n\n**Reminder**: If this command created or referenced any template files (artifacts, backlog, etc.), you MUST fill in ALL template sections with concrete content. Do not leave `<!-- -->` placeholders unfilled.";

export function emitOutput(output: ReapOutput): never {
  if (output.prompt) {
    output.prompt += ARTIFACT_REMINDER;
  }
  console.log(JSON.stringify(output, null, 2));
  process.exit(0);
}

export function emitError(command: string, message: string): never {
  emitOutput({
    status: "error",
    command,
    message,
  });
}
