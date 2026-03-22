#!/bin/bash
# condition: always
# order: 90

# Structural integrity check — runs after generation completion
# Outputs warnings only; does NOT block the commit (always exits 0)

result=$(reap fix --check 2>&1) || true

if [ -n "$result" ]; then
  echo "$result"
fi

exit 0
