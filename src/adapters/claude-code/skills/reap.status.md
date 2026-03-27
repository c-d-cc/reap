---
description: "REAP Status — Check current generation state"
---

Run `reap status` and interpret the results for the user.

The output JSON contains a `context` object with:
- `project` — project name
- `executionMode` — "supervised" or "cruise"
- `cruiseCount` — cruise mode counter (null if not active)
- `completedGenerations` — number of archived generations
- `genome` — which genome files exist (application, evolution, invariants)
- `generation` — current generation info (id, type, stage, goal) or null if no active generation

Summarize the status clearly. Highlight the current stage and goal if a generation is active.
