---
type: task
status: consumed
consumedBy: gen-022-947193
consumedAt: 2026-03-26T05:41:56.744Z
priority: high
createdAt: 2026-03-26T05:41:16.823Z
---

# reap-guide.md 작성 — v16용 REAP 도구 가이드 (사용자 프로젝트 주입용)

## Problem

v15에는 `reap-guide.md`가 있어서 session start hook을 통해 AI에게 REAP 도구 사용법을 주입했음.
v16에는 이 가이드가 없음. `.reap/genome/`은 해당 프로젝트의 고유 지식이지, REAP 도구 자체의 사용법이 아님.
사용자가 자기 프로젝트에 `reap init`하면 AI는 REAP의 lifecycle, backlog, genome 개념 등을 알 수 없음.

## Solution

v16 구조에 맞는 `reap-guide.md` 작성:
- v16의 stage (learning → completion), genome 구조 (application/evolution/invariants)
- hook 시스템 (조건부 실행, 순서 제어 포함)
- CLI 커맨드 (`reap run`, `reap make backlog` 등)
- 3-Layer 모델, backlog 규칙, lineage 압축 등 핵심 개념
- v15 reap-guide.md (`~/cdws/reap_v15/src/templates/hooks/reap-guide.md`) 참조

배치: `src/templates/reap-guide.md` → 빌드 시 `dist/templates/`로 복사

## Files to Change

- `src/templates/reap-guide.md` — 신규 작성
- subagent prompt 공통화 작업에서 이 가이드를 로딩하도록 연동
