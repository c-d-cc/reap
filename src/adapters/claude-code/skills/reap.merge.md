---
description: "REAP Merge — Run merge lifecycle for parallel branches"
---

# Merge Lifecycle

The merge lifecycle is the process of merging two diverged branches.
Stages: detect → mate → merge → reconcile → validation → completion

## Usage

Perform the appropriate action based on the user's request.

### Start a Merge

Start a new merge generation. Two branch names are required.

```bash
reap run start --type merge --parents "<branchA>,<branchB>" "<merge goal>"
```

After starting, run `reap run detect` to execute the first stage.

### Execute Individual Stages

Execute the next stage of the currently active merge generation.

```bash
reap run detect              # Stage 1: branch analysis, common ancestor, genome diff
reap run mate                # Stage 2: merge genome files
reap run merge               # Stage 3: source code merge (git merge --no-commit)
reap run reconcile           # Stage 4: environment regeneration, genome-source consistency check
reap run validation          # Stage 5: run tests
reap run completion --phase reflect   # Stage 6: retrospective
reap run completion --phase fitness   # fitness evaluation
reap run completion --phase adapt     # adaptation
reap run completion --phase commit    # archive
```

Complete each stage with `reap run <stage> --phase complete` after performing the work.

### Merge Evolve (Auto-Delegation)

Delegate the entire merge lifecycle to a subagent.

```bash
reap run evolve
```

### Check Status

Check the status of the current merge generation.

```bash
reap status
```

### Regress to Previous Stage

Go back to the previous stage if there are issues.

```bash
reap run back
```

## Execution Rules

1. Follow each stage's stdout output exactly.
2. Write the artifact first, then run `--phase complete`.
3. Do NOT modify `current.yml` directly.
4. invariants.md conflicts must be escalated to the human for judgment.
5. Genome modifications are only allowed during the mate stage.
