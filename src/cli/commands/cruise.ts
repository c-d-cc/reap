import { createPaths } from "../../core/paths.js";
import { setCruise } from "../../core/cruise.js";
import { emitOutput, emitError } from "../../core/output.js";

export async function execute(count: string): Promise<void> {
  const n = parseInt(count);
  if (isNaN(n) || n < 1) {
    emitError("cruise", "Count must be a positive integer.");
  }
  const paths = createPaths(process.cwd());
  await setCruise(paths.config, n);
  emitOutput({
    status: "ok",
    command: "cruise",
    context: { cruiseCount: `1/${n}` },
    message: `Cruise mode enabled: ${n} generations.`,
  });
}
