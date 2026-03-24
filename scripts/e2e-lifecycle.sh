#!/bin/bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CLI="$PROJECT_ROOT/src/cli/index.ts"
TEST_DIR="$PROJECT_ROOT/examples/e2e-test"

PASS=0
FAIL=0

run_cli() { cd "$TEST_DIR" && bun "$CLI" "$@" 2>&1; }

check() {
  local desc="$1" result="$2" expected="${3:-ok}"
  if echo "$result" | grep -q "\"status\": \"$expected\""; then
    echo "PASS: $desc"; ((PASS++))
  else
    echo "FAIL: $desc"; echo "  $(echo "$result" | grep -E 'status|message' | head -2)"; ((FAIL++))
  fi
}

# Cleanup
rm -rf "$TEST_DIR/.reap"

echo "=== Init ==="
RESULT=$(run_cli init e2e-test)
check "init" "$RESULT"

echo "=== Start ==="
RESULT=$(run_cli run start --goal "e2e test goal" --type embryo)
check "start" "$RESULT"

echo "=== Learning ==="
RESULT=$(run_cli run learning)
check "learning" "$RESULT" "prompt"

cat > "$TEST_DIR/.reap/life/01-learning.md" << 'EOF'
# Learning
## Project Overview
E2E test project. Testing full lifecycle.
## Key Findings
All systems operational.
## Context
Testing reap lifecycle from init to completion.
EOF

RESULT=$(run_cli run learning --phase complete)
check "learning complete" "$RESULT"

echo "=== Planning ==="
RESULT=$(run_cli run planning)
check "planning" "$RESULT" "prompt"

cat > "$TEST_DIR/.reap/life/02-planning.md" << 'EOF'
# Planning
## Goal
Test the full lifecycle.
## Completion Criteria
1. All stages complete without error
## Tasks
- [ ] T001 Verify lifecycle
EOF

RESULT=$(run_cli run planning --phase complete)
check "planning complete" "$RESULT"

echo "=== Implementation ==="
RESULT=$(run_cli run implementation)
check "implementation" "$RESULT" "prompt"

cat > "$TEST_DIR/.reap/life/03-implementation.md" << 'EOF'
# Implementation
## Completed Tasks
| Task | Description |
|------|------------|
| T001 | Verified lifecycle stages work correctly |
## Discovered Issues
None
EOF

RESULT=$(run_cli run implementation --phase complete)
check "implementation complete" "$RESULT"

echo "=== Validation ==="
RESULT=$(run_cli run validation)
check "validation" "$RESULT" "prompt"

cat > "$TEST_DIR/.reap/life/04-validation.md" << 'EOF'
# Validation
## Result
pass
## Checks
All completion criteria met.
## Issues
None
EOF

RESULT=$(run_cli run validation --phase complete)
check "validation complete" "$RESULT"

echo "=== Completion ==="
RESULT=$(run_cli run completion --phase reflect)
check "reflect" "$RESULT" "prompt"

cat > "$TEST_DIR/.reap/life/05-completion.md" << 'EOF'
# Completion
## Summary
Full lifecycle test completed successfully.
## Lessons Learned
- All stages work as expected
- Nonce chain maintains integrity
EOF

RESULT=$(run_cli run completion --phase fitness --feedback "E2E test passed")
check "fitness" "$RESULT"

RESULT=$(run_cli run completion --phase adapt)
check "adapt" "$RESULT" "prompt"

RESULT=$(run_cli run completion --phase commit)
check "commit" "$RESULT"

echo "=== Verify ==="
LINEAGE_DIR=$(ls -d "$TEST_DIR/.reap/lineage/gen-"* 2>/dev/null | head -1)
if [ -n "$LINEAGE_DIR" ] && [ -f "$LINEAGE_DIR/meta.yml" ]; then
  echo "PASS: lineage archived"; ((PASS++))
else
  echo "FAIL: lineage not archived"; ((FAIL++))
fi

if [ ! -f "$TEST_DIR/.reap/life/current.yml" ]; then
  echo "PASS: current.yml cleared"; ((PASS++))
else
  echo "FAIL: current.yml still exists"; ((FAIL++))
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && echo "=== ALL TESTS PASSED ===" || exit 1
