---
description: "REAP Update — Check for updates and upgrade REAP"
---

# Update

Check for REAP updates and upgrade to the latest version.

## IMPORTANT: File Access Rules
- Do NOT access global node_modules or any path outside the project.
- If a command fails, report the error and stop.

## Steps

### 1. Check Current Version
- Run `reap --version` to get the installed version
- Run `npm view @c-d-cc/reap version` to get the latest published version
- Compare the two versions

### 2. Update Decision
**If installed == latest:**
- "REAP v{version} is already up to date. (latest)"
- Then skip to Step 4.

**If installed < latest (patch only — same major.minor, different patch):**
- Show: "Patch update available: v{installed} → v{latest}. Updating automatically..."
- Proceed directly to Step 3 (no user confirmation needed)

**If installed < latest (minor or major change):**
- Show: "Update available: v{installed} → v{latest}"
- Ask the user: "Update now? (yes/no)"
- If yes: proceed to Step 3
- If no: "Skipped. Run `/reap.update` anytime to update."

### 3. Perform Update
- Run: `npm update -g @c-d-cc/reap`
- If the command fails, suggest: `sudo npm update -g @c-d-cc/reap` or `npm install -g @c-d-cc/reap@latest`
- After npm update, run: `reap update` to sync commands, templates, and hooks to all detected agents
- Show the update result summary

### 4. Sync Check
- Run: `reap update --dry-run` to check if commands/templates need syncing
- If changes detected: run `reap update` and show results
- If no changes: "All commands and templates are up to date."
