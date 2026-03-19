---
description: "REAP Merge Mate — Resolve genome conflicts through mating"
---

# Merge Mate (Genome Mating)

Resolve genome conflicts identified in the detect stage. The genome must be fully finalized before source merge.

## Gate
- Verify current generation is type: merge and stage: mate
- Verify `01-detect.md` exists

## Steps

1. Read conflicts from `01-detect.md`
2. For each WRITE-WRITE conflict:
   - Show both versions to the human
   - Ask: keep A, keep B, or merge manually
3. For each CROSS-FILE conflict:
   - Show the changes and ask if they are logically compatible
4. Apply the resolved genome to `.reap/genome/`
5. Record all decisions in `02-mate.md`
6. Proceed with `/reap.next`

## Escalation
- If conflicts are complex or ambiguous, STOP and ask the human
- Never auto-resolve WRITE-WRITE conflicts
