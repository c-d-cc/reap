---
description: "REAP Next — Advance to the next lifecycle stage"
---

# Next Stage

This command is the **ONLY legitimate way** to advance the lifecycle stage. All stage transitions MUST go through this command. Direct modification of `current.yml` is strictly prohibited.

## Gate (Preconditions)
- Read `.reap/life/current.yml`
- If no active Generation: ERROR — "No active Generation. Run `/reap.start` first." **STOP**

## Steps

### Stage Transition
- Stage order (normal): objective → planning → implementation → validation → completion
- Stage order (merge): detect → mate → merge → sync → validation → completion
- Update the `stage` in `current.yml` to the next stage
- Add an entry to `timeline`:
  ```yaml
  - stage: [next stage]
    at: [current ISO 8601]
  ```
- Immediately create the next stage's artifact file from template (empty, ready to fill)

**Note**: Stage-specific hooks (e.g., `onLifeObjected`) are handled by each stage command at its own completion, NOT by this command. Archiving is handled by `reap.completion` (normal) or `reap.merge.completion` (merge).

### Hook Execution (Transition)
After updating `current.yml`, execute the generic transition hook based on generation type:
- If `type` is `merge` (or current stage is a merge stage): execute hooks for event `onMergeTransited`
- Otherwise (normal): execute hooks for event `onLifeTransited`

Scan `.reap/hooks/` for `{event}.*` files, sort by frontmatter `order` then alphabetically, evaluate `condition`, execute `.md` (AI prompt) or `.sh` (shell script).

## Completion
- "Advanced to [next stage]. Proceed with `/reap.[next stage]`."
