---
type: task
status: consumed
consumedBy: gen-042-d87a87
consumedAt: 2026-03-27T13:04:41.463Z
priority: high
createdAt: 2026-03-27T12:53:17.049Z
---

# reap update CLI 명령 구현 — v0.16 프로젝트 업데이트 지원

## Problem

현재 `/reap.update`는 v0.15→v0.16 migration만 수행한다. v0.16 프로젝트에서 새 버전으로 업데이트했을 때 (npm install -g) 프로젝트 구조 동기화가 없다. skills 재설치는 postinstall에서 되지만, reap-guide 갱신, config 새 필드 backfill, 새 디렉토리 생성 등은 안 된다.

## Solution

1. `reap update` CLI 명령 추가:
   - v0.15 감지 → `reap init --migrate`로 위임 (기존 동작)
   - v0.16 감지 → 프로젝트 동기화 수행:
     - skills 재설치 (install-skills)
     - reap-guide.md 갱신 (~/.reap/)
     - config.yml 새 필드 backfill
     - 새 디렉토리 생성 (있으면 skip)
     - CLAUDE.md REAP 섹션 확인/보수
2. `/reap.update` skill 수정: `reap update` 호출로 변경 (v0.15/v0.16 분기를 CLI가 처리)

## Files to Change

- `src/cli/index.ts` — `reap update` 명령 라우팅 추가
- `src/cli/commands/update.ts` — 신규, v0.15/v0.16 분기 + 동기화 로직
- `src/adapters/claude-code/skills/reap.update.md` — `reap update` 호출로 변경
