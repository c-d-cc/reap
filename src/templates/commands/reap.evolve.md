---
description: "REAP Evolve — Run the full lifecycle for a Generation"
---

# Evolve (Full Lifecycle)

Run the entire Generation lifecycle from start to finish, interactively with the human.

<HARD-GATE>
NEVER modify `current.yml` directly to change the stage. ALWAYS use `/reap.next` to advance and `/reap.back` to regress.
Direct modification skips artifact creation and breaks the lifecycle. This is non-negotiable.
</HARD-GATE>

## Gate (Preconditions)
- Read `.reap/life/current.yml`
- If no active Generation exists: run `/reap.start` first to create one
- If an active Generation exists: resume from the current stage

## Autonomous Override
When `/reap.evolve` calls each stage command, the following overrides apply:
- **Skip routine human confirmations**: Do NOT pause to show artifacts and ask for approval at the end of each stage. Proceed autonomously.
- **Skip environment/genome interactive setup questions**: Use existing data, fill in what you can, skip what's empty.
- **STOP only when genuinely blocked**: ambiguous goal with multiple valid interpretations, uncertain technical decision with significant trade-offs, conflicts in the genome, or unexpected errors.
- **Escalation sections still apply**: If a stage's Escalation rules trigger, STOP and ask.
- This override does NOT apply when stages are invoked standalone (e.g., user runs `/reap.objective` directly).

## Lifecycle Loop

Execute the following loop until the generation is complete:

1. Read `current.yml` to determine the current stage
2. Execute the corresponding stage command:
   - `objective` → `/reap.objective`
   - `planning` → `/reap.planning`
   - `implementation` → `/reap.implementation`
   - `validation` → `/reap.validation`
   - `completion` → `/reap.completion`
3. When the stage command completes, run `/reap.next` to advance
4. If `/reap.next` archives the generation (from completion), the loop ends
5. Otherwise, return to step 1

## Handling Issues
- If validation fails: `/reap.back` to return to implementation (or earlier), then resume the loop
- If the human wants to pause: stop the loop, the generation state is preserved in `current.yml`
- If the human wants to skip a stage: advance with `/reap.next` without running the stage command

## Completion
- "Generation [id] completed. All artifacts archived to lineage."
