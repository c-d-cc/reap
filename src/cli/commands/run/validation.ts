import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { verifyNonce, setNonce, performTransition, performMergeTransition, verifyArtifact } from "../../../core/stage-transition.js";
import { copyArtifactTemplate } from "../../../core/template.js";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("validation", "No active generation.");
  if (state!.stage !== "validation") emitError("validation", `Current stage is '${state!.stage}', not 'validation'.`);

  const isMerge = state!.type === "merge";

  const s = state!;

  if (!phase || phase === "work") {
    verifyNonce("validation", s, "validation", "entry");
    await copyArtifactTemplate("validation", paths.artifact, isMerge);

    setNonce(s, "validation", "complete");
    await gm.save(s);

    emitOutput({
      status: "prompt",
      command: "validation",
      phase: "work",
      completed: ["gate"],
      context: {
        id: s.id,
        goal: s.goal,
        type: s.type,
        artifactPath: paths.artifact(isMerge ? "05-validation.md" : "04-validation.md"),
      },
      prompt: [
        "## Validation Stage",
        "",
        "Validate against the completion criteria from 02-planning.md.",
        "",
        "### Verification Items:",
        "1. **TypeCheck**: tsc --noEmit (or the project's typecheck command)",
        "2. **Build**: npm run build (or the project's build command)",
        "3. **Tests**: Run tests if the project has them",
        "4. **Completion Criteria**: Verify each criterion from 02-planning.md one by one",
        "",
        `### Artifact: Write \`.reap/life/${isMerge ? "05" : "04"}-validation.md\` progressively (after each command).`,
        "",
        "### Write validation artifact:",
        "- Result: pass / partial / fail",
        "- Each verification item's result and details",
        "- Issues found (if any)",
        "",
        "If pass/partial: reap run validation --phase complete",
        "If fail: reap run back to regress",
      ].join("\n"),
      nextCommand: "reap run validation --phase complete",
    });
  }

  if (phase === "complete") {
    verifyNonce("validation", s, "validation", "complete");
    await verifyArtifact("validation", paths.artifact, "validation", isMerge);

    setNonce(s, "completion", "entry");
    await gm.save(s);

    const next = isMerge
      ? await performMergeTransition(s, gm, paths)
      : await performTransition(s, gm, paths);

    emitOutput({
      status: "ok",
      command: "validation",
      phase: "complete",
      completed: ["gate", "validation-work", "artifact-verify", "auto-transition"],
      context: { id: s.id, nextStage: next },
      message: `Validation complete. Auto-advanced to ${next}. Run: reap run ${next}`,
      nextCommand: `reap run ${next}`,
    });
  }
}
