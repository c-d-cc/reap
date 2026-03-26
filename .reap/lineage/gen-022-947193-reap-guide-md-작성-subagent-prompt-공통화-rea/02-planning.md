# Planning

## Goal

reap-guide.md 작성 + subagent prompt 공통화. 사용자 프로젝트에서 AI가 REAP 도구 사용법을 알 수 있도록 가이드 문서를 만들고, evolve.ts의 프롬프트 빌드 로직을 `src/core/prompt.ts`로 추출하여 재사용 가능하게 만든다.

## Completion Criteria

1. `src/templates/reap-guide.md`가 존재하고, v16 구조에 맞는 REAP 가이드를 포함 (200줄 이상)
2. `src/core/prompt.ts`가 존재하고, `loadReapKnowledge()` + `buildBasePrompt()` 함수를 export
3. `src/cli/commands/run/evolve.ts`가 `prompt.ts`의 함수를 사용하도록 리팩토링
4. `loadReapKnowledge()`가 reap-guide.md를 dist/templates/에서 로딩
5. 빌드 성공 (`npm run build`)
6. TypeCheck 통과 (`npm run typecheck`)
7. 기존 테스트 전체 통과

## Approach

### Task 1: reap-guide.md
v15의 `~/cdws/reap_v15/src/templates/hooks/reap-guide.md`를 구조적 참조로 사용하되, v16의 차이점을 모두 반영:
- learning (not objective), application/evolution/invariants (not principles/conventions/constraints/source-map)
- `reap run <stage>` CLI 패턴
- hook 시스템 (executeHooks, 조건부 실행, 순서 제어)
- maturity system, vision/ 디렉토리
- v16에 없는 CLI 명령 (`reap fix`, `reap clean`, `reap destroy`, `reap help`) 제외

### Task 2: prompt.ts 공통 모듈
- `loadReapKnowledge(paths)`: genome 3파일 + environment + vision + reap-guide를 한꺼번에 로딩
- `buildBasePrompt(knowledge, state, config)`: evolve.ts의 buildSubagentPrompt() 로직을 이동
- reap-guide.md 경로: `import.meta.url` 기반 `../templates/reap-guide.md` (template.ts 패턴과 동일)
- evolve.ts는 이 함수들만 import하여 사용

## Scope

### 변경 파일
- `src/templates/reap-guide.md` — 신규 작성
- `src/core/prompt.ts` — 신규 작성
- `src/cli/commands/run/evolve.ts` — 리팩토링 (buildSubagentPrompt 제거, prompt.ts 사용)

### 범위 외
- 다른 CLI command에서 prompt.ts 사용 (향후 과제)
- init 시 reap-guide.md 설치 로직 (별도 세대)
- hook을 통한 reap-guide.md 주입 (별도 세대)

## Tasks

- [ ] T001 `src/templates/reap-guide.md` — v16 구조에 맞는 REAP 가이드 작성
- [ ] T002 `src/core/prompt.ts` — loadReapKnowledge() + buildBasePrompt() 구현
- [ ] T003 `src/cli/commands/run/evolve.ts` — prompt.ts 사용으로 리팩토링
- [ ] T004 빌드 + TypeCheck + 테스트 검증

### 테스트 방법
- T001: 파일 존재 + 내용 길이 확인 (수동)
- T002-T003: TypeCheck + 빌드 + 기존 e2e 테스트 통과로 검증 (리팩토링이므로 동작 동일성 확인)
- T004: `npm run typecheck && npm run build && npm run test`

## Dependencies

T001 → T002 (reap-guide.md가 있어야 prompt.ts에서 로딩 가능)
T002 → T003 (prompt.ts가 있어야 evolve.ts 리팩토링 가능)
T003 → T004 (모든 변경 후 검증)
