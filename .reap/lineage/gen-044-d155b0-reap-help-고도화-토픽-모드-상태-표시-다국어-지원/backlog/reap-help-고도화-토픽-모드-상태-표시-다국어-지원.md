---
type: task
status: consumed
priority: high
consumedBy: gen-044-4d3c48
---

# reap help 고도화 — 토픽 모드, 상태 표시, 다국어 지원


## Problem

현재 `reap help`는 단순 텍스트 출력만 한다. v0.15에서는 토픽 모드(`/reap.help <topic>`), 현재 generation 상태 표시, 다국어 지원(config.yml language 기반)이 있었으나 v0.16에서 미이식.

## Solution

v0.15의 `~/cdws/reap_v15/src/cli/commands/run/help.ts`를 참조하여 v0.16 구조에 맞게 이식:

1. **토픽 모드**: `reap run help <topic>` → reap-guide.md를 context로 AI에게 토픽 설명 위임
2. **상태 표시**: 현재 generation id, goal, stage 표시
3. **다국어**: config.yml의 language 필드 → 지원 언어(en/ko/ja/zh-CN)면 해당 언어로 출력, 미지원이면 AI 번역 위임
4. **명령어 테이블**: v0.16 slash commands로 업데이트 (마크다운 표)
5. reap.help.md skill에서 `reap run help` 호출하도록 변경 (토픽 전달 가능)

## Files to Change

- `src/cli/commands/help.ts` — 전면 재작성 (토픽, 상태, 다국어)
- `src/adapters/claude-code/skills/reap.help.md` — `reap run help` 호출로 변경
- `src/cli/commands/run/index.ts` — help stage 라우팅 추가 (또는 기존 help 명령에서 처리)

## Context

v0.15 참조: `~/cdws/reap_v15/src/cli/commands/run/help.ts`
