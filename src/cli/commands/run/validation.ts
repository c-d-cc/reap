import YAML from "yaml";
import type { ReapPaths } from "../../../core/paths.js";
import type { ReapConfig } from "../../../types/index.js";
import { GenerationManager } from "../../../core/generation.js";
import { readTextFile } from "../../../core/fs.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { verifyTransition, setTransitionNonces, prepareStageEntry, performTransition, performMergeTransition, verifyArtifact } from "../../../core/stage-transition.js";
import { copyArtifactTemplate } from "../../../core/template.js";
import { checkArtifactsFilled } from "../../../core/artifact-check.js";
import { buildEvaluatorPrompt, loadReapKnowledge } from "../../../core/prompt.js";
import { recordEvaluatorSilenceIfUnreported } from "../../../core/evaluator-run.js";
import { execute as executeReportEvaluator } from "./report-evaluator.js";

export async function execute(paths: ReapPaths, phase?: string, extra?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("validation", "No active generation.");
  // gen-100: `report-evaluator` is a side-channel, not a lifecycle step, so it
  // is exempted from the stage guard here and delegated further down — the
  // fitness evaluator runs during `completion`, and ./report-evaluator.ts owns
  // the narrower guard that admits exactly those two stages.
  if (state!.stage !== "validation" && phase !== "report-evaluator") {
    emitError("validation", `Current stage is '${state!.stage}', not 'validation'.`);
  }

  const isMerge = state!.type === "merge";

  const s = state!;

  // ── Sub-phase: report-evaluator (gen-067) ──
  // Side-channel for the builder to persist the reap-evaluate subagent's
  // verdict on the GenerationState. Does NOT advance the lifecycle and does
  // NOT participate in the nonce-protected transition graph — this is an
  // informational write to support cross-stage signalling (validation →
  // fitness cruise abort).
  if (phase === "report-evaluator") {
    await executeReportEvaluator(paths, extra);
    return;
  }

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

    // Base validation prompt (always present, byte-identical regardless of
    // evaluator opt-in — this guarantees the `evaluator: false` regression check).
    const basePromptLines = [
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
    ];

    // Opt-in: when `evaluator: true` is set in `.reap/config.yml`, append an
    // "Evaluator Subagent Invocation" section and surface the evaluator prompt
    // via context. The orchestrator launches `reap-evaluate` as a subagent.
    //
    // Advisor model: the evaluator's assessment surfaces to the user but does
    // NOT override the builder's verdict. If the subagent invocation fails for
    // any reason, the builder continues validation normally.
    const configContent = await readTextFile(paths.config);
    const config = configContent ? (YAML.parse(configContent) as ReapConfig) : null;
    const evaluatorEnabled = config?.evaluator === true;

    const context: Record<string, unknown> = {
      id: s.id,
      goal: s.goal,
      type: s.type,
      artifactPath: paths.artifact(isMerge ? "05-validation.md" : "04-validation.md"),
      evaluator: { enabled: evaluatorEnabled },
    };

    const promptLines = [...basePromptLines];

    if (evaluatorEnabled) {
      const knowledge = await loadReapKnowledge(paths);
      const evaluatorPrompt = buildEvaluatorPrompt(knowledge, paths, s, { stage: "validation" });
      (context.evaluator as { enabled: boolean; prompt?: string }).prompt = evaluatorPrompt;

      promptLines.push("");
      promptLines.push("### Evaluator Subagent Invocation (opt-in via `evaluator: true`)");
      promptLines.push("");
      promptLines.push("Before declaring your verdict, launch an independent reviewer using the Agent tool:");
      promptLines.push("");
      promptLines.push("- subagent_type: `reap-evaluate`");
      promptLines.push("- description: independent validation review");
      promptLines.push("- prompt: the `evaluator.prompt` value from the context above");
      promptLines.push("");
      promptLines.push("**Advisor model** — the evaluator's assessment is a recommendation, not a verdict:");
      promptLines.push("- You (the builder) decide the final pass/partial/fail verdict.");
      promptLines.push("- Surface every evaluator concern to the user in your validation report, even if you disagree.");
      promptLines.push("- If the evaluator escalates a high-impact concern, lean toward `partial` and document the concern in 04-validation.md.");
      promptLines.push("");
      promptLines.push("**Persist the verdict for the fitness phase (gen-067)**:");
      promptLines.push("");
      promptLines.push("After receiving the evaluator's reply, record the outcome on the generation state so the");
      promptLines.push("subsequent fitness phase can act on it (cruise mode auto-abort, evaluator concern surfacing):");
      promptLines.push("");
      promptLines.push("- High-impact escalation:");
      promptLines.push("  `reap run validation --phase report-evaluator --severity high --summary \"<one-line description>\"`");
      promptLines.push("- Low-impact concern (informational):");
      promptLines.push("  `reap run validation --phase report-evaluator --severity low --summary \"<one-line description>\"`");
      promptLines.push("- Clean review (no concern):");
      promptLines.push("  `reap run validation --phase report-evaluator --severity none --summary \"\"`");
      promptLines.push("- **No verdict reached you** (see Fallback below):");
      promptLines.push("  `reap run validation --phase report-evaluator --severity unreachable --summary \"<what happened>\"`");
      promptLines.push("");
      promptLines.push("This call does NOT advance the lifecycle — it only appends to the generation state.");
      promptLines.push("");
      promptLines.push("**Have the evaluator record its own verdict too.** `reap-evaluate` has `Bash`, so add");
      promptLines.push("this line to the prompt you send it:");
      promptLines.push("");
      promptLines.push("> When you have reached your verdict, record it yourself before replying:");
      promptLines.push("> `reap run validation --phase report-evaluator --severity <high|low|none> --summary \"<one line>\"`");
      promptLines.push("");
      promptLines.push("gen-100 measured a `reap-evaluate` subagent that ran correctly, executed every");
      promptLines.push("instruction sent to it, and whose replies never arrived. When the verdict travels");
      promptLines.push("only through the reply, a lost reply loses the review — and gen-099 lost one that way.");
      promptLines.push("");
      promptLines.push("**Fallback** — if no verdict reaches you, for any reason (the Agent tool is absent,");
      promptLines.push("the subagent errors, the reply is malformed, or it simply never answers):");
      promptLines.push("- Tell the user the evaluator produced no verdict, and say which of those you observed.");
      promptLines.push("- Continue normal validation. The evaluator is opt-in advice, not a gate.");
      promptLines.push("- **Record it** — do not leave it silent:");
      promptLines.push("  `reap run validation --phase report-evaluator --severity unreachable --summary \"launched, no reply after N checks\"`");
      promptLines.push("");
      promptLines.push("If you skip that call, REAP records `not-reported` for you at");
      promptLines.push("`validation --phase complete`, so the absence is visible either way — but only your");
      promptLines.push("own entry can say *what happened*.");
    }

    emitOutput({
      status: "prompt",
      command: "validation",
      phase: "work",
      completed: ["gate", "artifact-check"],
      context,
      prompt: promptLines.join("\n"),
      nextCommand: "reap run validation --phase complete",
    });
  }

  if (phase === "complete") {
    verifyTransition("validation", s, "validation:complete");
    await verifyArtifact("validation", paths.artifact, "validation", isMerge);

    // gen-100: the last moment at which "nobody reported anything" is still a
    // fact about *this* stage. REAP cannot observe whether the subagent was
    // launched — the launch happens in the agent, after this process has
    // exited — but it can observe that no verdict ever arrived, and that is the
    // fact worth seeing. Recorded, never enforced: the transition below runs
    // identically either way.
    const completeConfig = await readTextFile(paths.config);
    const completeEvaluatorEnabled =
      (completeConfig ? (YAML.parse(completeConfig) as ReapConfig) : null)?.evaluator === true;
    const silence = recordEvaluatorSilenceIfUnreported(s, "validation", completeEvaluatorEnabled);

    prepareStageEntry(s, "completion:entry");
    await gm.save(s);

    const next = isMerge
      ? await performMergeTransition(s, gm, paths)
      : await performTransition(s, gm, paths);

    emitOutput({
      status: "ok",
      command: "validation",
      phase: "complete",
      completed: [
        "gate", "validation-work", "artifact-verify",
        ...(silence ? ["evaluator-silence-recorded"] : []),
        "auto-transition",
      ],
      context: {
        id: s.id,
        nextStage: next,
        ...(silence ? { evaluatorRun: silence } : {}),
      },
      message:
        `Validation complete. Auto-advanced to ${next}. Run: reap run ${next}` +
        (silence
          ? " — NOTE: evaluator is enabled but no verdict was reported for validation. " +
            "Recorded as 'not-reported'; this generation's adversarial review was the builder's own."
          : ""),
      nextCommand: `reap run ${next}`,
    });
  }
}
