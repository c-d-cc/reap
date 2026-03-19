---
description: "REAP Merge Genome Resolve — Resolve genome conflicts before source merge"
---

# Merge Genome Resolve

Resolve genome conflicts identified in the detect stage. Genome must be finalized before source merge.

## Gate
- Verify current generation is type: merge and stage: genome-resolve
- Verify `01-detect.md` exists

## Steps

1. Read conflicts from `01-detect.md`
2. For each WRITE-WRITE conflict:
   - Show both versions to the human
   - Ask: keep A, keep B, or merge manually
3. For each CROSS-FILE conflict:
   - Show the changes and ask if they are logically compatible
4. Apply the resolved genome to `.reap/genome/`
5. Record all decisions in `02-genome-resolve.md`
6. Proceed with `/reap.next`

## Escalation
- If conflicts are complex or ambiguous, STOP and ask the human
