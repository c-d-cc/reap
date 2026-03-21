import type { RunOutput } from "../types";

export function emitOutput(output: RunOutput): never {
  console.log(JSON.stringify(output, null, 2));
  process.exit(0);
}

export function emitError(command: string, message: string, details?: Record<string, unknown>): never {
  const output: RunOutput = {
    status: "error",
    command,
    phase: "",
    completed: [],
    message,
    context: details,
  };
  console.error(JSON.stringify(output, null, 2));
  process.exit(1);
}
