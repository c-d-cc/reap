# Memory Index

## Feedback
- [No scope expansion in evaluation](feedback_no_scope_expansion.md) — never propose new backlog/gates/scripts; adjacent gaps get one out-of-scope line
- [Negative-test discrimination](feedback_negative_test_discrimination.md) — check which new assertions can actually fail; cross-check reported negative-run counts
- [Rebuild the scratch harness](feedback_rebuild_scratch_harness.md) — e2e runs dist/, not src/: rebuild after every mutation, cross-check findings against a library-level repro
- [Inherited worktree review](feedback_inherited_worktree_review.md) — read `git diff --cached` yourself; staged deletions hide from both the builder's diff and residue greps
- [Re-run claims after repairs](feedback_rerun_claims_after_repairs.md) — a later round's repair can falsify an earlier section's verified command; re-run it yourself
