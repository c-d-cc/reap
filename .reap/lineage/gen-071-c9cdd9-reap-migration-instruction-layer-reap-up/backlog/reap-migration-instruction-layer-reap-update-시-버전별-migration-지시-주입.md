---
type: task
status: consumed
priority: high
createdAt: 2026-06-27T15:34:33.094Z
consumedBy: gen-071-c9cdd9
consumedAt: 2026-06-27T15:42:52.653Z
---

# REAP migration instruction layer — reap update 시 버전별 migration 지시 주입

## 배경

각 REAP 버전 업데이트 시 AI agent가 '무엇을 마이그레이션해야 하는지' 명확히 인지할 수 있는 별도 레이어가 필요하다.

현재는 reap-guide.md 가이드만 업데이트되므로, 기존 구조로 작업하던 agent가 새 버전으로 업그레이드했을 때 기존 artifact/memory를 새 기준에 맞게 재조직해야 한다는 신호를 받지 못함.

## 설계 방향 (초안)

1. **`lastMigratedVersion` 필드** — `.reap/config.yml`에 추가. 이 프로젝트가 어디까지 migration됐는지 추적.

2. **버전별 migration 지시 파일** — `src/templates/migration/v{version}.md` 형태. AI 행동 지시 포함 (예: v0.17.1.md에 'vision memory를 content-type 기준으로 재분류하라').

3. **`reap update` 로직 확장** — 현재 패키지 버전 vs `lastMigratedVersion` 비교 → gap 버전들의 migration 파일을 순서대로 SessionStart context에 주입.

4. **완료 시그널** — agent 마이그레이션 완료 후 `lastMigratedVersion` 갱신 (별도 커맨드 또는 reap update --mark-migrated).

## 미결 설계 질문

- agent가 migration 완료를 어떻게 시그널하는가
- SessionStart 주입 vs reap update 출력 중 어느 쪽이 적합한가
- migration 실패/부분 완료 처리
- migration 파일의 scope: AI 지시만? code-level 변경도?

## 관련 generation

gen-070: vision memory content-type 재분류 (이 레이어가 있었다면 v0.17.1 migration note로 처리됐을 작업)

## Problem

REAP 버전 업그레이드 후 agent가 기존 프로젝트의 memory/artifact를 새 기준에 맞게 재조직해야 할 때, 그 신호를 받지 못해 구 기준 그대로 계속 사용하게 된다.

## Solution

위 설계 방향 참조. `reap update` 가 버전 gap 감지 → 해당 버전 migration 파일 읽기 → SessionStart context 주입 → agent 실행 → 완료 시 `lastMigratedVersion` 갱신.

## Files to Change

- `src/cli/commands/update.ts` — 버전 gap 감지 + migration 파일 로드 + context 주입 로직
- `src/cli/commands/load-context.ts` — pending migration 주입 섹션 추가
- `.reap/config.yml` (schema) — `lastMigratedVersion` 필드
- `src/types/index.ts` — `ReapConfig.lastMigratedVersion?: string`
- `src/templates/migration/` — 버전별 migration 지시 파일 디렉토리 (신설)
- `src/templates/migration/v0.17.1.md` — 첫 번째 migration note (vision memory content-type 재분류)
