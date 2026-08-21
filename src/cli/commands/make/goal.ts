import type { ReapPaths } from "../../../core/paths.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { readTextFile, writeTextFile } from "../../../core/fs.js";
import { appendGoalLine, parseGoals } from "../../../core/vision.js";
import { assignId } from "../../../core/sequence.js";

/**
 * Add a vision goal and give it an id.
 *
 * The only place REAP writes into `vision/goals.md`, which is a user-authored
 * file. It appends a line and nothing else — see `appendGoalLine`.
 */
export async function makeGoal(paths: ReapPaths, options: Record<string, string | undefined>): Promise<void> {
  if (!options.title || !options.section) {
    emitError("make", 'Usage: reap make goal --title "<title>" --section "<section in goals.md>"');
  }

  const content = (await readTextFile(paths.visionGoals)) ?? "# Vision Goals\n";
  const id = await assignId(paths.sequence, "goal", options.title!);
  const updated = appendGoalLine(content, options.section!, id, options.title!);
  await writeTextFile(paths.visionGoals, updated);

  const sections = [...new Set(parseGoals(updated).map((g) => g.section).filter(Boolean))];

  emitOutput({
    status: "ok",
    command: "make",
    context: { resource: "goal", id, section: options.section, sections },
    message: `Goal ${id} added under "${options.section}".`,
    prompt: [
      `The goal was appended to vision/goals.md as \`${id}\`.`,
      "Cite that id — not the title — wherever something refers to this goal (a milestone's `goal:`, a memory's `to:`).",
      "The title may be rewritten at any time; the id is what survives it.",
    ].join("\n"),
  });
}
