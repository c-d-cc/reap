# Learning — gen-024-1415bf

## Goal
core stability 버그 수정: back nonce 재발급 + completion commit 순서 교정

## Source Backlog
- **back 후 연속 regression 불가**: `verifyBackNonce()`에서 back nonce 재발급 누락
- 추가 버그: completion commit phase에서 archive→submodule check 순서 문제

## Project Overview
REAP v0.16.0 — 자기진화형 개발 파이프라인. 229 tests 통과 상태. Embryo maturity.

## Key Findings

### Bug 1: verifyBackNonce() back nonce 미발급
- **위치**: `src/core/stage-transition.ts` lines 112-142
- **원인**: `verifyBackNonce()`가 back nonce 검증 후 target stage로 이동하면서 forward nonce만 발급 (lines 138-141). back nonce는 재생성하지 않음
- **비교**: `setNonce()` (lines 79-107)는 forward + back nonce를 동시 발급
- **영향**: 한 번 back하면 다시 back 불가. 예: completion → validation back 후 validation → implementation back 불가
- **수정 방안**: `verifyBackNonce()`에서 target stage 이동 후 `setNonce()` 호출로 forward + back 동시 발급. 기존 수동 forward nonce 발급 코드(lines 138-141) 제거
- **추가 개선**: nonce verification 실패 시 에러 메시지에 현재 phase 상태 포함

### Bug 2: completion commit 순서 문제
- **위치**: `src/cli/commands/run/completion.ts` lines 277-333
- **현재 순서**:
  1. `archiveGeneration()` (line 291) — current.yml 삭제 포함
  2. `checkSubmoduleDirty()` (line 294) — submodule 검증
  3. `gitCommitAll()` (line 306) — git commit
- **원인**: archive가 current.yml을 삭제한 뒤 submodule check가 실패하면 generation 상태를 복구할 수 없음
- **수정 방안**: 순서 변경 — checkSubmoduleDirty() → archiveGeneration() → gitCommitAll()
  - submodule 검증을 먼저 수행하면 실패 시 generation 상태 보존됨

## Backlog Review
- [task] adapt phase에서 subagent의 자율 backlog 생성 방지 — 이번 generation과 무관
- [task] 기존 reap 프로젝트에 CLAUDE.md 추가 (migration) — 이번 generation과 무관

## Context for This Generation
- **Clarity**: High — 두 버그의 root cause와 수정 방향이 명확하게 분석되어 있음
- **영향 범위**: core 모듈 2개 (stage-transition.ts, completion.ts), 기존 테스트 229개 유지 필요
- **테스트 필요**: Bug 1 — consecutive back nonce 검증 unit test, Bug 2 — commit phase 순서 unit test
