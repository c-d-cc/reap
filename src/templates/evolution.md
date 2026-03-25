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

## Echo Chamber Prevention

- AI autonomous additions are only allowed within the direct cause/impact scope of the current goal
- "Nice to have" items go to backlog for human review
- Tag autonomous additions with `[autonomous]`

## Environment Refresh at Completion

- Sync environment/summary.md with current state during reflect phase
- Reflect structural changes, dependency updates, and new knowledge discovered
