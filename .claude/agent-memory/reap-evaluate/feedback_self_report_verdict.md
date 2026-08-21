---
name: self-report-verdict-before-replying
description: Always record the verdict with `reap run <validation|completion> --phase report-evaluator` before composing a reply — the reply channel back to the builder is not guaranteed to arrive
metadata:
  type: feedback
---

Write the verdict to the generation state with the CLI **before** composing any
reply, and call it with `--severity none` even when there is nothing to raise.

**Why:** gen-099 opted into an independent review and the builder received
nothing across three follow-ups. gen-100 measured the cause: the subagent was
spawned, received every message, and executed instructions sent to it within
seconds — only the *agent → caller reply direction* was lost. That generation's
adversarial review ended up being the builder's own, and nothing in
`current.yml` recorded that it had gone unreviewed. The reply is a channel that
can fail silently; the state append cannot.

**How to apply:** `reap run validation --phase report-evaluator --severity
<high|low|none|unreachable> --summary "<one line>"`, once per concern, from
`validation`; the same flags on `completion` during a fitness-stage review. It
is the one `reap run` the evaluator may call — it advances no stage, consumes
no nonce, and decides nothing, so it does not violate the lifecycle
prohibition. An unrecorded clean review is byte-identical to a review that
never happened.

Related: [[no-scope-expansion-in-evaluation]], [[rerun-claims-after-repairs]]
