---
type: task
status: consumed
consumedBy: gen-012-856e91
consumedAt: 2026-03-25T15:43:39.315Z
priority: high
---

# tests 폴더를 git submodule로 분리

## Problem
reap v0.15에서 tests/는 별도 repo의 git submodule로 관리됨. v0.16.0에서는 현재 reap-se에서 복사한 tests가 일반 폴더로 들어가 있음.

## Solution
- v0.15의 tests submodule 구조를 확인하고 동일하게 적용
- tests/ 폴더를 별도 repo로 분리하거나 기존 tests repo 활용
- `.gitmodules`에 submodule 등록
- 기존 reap main branch의 submodule 설정 참조: `git show main:.gitmodules`

## Reference
- v0.15: `.gitmodules` 파일에 tests submodule 설정 존재
- tests repo 위치 확인 필요 (기존 remote URL)
