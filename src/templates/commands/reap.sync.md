---
description: "REAP Sync — Synchronize Genome with current source code"
---

# Sync (Genome Synchronization)

Analyze the current source code and update the Genome to reflect reality.

<HARD-GATE>
If an active Generation exists (`.reap/life/current.yml` has content), do NOT modify Genome directly.
Instead, record discovered differences as `type: genome-change` items in `.reap/life/backlog/` and inform the human.
Only proceed with direct Genome modification when NO active Generation exists.
</HARD-GATE>

## Gate (Preconditions)
- Read `.reap/life/current.yml`
- If active Generation exists: switch to **Backlog Mode** (record differences, do not modify Genome)
- If no active Generation: proceed with **Sync Mode** (modify Genome directly after human confirmation)

## Steps

### 1. Read Current Genome
- Read all files in `.reap/genome/` (principles.md, conventions.md, constraints.md, domain/)
- Note current genomeVersion from the most recent generation in `.reap/lineage/`

### 2. Analyze Source Code
Scan the project to understand its current state:

**Tech Stack & Dependencies**:
- package.json, tsconfig.json, Dockerfile, docker-compose.yml, etc.
- New dependencies added, removed, or version-changed since Genome was last updated

**Architecture & Structure**:
- Directory structure and patterns (layers, modules, services)
- Entry points, routing, API structure
- Database, ORM, migration setup

**Conventions**:
- Linter/formatter configs (.eslintrc, .prettierrc, biome.json, etc.)
- Test setup and patterns (test framework, file naming, coverage config)
- Git hooks, CI/CD config
- Code patterns observed in the source (naming, error handling, etc.)

**Constraints**:
- Build commands, test commands, validation commands
- Environment requirements, runtime constraints
- External service dependencies

**Domain Knowledge** (→ `genome/domain/`):
- Read `~/.reap/templates/domain-guide.md` for domain file writing principles
- Scan source code for business rules NOT derivable from infrastructure analysis:
  - State machines and status transitions (e.g., post lifecycle, order states)
  - Policy rules with thresholds, limits, or conditions (e.g., rate limits, scoring criteria)
  - Classification/branching logic driven by business categories (e.g., template selection by type)
  - Hardcoded domain constants (keyword lists, prompt templates, magic numbers with business meaning)
  - Workflow orchestration sequences (e.g., approval flows, pipeline stages)
- For each discovered domain rule cluster, evaluate:
  - "Would an agent implementing this feature ask 'where is this rule?'" → YES = create domain file
  - "Does a single item in an upper-level genome file require 3+ lines of explanation?" → YES = extract to domain file
- Even if `genome/domain/` is currently empty, treat it as "not yet created" rather than "not needed"

### 3. Diff Analysis
Compare source analysis with current Genome and identify:
- **Additions**: Things in code but not in Genome
- **Changes**: Things in Genome that no longer match code
- **Removals**: Things in Genome that no longer exist in code
- **Gaps**: Areas where Genome has placeholders but code has established patterns
- **Domain gaps**: Business rules in code that have no corresponding `domain/` file

### 4. Report to Human
Present a structured diff report:

```
🔄 Genome Sync Report
━━━━━━━━━━━━━━━━━━━━━

📝 principles.md
  + [New] API-first design pattern observed
  ~ [Changed] Layer structure: added shared/ directory

📝 conventions.md
  + [New] Biome used for linting (replacing ESLint)
  ~ [Changed] Test pattern: using vitest instead of jest

📝 constraints.md
  + [New] Validation command: bun test
  ~ [Changed] Runtime: Node.js compatible (was Bun-only)

📁 domain/
  + [Suggest] Create lifecycle-rules.md for REAP lifecycle logic
```

### 5. Apply Changes

**Sync Mode** (no active Generation):
- For each difference, ask the human: "Apply this change? (yes/no/modify)"
- Apply confirmed changes to the corresponding Genome files
- Follow Genome writing principles:
  - Each file ≤ 100 lines
  - If exceeding, extract to `domain/`
  - Follow `~/.reap/templates/domain-guide.md` for domain files

**Backlog Mode** (active Generation):
- Record each difference as a `type: genome-change` backlog item in `.reap/life/backlog/`
- Inform: "Genome changes recorded in backlog. They will be applied at the Completion stage."

## Completion
- **Sync Mode**: "Genome synchronized. [N] changes applied."
- **Backlog Mode**: "Genome differences recorded as [N] backlog items. Apply during Completion."
