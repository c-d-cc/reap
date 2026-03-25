import { installSkills } from "../../adapters/claude-code/install.js";

export async function execute(): Promise<void> {
  await installSkills(process.cwd());
}
