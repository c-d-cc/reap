---
description: "REAP Abort — Abort the current generation and return to initial state"
---

# Abort

Abort the current generation and return to initial state.

## Gate (Preconditions)
- Read `.reap/life/current.yml`
- If no active Generation: ERROR — "No active Generation to abort." **STOP**

## Steps

### 1. Show Current State
- Display: generation id, goal, current stage
- Ask: "이 generation을 abort 하시겠습니까?"
- If no: **STOP**

### 2. Abort Reason
- Ask: "abort 사유를 입력해주세요"

### 3. Source Code Handling
- Check `git diff --name-only` for uncommitted changes
- If no changes: skip to Step 4
- If changes exist, present the changed files and ask:
  - **rollback**: `git checkout .` — 모든 변경 revert
  - **stash**: `git stash push -m "reap-abort: {gen-id}"` — stash에 저장
  - **hold**: 변경 유지 (working tree에 그대로)

### 4. Backlog Save
- Ask: "Goal과 진행 상황을 backlog에 저장할까요? (yes/no)"
- If yes:
  - Read `01-objective.md` for goal/spec content
  - Read `03-implementation.md` if exists for progress
  - Create `.reap/life/backlog/aborted-{gen-id}.md`:
    ```markdown
    ---
    type: task
    status: pending
    aborted: true
    abortedFrom: {gen-id}
    abortReason: "{reason}"
    stage: {current stage}
    sourceAction: rollback|stash|hold
    stashRef: "reap-abort: {gen-id}"  # only if stash
    changedFiles:
      - {file1}
      - {file2}
    ---

    # [Aborted] {goal}

    ## Original Goal
    {goal from objective}

    ## Progress
    {stage} 단계에서 중단.
    {implementation summary if available}

    ## Resume Guide
    {if stash: "git stash pop으로 코드 복구"}
    {if hold: "코드 변경이 working tree에 유지됨"}
    {if rollback: "코드 변경이 revert됨. objective부터 재시작 필요"}
    ```

### 5. Cleanup
- Delete all artifact files from `.reap/life/` (`01-*.md` through `05-*.md`)
- Clear `current.yml` (write empty content)
- Do NOT record in lineage (incomplete generation)

## Completion
- "Generation {gen-id} aborted. {backlog saved / not saved}."
