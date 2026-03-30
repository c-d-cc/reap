# Learning

> fix: migrate/update 관련 테스트 8건 수정

## Project Overview

REAP v0.16.0, 59번째 generation (embryo). 이전 세대에서 디렉토리 구조 변경(vision/docs -> vision/design)과 legacy cleanup 로직 리팩토링 이후 테스트 8건이 깨진 상태.

## Source Backlog

`fix-migrate-update-tests.md` 기반. cleanupLegacyProjectSkills 4건, migrate E2E 3건, update E2E 1건 수정 필요.

## Key Findings

### 1. cleanupLegacyProjectSkills 실패 (4건) — 근본 원인

`src/core/integrity.ts` line 649의 `LEGACY_PREFIX_PATTERN`:
```
/^reap\.[^.]+\.md$/
```

이 패턴의 문제:
- `reapdev.*` prefix를 매칭하지 못함 (코드 주석은 "reap.* or reapdev.*" 삭제라고 했으나 실제 패턴은 `reap.`만)
- `.md` suffix를 강제하여 skill 디렉토리(예: `reap.objective`)를 매칭하지 못함

**수정 방향**: commands용 패턴과 skills용 패턴을 분리하고 reapdev.* 도 포함.
- commands: `/^(reap|reapdev)\.[^.]+\.md$/` (파일, .md 필수)
- skills: `/^(reap|reapdev)\./` (디렉토리, .md 불필요)

### 2. migrate E2E "new directory structure exists" 실패 (1건)

`src/cli/commands/migrate.ts` line 401:
```ts
await ensureDir(join(paths.vision, "docs"));  // 잘못된 경로
```
`vision/docs`가 아닌 `vision/design`(`paths.visionDesign`)을 생성해야 함.

### 3. migrate E2E legacy cleanup 실패 (2건)

cleanupLegacyProjectSkills의 regex 버그로 skill 디렉토리가 삭제되지 않음. #1 수정으로 해결.

### 4. update E2E "update creates missing directories" 실패 (1건)

`tests/e2e/update.test.ts` line 65:
```ts
await rm(join(dir, ".reap", "vision", "docs"), { recursive: true });
```
`vision/docs`는 더 이상 존재하지 않음. `vision/design`으로 변경 필요.

## Backlog Review

- `strict-merge-mode-bypass-for-merge-gen.md` — gen-058에서 consumed 예정
- `daemon-e2e-tests.md` — 이번 generation과 무관

## Context

Clarity: HIGH. 실패 원인이 명확하고 수정 범위가 좁음.

수정 대상 파일:
- `src/core/integrity.ts` — LEGACY_PREFIX_PATTERN regex 수정 + skills 패턴 분리
- `src/cli/commands/migrate.ts` — vision/docs -> vision/design 경로 수정
- `tests/e2e/update.test.ts` — vision/docs -> vision/design 경로 수정
