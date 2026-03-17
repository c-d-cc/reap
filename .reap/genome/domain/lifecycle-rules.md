# Lifecycle Rules

> Immutable principles, stage transition rules, and artifact generation rules for the 5-stage lifecycle

## Stage Order

```
Objective → Planning → Implementation ⟷ Validation → Completion
```

## Stage Transition Rules

- Stage transitions must only be performed via `/reap.next` (forward) or `/reap.back` (regression)
- Directly modifying `current.yml` to change stages is **prohibited**
- When `/reap.next` is executed, the next stage's artifact is generated from `~/.reap/templates/`

## Artifact Rules

| Stage | Artifact | Gate (previous artifact required) |
|-------|----------|-----------------------------------|
| Objective | 01-objective.md | - |
| Planning | 02-planning.md | 01-objective.md |
| Implementation | 03-implementation.md | 02-planning.md |
| Validation | 04-validation.md | 03-implementation.md |
| Completion | 05-completion.md | 04-validation.md |

- Progressive Recording: Create artifact immediately upon stage entry, update incrementally during work
- Batch writing after waiting for completion is prohibited

## Regression (Micro Loop)

- Regression to a previous stage is possible from any stage
- Regression reason is recorded in the timeline + a `## Regression` section is added to the target artifact
- Artifact handling: Preserve before target, overwrite target (implementation uses append), preserve after target → overwrite on re-entry

## Immutability Principles

- **Genome immutability**: Direct genome modification during the current generation is prohibited. Record in backlog → apply during Completion
- **Environment immutability**: Same as above. Record in backlog → apply during Completion
- **Exception**: Initial genome setup is allowed during the first generation's Objective

## Backlog Status Management

- All backlog items have a `status` field in frontmatter
- `status: pending` — Unprocessed item (default, treated as pending if absent)
- `status: consumed` — Processed item (`consumedBy: gen-XXX` required)
- **Marking timing**:
  - `/reap.start`: Backlog selected as goal → consumed
  - `/reap.completion`: Applied genome-change/environment-change → consumed
- **Archiving timing** (`/reap.next` from completion):
  - consumed → moved to lineage
  - pending → copied to lineage + carried over to new backlog

## Minor Fix

- Trivial fixes under 5 minutes with no design changes (typo, lint error)
- Recorded in the current artifact without stage transition
