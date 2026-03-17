# Domain Rules — Writing Guide

> `genome/domain/` is a space for recording the **business domain rules** of the project.
> If `principles.md`, `conventions.md`, and `constraints.md` are the map of "what to do",
> `domain/` holds the details of "how, why, and how much".

## domain/ vs Upper-level Genome Files

| Upper-level Genome File | domain/ File |
|-------------------------|-------------|
| One-line architecture decision | Detailed rules, flows, and state transitions for that decision |
| Technical constraint summary | Thresholds, frequencies, conditions, and policy intent |
| Code pattern name | Pattern inputs/outputs, triggers, and exception cases |

**Example**: A one-liner in constraints.md: "Moderation suspension escalation: 3 times/1h → 30 min"
→ domain/moderation-policy.md contains the full pipeline, threshold table, and state transition details

## File Organization Principles

### 1. Separate by Business Domain Unit

Split files by **business rule grouping**, not by code structure (files, directories).

- **Good examples**: `interview-protocol.md`, `billing-rules.md`, `moderation-policy.md`
- **Bad examples**: `api-routes.md`, `database-tables.md`, `components.md`

Each domain file corresponds to one "topic you would ask a domain expert about".

### 2. Record Knowledge Not Directly Readable from Code

Do not write down things that can be learned by reading the code (function signatures, type definitions).
Record things that are difficult to determine from code alone:

- **Policy intent**: Why this threshold, why this order
- **Values and conditions**: Frequency (20–30%), limits (max 2), escalation steps
- **State machines**: Trigger → state transition → result
- **Domain term definitions**: Precise meaning of project-specific concepts

### 3. Agent-Implementable Level

An agent reading a domain file should be able to implement or modify the feature without additional questions.

- Structure with tables/diagrams
- Specify concrete values and conditions
- Include exception cases and edge cases
- Prohibit vague expressions like "it depends on the situation"

### 4. File Size

- Recommended: 40–80 lines
- Upper limit: 100 lines (same as the genome map principle)
- If exceeding 100 lines, split into sub-topics

### 5. Genome Total Budget (SessionStart Load)

- **L1** (upper-level genome files: principles, conventions, constraints): ~500 line limit. Always loaded in full
- **L2** (domain/ files): ~200 line limit. Loaded in full within budget; if exceeded, only titles + summaries are loaded (on-demand reading)
- As domain files grow, keep each file more concise or consolidate files with low reference frequency

## File Structure Template

```markdown
# [Domain Rule Name]

> [One-line description: scope covered by this file]

## [Core Concepts/Flows]
(Explain the core process or concepts of this domain)

## [Rules/Policy Table]
(Structure values, conditions, thresholds, etc. as a table)

## [State Transitions / Triggers]
(When does what occur)

## [Exceptions/Edge Cases]
(Exceptions to the general rules)
```

## Naming Rules

- Filename: `kebab-case.md`
- Names that intuitively represent the business domain
- Examples: `interview-protocol.md`, `article-generation.md`, `subscription-billing.md`

## When to Create a Domain File

- When a single item in an upper-level genome file requires 3+ lines of explanation
- When new business rules are added that don't fit the scope of existing files
- When a topic is something an agent implementing a feature would ask "where is this rule?"

## When NOT to Create a Domain File

- Implementation details that can be understood by reading the code
- One-off task notes (record these in life/)
- External library usage (refer to official documentation for these)
