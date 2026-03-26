# Learning — gen-021-82a4a0

## Goal
hook-engine 고급 기능 포팅 (조건부 실행, 순서 제어, 상세 결과)

## Source Backlog
`hook-engine-고급-기능-포팅-조건부-실행-순서-제어-상세-결과.md` (priority: high)

v16의 `runHooks()`는 단순 파일 매칭 + 실행만 지원. v15의 hook-engine.ts가 제공하던 고급 기능(조건부 실행, 순서 제어, 메타데이터 파싱, 상세 결과)을 v16에 포팅해야 함.

## Key Findings

### v16 현재 상태 (`src/core/hooks.ts`, 61줄)
- `runHooks(hooksDir, event, cwd)` — 단순 구현
- `{event}.*.{sh|md}` 패턴 매칭, 알파벳 정렬
- .sh는 execSync, .md는 readTextFile로 content 반환
- `HookResult` 타입은 hooks.ts 내부에 로컬 정의: `{ file, type, output?, prompt?, error? }`
- 호출부 3곳: `stage-transition.ts` (performTransition, performMergeTransition), `completion.ts` (commit phase), `start.ts` (create phase)

### v15 구현 (`~/cdws/reap_v15/src/core/hook-engine.ts`, 185줄)
- `executeHooks(hooksDir, event, projectRoot)` — 풍부한 기능
- **조건 시스템**: `conditions/` 하위 디렉토리의 .sh 스크립트, exit code 0 = 조건 충족
- **순서 제어**: `order` 메타데이터 (기본값 50), order → filename 순 정렬
- **메타데이터 파싱**: .md = YAML frontmatter, .sh = 주석 헤더 (`# condition:`, `# order:`)
- **상세 HookResult**: name, event, type, status(executed/skipped), exitCode, stdout, stderr, content, skipReason
- **ReapHookEvent 타입**: 라이프사이클 이벤트 union type (16개)
- 내부 구조: `scanHooks()` → `evaluateCondition()` → `executeShHook()` / `executeMdHook()`

### v15 → v16 차이점
- v16은 `yaml` 패키지 사용 (v15도 동일) — YAML frontmatter 파싱 가능
- v16은 `fileExists` from `src/core/fs.ts` — v15도 동일 패턴
- v16의 `ReapHookEvent`는 v15에서 일부 이벤트 차이:
  - v16에는 `onLifeObjected` 없음 (objective stage가 v16에 없음)
  - v16에는 `onMergeSynced` 대신 `onMergeReconciled` 사용
  - v16에는 `onLifeRegretted` 없음 (back은 있지만 regret 이벤트 불필요)
  - v16에 `onLifeLearned` 추가 필요 (v15에 없던 이벤트)

### 호출부 변경 영향 분석
1. **stage-transition.ts**: `runHooks()` → `executeHooks()`, 반환값 사용 안 함 (catch 무시)
2. **completion.ts**: `runHooks()` → `executeHooks()`, 반환값 사용 안 함 (catch 무시)
3. **start.ts**: `runHooks()` → `executeHooks()`, 반환값 사용 안 함 (catch 무시)
- 모든 호출부에서 결과를 무시하므로, API 시그니처 변경이 안전함

### 타입 변경
- `HookResult`를 `src/types/index.ts`로 이동 (중앙 집중)
- `ReapHookEvent` 타입 추가 (v16 이벤트 기준)
- hooks.ts 내부의 로컬 `HookResult` 제거

## Previous Generation Reference
gen-020: installSkills cleanup 로직 추가. cleanup 정상 동작 확인, stale artifact 방지 확인 완료.

## Backlog Review
- [task] 기존 reap 프로젝트에 CLAUDE.md 추가 (migration) — 이번 generation과 무관, 유지

## Context for This Generation
- **Clarity**: High — goal이 명확하고, v15 참조 코드와 v16 변경 대상이 구체적으로 정의됨
- v15 소스를 거의 그대로 포팅 가능, v16 이벤트 이름만 조정 필요
- 하위 호환성 유지: 메타데이터 없는 hook 파일도 기본값(condition=always, order=50)으로 동작
