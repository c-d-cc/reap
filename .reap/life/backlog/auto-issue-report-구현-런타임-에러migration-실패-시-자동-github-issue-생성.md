---
type: task
status: pending
priority: medium
createdAt: 2026-03-27T14:34:40.332Z
---

# auto issue report 구현 — 런타임 에러/migration 실패 시 자동 GitHub issue 생성

## Problem

런타임 에러나 migration 실패 시 사용자가 수동으로 issue를 작성해야 함. v0.15에서는 gh CLI로 자동 issue 생성 + AI 기반 수동 report 기능이 있었다.

## Solution

### 자동 report (2경로)
1. `reap run <command>` 실행 중 unexpected error → `gh issue create --repo c-d-cc/reap --label "auto-reported,bug" --body "..."`
2. `reap update` 중 migration 에러 → 동일 패턴, label "auto-reported,migration"
- gh CLI 미설치 시 silent skip
- best-effort (실패해도 원래 에러 전달)
- issue 본문: REAP 버전, 명령어, 에러 메시지, OS, Node 버전

### 수동 report (/reap.report skill)
- `reap run report` CLI + prompt 기반: AI가 context 수집 → privacy 필터링 → 사용자 확인 → gh issue create
- 민감 정보 마스킹 (이메일, API 키, 소스 코드 블록)

v0.15 참조:
- ~/cdws/reap_v15/src/cli/commands/run/index.ts:57-82 (자동 report)
- ~/cdws/reap_v15/src/cli/commands/update.ts:305-316 (migration 실패)
- ~/cdws/reap_v15/src/cli/commands/run/report.ts (수동 report)

## Files to Change

- src/core/report.ts — 신규 (autoReport 함수, gh issue create 래퍼)
- src/cli/commands/run/index.ts — catch 블록에 autoReport 호출
- src/cli/commands/update.ts — migration 에러 시 autoReport
- src/cli/commands/run/report.ts — 신규 (수동 report prompt)
- src/adapters/claude-code/skills/reap.report.md — 신규 skill
