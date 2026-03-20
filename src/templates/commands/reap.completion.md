---
description: "REAP Completion — Retrospect, evolve the Genome, and finalize the Generation"
---

# Completion

<HARD-GATE>
Do NOT apply Genome changes without human confirmation — UNLESS called from `/reap.evolve` (Autonomous Override active).
Do NOT finalize Genome changes without running Validation Commands.
</HARD-GATE>

## Gate (Preconditions)
- Read `.reap/life/current.yml` and verify that stage is `completion`
- Verify that `.reap/life/04-validation.md` exists
- If not met: ERROR — state the reason and **STOP**

## Context (Generation Info)
- Read `.reap/life/current.yml` for the current generation info (id, goal, genomeVersion)

## Steps

### Phase 0: Summary

1. Fill the `## Summary` section of `05-completion.md` using data from `current.yml` and `04-validation.md`:
   - **Goal**: from `current.yml` goal
   - **Period**: from `current.yml` startedAt ~ completedAt
   - **Genome Version**: from `current.yml` genomeVersion (v[N] → v[N+1])
   - **Result**: from `04-validation.md` result (pass/partial/fail)
   - **Key Changes**: brief one-line summary of what was delivered

### Phase 1: Retrospective

2. Read all `type: genome-change` and `type: environment-change` items from `.reap/life/backlog/`
3. Read the deferred task list from `.reap/life/03-implementation.md`
4. Compile lessons learned from this generation
   - **Limit**: Maximum 5 lessons. Keep only the most impactful ones.
5. Compile genome changes to apply (which genome file to modify and how)

### Phase 2: Garbage Collection (Codebase Health)

6. Referencing the Enforced Rules in `.reap/genome/conventions.md`, check codebase consistency:
   - Check whether new convention violations have been introduced
   - Identify technical debt incurred during implementation
7. For each piece of technical debt found, add it to `.reap/life/backlog/`:
   ```markdown
   ---
   type: task
   status: pending
   ---
   # [Title]
   [Description]
   ```

### Phase 3: Backlog Cleanup

8. Add deferred tasks to `.reap/life/backlog/` as `type: task`
9. Also add other next-generation goal candidates to the backlog
10. Finalize the retrospective with the human

### Phase 4: Genome Application

11. Read `type: genome-change` and `type: environment-change` items from `.reap/life/backlog/`
12. Apply genome-change items to the corresponding files in `.reap/genome/`:
    - **Map principle**: Each genome file should be **~100 lines or less**
    - If exceeding 100 lines, extract into files under `domain/`
    - **When writing domain/ files, follow the guide in `~/.reap/templates/domain-guide.md`**
13. Apply environment-change items to the corresponding files in `.reap/environment/`
14. **Verify**: Run the Validation Commands from constraints.md to confirm genome changes do not conflict with existing code
15. **Human confirmation**:
    - **If called from `/reap.evolve`** (Autonomous Override active): Apply genome changes automatically after Validation Commands pass. Do NOT pause for human confirmation.
    - **If called standalone**: Show the modified genome/environment content to the human and get approval. Do NOT finalize changes until the human approves.
16. For each applied `type: genome-change` and `type: environment-change` backlog item, update its frontmatter to `status: consumed` and add `consumedBy: gen-XXX-{hash}`

### Phase 5: Hook Suggestion

17. Read the last 3 completed generations from `.reap/lineage/` (sorted by gen number, most recent first)
    - For each: read `03-implementation.md` (Implementation Notes) and `05-completion.md` (Retrospective)
    - Identify **manual tasks that were repeated across 2+ generations**
    - Examples: docs update, lint fix, dependency sync, test data setup, specific file regeneration
18. If a repeated pattern is found, engage the human with a step-by-step confirmation:
    a. **Describe the pattern**: "최근 N개 generation에서 '[작업 설명]'이 반복적으로 수행되었습니다."
    b. **Ask if it should be a hook**: "이 작업을 hook으로 자동화할까요? (yes/no)"
    c. If yes, ask **event**: "어떤 이벤트에서 실행할까요?"
       - `onLifeCompleted` — generation 완료 후
       - `onLifeTransited` — stage 전환 시
       - `onLifeStarted` — generation 시작 시
       - `onLifeRegretted` — stage 회귀 시
    d. Ask **condition**: "실행 조건은 무엇인가요?"
       - `always` — 항상
       - `has-code-changes` — src/ 변경이 있을 때
       - `version-bumped` — version bump가 있을 때
       - Custom — 유저가 직접 기술
    e. Ask **hook name**: "hook 이름을 지어주세요 (예: lint-fix, docs-sync)"
    f. **Preview**: 생성될 hook 파일 내용을 보여주고 확인:
       ```
       파일: .reap/hooks/{event}.{name}.md
       ---
       condition: {condition}
       order: 50
       ---
       {작업 내용}
       ```
    g. 유저 확인 후 `.reap/hooks/{event}.{name}.md` 생성
19. 반복 패턴이 없으면 skip — "반복 패턴이 감지되지 않았습니다."
20. **Limit**: 한 번에 최대 2개까지만 제안 (과부하 방지)

### Phase 6: Lineage Compression

21. Check if lineage compression is needed:
    - Count total lines in `.reap/lineage/` and number of generations
    - **Level 1 trigger**: total lines > 5,000 AND generations >= 5
    - **Level 2 trigger**: Level 1 compressed `.md` files > 100
22. If Level 1 triggered:
    - Compress oldest uncompressed generation directories into single `.md` files
    - Protect: recent 3 generations + DAG leaf nodes
    - Preserve DAG metadata in frontmatter (id, parents, genomeHash)
23. If Level 2 triggered:
    - Run `git fetch --all` to update remote refs
    - Scan all branches (local + remote) for fork points
    - Compress eligible Level 1 files into single `epoch.md` (append if exists)
    - Protect: recent 9 Level 1 files + all generations at/after fork points
    - epoch.md frontmatter contains `generations` array with hash chain (id, parents, genomeHash)
24. Report compression results: "Compressed N generations (Level 1: X, Level 2: Y)"
    - If no compression needed: skip silently

## Self-Verification
Before saving the artifact, verify:
- [ ] Are lessons concrete and applicable to the next generation? (No vague "do better next time")
- [ ] Have genome changes been confirmed by the human?
- [ ] Do Validation Commands still pass after the changes?
- [ ] Have deferred tasks been added to the backlog?

❌ Bad lesson: "We should write more tests"
✅ Good lesson: "SSE streaming responses are difficult to unit test, so prioritize integration tests"

## Artifact Generation (Progressive Recording)
- **Language**: Write all artifact content in the user's configured language (see REAP Guide § Language).
- **Immediately upon entering this stage**: Read `~/.reap/templates/05-completion.md` and create `.reap/life/05-completion.md` with empty sections ready to fill
- **Update incrementally as each phase completes**:
  - After Phase 1 (Retrospective) → fill in Lessons Learned, Genome Change Proposals
  - After Phase 2 (Garbage Collection) → update with any tech debt findings
  - After Phase 3 (Backlog Cleanup) → fill in Deferred Task Handoff, Next Generation Backlog
  - After Phase 4 (Genome Application) → fill in Genome Changelog sections
- The artifact should reflect the current state of completion work at all times

## Completion
- **If called from `/reap.evolve`** (Autonomous Override active): Proceed automatically to `/reap.next`.
- **If called standalone**: "Finalize the generation with `/reap.next`. Lineage archiving will be performed automatically."
