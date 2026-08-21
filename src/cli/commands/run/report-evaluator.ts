import type { ReapPaths } from "../../../core/paths.js";
import type { EvaluatorConcern } from "../../../types/index.js";
import { GenerationManager } from "../../../core/generation.js";
import { emitOutput, emitError } from "../../../core/output.js";
import { recordEvaluatorRun } from "../../../core/evaluator-run.js";

/**
 * `run <validation|completion> --phase report-evaluator` (gen-067, reworked gen-100).
 *
 * A side-channel state write: outside the nonce-protected transition graph,
 * advancing nothing. It has one owner and two callers — `validation.ts` and
 * `completion.ts` both delegate here — because the fitness evaluator runs
 * during `completion` and a second copy of this logic would be a second set of
 * accepted severities to keep in step (genome: prefer sharing over marking).
 *
 * gen-090 L7 recorded the gap this closes: `EvaluatorConcern.stage` has always
 * been `"validation" | "fitness"`, and until now nothing could produce the
 * second.
 */
export async function execute(paths: ReapPaths, extra?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();

  if (!state) emitError("validation", "No active generation.");
  const s = state!;

  // Callable from the two stages an evaluator is invoked for, and no others —
  // a verdict recorded during learning would name a stage nothing ran in.
  if (s.stage !== "validation" && s.stage !== "completion") {
    emitError(
      "validation",
      `report-evaluator is callable during validation or completion, not '${s.stage}'.`,
    );
  }

  // The envelope names the command the caller actually typed. Reporting
  // `validation` for a `reap run completion --phase report-evaluator` would
  // make the output disagree with the invocation — and this handler exists
  // precisely because both spellings are real.
  const command = s.stage === "completion" ? "completion" : "validation";

  // The stage this verdict is about. `completion` means the fitness
  // evaluator — the other half of EvaluatorConcern.stage, which had no
  // producer before gen-100.
  const reportStage: "validation" | "fitness" = s.stage === "completion" ? "fitness" : "validation";

  let severity: string | undefined;
  let summary: string | undefined;
  if (extra) {
    try {
      const parsed = JSON.parse(extra) as { severity?: string; summary?: string };
      severity = parsed.severity;
      summary = parsed.summary;
    } catch {
      emitError("validation", "report-evaluator: failed to parse options. Expected --severity and --summary.");
    }
  }

  if (!severity) {
    emitError("validation", "report-evaluator requires --severity <high|low|none|unreachable>.");
  }

  const sev = severity!.toLowerCase();

  // `none` and `unreachable` both mean "no concern to record", and before
  // gen-100 that made them indistinguishable from a generation nobody
  // reviewed: `none` was an explicit no-op that touched nothing. Both now
  // write an EvaluatorRun, because "reviewed and clean" and "no verdict
  // arrived" are different facts and the fitness reader needs to tell them
  // apart. Neither adds an EvaluatorConcern — an absent review is not a
  // finding about the code, and routing it through the concern list would
  // make it abort cruise, which is the gate this must not become.
  if (sev === "none" || sev === "unreachable") {
    if (sev === "unreachable" && (!summary || summary.trim().length === 0)) {
      emitError("validation", "report-evaluator --severity unreachable requires --summary \"<what happened>\".");
    }
    const outcome = sev === "none" ? "clean" : "unreachable";
    const run = recordEvaluatorRun(
      s,
      reportStage,
      outcome,
      sev === "none" ? "evaluator reviewed this stage and raised no concern" : summary,
    );
    await gm.save(s);

    emitOutput({
      status: "ok",
      command,
      phase: "report-evaluator",
      completed: ["gate", "run-recorded"],
      context: {
        id: s.id,
        severity: sev,
        stage: reportStage,
        outcome: run.outcome,
        totalRuns: s.evaluatorRuns!.length,
      },
      message:
        outcome === "clean"
          ? `Evaluator reported no concern (${reportStage}) — recorded as a completed review.`
          : `Evaluator verdict never arrived (${reportStage}) — recorded so the silence is visible.`,
    });
    return;
  }

  if (sev !== "high" && sev !== "low") {
    emitError("validation", `report-evaluator: invalid severity '${severity}'. Use high, low, none, or unreachable.`);
  }

  if (!summary || summary.trim().length === 0) {
    emitError("validation", "report-evaluator requires --summary \"<one-line description>\".");
  }

  const concern: EvaluatorConcern = {
    stage: reportStage,
    severity: sev as "high" | "low",
    summary: summary!.trim(),
    recordedAt: new Date().toISOString(),
  };

  if (!s.evaluatorConcerns) s.evaluatorConcerns = [];
  s.evaluatorConcerns.push(concern);
  recordEvaluatorRun(s, reportStage, "concern", concern.summary);
  await gm.save(s);

  emitOutput({
    status: "ok",
    command,
    phase: "report-evaluator",
    completed: ["gate", "concern-recorded"],
    context: {
      id: s.id,
      severity: concern.severity,
      stage: reportStage,
      outcome: "concern",
      summary: concern.summary,
      total: s.evaluatorConcerns.length,
    },
    message: `Evaluator concern recorded (severity=${concern.severity}, stage=${reportStage}). Total: ${s.evaluatorConcerns.length}.`,
  });
  return;
}
