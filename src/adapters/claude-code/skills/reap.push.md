---
description: "REAP Push — Validate state and push to remote"
---

# reap.push

Push the current project to remote after validating state.

## Prerequisites
- No active generation (current.yml must not exist)
- Must be inside a git repository

## Usage
```bash
reap run push
```

## Behavior
1. Checks that no active generation exists — if one does, the push is blocked
2. Verifies the directory is a git repository
3. Runs `git push` to the configured remote

## When to Use
- After completing a generation (completion --phase commit already auto-commits)
- When ready to share changes with the remote repository
- Never during an active generation — complete or abort it first
