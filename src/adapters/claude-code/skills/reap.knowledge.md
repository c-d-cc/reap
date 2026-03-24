---
description: "REAP Knowledge — Manage genome, environment, and context knowledge"
---

Manage project knowledge (genome, environment, vision). Respond in the user's configured language (from `.reap/config.yml` `language` field).

## Usage

`/reap.knowledge <argument>`

### Arguments

#### `reload`
Reload genome, environment, and vision into context.

1. Read all files under `.reap/genome/` (application.md, evolution.md, invariants.md)
2. Read `.reap/environment/summary.md`
3. Read `.reap/vision/goals.md` (if exists)
4. Confirm to user that knowledge has been reloaded

#### `genome`
Summarize current genome and discuss modifications with the user.

1. Read all files under `.reap/genome/`
2. Present a concise summary of each file to the user
3. Ask the user if they want to modify anything
4. If modifications requested:
   - `application.md`, `evolution.md`: modify per user request
   - `invariants.md`: human-only editable — guide user to edit directly

#### `environment`
Summarize current environment and discuss updates with the user.

1. Read `.reap/environment/summary.md`
2. Read `.reap/environment/source-map.md` (if exists)
3. Present a concise summary to the user
4. Ask the user if they want to update anything
5. If updates requested, modify the relevant files

#### No argument
Present the following choices and let the user pick:

1. **reload** — Reload genome, environment, vision into context
2. **genome** — Review genome summary + discuss modifications
3. **environment** — Review environment summary + discuss updates
