---
type: task
status: pending
priority: medium
---

# 기존 reap 프로젝트에 CLAUDE.md 추가 (migration)

## Problem
이미 .reap/으로 관리되고 있는 프로젝트는 re-init이 차단됨. 이 프로젝트들에는 CLAUDE.md가 없을 수 있음.
reap 업데이트 후 CLAUDE.md가 필요해진 경우, update agent 또는 별도 명령으로 CLAUDE.md를 추가해야 함.

## Solution
- update agent의 migration 로직에서 CLAUDE.md 존재 여부 확인
- 없으면 생성, 있으면 reap 섹션 존재 여부 확인 후 안내
- 또는 `reap init --repair` 같은 명령으로 누락 파일만 보충
