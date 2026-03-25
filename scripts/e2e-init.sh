#!/bin/bash
set -uo pipefail

# E2E Init Test — validates reap init in greenfield and adoption modes
# Uses built dist/cli/index.js to simulate npm global install

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CLI="$PROJECT_ROOT/dist/cli/index.js"

PASS=0
FAIL=0

check() {
  local desc="$1" result="$2" expected="${3:-ok}"
  if echo "$result" | grep -q "\"status\": \"$expected\""; then
    echo "PASS: $desc"; ((PASS++))
  else
    echo "FAIL: $desc"; echo "  $(echo "$result" | grep -E 'status|message' | head -2)"; ((FAIL++))
  fi
}

check_file() {
  local desc="$1" filepath="$2"
  if [ -f "$filepath" ]; then
    echo "PASS: $desc"; ((PASS++))
  else
    echo "FAIL: $desc (file not found: $filepath)"; ((FAIL++))
  fi
}

check_dir() {
  local desc="$1" dirpath="$2"
  if [ -d "$dirpath" ]; then
    echo "PASS: $desc"; ((PASS++))
  else
    echo "FAIL: $desc (dir not found: $dirpath)"; ((FAIL++))
  fi
}

check_contains() {
  local desc="$1" filepath="$2" pattern="$3"
  if [ -f "$filepath" ] && grep -q "$pattern" "$filepath"; then
    echo "PASS: $desc"; ((PASS++))
  else
    echo "FAIL: $desc (pattern '$pattern' not found in $filepath)"; ((FAIL++))
  fi
}

check_json_field() {
  local desc="$1" result="$2" field="$3" expected="$4"
  if echo "$result" | grep -q "\"$field\": \"$expected\""; then
    echo "PASS: $desc"; ((PASS++))
  else
    echo "FAIL: $desc (expected $field=$expected)"; ((FAIL++))
  fi
}

# ── Build ──────────────────────────────────────────────────────────────────

echo "=== Build ==="
cd "$PROJECT_ROOT"
BUILD_RESULT=$(npm run build 2>&1)
if [ $? -eq 0 ]; then
  echo "PASS: build"; ((PASS++))
else
  echo "FAIL: build"; echo "  $BUILD_RESULT"; ((FAIL++))
  echo "=== Results: $PASS passed, $FAIL failed ==="
  exit 1
fi

if [ -f "$CLI" ]; then
  echo "PASS: dist/cli/index.js exists"; ((PASS++))
else
  echo "FAIL: dist/cli/index.js missing"; ((FAIL++))
  echo "=== Results: $PASS passed, $FAIL failed ==="
  exit 1
fi

# ── Test 1: Greenfield Init ───────────────────────────────────────────────

echo ""
echo "=== Test 1: Greenfield Init ==="
GREENFIELD_DIR=$(mktemp -d)
trap "rm -rf $GREENFIELD_DIR" EXIT

RESULT=$(cd "$GREENFIELD_DIR" && node "$CLI" init my-greenfield 2>&1)
check "greenfield init status" "$RESULT"
check_json_field "greenfield mode detected" "$RESULT" "mode" "greenfield"
check_json_field "greenfield phase" "$RESULT" "phase" "greenfield"

# Verify prompt contains conversation guide
if echo "$RESULT" | grep -q "Greenfield Init — Interactive Session"; then
  echo "PASS: greenfield conversation prompt present"; ((PASS++))
else
  echo "FAIL: greenfield conversation prompt missing"; ((FAIL++))
fi

# Verify .reap/ directory structure
check_dir  "greenfield .reap/" "$GREENFIELD_DIR/.reap"
check_file "greenfield config.yml" "$GREENFIELD_DIR/.reap/config.yml"
check_file "greenfield genome/application.md" "$GREENFIELD_DIR/.reap/genome/application.md"
check_file "greenfield genome/evolution.md" "$GREENFIELD_DIR/.reap/genome/evolution.md"
check_file "greenfield genome/invariants.md" "$GREENFIELD_DIR/.reap/genome/invariants.md"
check_file "greenfield environment/summary.md" "$GREENFIELD_DIR/.reap/environment/summary.md"
check_file "greenfield vision/goals.md" "$GREENFIELD_DIR/.reap/vision/goals.md"
check_dir  "greenfield environment/domain/" "$GREENFIELD_DIR/.reap/environment/domain"
check_dir  "greenfield life/" "$GREENFIELD_DIR/.reap/life"
check_dir  "greenfield life/backlog/" "$GREENFIELD_DIR/.reap/life/backlog"
check_dir  "greenfield lineage/" "$GREENFIELD_DIR/.reap/lineage"
check_dir  "greenfield vision/docs/" "$GREENFIELD_DIR/.reap/vision/docs"
check_dir  "greenfield hooks/" "$GREENFIELD_DIR/.reap/hooks"

# Verify config.yml defaults
check_contains "config project name" "$GREENFIELD_DIR/.reap/config.yml" "project: my-greenfield"
check_contains "config language english" "$GREENFIELD_DIR/.reap/config.yml" "language: english"
check_contains "config autoSubagent" "$GREENFIELD_DIR/.reap/config.yml" "autoSubagent: true"

# Verify genome templates
check_contains "application has Project Identity" "$GREENFIELD_DIR/.reap/genome/application.md" "Project Identity"
check_contains "invariants has default rules" "$GREENFIELD_DIR/.reap/genome/invariants.md" "Do not skip lifecycle stages"
check_contains "evolution has AI Behavior" "$GREENFIELD_DIR/.reap/genome/evolution.md" "AI Behavior Guide"
check_contains "vision has Ultimate Goal" "$GREENFIELD_DIR/.reap/vision/goals.md" "Ultimate Goal"

# ── Test 2: Adoption Init ─────────────────────────────────────────────────

echo ""
echo "=== Test 2: Adoption Init ==="
ADOPTION_DIR=$(mktemp -d)
# Update trap to clean both dirs
trap "rm -rf $GREENFIELD_DIR $ADOPTION_DIR" EXIT

# Create a fake existing project
cat > "$ADOPTION_DIR/package.json" << 'PKGJSON'
{
  "name": "test-adoption-project",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "jest": "^29.0.0"
  },
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint ."
  }
}
PKGJSON
mkdir -p "$ADOPTION_DIR/src/routes"
echo "// Express route" > "$ADOPTION_DIR/src/routes/index.ts"
mkdir -p "$ADOPTION_DIR/src/services"
echo "// Service layer" > "$ADOPTION_DIR/src/services/user.ts"
echo '{"compilerOptions":{}}' > "$ADOPTION_DIR/tsconfig.json"

RESULT=$(cd "$ADOPTION_DIR" && node "$CLI" init 2>&1)
check "adoption init status" "$RESULT"
check_json_field "adoption mode detected" "$RESULT" "mode" "adoption"
check_json_field "adoption phase" "$RESULT" "phase" "adoption"

# Verify prompt contains conversation guide
if echo "$RESULT" | grep -q "Adoption Init — Interactive Session"; then
  echo "PASS: adoption conversation prompt present"; ((PASS++))
else
  echo "FAIL: adoption conversation prompt missing"; ((FAIL++))
fi

# Verify scan results in context
if echo "$RESULT" | grep -q '"hasTypeScript": true'; then
  echo "PASS: adoption detected TypeScript"; ((PASS++))
else
  echo "FAIL: adoption did not detect TypeScript"; ((FAIL++))
fi

if echo "$RESULT" | grep -q '"hasTests": true'; then
  echo "PASS: adoption detected tests"; ((PASS++))
else
  echo "FAIL: adoption did not detect tests"; ((FAIL++))
fi

if echo "$RESULT" | grep -q '"testFramework": "jest"'; then
  echo "PASS: adoption detected jest"; ((PASS++))
else
  echo "FAIL: adoption did not detect jest"; ((FAIL++))
fi

# Verify project name auto-detected from package.json
if echo "$RESULT" | grep -q '"project": "test-adoption-project"'; then
  echo "PASS: adoption project name from package.json"; ((PASS++))
else
  echo "FAIL: adoption project name not detected"; ((FAIL++))
fi

# Verify .reap/ structure
check_dir  "adoption .reap/" "$ADOPTION_DIR/.reap"
check_file "adoption config.yml" "$ADOPTION_DIR/.reap/config.yml"
check_file "adoption genome/application.md" "$ADOPTION_DIR/.reap/genome/application.md"
check_file "adoption genome/evolution.md" "$ADOPTION_DIR/.reap/genome/evolution.md"
check_file "adoption genome/invariants.md" "$ADOPTION_DIR/.reap/genome/invariants.md"
check_file "adoption environment/summary.md" "$ADOPTION_DIR/.reap/environment/summary.md"
check_file "adoption environment/source-map.md" "$ADOPTION_DIR/.reap/environment/source-map.md"
check_file "adoption vision/goals.md" "$ADOPTION_DIR/.reap/vision/goals.md"

# Verify genome suggestion content
check_contains "genome has project name" "$ADOPTION_DIR/.reap/genome/application.md" "test-adoption-project"
check_contains "genome has TypeScript" "$ADOPTION_DIR/.reap/genome/application.md" "TypeScript"
check_contains "genome has route detection" "$ADOPTION_DIR/.reap/genome/application.md" "Route-based"

# Verify source-map
check_contains "source-map has directory tree" "$ADOPTION_DIR/.reap/environment/source-map.md" "Directory Structure"
check_contains "source-map has dependencies" "$ADOPTION_DIR/.reap/environment/source-map.md" "express"

# Verify environment summary
check_contains "env summary has TypeScript" "$ADOPTION_DIR/.reap/environment/summary.md" "TypeScript"

# ── Test 3: Re-init Guard ─────────────────────────────────────────────────

echo ""
echo "=== Test 3: Re-init Guard ==="
RESULT=$(cd "$GREENFIELD_DIR" && node "$CLI" init another-name 2>&1)
check "re-init blocked" "$RESULT" "error"

if echo "$RESULT" | grep -q "already exists"; then
  echo "PASS: re-init error message correct"; ((PASS++))
else
  echo "FAIL: re-init error message missing 'already exists'"; ((FAIL++))
fi

# ── Test 4: Mode Override ──────────────────────────────────────────────────

echo ""
echo "=== Test 4: Mode Override (--mode greenfield on adoption dir) ==="
OVERRIDE_DIR=$(mktemp -d)
trap "rm -rf $GREENFIELD_DIR $ADOPTION_DIR $OVERRIDE_DIR" EXIT

# Create adoption-detectable dir
echo '{"name":"override-test"}' > "$OVERRIDE_DIR/package.json"
mkdir -p "$OVERRIDE_DIR/src"
echo "console.log('hello')" > "$OVERRIDE_DIR/src/index.ts"

RESULT=$(cd "$OVERRIDE_DIR" && node "$CLI" init override-project --mode greenfield 2>&1)
check "mode override status" "$RESULT"
check_json_field "mode override to greenfield" "$RESULT" "mode" "greenfield"

# Should NOT have source-map (greenfield doesn't scan)
if [ ! -f "$OVERRIDE_DIR/.reap/environment/source-map.md" ]; then
  echo "PASS: greenfield override skipped source-map"; ((PASS++))
else
  echo "FAIL: greenfield override created source-map (should not)"; ((FAIL++))
fi

# ── Test 5: Init then Start flow ──────────────────────────────────────────

echo ""
echo "=== Test 5: Init -> Start -> Status flow ==="
FLOW_DIR=$(mktemp -d)
trap "rm -rf $GREENFIELD_DIR $ADOPTION_DIR $OVERRIDE_DIR $FLOW_DIR" EXIT

RESULT=$(cd "$FLOW_DIR" && node "$CLI" init flow-test 2>&1)
check "flow init" "$RESULT"

RESULT=$(cd "$FLOW_DIR" && node "$CLI" run start --type embryo --goal "test flow" 2>&1)
check "flow start" "$RESULT"

if echo "$RESULT" | grep -q "gen-001"; then
  echo "PASS: first generation is gen-001"; ((PASS++))
else
  echo "FAIL: unexpected generation id"; ((FAIL++))
fi

RESULT=$(cd "$FLOW_DIR" && node "$CLI" status 2>&1)
check "flow status" "$RESULT"

if echo "$RESULT" | grep -q '"stage": "learning"'; then
  echo "PASS: status shows learning stage"; ((PASS++))
else
  echo "FAIL: status does not show learning stage"; ((FAIL++))
fi

# ── Test 6: Auto-detect edge cases ────────────────────────────────────────

echo ""
echo "=== Test 6: Auto-detect Edge Cases ==="

# 6a: Dir with only a Makefile → adoption
MAKE_DIR=$(mktemp -d)
trap "rm -rf $GREENFIELD_DIR $ADOPTION_DIR $OVERRIDE_DIR $FLOW_DIR $MAKE_DIR" EXIT
echo "all: build" > "$MAKE_DIR/Makefile"
RESULT=$(cd "$MAKE_DIR" && node "$CLI" init make-project 2>&1)
check_json_field "Makefile triggers adoption" "$RESULT" "mode" "adoption"

# 6b: Dir with only a .py file → adoption
PY_DIR=$(mktemp -d)
trap "rm -rf $GREENFIELD_DIR $ADOPTION_DIR $OVERRIDE_DIR $FLOW_DIR $MAKE_DIR $PY_DIR" EXIT
echo "print('hello')" > "$PY_DIR/main.py"
RESULT=$(cd "$PY_DIR" && node "$CLI" init py-project 2>&1)
check_json_field ".py file triggers adoption" "$RESULT" "mode" "adoption"

# 6c: Dir with only hidden files → greenfield
HIDDEN_DIR=$(mktemp -d)
trap "rm -rf $GREENFIELD_DIR $ADOPTION_DIR $OVERRIDE_DIR $FLOW_DIR $MAKE_DIR $PY_DIR $HIDDEN_DIR" EXIT
echo "secret" > "$HIDDEN_DIR/.env"
echo "git" > "$HIDDEN_DIR/.gitignore"
RESULT=$(cd "$HIDDEN_DIR" && node "$CLI" init hidden-project 2>&1)
check_json_field "hidden-only files stay greenfield" "$RESULT" "mode" "greenfield"

# 6d: Dir with only a README.md (no source) → greenfield
README_DIR=$(mktemp -d)
trap "rm -rf $GREENFIELD_DIR $ADOPTION_DIR $OVERRIDE_DIR $FLOW_DIR $MAKE_DIR $PY_DIR $HIDDEN_DIR $README_DIR" EXIT
echo "# My Project" > "$README_DIR/README.md"
RESULT=$(cd "$README_DIR" && node "$CLI" init readme-project 2>&1)
check_json_field "README-only stays greenfield" "$RESULT" "mode" "greenfield"

# ── Results ────────────────────────────────────────────────────────────────

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && echo "=== ALL TESTS PASSED ===" || exit 1
