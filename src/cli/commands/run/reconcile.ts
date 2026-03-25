import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { verifyNonce, setNonce, verifyArtifact, performMergeTransition } from "../../../core/stage-transition.js";
import { copyArtifactTemplate } from "../../../core/template.js";
import { readTextFile } from "../../../core/fs.js";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("reconcile", "No active generation.");
  if (state!.type !== "merge") emitError("reconcile", `Generation type is '${state!.type}', not 'merge'.`);
  if (state!.stage !== "reconcile") emitError("reconcile", `Current stage is '${state!.stage}', not 'reconcile'.`);

  const s = state!;

  if (!phase || phase === "work") {
    verifyNonce("reconcile", s, "reconcile", "entry");
    await copyArtifactTemplate("reconcile", paths.artifact, true);

    // Read merge artifact for context
    const mergeArtifact = await readTextFile(paths.artifact("03-merge.md"));

    // Read current genome for comparison
    const application = await readTextFile(paths.application);
    const evolution = await readTextFile(paths.evolution);

    // Read current environment for regen reference
    const envSummary = await readTextFile(paths.environmentSummary);
    const sourceMap = await readTextFile(paths.sourceMap);

    setNonce(s, "reconcile", "complete");
    await gm.save(s);

    emitOutput({
      status: "prompt",
      command: "reconcile",
      phase: "work",
      completed: ["gate", "context-load"],
      context: {
        id: s.id,
        artifactPath: paths.artifact("04-reconcile.md"),
        mergeArtifactPreview: mergeArtifact?.slice(0, 2000),
        applicationPreview: application?.slice(0, 1500),
        evolutionPreview: evolution?.slice(0, 1500),
        envSummaryPreview: envSummary?.slice(0, 1500),
        sourceMapPreview: sourceMap?.slice(0, 1500),
      },
      prompt: [
        "## Reconcile Stage — Environment Regen + Genome-Source Consistency",
        "",
        "### Instructions",
        "1. **Environment Regeneration**:",
        "   - Regenerate environment/source-map.md based on merged source",
        "   - Update environment/summary.md if project structure changed",
        "",
        "2. **Genome-Source Consistency Check**:",
        "   - Compare merged genome (application.md, evolution.md) with actual source",
        "   - Verify conventions, architecture rules, constraints are followed",
        "   - Flag any inconsistencies",
        "",
        "3. **Resolution**:",
        "   - Minor inconsistencies: fix source to match genome",
        "   - Major inconsistencies: flag for human judgment",
        "   - If unresolvable: use `reap run back` to regress to merge or mate",
        "",
        "4. Write 04-reconcile.md with:",
        "   - Environment regen summary",
        "   - Genome-source comparison results",
        "   - Inconsistencies found and resolutions",
        "",
        "### Artifact: Write `.reap/life/04-reconcile.md`",
        "",
        "When done: reap run reconcile --phase complete",
      ].join("\n"),
      nextCommand: "reap run reconcile --phase complete",
    });
  }

  if (phase === "complete") {
    verifyNonce("reconcile", s, "reconcile", "complete");
    await verifyArtifact("reconcile", paths.artifact, "reconcile", true);

    setNonce(s, "validation", "entry");
    await gm.save(s);

    const next = await performMergeTransition(s, gm, paths);

    emitOutput({
      status: "ok",
      command: "reconcile",
      phase: "complete",
      completed: ["gate", "artifact-verify", "auto-transition"],
      context: { id: s.id, nextStage: next },
      message: `Reconcile complete. Advanced to ${next}. Run: reap run ${next}`,
      nextCommand: `reap run ${next}`,
    });
  }
}
