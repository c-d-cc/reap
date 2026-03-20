# Objective
## Goal
postinstall.cjs Phase 2 수정 — ~/.reap/commands/ 전용 설치
## Completion Criteria
1. postinstall.cjs가 ~/.reap/commands/에만 원본 설치
2. ~/.claude/commands/에 원본 복사 하지 않음
3. 기존 redirect 파일 자동 삭제
## Background
- npm update -g 시 postinstall.cjs가 ~/.claude/commands/에 원본을 복사하는 버그
- Phase 2에서 installCommands()는 수정했지만 postinstall.cjs는 독립 CJS라 누락
