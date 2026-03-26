# Implementation Log — gen-021-82a4a0

## Completed Tasks

### T001 `src/types/index.ts` — HookResult, ReapHookEvent 타입 추가
- `ReapHookEvent`: v16 라이프사이클 이벤트 union type (14개) 추가
  - Normal: onLifeStarted, onLifeLearned, onLifePlanned, onLifeImplemented, onLifeValidated, onLifeCompleted, onLifeTransited
  - Merge: onMergeStarted, onMergeDetected, onMergeMated, onMergeMerged, onMergeReconciled, onMergeValidated, onMergeCompleted, onMergeTransited
- `HookResult`: name, event, type, status, exitCode, stdout, stderr, content, skipReason 포함
- hooks.ts 내부의 로컬 HookResult 정의는 제거 대상

### T002 `src/core/hooks.ts` — hook-engine 로직으로 전면 교체
- v15의 hook-engine.ts를 v16에 맞게 포팅 (185줄)
- `executeHooks()`: 메인 엔트리 함수 (기존 `runHooks()` 대체)
- `scanHooks()`: 파일 스캔 + 메타데이터 파싱 + order/filename 정렬
- `parseHookMeta()`: .md = YAML frontmatter, .sh = 주석 헤더 파싱
- `evaluateCondition()`: conditions/ 디렉토리의 .sh 스크립트로 조건 평가
- `executeShHook()`: .sh 파일 실행, exitCode/stdout/stderr 캡처
- `executeMdHook()`: .md 파일 content 반환 (frontmatter 제거)
- import 경로를 v16 형식으로 조정 (.js 확장자)

### T003 `src/core/stage-transition.ts` — import/호출 변경
- `runHooks` → `executeHooks` import 및 호출 3곳 변경

### T004 `src/cli/commands/run/completion.ts` — import/호출 변경
- `runHooks` → `executeHooks` import 및 호출 1곳 변경

### T005 `src/cli/commands/run/start.ts` — import/호출 변경
- `runHooks` → `executeHooks` import 및 호출 2곳 변경

### T006 빌드 확인
- `npm run build` 성공 (0.39 MB, 118 modules)

### T007 `tests/unit/hooks.test.ts` — hook-engine unit test 작성
- 13개 테스트 케이스 작성:
  - 존재하지 않는 hooks dir 처리
  - 매칭 hook 없는 경우
  - .sh hook 실행 및 결과 반환
  - .md hook content 반환 (frontmatter 없음)
  - .md hook frontmatter 제거
  - order 기반 정렬 (order → filename)
  - 메타데이터 없는 hook의 기본값 (order=50)
  - 조건 스크립트 미존재 시 skip
  - 조건 스크립트 실패(non-zero) 시 skip
  - 조건 스크립트 성공(zero) 시 실행
  - .sh hook 실패 시 stderr/exitCode 캡처
  - .md frontmatter에서 condition/order 파싱
  - .sh 주석 헤더에서 condition/order 파싱

### T008 기존 테스트 실행 확인
- 82개 전체 통과 (기존 69 + 신규 13)
