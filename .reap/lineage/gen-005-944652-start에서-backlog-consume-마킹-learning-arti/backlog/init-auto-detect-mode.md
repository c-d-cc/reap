---
type: task
status: pending
priority: high
---

# reap init 자동 모드 감지

## Problem
현재 `reap init`에서 `--mode greenfield|adoption` 파라미터를 받음. 사용자가 판단할 필요 없이 프로젝트 상태에서 자동 감지 가능.

## Solution
- 디렉토리가 비어있거나 거의 비어있으면 → greenfield
- 이미 소스 코드가 있으면 → adoption
- `--mode` 파라미터 제거 (또는 override용으로만 유지)

## 감지 기준
- src/, lib/, app/ 등 코드 디렉토리 존재 여부
- package.json, Cargo.toml, go.mod 등 프로젝트 파일 존재 여부
- 파일 수가 일정 threshold 이하면 greenfield

## Files to Change
- src/cli/index.ts — init command에서 --mode 제거 또는 optional화
- src/cli/commands/init/index.ts — 자동 감지 로직 추가
- src/adapters/claude-code/skills/reap.init.md — 파라미터 안내 수정
