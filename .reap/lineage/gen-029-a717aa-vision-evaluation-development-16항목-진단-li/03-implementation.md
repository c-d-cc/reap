# Implementation Log — gen-029-a717aa

## Completed Tasks

### T001: `src/core/lineage.ts` — readAllLineageGoals()
- Added `LineageGoal` interface (`{ id, goal }`)
- Added `readAllLineageGoals()`: reads all gen entries from lineage dir
  - Directories: reads meta.yml for id/goal
  - L1 compressed .md files: parses frontmatter for id/goal
  - Returns sorted by entry name (gen-NNN ordering)
  - Handles missing dirs, malformed YAML gracefully

### T002: `src/core/vision.ts` — buildDiagnosisPrompt()
- Uses SOFTWARE_COMPLETION_CRITERIA from maturity.ts
- Generates prompt asking AI to qualitatively assess each of 16 criteria
- Explicitly prohibits numeric scores (Goodhart's Law)
- Instructs AI to record assessment in completion artifact under `## Project Diagnosis`
- Available for all maturity levels (not bootstrap-only)

### T003: `src/core/vision.ts` — analyzeLineageBias()
- Takes lineageGoals, visionGoals, recentCount (default 10)
- Maps recent gen goals to vision sections via tokenize + overlap (score >= 0.15)
- Generates section distribution with visual bar chart
- Detects concentration bias (>60% in one section)
- Detects neglected areas (0 hits with unchecked goals)
- Returns empty string when insufficient data

### T004: `src/core/vision.ts` — buildVisionDevelopmentSuggestions()
- Detects criteria not covered by any vision goal (Missing coverage)
- Detects stale goals (unchecked, no recent lineage work in last 10 gen)
- Detects large scope sections (4+ unchecked goals)
- Limits output to top 5 suggestions
- Explicitly states no automatic modification

### T005: `src/cli/commands/run/completion.ts` — adapt phase integration
- Replaced bootstrap-only 16항목 criteria block with `buildDiagnosisPrompt()` (all maturity levels)
- Added `readAllLineageGoals()` call after vision gap analysis
- Added `analyzeLineageBias()` → prompt injection (if non-empty)
- Added `buildVisionDevelopmentSuggestions()` → prompt injection (if non-empty)
- Removed unused `formatCompletionCriteria` import
- Added imports for new vision.ts and lineage.ts functions

### T006: `tests/unit/vision.test.ts` — new function tests
- buildDiagnosisPrompt: 4 tests (16 criteria presence, no-score emphasis, header, format)
- analyzeLineageBias: 5 tests (empty cases, concentration detection, neglected areas, recent count)
- buildVisionDevelopmentSuggestions: 5 tests (empty case, stale goals, large scope, limit, header)

### T007: `tests/unit/lineage.test.ts` — readAllLineageGoals tests (new file)
- 9 tests: non-existent dir, empty dir, meta.yml reading, compressed md reading, mixed sources, sorting, missing meta, malformed YAML, non-gen entries

### T008: Build + TypeCheck + Tests
- Pending execution

## Architecture Decisions
- `tokenize()` in vision.ts changed from private to exported — needed internally by new functions in the same file. No external callers added.
- Diagnosis prompt is injected for all maturity levels (not just bootstrap) — because vision evaluation is valuable at every stage.
- Bias analysis threshold set at 0.15 (lower than goal matching at 0.3) — section-to-goal mapping is broader and intentionally more permissive.
