---
name: rebuild-scratch-harness-before-concluding
description: In a scratch copy used for negative tests, rebuild after every source mutation and diff the copy's sources against the real repo before reporting any finding
metadata:
  type: feedback
---

When running negative tests in a copied working tree, `npm run build` after
*every* source mutation and restoration, and diff the copy's changed files
against the real repository before drawing any conclusion from a run.

**Why:** REAP's e2e helpers execute `dist/cli/index.js`, not `src/`. During
gen-089 round 3 I restored `src/indexer/scanner.ts` after a negative run but did
not rebuild, then reproduced a "ghost node survives a rename" divergence and was
minutes from reporting it as a blocker. It was my own stale bundle — the
`--no-renames` negative was still compiled in. A library-level repro of the same
scenario passed, which is what exposed the mistake.

**How to apply:** before writing down any newly discovered divergence, re-run it
once from the library API (bun, importing `src/`) as well as through the CLI
bundle. If the two disagree, suspect the build, not the product. Restoring a
file is a mutation too.

Related: [[negative-test-discrimination]]
