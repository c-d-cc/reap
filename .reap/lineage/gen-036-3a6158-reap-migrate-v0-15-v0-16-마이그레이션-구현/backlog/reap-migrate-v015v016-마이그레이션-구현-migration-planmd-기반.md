---
type: task
status: consumed
consumedBy: gen-036-3a6158
consumedAt: 2026-03-26T13:42:30.871Z
priority: high
createdAt: 2026-03-26T13:41:50.187Z
---

# reap migrate — v0.15→v0.16 마이그레이션 구현 (migration-plan.md 기반)

## Problem

v0.15 사용자가 v0.16을 설치하면 .reap/ 구조 불일치로 모든 CLI 명령이 실패.
genome 파일명 변경, config 필드 변경, stage 이름 변경, vision 디렉토리 부재 등 30개 호환성 문제.

## Solution

상세 계획: `.reap/vision/docs/migration-plan.md` 참조.

핵심:
1. `reap init --migrate` CLI + `/reap.migrate` 스킬
2. 모든 v0.16 CLI에 v0.15 감지 gate (principles.md 존재 → migrate 안내)
3. .reap/v15/로 백업 → 새 .reap 구성
4. genome AI 기반 재구성 (principles/conventions/constraints → application/evolution/invariants)
5. config 필드 마이그레이션
6. hooks 이벤트명 자동 매핑 (onLifeObjected → AI 추론)
7. vision interaction (adoption 수준)
8. 2-3 gen 후 백업 자동 삭제
9. postinstall에서 v0.15 감지 안내

## Files to Change

신규:
- `src/cli/commands/migrate.ts` — migration 핵심 로직
- `src/adapters/claude-code/skills/reap.migrate.md` — slash command
- `tests/e2e/migrate.test.ts` — e2e 테스트

수정:
- `src/cli/index.ts` — reap init --migrate 등록
- `src/cli/commands/run/index.ts` — v0.15 감지 gate
- `src/cli/commands/status.ts` — v0.15 감지 gate
- `src/cli/commands/fix.ts` — v0.15 감지 gate
- `src/cli/commands/make.ts` — v0.15 감지 gate
- `src/cli/commands/cruise.ts` — v0.15 감지 gate
- `package.json` — postinstall 확장
