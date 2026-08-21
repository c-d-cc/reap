import type { ReapPaths } from "../../../core/paths.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { createMilestone } from "../../../core/milestone.js";

export async function makeMilestone(paths: ReapPaths, options: Record<string, string | undefined>): Promise<void> {
  if (!options.title || !options.goal) {
    emitError("make", 'Usage: reap make milestone --title "<title>" --goal "<vision goal>"');
  }
  const filename = await createMilestone(paths.visionMilestones, {
    title: options.title!,
    goal: options.goal!,
  });
  const slug = filename.replace(/\.md$/, "");
  emitOutput({
    status: "ok",
    command: "make",
    context: { resource: "milestone", filename, slug },
    message: `Milestone created: ${filename}`,
    prompt: [
      "The milestone was created with template sections. You MUST now fill in:",
      "- `## Exit Criteria` — what must be true for this milestone to be over. Verifiable facts, NOT quantitative metrics. The human makes the final call.",
      "- `## Out of Scope` — what is NOT this milestone.",
      "- `## Generations` — the generations planned to realise it. This list is updated as work proceeds.",
      "Do not leave <!-- --> placeholders.",
      "",
      `Until Exit Criteria and Out of Scope are filled, this milestone offers no goal candidates and cannot become the focus: \`reap milestone main ${slug}\` will refuse it.`,
    ].join("\n"),
  });
}
