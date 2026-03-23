---
type: task
status: consumed
priority: high
consumedBy: gen-168-f8f638
---

# pull check에서 ahead/behind/diverged 정확히 구분

현재 lineage meta 기반으로만 비교하여 local ahead인 경우도 diverged로 판단. git rev-list로 ahead/behind 카운트 확인 필요.

## Problem
`reap run pull --phase check`에서 lineage meta 기반으로만 비교하여, local이 ahead인 경우도 `diverged: true`로 판단 → 불필요한 merge generation 추천.

올바른 분류:
- **up-to-date**: 동일
- **behind**: remote만 앞서있음 → fast-forward
- **ahead**: local만 앞서있음 → push 안내
- **diverged**: 양쪽 다 고유 커밋 → merge 필요

## Solution
lineage meta 비교 전에 `git rev-list --left-right --count HEAD...{target}` 로 ahead/behind 카운트 확인:
- ahead > 0 && behind == 0 → "ahead" 상태, push 안내
- ahead == 0 && behind > 0 → "behind" 상태, fast-forward 시도
- ahead > 0 && behind > 0 → "diverged", 기존 merge 로직
- 둘 다 0 → "up-to-date"

## Files to Change
- `src/cli/commands/run/pull.ts` — check phase에 git rev-list 기반 분류 추가
