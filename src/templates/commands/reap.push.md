---
description: "REAP Push — Validate REAP state and push current branch"
---

# Push

Validate the current REAP state and push the current branch to the remote.

## Steps

1. Read `.reap/life/current.yml`
2. If an active generation exists and stage is not `completion`:
   - Warn: "Generation {id} is in progress (stage: {stage}). Complete it before pushing."
   - Ask the user: "Push anyway? (yes/no)"
   - If no: STOP
3. Get current branch: `git rev-parse --abbrev-ref HEAD`
4. Run `git push origin {branch}`
5. Report: "Pushed {branch} to origin."
