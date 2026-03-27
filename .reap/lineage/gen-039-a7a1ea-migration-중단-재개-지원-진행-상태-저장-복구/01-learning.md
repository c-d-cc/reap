# Learning -- gen-039-a7a1ea

## Goal

migration 중단/재개 지원 -- 진행 상태 저장 + 복구

## Project Overview

현재 `reap init --migrate`는 multi-phase 구조로 동작한다:
1. **confirm** -- v0.15 구조 스캔, 유저에게 변경 사항 안내
2. **execute** -- 백업, 디렉토리 생성, config 변환, env/lineage/backlog/hooks 복사, legacy cleanup, vision 생성 등 10+ steps
3. **genome-convert** -- AI가 원본 genome 파일 3개를 v0.16 구조로 재구성 (AI prompt)
4. **vision** -- AI가 goals.md 작성 (AI prompt)
5. **complete** -- 마이그레이션 요약 출력

문제: execute phase에서 10+ step을 한 번에 처리하는데, 중간에 세션 중단(API 에러, Esc, 네트워크 끊김 등)이 발생하면 어디까지 완료되었는지 알 수 없다. 특히 backup(rename)이 완료된 후 directory 생성 전에 끊기면 프로젝트가 불완전한 상태에 놓인다.

## Key Findings

### 현재 코드 분석 (migrate.ts)

1. **Phase 구분**: `execute()` 함수가 switch로 phase 분기 (confirm/execute/vision/complete)
2. **Execute phase 내 step들**: backup → create-dirs → config-migrate → genome 읽기 → environment-copy → lineage-copy → backlog-copy → hooks-map → legacy-cleanup → vision-create → claude-md → reap-guide
3. **멱등성**: 현재 없음. execute를 두 번 실행하면 "v0.15 structure not found" 에러 (backup으로 이미 이동했으므로)
4. **v15 backup 존재 체크**: confirm phase에서만 체크 -- execute에서는 체크하지 않음
5. **AI prompt phases** (genome-convert, vision): CLI가 prompt를 반환하고 AI가 파일을 직접 작성 -- 이 부분은 멱등성이 자연스럽게 보장됨 (파일 덮어쓰기)

### 해결 방향 (backlog에서 제안된 것)

- `.reap/migration-state.yml`에 phase/step 진행 상태 저장
- 재시작 시 state 파일 감지하여 중단 지점에서 재개
- 각 step이 이미 완료되었으면 skip (멱등성)
- 완료 후 state 파일 삭제

### 핵심 설계 포인트

1. **State 파일 위치**: `.reap/migration-state.yml` -- .reap/ 내에 있어야 migrate 중에도 접근 가능
2. **State 내용**: 현재 phase, 완료된 step 목록, 타임스탬프
3. **재개 진입점**: `reap init --migrate` 시작 시 state 파일 존재 여부 확인 -- 있으면 자동 재개 제안
4. **Step 단위 멱등성**: 각 step은 "이미 완료되었는가"를 스스로 판단 (파일 존재 체크 등)

### 영향 파일

- `src/cli/commands/migrate.ts` -- 주요 변경 대상
- `src/core/paths.ts` -- migrationState 경로 추가
- `tests/e2e/migrate.test.ts` -- 중단/재개 테스트 추가

## Backlog Review

- **[task] migration 중단/재개 지원** (pending, high) -- 이번 generation의 소스 backlog. 구체적인 solution이 명시되어 있어 그대로 따르면 됨.

## Previous Generation Reference

gen-038에서 migrate.ts에 `cleanupLegacyProjectSkills` 호출을 추가. migrate.ts 코드 구조에 익숙한 상태. 349 tests 전부 통과.

## Context for This Generation

- Embryo generation -- genome 수정 자유
- Clarity: **HIGH** -- backlog에 구체적인 solution까지 명시, 변경 대상 파일 명확
- 기존 테스트 390개 (unit 223, e2e 126, scenario 41) 전체 통과 상태
