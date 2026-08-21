import { createPaths } from "../../core/paths.js";
import { emitOutput, emitError } from "../../core/output.js";
import { readTextFile } from "../../core/fs.js";
import { goalIdentifiers } from "../../core/vision.js";
import {
  listMilestones,
  mainMilestone,
  isValidMilestone,
  uncheckedGenerations,
  setMain,
  closeMilestone,
} from "../../core/milestone.js";

const ACTIONS = ["list", "main", "close"] as const;

export async function execute(action: string | undefined, slug?: string): Promise<void> {
  const paths = createPaths(process.cwd());
  const effective = action ?? "list";

  if (effective === "list") {
    const all = await listMilestones(paths.visionMilestones);
    const open = all.filter((m) => m.status === "open");
    const completed = all.filter((m) => m.status === "completed");
    const focus = mainMilestone(all);

    const lines: string[] = [];
    if (all.length === 0) {
      lines.push("No milestones. Create one with: reap make milestone --title \"<t>\" --goal \"<vision goal>\"");
    } else {
      lines.push(`Open (${open.length}):`);
      for (const m of open) {
        const marks = [
          m.main ? "main" : null,
          isValidMilestone(m) ? null : "boundary incomplete — offers no candidates",
        ].filter(Boolean);
        const suffix = marks.length > 0 ? `  [${marks.join(", ")}]` : "";
        const left = uncheckedGenerations(m).length;
        lines.push(`  ${m.slug} — ${m.title} (${left} generation(s) left)${suffix}`);
      }
      if (completed.length > 0) {
        lines.push(`Completed (${completed.length}):`);
        for (const m of completed) lines.push(`  ${m.slug} — ${m.title}`);
      }
      if (!focus) {
        lines.push("");
        lines.push("No main milestone. Set one with: reap milestone main <slug>");
      }
    }

    emitOutput({
      status: "ok",
      command: "milestone",
      context: {
        action: "list",
        main: focus?.slug ?? null,
        milestones: all.map((m) => ({
          slug: m.slug,
          title: m.title,
          goal: m.goal,
          status: m.status,
          main: m.main,
          valid: isValidMilestone(m),
          unchecked: uncheckedGenerations(m).map((g) => g.text),
        })),
      },
      message: lines.join("\n"),
    });
    return;
  }

  if (effective === "main") {
    if (!slug) emitError("milestone", "Usage: reap milestone main <slug>");
    const goalsContent = (await readTextFile(paths.visionGoals)) ?? "";
    const result = await setMain(paths.visionMilestones, slug!, goalIdentifiers(goalsContent));
    if (result.status === "error") emitError("milestone", result.reason ?? "Could not set main");

    emitOutput({
      status: "ok",
      command: "milestone",
      context: { action: "main", slug, previousMain: result.previousMain ?? null },
      message: result.previousMain
        ? `Main milestone is now '${slug}' (was '${result.previousMain}').`
        : `Main milestone is now '${slug}'.`,
    });
    return;
  }

  if (effective === "close") {
    if (!slug) emitError("milestone", "Usage: reap milestone close <slug>");
    const result = await closeMilestone(paths.visionMilestones, slug!);
    if (result.status === "error") emitError("milestone", result.reason ?? "Could not close");

    const lines = [`Milestone '${slug}' is completed. The file stays in vision/milestones/.`];
    if (result.uncheckedCount && result.uncheckedCount > 0) {
      lines.push(`${result.uncheckedCount} generation(s) were still unchecked — that is allowed; the exit criteria decide, not the checklist.`);
    }
    if (result.wasMain) {
      lines.push("It was the main milestone, so there is no focus now. Choose the next one with: reap milestone main <slug>");
    }

    emitOutput({
      status: "ok",
      command: "milestone",
      context: {
        action: "close",
        slug,
        wasMain: result.wasMain ?? false,
        uncheckedCount: result.uncheckedCount ?? 0,
      },
      message: lines.join("\n"),
    });
    return;
  }

  emitError("milestone", `Unknown action '${effective}'. Available: ${ACTIONS.join(", ")}`);
}
