import { createPaths } from "../../../core/paths.js";
import { fileExists } from "../../../core/fs.js";
import { emitError } from "../../../core/output.js";
import { execute as greenfieldExecute } from "./greenfield.js";
import { execute as adoptionExecute } from "./adoption.js";

export async function execute(projectName?: string, mode?: string): Promise<void> {
  const root = process.cwd();
  const paths = createPaths(root);

  if (await fileExists(paths.config)) {
    emitError("init", ".reap/ already exists. Use 'reap status' to check current state.");
  }

  if (mode === "adoption") {
    await adoptionExecute(paths, projectName);
  } else {
    await greenfieldExecute(paths, projectName ?? "my-project");
  }
}
