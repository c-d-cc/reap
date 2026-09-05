#!/usr/bin/env bash
# REAP SessionStart hook.
#
# **This script never blocks session start, for any reason** (.reap/genome/invariants.md).
# So no `set -e` — if the reap call fails the hook would die with it, and the user
# would not even know REAP was the cause.
#
# Emitting nothing injects nothing. That is how every failure is handled — except one:
# a missing `reap` binary is reported, because the plugin is installed and the user
# has no other way to learn why nothing shows up.
#
# Hanging is not handled here — Claude Code owns execution and hooks.json declares
# the timeout. Timing ourselves would need a background job and a kill, and that
# complexity would break this script's only virtue (doing nothing).

if ! command -v reap >/dev/null 2>&1; then
  printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"<!-- reap status -->\nREAP plugin is installed but the `reap` CLI is not on PATH, so nothing was injected. Install it: `npm i -g @c-d-cc/reap` (or put the built binary on PATH), then open a new session."}}'
  exit 0
fi

output=$(reap ctx --hook 2>/dev/null) || exit 0
[ -n "$output" ] || exit 0

printf '%s\n' "$output"
exit 0
