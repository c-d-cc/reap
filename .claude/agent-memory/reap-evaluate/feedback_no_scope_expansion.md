---
name: no-scope-expansion-in-evaluation
description: Do not propose new work, gates, scripts, or backlog items when evaluating a generation — surface adjacent gaps as one-line out-of-scope notes only
metadata:
  type: feedback
---

When evaluating a REAP generation, do not propose additional work: no new backlog
items, no new CI gates, no new verification scripts. If an adjacent gap turns up,
name it in a single line and mark it explicitly out of scope.

**Why:** successive generations kept finding adjacent gaps and filing backlogs
until 18 accumulated; the user consolidated eleven into one and deleted eight.
gen-085's fitness feedback named the mechanism directly — *"검증을 강화하는 일
자체가 새 작업을 낳는 순환"*. An evaluator that recommends follow-up work feeds
exactly that loop, and the evaluator's recommendations carry weight because they
come from outside the builder.

**How to apply:** judge the fixes in front of you on their own merits — are they
correct, are they verified, does the evidence prove what it claims. Reserve
"here is something else that is broken" for a single named line. This holds by
default, not only when the invocation prompt repeats it.

Related: [[negative-test-discrimination]]
