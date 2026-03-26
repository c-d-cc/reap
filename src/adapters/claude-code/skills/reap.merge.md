---
description: "REAP Merge — Run merge lifecycle for parallel branches"
---

Start a merge generation and run the lifecycle:

```bash
reap run start --type merge --parents "<branchA>,<branchB>" "<merge goal>"
reap run evolve
```

For individual stage execution, use `reap run <stage>` (detect, mate, merge, reconcile, validation, completion).
Follow the stdout instructions from each command exactly.
