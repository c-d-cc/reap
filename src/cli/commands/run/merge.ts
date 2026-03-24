import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { verifyNonce, setNonce, verifyArtifact, performMergeTransition } from "../../../core/stage-transition.js";
import { copyArtifactTemplate } from "../../../core/template.js";
import { readTextFile } from "../../../core/fs.js";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("merge", "No active generation.");
  if (state!.type !== "merge") emitError("merge", `Generation type is '${state!.type}', not 'merge'.`);
  if (state!.stage !== "merge") emitError("merge", `Current stage is '${state!.stage}', not 'merge'.`);

  const s = state!;

  if (!phase || phase === "work") {
    verifyNonce("merge", s, "merge", "entry");
    await copyArtifactTemplate("merge", paths.artifact, true);

    // Read mate artifact for resolved genome decisions
    const mateArtifact = await readTextFile(paths.artifact("02-mate.md"));

    setNonce(s, "merge", "complete");
    await gm.save(s);

    emitOutput({
      status: "prompt",
      command: "merge",
      phase: "work",
      completed: ["gate", "context-load"],
      context: {
        id: s.id,
        parentA: s.parents[0],
        parentB: s.parents[1],
        commonAncestor: s.commonAncestor,
        mateArtifactPreview: mateArtifact?.slice(0, 2000),
      },
      prompt: [
        "## Merge Stage — Source Merge",
        "",
        `Merging: ${s.parents[0]} + ${s.parents[1]}`,
        s.commonAncestor ? `Common Ancestor: ${s.commonAncestor}` : "",
        "",
        "### Instructions",
        "1. Review 02-mate.md for resolved genome decisions",
        "2. Execute `git merge --no-commit <target-branch>` (if applicable)",
        "3. Resolve source code conflicts using Mate decisions as guide:",
        "   - Genome-aligned conflicts: follow the merged genome",
        "   - Logic conflicts: resolve with minimal changes",
        "   - Style conflicts: follow application.md conventions",
        "4. Do NOT commit — wait for reconcile + validation",
        "5. Write 03-merge.md with: source conflict list, resolution for each, files changed",
        "",
        "When done: reap run merge --phase complete",
      ].filter(Boolean).join("\n"),
      nextCommand: "reap run merge --phase complete",
    });
  }

  if (phase === "complete") {
    verifyNonce("merge", s, "merge", "complete");
    await verifyArtifact("merge", paths.artifact, "merge", true);

    setNonce(s, "reconcile", "entry");
    await gm.save(s);

    const next = await performMergeTransition(s, gm, paths);

    emitOutput({
      status: "ok",
      command: "merge",
      phase: "complete",
      completed: ["gate", "artifact-verify", "auto-transition"],
      context: { id: s.id, nextStage: next },
      message: `Merge complete. Advanced to ${next}. Run: reap run ${next}`,
      nextCommand: `reap run ${next}`,
    });
  }
}
