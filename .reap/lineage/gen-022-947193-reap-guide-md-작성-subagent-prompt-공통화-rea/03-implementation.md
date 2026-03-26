# Implementation Log

## Completed Tasks

### T001: src/templates/reap-guide.md 작성
v15의 reap-guide.md를 구조적 참조로 사용하여 v16에 맞는 가이드 작성 (~210줄).

v16 반영 사항:
- Stages: learning (not objective)
- Genome: application.md / evolution.md / invariants.md
- .reap/ 구조에 vision/, hooks/ 추가
- Hook 시스템: executeHooks, 조건부 실행, 순서 제어, 메타데이터
- CLI: `reap run <stage>` 패턴, `reap make backlog` 등
- Maturity system: bootstrap/growth/cruise
- v16에 없는 명령(fix, clean, destroy, help) 제외

### T002: src/core/prompt.ts 구현
두 함수를 export하는 공통 모듈 작성:

- `loadReapKnowledge(paths)`: reap-guide.md + genome 3파일 + environment + vision을 병렬 로딩. guide는 `import.meta.url` 기반으로 `../templates/reap-guide.md` 경로에서 로딩 (template.ts 패턴과 동일).
- `buildBasePrompt(knowledge, paths, state, cruiseCount?)`: evolve.ts의 buildSubagentPrompt() 로직을 그대로 이동. 추가로 `## REAP Guide` 섹션을 prompt에 포함하여 도구 지식을 주입.

타입 `ReapKnowledge` 인터페이스 정의: guide, genome (3파일), environment, visionGoals.

### T003: evolve.ts 리팩토링
- `buildSubagentPrompt()` 함수 제거 (212줄 → 54줄)
- `loadReapKnowledge()` + `buildBasePrompt()` import로 교체
- maturity.ts 직접 import 제거 (prompt.ts 내부에서 처리)
- 동작은 동일하게 유지 + reap-guide.md가 프롬프트에 추가됨

### T004: 빌드 + TypeCheck 검증
- TypeCheck: 통과 (에러 없음)
- Build: 성공 (0.39 MB, 119 modules)
