import type { ReapOutput } from "../types/index.js";

export function emitOutput(output: ReapOutput): never {
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
