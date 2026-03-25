# Learning — gen-014-79409d

## Goal
Test Phase 3: core 함수 unit tests

## Source Backlog
`test-phase-3-core-함수-unit-tests.md` — core 모듈에 unit test가 없음. 대상:
- backlog.ts — createBacklog, scanBacklog, consumeBacklog, toKebabCase
- nonce.ts — generateToken, verifyToken
- generation.ts — create, countLineage, ID 생성
- archive.ts — archiveGeneration (consumed-only backlog 검증)
- compression.ts — compressLineage (threshold, protected count)

## Project Overview
REAP은 TypeScript/Bun 기반 자기진화형 개발 파이프라인 CLI. core 모듈은 lifecycle, generation, nonce, archive, compression, backlog 등 18개 모듈로 구성.

## Key Findings

### 기존 테스트 패턴 (tests/unit/lifecycle.test.ts)
- `bun:test`에서 `describe`, `test`, `expect` import
- `../../src/core/` 경로로 직접 import
- 순수 함수 테스트 — 외부 의존 없음, temp dir 불필요

### 테스트 대상 모듈 분석

**backlog.ts**: 파일 기반 함수들. `createBacklog`는 파일 생성, `scanBacklog`는 디렉토리 읽기+파싱, `consumeBacklog`는 상태 변경, `toKebabCase`는 순수 함수. temp dir 필요.
- `readTextFile`/`writeTextFile`은 `./fs.ts`의 유틸 사용
- frontmatter 파싱은 내부 함수 (parseFrontmatter, extractTitle)

**nonce.ts**: 순수 crypto 함수. `generateToken(genId, stage, phase)` → `{nonce, hash}`, `verifyToken(nonce, genId, stage, phase, expectedHash)` → boolean. temp dir 불필요.

**generation.ts**: `GenerationManager` 클래스. `ReapPaths` 의존. `create()` → ID 생성 + current.yml 저장, `countLineage()` → lineage 디렉토리 카운트, `save()`/`current()` → YAML 직렬화/역직렬화. temp dir + mock paths 필요.

**archive.ts**: `archiveGeneration(paths, state, feedback?)`. life/ → lineage/ 복사, consumed backlog만 아카이브, pending은 유지. temp dir + 복잡한 셋업 필요.

**compression.ts**: `compressLineage(lineageDir)`. LEVEL1_THRESHOLD=20, PROTECTED_RECENT=20. 20개 넘으면 가장 오래된 것부터 압축 (디렉토리→.md). temp dir + 다수 gen 디렉토리 생성 필요.

### 테스트 복잡도 순서 (쉬운 것부터)
1. nonce.ts — 순수 함수, 의존 없음
2. backlog.ts (toKebabCase) — 순수 함수
3. backlog.ts (나머지) — 파일 I/O, temp dir
4. generation.ts — ReapPaths mock, temp dir
5. archive.ts — 복합 파일 I/O
6. compression.ts — 대량 디렉토리 생성

## Previous Generation Reference
gen-013: 테스트 환경 구성 완료 (unit/e2e/scenario 3단계). lifecycle.test.ts 12개 테스트 작성. 이번 세대는 그 기반 위에 core unit tests를 추가하는 것.

## Backlog Review
- Test Phase 4 — 이번 세대 이후 연속 작업. 관련성 높음.
- 나머지 5개 (CLAUDE.md migration, e2e init, npx 지원, presets 제거, restart 제거) — 이번 세대와 직접 관련 없음.

## Context for This Generation
- Clarity: **High** — 목표 명확, 대상 함수와 테스트 패턴 모두 확립됨
- 각 테스트 파일은 `tests/unit/` 하위에 생성
- 파일 기반 테스트는 `mkdtemp`로 temp dir 생성, `afterEach`에서 정리
- tests/ 는 git submodule — 커밋 시 별도 처리 필요
