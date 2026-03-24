---
description: "REAP Pull — Fetch remote changes and detect merge opportunities"
---

# Pull and Merge Detection

Fetch remote changes and detect branch divergence to determine if a merge is needed.

## Procedure

### 1. Fetch Remote Changes

```bash
git fetch --all
```

### 2. Detect Branch Divergence

Check divergence between the current branch and the remote branch.

```bash
git log --oneline HEAD..origin/<current-branch>    # commits only on remote
git log --oneline origin/<current-branch>..HEAD    # commits only on local
```

### 3. Check Other Reap Branches

Check if there are other work branches on remote.

```bash
git branch -r --no-merged
```

### 4. Guide Based on Results

**No divergence:**
- Display "In sync with remote." message.

**Fast-forward possible (only remote has new commits):**
- Perform fast-forward merge with `git pull --ff-only`.

**Divergence exists (both sides have new commits):**
- Display a divergence summary of the two branches.
- Suggest starting a merge generation:
  ```
  Branches have diverged. A merge is needed.
  Use /reap.merge to start a merge lifecycle.
  ```

**Other work branches exist:**
- Display the list of unmerged branches.
- Suggest merge if needed: `/reap.merge start -b <currentBranch>,<remoteBranch> "<goal>"`

## Notes

- If an active generation exists, complete or abort it before starting a merge.
- Check current state with `reap status` first.
