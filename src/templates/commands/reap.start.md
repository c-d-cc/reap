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
3. Generate the next generation ID (existing count + 1, in `gen-XXX-{hash}` format where `{hash}` is a short content hash)
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
8. Scan `.reap/hooks/` for files matching `onGenerationStart.*`
   - For each matched file (sorted by `order` from frontmatter, then alphabetically):
     1. Read the frontmatter (`condition`, `order`)
     2. Evaluate `condition` by running `.reap/hooks/conditions/{condition}.sh` (exit 0 = met, non-zero = skip):
        - If `condition` is absent: treat as `always`
        - If the condition script doesn't exist: warn and skip the hook
        - Default conditions: `always`, `has-code-changes`, `version-bumped`
        - Users can add custom conditions by placing scripts in `.reap/hooks/conditions/`
     3. Execute based on file extension:
        - `.md`: read the file content (after frontmatter) as AI prompt and follow the instructions
        - `.sh`: run as shell script in the project root directory

## Completion
- "Generation gen-XXX-{hash} started. Proceed with `/reap.objective` to define the goal, or `/reap.evolve` to run the full lifecycle."
