---
description: "REAP Merge Sync — Verify genome-source consistency"
---

# Merge Sync (Genome-Source Consistency)

Verify that the merged source code is consistent with the finalized genome. This is NOT validation (tests/build) — this is a semantic check that the code matches the genome's rules and decisions.

## Gate
- Verify current generation is type: merge and stage: sync
- Verify `03-merge.md` exists

## Steps

1. Read the finalized genome (`.reap/genome/`)
2. Compare genome rules against the merged source code:
   - **conventions.md**: Are naming conventions, code style, and patterns followed?
   - **constraints.md**: Are tech stack choices and constraints respected?
   - **principles.md**: Are architecture decisions reflected in the code?
   - **domain/**: Are business rules implemented correctly?
   - **source-map.md**: Do documented components match actual files?
3. For each inconsistency found:
   - **STOP and present to the human**
   - Ask: fix the source, update the genome, or accept as-is with rationale
   - Record the decision in `04-sync.md`
4. If no inconsistencies: record "All consistent" in `04-sync.md`
5. Proceed with `/reap.next`

## Escalation
- **Every inconsistency requires user confirmation** — do NOT auto-resolve
- If fixing requires significant code changes, consider `/reap.back merge`
- If fixing requires genome changes, consider `/reap.back mate`
