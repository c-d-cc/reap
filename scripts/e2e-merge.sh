#!/bin/bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CLI="$PROJECT_ROOT/src/cli/index.ts"

PASS=0
FAIL=0

# Create a temporary git repo for merge testing
TMPDIR=$(mktemp -d)
trap "rm -rf '$TMPDIR'" EXIT

check() {
  local desc="$1" result="$2" expected="${3:-ok}"
  if echo "$result" | grep -q "\"status\": \"$expected\""; then
    echo "PASS: $desc"; ((PASS++))
  else
    echo "FAIL: $desc"; echo "  $(echo "$result" | grep -E 'status|message' | head -2)"; ((FAIL++))
  fi
}

run_cli() { cd "$TMPDIR" && bun "$CLI" "$@" 2>&1; }

echo "=== Setup: Create test git repo with branches ==="

cd "$TMPDIR"
git init -q
git config user.email "test@test.com"
git config user.name "Test"

# Base commit with reap init
mkdir -p .reap/genome .reap/environment .reap/life/backlog .reap/lineage .reap/vision .reap/hooks

cat > .reap/config.yml << 'EOF'
project: merge-test
language: en
autoSubagent: false
strict: false
agentClient: claude-code
autoUpdate: false
EOF

cat > .reap/genome/application.md << 'EOF'
# Application
Architecture: monolith
Language: TypeScript
EOF

cat > .reap/genome/evolution.md << 'EOF'
# Evolution
Style: cautious
EOF

cat > .reap/genome/invariants.md << 'EOF'
# Invariants
- No breaking changes
EOF

cat > .reap/environment/summary.md << 'EOF'
# Environment
Test project for merge E2E.
EOF

git add -A && git commit -q -m "initial commit"

# Create branch-a with genome changes
git checkout -q -b branch-a
cat > .reap/genome/application.md << 'EOF'
# Application
Architecture: microservice
Language: TypeScript
Database: PostgreSQL
EOF
git add -A && git commit -q -m "branch-a: change architecture"

# Create branch-b from main with different genome changes
git checkout -q main
git checkout -q -b branch-b
cat > .reap/genome/application.md << 'EOF'
# Application
Architecture: monolith
Language: Go
Framework: Gin
EOF
git add -A && git commit -q -m "branch-b: change language"

# Stay on branch-b (or main) for merge
git checkout -q main

echo "PASS: git branches created"; ((PASS++))

echo "=== Start Merge ==="
RESULT=$(run_cli run start --goal "merge branch-a and branch-b" --type merge --parents "branch-a,branch-b")
check "merge start" "$RESULT"

echo "=== Detect ==="
RESULT=$(run_cli run detect)
check "detect work" "$RESULT" "prompt"

# Verify genome diff detected the conflict
if echo "$RESULT" | grep -q "conflicts"; then
  echo "PASS: genome conflict detected"; ((PASS++))
else
  echo "FAIL: genome conflict not detected"; ((FAIL++))
fi

cat > "$TMPDIR/.reap/life/01-detect.md" << 'EOF'
# Detect
## Branches
- Branch A: branch-a (changed architecture to microservice)
- Branch B: branch-b (changed language to Go)
## Common Ancestor
Found (initial commit).
## Genome Changes
- application.md: WRITE-WRITE conflict (both changed)
## Conflict List
1. application.md — architecture + language both diverged
EOF

RESULT=$(run_cli run detect --phase complete)
check "detect complete" "$RESULT"

echo "=== Mate ==="
RESULT=$(run_cli run mate)
check "mate work" "$RESULT" "prompt"

cat > "$TMPDIR/.reap/life/02-mate.md" << 'EOF'
# Mate
## Conflict Resolution
### application.md
- Architecture: microservice (branch-a chosen)
- Language: Go (branch-b chosen)
- Database: PostgreSQL (from branch-a)
- Framework: Gin (from branch-b)
## Confirmed Genome
Architecture: microservice, Language: Go, Database: PostgreSQL, Framework: Gin
EOF

RESULT=$(run_cli run mate --phase complete)
check "mate complete" "$RESULT"

echo "=== Back Regression (mate -> detect) ==="
RESULT=$(run_cli run back --reason "re-analyze genome diff")
check "back to detect" "$RESULT"

# Verify we're back at detect
RESULT=$(run_cli run detect)
check "detect after back" "$RESULT" "prompt"

cat > "$TMPDIR/.reap/life/01-detect.md" << 'EOF'
# Detect (re-entry after regression)
## Branches
- Branch A: branch-a (microservice + PostgreSQL)
- Branch B: branch-b (Go + Gin)
## Common Ancestor
Found.
## Genome Changes
- application.md: WRITE-WRITE conflict
## Regression
Re-analyzed after back from mate. Same conflicts confirmed.
EOF

RESULT=$(run_cli run detect --phase complete)
check "detect complete (2nd)" "$RESULT"

echo "=== Resume: Mate again ==="
RESULT=$(run_cli run mate)
check "mate work (2nd)" "$RESULT" "prompt"

cat > "$TMPDIR/.reap/life/02-mate.md" << 'EOF'
# Mate (2nd pass)
## Conflict Resolution
### application.md
- Merged: microservice + Go + PostgreSQL + Gin
## Confirmed Genome
Final merged genome confirmed.
EOF

RESULT=$(run_cli run mate --phase complete)
check "mate complete (2nd)" "$RESULT"

echo "=== Merge ==="
RESULT=$(run_cli run merge)
check "merge work" "$RESULT" "prompt"

cat > "$TMPDIR/.reap/life/03-merge.md" << 'EOF'
# Merge
## Source Conflicts
Simulated — no actual git merge in E2E.
## Resolution
N/A.
EOF

RESULT=$(run_cli run merge --phase complete)
check "merge complete" "$RESULT"

echo "=== Reconcile ==="
RESULT=$(run_cli run reconcile)
check "reconcile work" "$RESULT" "prompt"

cat > "$TMPDIR/.reap/life/04-reconcile.md" << 'EOF'
# Reconcile
## Environment Regeneration
source-map.md regenerated (simulated).
## Genome-Source Consistency
All consistent.
EOF

RESULT=$(run_cli run reconcile --phase complete)
check "reconcile complete" "$RESULT"

echo "=== Validation ==="
RESULT=$(run_cli run validation)
check "validation work" "$RESULT" "prompt"

cat > "$TMPDIR/.reap/life/05-validation.md" << 'EOF'
# Validation
## Result
pass
## Checks
All pass (simulated).
EOF

RESULT=$(run_cli run validation --phase complete)
check "validation complete" "$RESULT"

echo "=== Completion ==="
RESULT=$(run_cli run completion --phase reflect)
check "reflect" "$RESULT" "prompt"

cat > "$TMPDIR/.reap/life/06-completion.md" << 'EOF'
# Completion
## Summary
Merge of branch-a and branch-b completed.
## Lessons Learned
- Git-ref based genome diff works correctly
- Back regression in merge lifecycle verified
EOF

RESULT=$(run_cli run completion --phase fitness --feedback "Merge E2E passed with git branches")
check "fitness" "$RESULT"

RESULT=$(run_cli run completion --phase adapt)
check "adapt" "$RESULT" "prompt"

RESULT=$(run_cli run completion --phase commit)
check "commit" "$RESULT"

echo "=== Verify ==="
# Check that merge lineage was archived
MERGE_LINEAGE=$(ls -d "$TMPDIR/.reap/lineage/gen-"*merge* 2>/dev/null | head -1)
if [ -n "$MERGE_LINEAGE" ] && [ -f "$MERGE_LINEAGE/meta.yml" ]; then
  echo "PASS: merge lineage archived"; ((PASS++))
else
  echo "FAIL: merge lineage not archived"; ((FAIL++))
fi

if [ -n "$MERGE_LINEAGE" ] && grep -q "type: merge" "$MERGE_LINEAGE/meta.yml"; then
  echo "PASS: meta.yml has type: merge"; ((PASS++))
else
  echo "FAIL: meta.yml missing type: merge"; ((FAIL++))
fi

if [ ! -f "$TMPDIR/.reap/life/current.yml" ]; then
  echo "PASS: current.yml cleared"; ((PASS++))
else
  echo "FAIL: current.yml still exists"; ((FAIL++))
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && echo "=== ALL MERGE TESTS PASSED ===" || exit 1
