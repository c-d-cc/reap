---
type: task
status: consumed
priority: medium
consumedBy: gen-149-00cf81
---

# migration-spec.ts가 integrity.ts를 SSOT로 사용하도록 리팩토링

## 문제

- `src/core/integrity.ts` — `.reap/` 구조 검사의 SSOT. config 필드, genome 파일, lineage meta, backlog frontmatter, artifact 등 상세 검증
- `src/core/migration-spec.ts`의 `detectMigrationGaps()` — 별도로 구조 검사를 하드코딩. integrity.ts와 중복되며 기준이 다를 수 있음
- `buildMigrationSpec()` — slash command 수(29개) 등 하드코딩된 수치가 실제(32개)와 불일치

## 해결 방향

1. `detectMigrationGaps()`를 `integrity.ts`의 `checkIntegrity()`로 대체하거나, `checkIntegrity()` 결과를 기반으로 gap을 추출
2. `buildMigrationSpec()`의 하드코딩 수치를 동적으로 생성하거나, integrity.ts의 검증 기준과 동기화
3. integrity.ts가 구조 검사의 유일한 기준점(SSOT)이 되도록 보장

## 추가: integrity에 falsy 검사 추가

integrity.ts가 "있어야 할 것" 뿐 아니라 "있으면 안 되는 것"도 검사하도록 확장:

| 검사 대상 | 조건 | 심각도 |
|-----------|------|--------|
| `~/.claude/skills/reap.*` | user-level에 reap skills 존재 | error — session-start가 잘못된 cwd에서 실행된 흔적 |
| `~/.claude/commands/reap.*` | user-level에 레거시 reap commands 존재 | warning — Phase 2 마이그레이션 잔재 |
| `~/.config/opencode/commands/reap.*` | user-level에 레거시 opencode commands 존재 | warning — Phase 2 마이그레이션 잔재 |
| `.claude/commands/reap.*` | project-level에 레거시 commands 존재 | warning — skills로 마이그레이션 필요 |

이 검사들은 프로젝트 `.reap/` 범위를 넘어 user-level 경로까지 포함하므로, 별도 함수(`checkUserLevelArtifacts`)로 분리하고 `reap fix --check`에서 opt-in으로 실행하는 방안 검토.

## 영향 범위

- `src/core/migration-spec.ts` — `detectMigrationGaps()`, `buildMigrationSpec()`
- `src/cli/commands/update.ts` L220-231 — gap 감지 + spec 생성 로직
- `src/core/integrity.ts` — falsy 검사 추가 (SSOT 역할 확장)
