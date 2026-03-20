# Completion

## Retrospective
Claude Code는 `.claude/commands/`에서 symlink를 따라가지 않는다는 것을 발견.
session-start.cjs의 커맨드 설치 방식을 symlink → file copy로 변경하여 해결.

## Changes Summary
- `src/templates/hooks/session-start.cjs`: Step 0 symlink → copyFile 변경

## Genome Changes
없음 — 기존 genome에 영향 없음

## Backlog
없음
