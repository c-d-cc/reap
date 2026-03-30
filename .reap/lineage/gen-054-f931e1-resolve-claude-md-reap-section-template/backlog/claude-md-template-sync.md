---
type: task
status: consumed
consumedBy: gen-054-f931e1
consumedAt: 2026-03-30T05:50:57.009Z
priority: medium
createdAt: 2026-03-30T05:44:41.943Z
---

# claude-md-template-sync

reap update 시 CLAUDE.md의 REAP 섹션이 템플릿 변경을 반영하지 못함. ensureClaudeMd()가 .reap/genome/ 존재 여부만 체크하고 skip하므로, 템플릿이 바뀌어도 기존 내용이 유지됨. 버전/해시 기반 REAP 섹션 교체 메커니즘 필요.

## Problem

`ensureClaudeMd()`는 CLAUDE.md에 `.reap/genome/` 문자열이 존재하면 "skipped" 반환 — 템플릿 내용이 바뀌어도 기존 REAP 섹션을 업데이트하지 않음.

gen-053에서 CLAUDE.md 내용이 크게 변경됨 (파일 목록 9개 → 자동 로딩 안내 + fallback). 이 변경이 기존 프로젝트에 전파되지 않음.

양쪽 위치 모두 해당: root `CLAUDE.md`, `.claude/CLAUDE.md`.

## Solution

REAP 섹션에 버전 마커를 삽입하여 변경 감지:
1. 템플릿에 `<!-- reap-section-v{hash} -->` 같은 마커 추가
2. `ensureClaudeMd()`에서 마커 비교 — 해시 불일치 시 기존 REAP 섹션을 새 템플릿으로 교체
3. 사용자 커스텀 내용(REAP 섹션 밖)은 보존
4. REAP 섹션 경계를 명확히 구분하는 시작/끝 마커 필요 (예: `<!-- reap:start -->` ... `<!-- reap:end -->`)

## Files to Change

- `src/templates/claude-md-section.md` — 시작/끝 마커 + 버전 해시 추가
- `src/cli/commands/init/common.ts` — `ensureClaudeMd()`: 마커 감지 → 섹션 교체 로직
- `CLAUDE.md` — 마커 적용 (dogfooding)
