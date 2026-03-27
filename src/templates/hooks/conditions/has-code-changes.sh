#!/usr/bin/env bash
# True if src/ files were changed in the most recent commit
# Exit 0 = condition met, Exit 1 = condition not met
last_commit=$(git log -1 --format="%H" 2>/dev/null)
if [ -z "$last_commit" ]; then
  exit 1
fi
changes=$(git diff-tree --no-commit-id --name-only -r "$last_commit" -- src/ 2>/dev/null)
if [ -n "$changes" ]; then
  exit 0
else
  exit 1
fi
