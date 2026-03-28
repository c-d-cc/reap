import type { ReapPaths } from "../../../core/paths.js";
import { GenerationManager } from "../../../core/generation.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { verifyTransition, setTransitionNonces, prepareStageEntry, performTransition, performMergeTransition, verifyArtifact } from "../../../core/stage-transition.js";
import { copyArtifactTemplate } from "../../../core/template.js";
import { checkArtifactsFilled } from "../../../core/artifact-check.js";

export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("validation", "No active generation.");
  if (state!.stage !== "validation") emitError("validation", `Current stage is '${state!.stage}', not 'validation'.`);

  const isMerge = state!.type === "merge";

  const s = state!;

  if (!phase || phase === "work") {
    verifyTransition("validation", s, "validation:entry");
    await copyArtifactTemplate("validation", paths.artifact, isMerge);

    // Check if previous stage artifacts have been filled
    const artifactCheck = await checkArtifactsFilled(paths.artifact, isMerge);

    setTransitionNonces(s, "validation:entry");
    await gm.save(s);

    if (artifactCheck.unfilled.length > 0) {
      const unfilledList = artifactCheck.unfilled
        .map((f) => `- ${f} (template placeholder만 존재)`)
        .join("\n");

      emitOutput({
        status: "artifact-incomplete",
        command: "validation",
        phase: "work",
        completed: ["gate", "artifact-check"],
        context: {
          id: s.id,
          goal: s.goal,
          type: s.type,
          artifactPath: paths.artifact(isMerge ? "05-validation.md" : "04-validation.md"),
          unfilledArtifacts: artifactCheck.unfilled,
        },
        prompt: [
          "## Artifact Verification — FAILED",
          "",
          "다음 artifact가 미작성되었습니다:",
          unfilledList,
          "",
          "이 generation에서 수행한 작업을 바탕으로 위 artifact를 채우세요.",
          "이것은 validation 단계의 보충 작업이므로 artifact 수정이 허용됩니다.",
          "보충 완료 후 다시 `reap run validation`을 실행하세요.",
        ].join("\n"),
        nextCommand: "reap run validation",
      });
      return;
    }

    emitOutput({
      status: "prompt",
      command: "validation",
      phase: "work",
      completed: ["gate", "artifact-check"],
      context: {
        id: s.id,
        goal: s.goal,
        type: s.type,
        artifactPath: paths.artifact(isMerge ? "05-validation.md" : "04-validation.md"),
      },
      prompt: [
        "## Validation Stage",
        "",
        "### HARD-GATE:",
        "- Do NOT declare 'pass' without running the validation commands.",
        "- Do NOT reuse results from a previous run — execute them FRESH.",
        "- 'It will probably pass' is NOT validation.",
        "",
        "### Steps:",
        "1. **TypeCheck**: Run `npm run typecheck` (or project's typecheck command). Record result.",
        "2. **Build**: Run `npm run build` (or project's build command). Record result.",
        "3. **Tests**: Run ALL test commands the project has (e.g., e2e scripts). Record each result.",
        "4. **Completion Criteria**: Verify EACH criterion from 02-planning.md one by one.",
        "5. **Minor Fix** (trivial issues only, under 5 minutes): Fix and re-run the failed command.",
        "6. **Verdict**: Determine pass / partial / fail.",
        "",
        "### Red Flags (sycophancy prevention):",
        "- 'It will probably pass' → Run it.",
        "- 'It passed before' → Run it again.",
        "- 'It\\'s trivial, no need to test' → Test it anyway.",
        "",
        "### Verdict Criteria:",
        "- **pass**: All checks pass, all completion criteria met.",
        "- **partial**: Minor issues remain but core functionality works. Document what's incomplete.",
        "- **fail**: Critical failures. Must regress to implementation.",
        "",
        `### Artifact: Write \`.reap/life/${isMerge ? "05" : "04"}-validation.md\` progressively (after each command).`,
        "",
        "If pass/partial: reap run validation --phase complete",
        "If fail: reap run back to regress",
      ].join("\n"),
      nextCommand: "reap run validation --phase complete",
    });
  }

  if (phase === "complete") {
    verifyTransition("validation", s, "validation:complete");
    await verifyArtifact("validation", paths.artifact, "validation", isMerge);

    prepareStageEntry(s, "completion:entry");
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
