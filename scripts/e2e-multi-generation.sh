#!/bin/bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CLI="$PROJECT_ROOT/src/cli/index.ts"
TEST_DIR=$(mktemp -d)

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

cleanup() { rm -rf "$TEST_DIR"; }
trap cleanup EXIT

echo "=== Multi-Generation E2E Test ==="
echo "Test dir: $TEST_DIR"

# Initialize git repo for commit automation testing
cd "$TEST_DIR" && git init -q && git config user.email "test@test.com" && git config user.name "Test"

echo "=== Init ==="
RESULT=$(run_cli init multi-gen-test)
check "init" "$RESULT"

# Initial commit so git has a HEAD
cd "$TEST_DIR" && git add -A && git commit -q -m "init: reap project"

# ── Generation 1 ──────────────────────────────────────────

echo ""
echo "=== Generation 1 ==="

RESULT=$(run_cli run start --goal "first generation" --type embryo)
check "gen1 start" "$RESULT"

RESULT=$(run_cli run learning)
check "gen1 learning" "$RESULT" "prompt"

cat > "$TEST_DIR/.reap/life/01-learning.md" << 'EOF'
# Learning
## Project Overview
Multi-gen E2E test project. Generation 1.
## Key Findings
Testing multi-generation lifecycle.
## Context
First generation in sequence.
EOF

RESULT=$(run_cli run learning --phase complete)
check "gen1 learning complete" "$RESULT"

RESULT=$(run_cli run planning)
check "gen1 planning" "$RESULT" "prompt"

cat > "$TEST_DIR/.reap/life/02-planning.md" << 'EOF'
# Planning
## Goal
Complete first generation.
## Completion Criteria
1. All stages complete
## Tasks
- [ ] T001 Verify lifecycle
EOF

RESULT=$(run_cli run planning --phase complete)
check "gen1 planning complete" "$RESULT"

RESULT=$(run_cli run implementation)
check "gen1 implementation" "$RESULT" "prompt"

cat > "$TEST_DIR/.reap/life/03-implementation.md" << 'EOF'
# Implementation
## Completed Tasks
| Task | Description |
|------|------------|
| T001 | Verified lifecycle |
## Discovered Issues
None
EOF

RESULT=$(run_cli run implementation --phase complete)
check "gen1 implementation complete" "$RESULT"

RESULT=$(run_cli run validation)
check "gen1 validation" "$RESULT" "prompt"

cat > "$TEST_DIR/.reap/life/04-validation.md" << 'EOF'
# Validation
## Result
pass
## Checks
All criteria met.
## Issues
None
EOF

RESULT=$(run_cli run validation --phase complete)
check "gen1 validation complete" "$RESULT"

RESULT=$(run_cli run completion --phase reflect)
check "gen1 reflect" "$RESULT" "prompt"

cat > "$TEST_DIR/.reap/life/05-completion.md" << 'EOF'
# Completion
## Summary
First generation completed successfully.
## Lessons Learned
- All stages work as expected
- Nonce chain intact
EOF

RESULT=$(run_cli run completion --phase fitness --feedback "gen1 ok")
check "gen1 fitness" "$RESULT"

RESULT=$(run_cli run completion --phase adapt)
check "gen1 adapt" "$RESULT" "prompt"

# Create a backlog item to test carry-over
mkdir -p "$TEST_DIR/.reap/life/backlog"
cat > "$TEST_DIR/.reap/life/backlog/carry-over-test.md" << 'EOF'
---
type: task
status: pending
priority: medium
---
# Carry-Over Test
## Problem
Test that pending backlog items carry over between generations.
## Solution
Verify in generation 2.
EOF

RESULT=$(run_cli run completion --phase commit)
check "gen1 commit" "$RESULT"

# Verify gen1 auto-committed
GEN1_COMMIT=$(echo "$RESULT" | grep -o '"commitHash": "[^"]*"' | head -1)
if [ -n "$GEN1_COMMIT" ]; then
  echo "PASS: gen1 auto-committed ($GEN1_COMMIT)"; ((PASS++))
else
  echo "FAIL: gen1 no auto-commit detected"; ((FAIL++))
fi

# Verify lineage has gen1
GEN1_LINEAGE=$(ls -d "$TEST_DIR/.reap/lineage/gen-"* 2>/dev/null | head -1)
if [ -n "$GEN1_LINEAGE" ] && [ -f "$GEN1_LINEAGE/meta.yml" ]; then
  echo "PASS: gen1 lineage archived"; ((PASS++))
else
  echo "FAIL: gen1 lineage not archived"; ((FAIL++))
fi

# Verify current.yml cleared
if [ ! -f "$TEST_DIR/.reap/life/current.yml" ]; then
  echo "PASS: gen1 current.yml cleared"; ((PASS++))
else
  echo "FAIL: gen1 current.yml still exists"; ((FAIL++))
fi

# ── Generation 2 ──────────────────────────────────────────

echo ""
echo "=== Generation 2 ==="

RESULT=$(run_cli run start --goal "second generation" --type embryo)
check "gen2 start" "$RESULT"

# Verify backlog carried over
if [ -f "$TEST_DIR/.reap/life/backlog/carry-over-test.md" ]; then
  echo "PASS: backlog carried over to gen2"; ((PASS++))
else
  echo "FAIL: backlog not carried over"; ((FAIL++))
fi

RESULT=$(run_cli run learning)
check "gen2 learning" "$RESULT" "prompt"

cat > "$TEST_DIR/.reap/life/01-learning.md" << 'EOF'
# Learning
## Project Overview
Multi-gen E2E test project. Generation 2.
## Key Findings
Backlog carried over from gen1.
## Context
Second generation in sequence.
EOF

RESULT=$(run_cli run learning --phase complete)
check "gen2 learning complete" "$RESULT"

RESULT=$(run_cli run planning)
check "gen2 planning" "$RESULT" "prompt"

cat > "$TEST_DIR/.reap/life/02-planning.md" << 'EOF'
# Planning
## Goal
Complete second generation.
## Completion Criteria
1. All stages complete
## Tasks
- [ ] T001 Verify gen2 lifecycle
EOF

RESULT=$(run_cli run planning --phase complete)
check "gen2 planning complete" "$RESULT"

RESULT=$(run_cli run implementation)
check "gen2 implementation" "$RESULT" "prompt"

cat > "$TEST_DIR/.reap/life/03-implementation.md" << 'EOF'
# Implementation
## Completed Tasks
| Task | Description |
|------|------------|
| T001 | Verified gen2 lifecycle |
## Discovered Issues
None
EOF

RESULT=$(run_cli run implementation --phase complete)
check "gen2 implementation complete" "$RESULT"

RESULT=$(run_cli run validation)
check "gen2 validation" "$RESULT" "prompt"

cat > "$TEST_DIR/.reap/life/04-validation.md" << 'EOF'
# Validation
## Result
pass
## Checks
All criteria met.
## Issues
None
EOF

RESULT=$(run_cli run validation --phase complete)
check "gen2 validation complete" "$RESULT"

RESULT=$(run_cli run completion --phase reflect)
check "gen2 reflect" "$RESULT" "prompt"

cat > "$TEST_DIR/.reap/life/05-completion.md" << 'EOF'
# Completion
## Summary
Second generation completed successfully.
## Lessons Learned
- Multi-generation flow works
- Backlog carry-over verified
EOF

RESULT=$(run_cli run completion --phase fitness --feedback "gen2 ok")
check "gen2 fitness" "$RESULT"

RESULT=$(run_cli run completion --phase adapt)
check "gen2 adapt" "$RESULT" "prompt"

RESULT=$(run_cli run completion --phase commit)
check "gen2 commit" "$RESULT"

# ── Final Verification ────────────────────────────────────

echo ""
echo "=== Final Verification ==="

# Count lineage entries (directories or compressed .md files)
LINEAGE_COUNT=$(ls -1 "$TEST_DIR/.reap/lineage/" 2>/dev/null | grep -c "^gen-" || true)
if [ "$LINEAGE_COUNT" -ge 2 ]; then
  echo "PASS: lineage has $LINEAGE_COUNT entries (expected >= 2)"; ((PASS++))
else
  echo "FAIL: lineage has $LINEAGE_COUNT entries (expected >= 2)"; ((FAIL++))
fi

# Verify no active generation
if [ ! -f "$TEST_DIR/.reap/life/current.yml" ]; then
  echo "PASS: no active generation after gen2"; ((PASS++))
else
  echo "FAIL: active generation still exists after gen2"; ((FAIL++))
fi

# Verify git log has auto-commits
GIT_LOG=$(cd "$TEST_DIR" && git log --oneline 2>/dev/null)
FEAT_COMMITS=$(echo "$GIT_LOG" | grep -c "^.*feat(gen-" || true)
if [ "$FEAT_COMMITS" -ge 2 ]; then
  echo "PASS: git log has $FEAT_COMMITS feat(gen-*) commits"; ((PASS++))
else
  echo "FAIL: git log has $FEAT_COMMITS feat(gen-*) commits (expected >= 2)"; ((FAIL++))
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && echo "=== ALL TESTS PASSED ===" || exit 1
