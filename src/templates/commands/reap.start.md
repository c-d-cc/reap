---
description: "REAP Start — Start a new Generation"
---

# Start a New Generation

## Gate (Preconditions)
- Read `.reap/life/current.yml`
- If an active Generation exists: ERROR — "Generation [id] is in progress (stage: [stage]). Complete it before starting a new generation." **STOP**

## Steps

1. Ask the human for the goal of this generation
2. Count existing generations in `.reap/lineage/` to determine the genomeVersion
3. Generate the next generation ID (existing count + 1, in `gen-XXX` format)
4. Write the following to `current.yml`:
   ```yaml
   id: gen-XXX
   goal: [goal provided by the human]
   stage: objective
   genomeVersion: [generation count + 1]
   startedAt: [current ISO 8601 timestamp]
   timeline:
     - stage: objective
       at: [current ISO 8601 timestamp]
   ```
5. Immediately create `.reap/life/01-objective.md` from the artifact template with the Goal section filled in

### Hook Execution
6. Read `.reap/config.yml` — if `hooks.onGenerationStart` is defined, execute each command in order

## Completion
- "Generation gen-XXX started. Proceed with `/reap.objective` to define the goal, or `/reap.evolve` to run the full lifecycle."
