import type { ReapPaths } from "../../../core/paths.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { createBacklog } from "../../../core/backlog.js";
import { makeHashedId, isReapId } from "../../../core/sequence.js";

export async function makeBacklog(paths: ReapPaths, options: Record<string, string | undefined>): Promise<void> {
  if (!options.type || !options.title) {
    emitError("make", 'Usage: reap make backlog --type <type> --title "<title>" [--body "<body>"] [--priority <priority>] [--from <id,id>]');
  }

  // The one thing that most directly caused this item — not a list of what it
  // relates to. Recorded as an id so the link survives every rewording of the
  // thing it names.
  const from = (options.from ?? "").trim();
  if (from && !isReapId(from)) {
    emitError("make", `--from '${from}' is not a REAP id. Give the id of the one document that most directly caused this — usually a generation (gen-098-99c09a), but a goal, milestone, design or backlog id works the same way.`);
  }
  // Hashed, not numbered: a backlog is consumed and removed, so a permanent
  // number would be spent on something nothing cites afterwards.
  const id = makeHashedId("backlog");
  const filename = await createBacklog(paths.backlog, {
    type: options.type!,
    title: options.title!,
    body: options.body,
    priority: options.priority,
    id,
    from,
  });
  emitOutput({
    status: "ok",
    command: "make",
    context: { resource: "backlog", filename, id, from },
    message: `Backlog ${id} created: ${filename}`,
    prompt: [
      "The backlog file has been created with template sections (Problem, Solution, Files to Change). You MUST now use the Edit tool to fill in these sections with concrete content. Do not leave <!-- --> placeholders.",
      from
        ? `Recorded as caused by ${from}.`
        : "No `from:` was recorded. If one document caused this item — usually the generation that ran into it, but it may be a design document, a goal or another backlog — put that id in `from:`. One, the most direct: it is a cause, not a list of what this relates to.",
    ].join("\n"),
  });
}
