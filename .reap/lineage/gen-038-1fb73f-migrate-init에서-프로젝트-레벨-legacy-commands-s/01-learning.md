# Learning

## Project Overview

REAP v0.16.0 — 자기진화형 개발 파이프라인. v0.15에서 v0.16으로 마이그레이션 시 프로젝트 레벨 legacy commands/skills 파일이 정리되지 않는 문제를 해결해야 한다.

## Source Backlog

backlog `migrateinit에서-프로젝트-레벨-legacy-commandsskills-정리-claudecommandsreap-claudeskillsreap.md`:
- v0.15에서 프로젝트 레벨 `.claude/commands/reap.*.md`와 `.claude/skills/reap.*/SKILL.md`에 설치
- v0.16 설치/migrate 후에도 이 파일들이 남아있어 v0.15 스킬이 v0.16과 공존 → AI 혼란
- migrate/init에서 프로젝트 레벨 legacy 파일 정리 필요

## Key Findings

### 현재 코드 분석

1. **`src/cli/commands/migrate.ts`** — v0.15→v0.16 마이그레이션 (multi-phase: confirm→execute→genome-convert→vision→complete)
   - `executeMain()` (execute phase)에서 구조 변환 수행
   - legacy commands/skills 정리 로직은 없음
   - `executeComplete()`에서 마이그레이션 결과 summary 출력

2. **`src/cli/commands/init/common.ts`** — `initCommon()` 함수로 `.reap/` 구조 초기화
   - 디렉토리 생성, config 작성, genome/vision/memory 초기화
   - legacy 정리 로직 없음

3. **`src/core/integrity.ts`** — `checkUserLevelArtifacts()`에서 이미 project-level `.claude/commands/reap.*` 탐지 로직 존재 (warning 레벨)
   - 탐지만 하고 삭제는 하지 않음
   - `reap.` 패턴으로 매칭 — 동일 패턴 재사용 가능

4. **`src/core/fs.ts`** — `fileExists`, `readTextFile`, `writeTextFile`, `ensureDir` 유틸리티 제공
   - 디렉토리/파일 삭제 유틸은 없음 → `fs/promises`의 `rm` 직접 사용 필요

### v0.15 legacy 파일 구조
```
project/
  .claude/
    commands/           ← reap.*.md 파일들
      reap.objective.md
      reap.planning.md
      ...
    skills/             ← reap.*/SKILL.md 디렉토리들
      reap.objective/
        SKILL.md
      reap.planning/
        SKILL.md
      ...
```

### 구현 계획 요약

- `cleanupLegacyProjectSkills(projectRoot)` 공통 함수를 `src/core/integrity.ts`에 추가 (탐지 로직이 이미 있으므로 같은 모듈)
- `reap.` 또는 `reapdev.`로 시작하는 것만 삭제
- `.claude/commands/`나 `.claude/skills/` 디렉토리 자체는 보존
- migrate.ts의 `executeMain()`과 init/common.ts의 `initCommon()` 양쪽에서 호출
- unit test: `cleanupLegacyProjectSkills` 함수 테스트
- e2e test: migrate.test.ts에 legacy cleanup 테스트 추가

## Previous Generation Reference

gen-037 — artifact 미작성 감지 기능 구현. core placeholder 기반 감지, false positive 방지. 340 tests 통과. 피드백: "깔끔한 구현".

## Context for This Generation

- **Clarity**: High — goal과 구현 방향이 명확, 영향 범위가 한정적
- **Type**: embryo — genome 수정 가능
- `reapdev.` 접두사도 삭제 대상에 포함해야 함 (지시사항에 명시)
- tests/ submodule 주의 — 테스트 파일 수정 시 별도 커밋 필요
