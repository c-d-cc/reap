# Evolution

## Language
Source code is in English. AI responds in user's configured language (config.yml `language` field).

## Clarity-driven Interaction

AI adjusts communication depth based on the current context's clarity level.

| Clarity | State | AI Behavior |
|---------|-------|-------------|
| High | Goal clear, backlog specific | Confirm briefly, then execute. Minimize questions. |
| Medium | Direction exists, details unclear | Present options + tradeoffs |
| Low | Goal ambiguous, next steps unknown | Active interaction — questions, examples, suggestions |

### Clarity Indicators
- vision/goals.md has specific, actionable goals → high
- Backlog has clear tasks → high
- Genome is unstable (embryo, frequent changes) → low
- Short lineage, direction not established → low

## Genome Management Principles

- **Embryo**: Genome can be modified directly. Be intentional about timing — establish early in the generation, then work on top of it.
- **Normal**: Genome is immutable. Changes go to backlog → applied at adapt phase → effective from next generation.
- **Lessons discovered mid-generation go into the completion artifact**. Genome modifications happen at adapt phase. Changing genome mid-generation undermines the foundation of prior work in that generation.

## Code Quality Principles

Before writing new code, always read existing code first to understand established patterns.

- **Pattern-first**: Identify how existing code with the same role is structured. New code must follow that pattern.
- **Consistency over preference**: Codebase consistency takes priority over personal preference. If a better pattern exists, refactor all instances — don't introduce a second pattern alongside the first.
- **No duplication**: The same logic must not exist in two places. Extract and share when duplication is found.
- **Verify before commit**: Before committing, verify new code matches existing patterns and contains no duplication.
- **Enforced conventions in application.md**: Deliberate design decisions that cannot be derived from code alone (especially when violations exist in the codebase) should be recorded in application.md. When stated, application.md conventions take precedence over the current state of the code.

## Testing Principles

### Mandatory Rules
- **New feature = test required**: Every new feature must have corresponding test code. A feature without tests is not complete.
- **Modified feature = update existing tests**: When modifying existing logic, find and update related tests to match the new behavior, then re-run.
- **Fresh execution only**: Never reuse previous test results. Always run tests fresh.

### Test Level Guidelines
- **Unit test**: Verify input/output of isolated functions/modules. Best for pure logic without external dependencies.
- **E2E test**: CLI command → JSON output verification. Confirms full flow works correctly.
- **Scenario test**: Reproduce real usage scenarios in a sandbox environment. Tests multi-command combinations, state transitions, error recovery.

### Test Level Selection
| Change Type | Required Test |
|------------|--------------|
| Core function add/modify | unit test |
| CLI command add/modify | e2e test |
| Lifecycle flow change | e2e + scenario test |
| Init/genome/environment structure change | scenario test (sandbox) |
| Prompt-only change | e2e if functional impact, skip if cosmetic |

### Test Feedback Loop
- Record environment issues or insights discovered during testing in the completion artifact, and reflect in genome if needed.
- If test failures stem from environment differences (OS, Node version, etc.), record in environment.

## Echo Chamber Prevention

- AI autonomous additions are only allowed within the direct cause/impact scope of the current goal
- "Nice to have" items go to backlog for human review
- Tag autonomous additions with `[autonomous]`

## No Workarounds — Root Cause Tracking

When encountering a problem, never work around it and move on. Always track the root cause and create a fix plan.

- **Fixable now**: Fix within the current generation
- **Not fixable now**: Analyze root cause + create backlog (include reproduction conditions, root cause, fix direction)
- **Never do**: Manually bypass an error and move on without mention

Decision rule: "If this problem occurs again, would I have to repeat the same workaround?" → If yes, a root cause fix is required.

## Environment Refresh at Completion

Incrementally update environment/summary.md during reflect phase:
- Based on files changed in implementation, update only affected environment sections
- Not a full rewrite — reflect only what changed (file additions/deletions, dependency changes, build changes)
- Primary update targets: Tech Stack, Source Structure, Tests sections

## Genome vs Environment Boundary

- **genome (application.md)**: prescriptive — "how things should be" (principles, design decisions, conventions, rules). Genome is immutable in normal mode, so do not put frequently changing factual information here.
- **environment (summary.md)**: descriptive — "how things currently are" (tech stack, source structure, build, tests, dependencies). When code changes, only environment is updated.
- Decision rule: "If this information changes, does the genome need updating?" → Yes = genome, No = environment.
