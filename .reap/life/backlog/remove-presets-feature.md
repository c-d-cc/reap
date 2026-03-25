---
type: task
status: pending
priority: medium
---

# Presets 기능 제거

## Problem
v0.15의 presets 기능은 v0.16에서 불필요. init이 auto-detect + 대화형으로 변경되면서 preset의 역할이 없어짐.

## Solution
- config.yml에서 preset 필드 제거
- init 코드에서 preset 관련 로직 제거 (있다면)
- docs/README에서 preset 참조 제거
