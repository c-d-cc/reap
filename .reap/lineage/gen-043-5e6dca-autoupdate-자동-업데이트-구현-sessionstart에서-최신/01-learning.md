# Learning — gen-043-5e6dca

## Goal
autoUpdate 자동 업데이트 구현 — SessionStart에서 최신 버전 확인 및 설치

## Project Overview
check-version.ts는 postinstall + SessionStart hook에서 호출되며, 현재는 v0.15 legacy cleanup과 autoUpdateMinVersion guard만 수행. 실제 자동 업데이트(npm에서 latest 조회 후 설치)는 v0.15에서 존재했으나 v0.16에서 미구현 상태.

## Key Findings

### 현재 상태 (check-version.ts)
- `semverGte()`, `queryAutoUpdateMinVersion()`, `checkAutoUpdateGuard()` 함수 존재
- `getInstalledVersion()` — `reap --version` 실행하여 설치 버전 확인
- `execute()` — legacy cleanup + guard 체크만 수행
- 자동 업데이트 로직 없음

### v0.15 참조 코드
1. **session-start.cjs (Lines 176-203)**: 핵심 auto-update flow
   - `reap --version`으로 installed 확인
   - `npm view @c-d-cc/reap version`으로 latest 확인
   - `+dev` suffix 있으면 skip
   - config.yml에서 `autoUpdate: true` 확인
   - autoUpdateMinVersion guard 체크
   - `npm update -g @c-d-cc/reap` 실행
   - `reap update` 실행 (프로젝트 동기화)

2. **update.ts selfUpgrade()**: 동일한 로직의 TypeScript 버전
   - SelfUpgradeResult 인터페이스로 결과 구조화
   - blocked 상태도 반환 (breaking change 시)

### 호출 경로
- **postinstall**: `scripts/postinstall.sh` → `reap check-version`
- **SessionStart**: `~/.claude/settings.json` → `reap check-version 2>/dev/null || true`

### config.yml
- `autoUpdate: true` 필드 존재 (ReapConfig 타입에 정의됨)
- 현재 프로젝트에서 true로 설정

### 기존 테스트
- unit: semverGte 함수 테스트 (8개)
- e2e: check-version exit code 0 확인 (1개)

## Backlog Review
- [task] autoUpdate 자동 업데이트 구현 (이 generation의 목표, pending)

## Context for This Generation
- Clarity: **HIGH** — backlog에 구체적 solution과 files-to-change 명시, v0.15 참조 코드 존재
- Type: embryo
- v0.15 코드가 명확한 참조점 제공 — 로직 이식 후 v0.16 스타일로 정리
- check-version.ts에 이미 필요한 helper 함수 존재 (semverGte, queryAutoUpdateMinVersion, getInstalledVersion)

### Implementation Considerations
1. config.yml 읽기: cwd에서 `.reap/config.yml` 파싱 필요 (YAML import)
2. `npm view @c-d-cc/reap version`으로 latest 조회 (queryLatestVersion 함수 추가)
3. installed !== latest 이면 업데이트 시도
4. +dev, alpha 버전은 skip
5. autoUpdateMinVersion guard 적용
6. `npm install -g @c-d-cc/reap@latest` 실행 (v0.15는 `npm update -g` 사용)
7. 성공 후 `reap update` 실행 (프로젝트 동기화)
8. 모든 에러는 silent skip — postinstall/hook 절대 깨지면 안 됨
9. 결과를 stderr로 출력 (SessionStart hook에서 AI가 참조)
