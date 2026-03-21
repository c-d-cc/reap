---
description: "REAP Start — Start a new Generation"
---

# Start a New Generation

## Gate (Preconditions)
- Read `.reap/life/current.yml`
- If an active Generation exists: ERROR — "Generation [id] is in progress (stage: [stage]). Complete it before starting a new generation." **STOP**

## Steps

### 0. Backlog Scan
- Read all files in `.reap/life/backlog/`
- If backlog items exist:
  - Present the list with title and priority for each item
  - Ask: "Would you like to select one of these, or enter a new goal?"
  - If the human selects a backlog item: **note the selection** (do NOT mark consumed yet — ID is not generated)
  - If the human wants a new goal: proceed to Step 1
- If no backlog items exist: proceed to Step 1

1. Ask the human for the goal of this generation (or use selected backlog item's goal)
2. Count existing generations in `.reap/lineage/` to determine the genomeVersion
3. Generate the next generation ID:
   - Format: `gen-{NNN}-{hash}` (e.g. `gen-042-a3f8c2`)
   - `{NNN}`: zero-padded 3-digit sequence (existing count + 1)
   - `{hash}`: 6-character hex (0-9a-f only) — first 6 chars of `sha256(JSON.stringify({parents, goal, genomeHash, machineId, startedAt}))`
   - Generate: `node -e "const c=require('crypto'),o=require('os');console.log(c.createHash('sha256').update(JSON.stringify({parents:[],goal:'YOUR_GOAL',genomeHash:'',machineId:o.hostname(),startedAt:new Date().toISOString()})).digest('hex').slice(0,6))"`
4. **If a backlog item was selected in Step 0**: now mark it as `status: consumed` and add `consumedBy: gen-XXX-{hash}` (using the ID just generated)
6. Write the following to `current.yml`:
   ```yaml
   id: gen-XXX-{hash}
   goal: [goal provided by the human]
   stage: objective
   genomeVersion: [generation count + 1]
   startedAt: [current ISO 8601 timestamp]
   timeline:
     - stage: objective
       at: [current ISO 8601 timestamp]
   ```
7. Immediately create `.reap/life/01-objective.md` from the artifact template with the Goal section filled in

### Hook Execution (Generation Start)
8. Execute hooks for event `onLifeStarted` following the Hook System protocol:
   - Scan `.reap/hooks/` for `onLifeStarted.*` files
   - Sort by frontmatter `order`, then alphabetically
   - Evaluate `condition`, execute `.md` (AI prompt) or `.sh` (shell script)
   - All hooks run BEFORE any commit (hook outputs included in the same commit)
   - **Order**: This runs AFTER backlog consumed marking (Step 4) and current.yml creation (Step 6)

## Completion
- "Generation gen-XXX-{hash} started. Proceed with `/reap.objective` to define the goal, or `/reap.evolve` to run the full lifecycle."
