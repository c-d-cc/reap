# Learning

## Project Overview

REAP v0.16.0 CLI 도구. `check-version.ts`의 `performAutoUpdate()`가 `npm install -g @c-d-cc/reap@latest`로 자기 자신을 업그레이드한 뒤 `reap update`로 프로젝트 동기화를 수행하는데, 이 `reap update`는 여전히 구 바이너리(현재 프로세스)가 실행한다. 새 바이너리가 프로젝트 동기화를 해야 새 버전의 변경사항이 정확히 반영된다.

## Key Findings

### 현재 코드 분석

**`check-version.ts` (performAutoUpdate)**:
- L123: `npm install -g @c-d-cc/reap@latest` 실행
- L130-138: 성공 후 `reap update`를 구 바이너리로 실행 (문제의 지점)
- 전체가 try/catch로 감싸여 있어 silent fail 보장

**`update.ts` (execute)**:
- `--phase` 옵션만 지원 (v0.15 migration용)
- `--post-upgrade` 플래그 미지원
- v0.16 sync: config backfill + directory creation + CLAUDE.md repair

**`index.ts` (CLI routing)**:
- update 명령: `--phase` 옵션만 등록

### v0.15 참조 패턴

v0.15의 `handOffToNewBinary()`:
- `reap update --post-upgrade`를 `execSync`로 실행 (stdio: inherit, timeout: 120s)
- 새 바이너리가 `--post-upgrade` 플래그를 받으면 selfUpgrade skip, 프로젝트 동기화만 수행
- hand-off 실패 시 현재 바이너리로 fallback (기존 updateProject 실행)

### 변경 범위

1. **`check-version.ts`**: `performAutoUpdate()`에서 npm install 성공 후 `handOffToNewBinary()` 호출. 성공 시 `reap update` skip, 실패 시 기존 fallback 유지
2. **`update.ts`**: `--post-upgrade` 플래그 지원 — v0.15 detect/migration skip, 바로 v0.16 sync 수행
3. **`index.ts`**: update 명령에 `--post-upgrade` 옵션 추가

## Previous Generation Reference

gen-046: `reap config` 명령 구현. 454 tests pass. fitness: ok.

## Backlog Review

이번 generation의 source backlog:
- **[task] hand-off 구현 — 업그레이드 후 새 바이너리 위임** (consuming)

관련 없는 pending:
- auto issue report 구현
- release notice 구현

## Context for This Generation

- **Clarity: HIGH** — backlog에 구체적 solution과 파일 목록이 있고, v0.15 참조 코드도 명확
- **Embryo type** — genome 수정 자유
- **테스트 전략**: `performAutoUpdate()`와 `handOffToNewBinary()`는 execSync 의존이라 unit test 어려움. `update.ts`의 `--post-upgrade` 분기는 e2e에서 검증 가능. 기존 454 tests 유지 + 신규 테스트 추가
- v0.16 update.ts는 JSON stdout 패턴 (`emitOutput`)을 따르므로, `--post-upgrade` 처리도 동일 패턴 유지
