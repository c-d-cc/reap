# Learning

> validation에서 artifact 미작성 감지 + 보충 지시 기능 추가

## Project Overview

REAP v0.16.0. 현재 generation lifecycle에서 각 stage의 `--phase complete` 시 artifact 검증은 50자 최소 길이만 확인한다 (`verifyArtifact` in `stage-transition.ts`). 템플릿 자체가 50자를 초과하므로, subagent가 artifact를 채우지 않고 template만 남겨도 통과된다 (GitHub Issue #13).

## Key Findings

### 현재 artifact 검증 (stage-transition.ts)
- `verifyArtifact()`: `content.length < 50`만 체크
- 템플릿 파일들은 모두 50자를 훨씬 초과 (01-learning.md ~1200자, 02-planning.md ~1100자, 03-implementation.md ~700자)
- 따라서 템플릿 복사만으로도 gate 통과 가능 = 실질적으로 무의미한 gate

### 템플릿 placeholder 패턴
- 모든 템플릿은 `<!-- ... -->` HTML 주석 형태의 placeholder 사용
- 패턴: `<!-- Core section. ... -->`, `<!-- Optional — include if relevant. ... -->`
- 정상적으로 작성된 artifact는 이 placeholder들이 실제 내용으로 대체됨
- 미작성 artifact는 placeholder가 그대로 남아있음

### validation.ts 구조
- work phase: nonce 검증 → template 복사 → prompt 반환
- complete phase: nonce 검증 → artifact 검증 → stage 전환
- work phase에서 이전 stage artifact 검증을 추가하는 것이 자연스러운 위치

### 관련 모듈
- `src/core/template.ts` — `copyArtifactTemplate()`, `STAGE_ARTIFACTS` / `MERGE_STAGE_ARTIFACTS` 맵
- `src/core/stage-transition.ts` — `verifyArtifact()`, `STAGE_ARTIFACTS` / `MERGE_STAGE_ARTIFACTS` 맵 (중복 정의)
- `src/core/fs.ts` — `readTextFile()` 유틸리티
- `src/core/prompt.ts` — subagent prompt 빌드 (reap-guide.md 포함)
- `src/templates/reap-guide.md` — "artifact 직접 수정 금지" 규칙 없음 (현재는 write before complete만 명시)

### 테스트 구조
- `tests/unit/` — bun:test 기반, `../../src/core/` 임포트
- 기존 `stage-transition.test.ts`가 nonce 관련 테스트 담당
- 새 파일 `tests/unit/artifact-check.test.ts` 생성 필요

## Context for This Generation

- embryo type이므로 genome 수정 자유
- `STAGE_ARTIFACTS` 맵이 `template.ts`와 `stage-transition.ts`에 중복 정의됨 — 새 모듈에서는 기존 것 재사용 고려
- validation work phase에서 unfilled 감지 시 "artifact-incomplete" status로 반환하면, evolve subagent가 보충 작업 수행 후 다시 validation 실행 가능
- prompt.ts / reap-guide.md에서 "artifact 직접 수정 금지"의 명시적 예외 추가 필요 (validation 보충 허용)
