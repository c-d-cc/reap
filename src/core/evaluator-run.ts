import type { GenerationState, EvaluatorRun } from "../types/index.js";

/**
 * Append one EvaluatorRun to the generation state (gen-100).
 *
 * Shared by `validation` and `completion` rather than marked as a carrier:
 * both need the same *value*, so one owner and an import is what keeps them
 * from drifting (genome application.md — prefer sharing over marking).
 *
 * Mutates and returns `state`; the caller saves.
 */
export function recordEvaluatorRun(
  state: GenerationState,
  stage: EvaluatorRun["stage"],
  outcome: EvaluatorRun["outcome"],
  detail?: string,
): EvaluatorRun {
  const run: EvaluatorRun = {
    stage,
    outcome,
    recordedAt: new Date().toISOString(),
  };
  if (detail && detail.trim().length > 0) run.detail = detail.trim();

  if (!state.evaluatorRuns) state.evaluatorRuns = [];
  state.evaluatorRuns.push(run);
  return run;
}

/**
 * When did the current round of `stage` begin?
 *
 * A stage can be entered more than once: `reap run back` sends validation to
 * implementation and the work comes round again, and every entry appends to
 * `state.timeline`. Without this, a verdict from round 1 answers for round 2 —
 * the second round would be reported as reviewed on the strength of a review
 * that predates the code it is supposed to have looked at. gen-100's own
 * evaluator measured that.
 *
 * `null` means the stage has no timeline entry (the state predates timelines,
 * or the stage has not been reached), in which case every run counts.
 */
function roundStartedAt(state: GenerationState, stage: EvaluatorRun["stage"]): string | null {
  // The fitness evaluator runs inside the completion stage, so that is the
  // entry that bounds its round.
  const lifecycleStage = stage === "fitness" ? "completion" : "validation";
  const entries = (state.timeline ?? []).filter((t) => t.stage === lifecycleStage);
  return entries.length > 0 ? entries[entries.length - 1].at : null;
}

/**
 * Was a verdict reported for the CURRENT round of this stage?
 *
 * Deliberately not "was one ever reported" — see roundStartedAt.
 */
export function hasEvaluatorRun(state: GenerationState, stage: EvaluatorRun["stage"]): boolean {
  const since = roundStartedAt(state, stage);
  return (state.evaluatorRuns ?? []).some(
    (r) => r.stage === stage && (since === null || r.recordedAt >= since),
  );
}

/**
 * The stage-closing hook: when the evaluator is enabled and nothing was
 * reported for `stage`, record that fact.
 *
 * Returns the run it wrote, or `null` when it wrote nothing — which happens in
 * exactly two cases, and they must stay distinct from each other: the evaluator
 * is opted out (`enabled` false), or a verdict already arrived. Callers that
 * only want to *announce* the silence therefore branch on the return value, not
 * on `enabled`.
 *
 * **This never blocks a transition.** The caller records and moves on.
 */
export function recordEvaluatorSilenceIfUnreported(
  state: GenerationState,
  stage: EvaluatorRun["stage"],
  enabled: boolean,
): EvaluatorRun | null {
  if (!enabled) return null;
  if (hasEvaluatorRun(state, stage)) return null;
  return recordEvaluatorRun(
    state,
    stage,
    "not-reported",
    `evaluator: true, but no report-evaluator call was made during ${stage}. ` +
      "The independent review either never ran or its verdict never reached the builder.",
  );
}

/**
 * One-line human-readable rendering, for prompts and CLI messages.
 *
 * The timestamp is here because a generation can review a stage, regress, and
 * redo the work: two entries for one stage are then a history, and without a
 * time the reader cannot tell which round each belongs to.
 */
export function formatEvaluatorRun(run: EvaluatorRun): string {
  return `- [${run.outcome}] (${run.stage}, ${run.recordedAt}) ${run.detail ?? "(no detail)"}`;
}

/** True when the generation went without an independent review at some stage. */
export function hasUnreviewedStage(state: GenerationState): boolean {
  return (state.evaluatorRuns ?? []).some(
    (r) => r.outcome === "unreachable" || r.outcome === "not-reported",
  );
}
