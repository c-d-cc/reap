# Memory Index

## Feedback
- [No scope expansion in evaluation](feedback_no_scope_expansion.md) — never propose new backlog/gates/scripts; adjacent gaps get one out-of-scope line
- [Negative-test discrimination](feedback_negative_test_discrimination.md) — check which new assertions can actually fail; cross-check reported negative-run counts
- [Rebuild the scratch harness](feedback_rebuild_scratch_harness.md) — e2e runs dist/, not src/: rebuild after every mutation, cross-check findings against a library-level repro
