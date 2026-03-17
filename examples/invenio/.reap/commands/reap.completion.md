---
description: "REAP Completion — Retrospect, evolve the Genome, and finalize the Generation"
---

# Completion

<HARD-GATE>
Do NOT apply Genome changes without human confirmation.
Do NOT finalize Genome changes without running Validation Commands.
</HARD-GATE>

## Gate (Preconditions)
- Read `.reap/life/current.yml` and verify that stage is `completion`
- Verify that `.reap/life/04-validation.md` exists
- If not met: ERROR — state the reason and **STOP**

## Context (Generation Info)
- Read `.reap/life/current.yml` for the current generation info (id, goal, genomeVersion)

## Steps

### Phase 1: Retrospective

1. Read all `type: genome-change` and `type: environment-change` items from `.reap/life/backlog/`
2. Read the deferred task list from `.reap/life/03-implementation.md`
3. Compile lessons learned from this generation
   - **Limit**: Maximum 5 lessons. Keep only the most impactful ones.
4. Compile genome changes to apply (which genome file to modify and how)

### Phase 2: Garbage Collection (Codebase Health)

5. Referencing the Enforced Rules in `.reap/genome/conventions.md`, check codebase consistency:
   - Check whether new convention violations have been introduced
   - Identify technical debt incurred during implementation
6. For each piece of technical debt found, add it to `.reap/life/backlog/`:
   ```markdown
   ---
   type: task
   ---
   # [Title]
   [Description]
   ```

### Phase 3: Backlog Cleanup

7. Add deferred tasks to `.reap/life/backlog/` as `type: task`
8. Also add other next-generation goal candidates to the backlog
9. Finalize the retrospective with the human

### Phase 4: Genome Application

10. Read `type: genome-change` and `type: environment-change` items from `.reap/life/backlog/`
11. Apply genome-change items to the corresponding files in `.reap/genome/`:
    - **Map principle**: Each genome file should be **~100 lines or less**
    - If exceeding 100 lines, extract into files under `domain/`
    - **When writing domain/ files, follow the guide in `domain/README.md`**
12. Apply environment-change items to the corresponding files in `.reap/environment/`
13. **Verify**: Run the Validation Commands from constraints.md to confirm genome changes do not conflict with existing code
14. **Human confirmation**: Show the modified genome/environment content to the human and get approval
    - Do NOT finalize changes until the human approves
15. Delete `type: genome-change` and `type: environment-change` backlog items that have been applied

## Self-Verification
Before saving the artifact, verify:
- [ ] Are lessons concrete and applicable to the next generation? (No vague "do better next time")
- [ ] Have genome changes been confirmed by the human?
- [ ] Do Validation Commands still pass after the changes?
- [ ] Have deferred tasks been added to the backlog?

❌ Bad lesson: "We should write more tests"
✅ Good lesson: "SSE streaming responses are difficult to unit test, so prioritize integration tests"

## Artifact Generation
- Read `.reap/templates/05-completion.md`
- Record the Retrospective and Changelog
- Save to `.reap/life/05-completion.md`

## Completion
- "Finalize the generation with `reap evolve --advance`. Lineage archiving will be performed automatically."
