---
description: "REAP Merge Validation — Run tests, type check, and build"
---

# Merge Validation

Run all validation commands to verify the merged code works correctly. Same as normal generation validation.

## Gate
- Verify current generation is type: merge and stage: validation
- Verify `04-sync.md` exists

## Steps

1. Read validation commands from `.reap/genome/constraints.md`
2. Execute all commands in order:
   - Tests (`bun test`)
   - Type check (`bunx tsc --noEmit`)
   - Build (`npm run build`)
3. Record results in `05-validation.md`
4. If all pass: proceed with `/reap.next`
5. If any fail:
   - Analyze the failure
   - `/reap.back merge` to fix source issues
   - Or `/reap.back mate` if the genome needs adjustment
