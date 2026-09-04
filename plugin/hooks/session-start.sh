#!/usr/bin/env bash
# REAP SessionStart hook.
#
# **This script never blocks session start, for any reason** (.reap/genome/invariants.md).
# So it doesn't turn on set -e — if a reap call fails, the whole hook would die,
# and the user wouldn't even know REAP was the cause.
#
# Emit nothing and nothing gets injected. That's how every failure is handled.
#
# Hanging isn't guarded against here — Claude Code owns execution, and
# hooks.json declares the timeout. A script timing itself would need a
# background job and a kill, and that complexity would break this script's
# one virtue (doing nothing).

command -v reap >/dev/null 2>&1 || exit 0

output=$(reap ctx --hook 2>/dev/null) || exit 0
[ -n "$output" ] || exit 0

printf '%s\n' "$output"
exit 0
