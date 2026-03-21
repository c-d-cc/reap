# Planning

## Summary

Hook 실행 엔진(`src/core/hook-engine.ts`)과 commit 모듈(`src/core/commit.ts`)을 독립 모듈로 구현하고, 기존 4개 command script(next, back, start, completion)에 통합한다. Hook 엔진은 `.reap/hooks/` 디렉토리를 스캔하여 event별 hook을 찾고, condition을 평가하고, `.sh`는 실행 / `.md`는 내용을 반환한다. Commit 모듈은 submodule 상태 확인 + git commit을 수행한다.

## Technical Context

- **Tech Stack**: TypeScript 5.x, Node.js >=18, Commander.js, YAML
- **기존 인프라**: `reap run <command> [--phase <phase>]` dispatcher 및 4개 command script가 gen-087에서 구현됨
- **현재 상태**:
  - Hook 실행: command script의 `emitOutput` context에 `hookEvent` 이름만 포함, 실제 실행은 AI가 `.md` prompt를 읽고 수동 처리
  - Git commit: `completion.ts` archive phase에서 AI에게 commit을 지시하는 prompt만 출력
- **Constraints**:
  - 파일 I/O는 `src/core/fs.ts` 경유 (Node.js fs/promises)
  - 외부 서비스 의존 없음
  - `npm run build` + `bunx tsc --noEmit` + `bun test` 통과 필수
  - Hook condition은 `.reap/hooks/conditions/{name}.sh` 실행 (exit 0 = true)

## src/core/ 재사용 분석

### 직접 재사용

| 모듈 | 함수 | 용도 |
|------|------|------|
| `fs.ts` | `readTextFile`, `writeTextFile`, `fileExists` | hook 파일 읽기, condition 스크립트 존재 확인 |
| `git.ts` | `execSync` 패턴 | submodule status, git commit 실행 |
| `run-output.ts` | `emitOutput`, `emitError` | hook 결과를 structured output에 포함 |
| `paths.ts` | `ReapPaths` | hooks 디렉토리 경로 |
| `generation.ts` | `GenerationManager` | current state 조회 |

### 신규 구현 필요

| 모듈 | 설명 | 복잡도 |
|------|------|--------|
| `src/core/hook-engine.ts` | hook 스캔, condition 평가, 실행 | M |
| `src/core/commit.ts` | submodule check + git commit | S |
| command script 수정 | 4개 script에 hook/commit 호출 통합 | M |

## Tasks

### T-001: Hook Engine 코어 모듈 (`src/core/hook-engine.ts`)

- **설명**: `.reap/hooks/` 디렉토리에서 지정된 event에 매칭되는 hook 파일들을 스캔하고, condition을 평가하고, 실행하는 엔진. 핵심 로직을 담당하는 독립 모듈.
- **영향 파일**:
  - `src/core/hook-engine.ts` (신규)
  - `src/types/index.ts` (HookResult 타입 추가)
- **의존성**: 없음
- **복잡도**: M

**구현 상세**:

1. **Hook 파일 스캔** (`scanHooks(hooksDir, event)`)
   - `.reap/hooks/` 디렉토리에서 `{event}.{name}.{md|sh}` 패턴의 파일을 찾는다
   - `readdir` + 파일명 패턴 매칭

2. **Frontmatter/Header 파싱** (`parseHookMeta(filePath)`)
   - `.md`: YAML frontmatter에서 `condition`, `order` 추출
   - `.sh`: 파일 첫 줄들에서 `# condition:`, `# order:` 주석 추출
   - 기본값: condition = "always", order = 0

3. **Condition 평가** (`evaluateCondition(conditionsDir, conditionName, projectRoot)`)
   - `.reap/hooks/conditions/{conditionName}.sh` 파일 실행
   - `execSync`로 실행, exit 0 = true, non-zero = false
   - timeout: 10초
   - 파일 미존재 시 → false (skip)

4. **Hook 실행** (`executeHooks(hooksDir, event, projectRoot)`)
   - scanHooks → parseHookMeta → order 정렬 → condition 평가 → 실행
   - `.sh`: `execSync`로 project root에서 실행, stdout/stderr 캡처
   - `.md`: 파일 내용 읽기 (AI prompt로 반환)
   - 결과: `HookResult[]`

**타입 정의** (`src/types/index.ts` 추가):
```typescript
export interface HookResult {
  name: string;
  event: string;
  type: "sh" | "md";
  status: "executed" | "skipped";
  // sh hook
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  // md hook
  content?: string;
  // skip 사유
  skipReason?: string;
}
```

### T-002: Commit 모듈 (`src/core/commit.ts`)

- **설명**: submodule 상태 확인 + git add + git commit을 수행하는 모듈.
- **영향 파일**:
  - `src/core/commit.ts` (신규)
- **의존성**: 없음
- **복잡도**: S

**구현 상세**:

1. **Submodule 상태 확인** (`checkSubmodules(projectRoot)`)
   - `git submodule status` 실행
   - `+` prefix = dirty (uncommitted changes), ` ` = clean, `-` = uninitialized
   - dirty submodule 목록 반환

2. **Git Commit** (`commitChanges(projectRoot, message, paths?)`)
   - `git add` 실행 (지정 경로 또는 `.reap/`)
   - `git commit -m "message"` 실행
   - 결과 반환: `{ success, commitHash?, error? }`

3. **Submodule Commit** (`commitSubmodule(submodulePath, message)`)
   - submodule 디렉토리에서 `git add -A && git commit -m "message"` 실행
   - 결과 반환

**반환 타입**:
```typescript
export interface CommitResult {
  success: boolean;
  commitHash?: string;
  error?: string;
}

export interface SubmoduleStatus {
  path: string;
  dirty: boolean;
  hash: string;
}
```

### T-003: Command Script 통합 — `start.ts`

- **설명**: `start.ts`의 create phase 완료 후 `onLifeStarted` hook을 실행하도록 통합.
- **영향 파일**:
  - `src/cli/commands/run/start.ts`
- **의존성**: T-001
- **복잡도**: S

**구현 상세**:
- create phase 마지막에 `executeHooks(hooksDir, "onLifeStarted", projectRoot)` 호출
- hook 결과를 `emitOutput`의 `context.hookResults`에 포함
- `.md` hook이 있으면 AI에게 실행 지시하는 prompt에 포함

### T-004: Command Script 통합 — `next.ts`

- **설명**: `next.ts`의 stage 전환 후 해당 event hook과 `onLifeTransited` hook을 실행하도록 통합.
- **영향 파일**:
  - `src/cli/commands/run/next.ts`
- **의존성**: T-001
- **복잡도**: M

**구현 상세**:

Stage별 hook event 매핑:
```typescript
const STAGE_HOOK_EVENT: Record<string, string> = {
  planning: "onLifeObjected",       // objective 완료 후
  implementation: "onLifePlanned",   // planning 완료 후
  validation: "onLifeImplemented",   // implementation 완료 후
  completion: "onLifeValidated",     // validation 완료 후
};
```

- stage 전환 후:
  1. stage-specific event hook 실행 (있으면)
  2. `onLifeTransited` hook 실행 (범용)
- 두 결과를 모두 `context.hookResults`에 포함

### T-005: Command Script 통합 — `back.ts`

- **설명**: `back.ts`의 apply phase에서 `onLifeRegretted` hook을 실행하도록 통합.
- **영향 파일**:
  - `src/cli/commands/run/back.ts`
- **의존성**: T-001
- **복잡도**: S

**구현 상세**:
- apply phase에서 regression 적용 후 `executeHooks(hooksDir, "onLifeRegretted", projectRoot)` 호출
- hook 결과를 `context.hookResults`에 포함

### T-006: Command Script 통합 — `completion.ts`

- **설명**: `completion.ts`의 archive phase에서 commit 로직 실행 + `onLifeCompleted` hook 실행을 통합.
- **영향 파일**:
  - `src/cli/commands/run/completion.ts`
- **의존성**: T-001, T-002
- **복잡도**: M

**구현 상세**:

archive phase 수정:
1. `gm.complete()` 호출 (기존)
2. `checkSubmodules(projectRoot)` — dirty submodule 확인
3. dirty submodule이 있으면 `context.dirtySubmodules`에 포함하여 AI에게 처리 지시
4. Commit 정보(message 템플릿, 대상 경로)를 `context.commitInfo`에 포함
5. `executeHooks(hooksDir, "onLifeCompleted", projectRoot)` 호출
6. hook 결과를 `context.hookResults`에 포함

Note: 실제 `git commit`은 AI가 submodule 처리 후 수행하도록 prompt로 지시. commit 모듈은 AI가 호출할 수 있는 유틸로 제공하되, archive phase에서 자동 실행하지 않음 (submodule dirty 상태에 따른 분기가 필요하므로).

### T-007: `ReapPaths`에 hooks 경로 추가

- **설명**: `ReapPaths` 클래스에 `.reap/hooks/` 및 `.reap/hooks/conditions/` 경로 getter 추가.
- **영향 파일**:
  - `src/core/paths.ts`
- **의존성**: 없음
- **복잡도**: S

**구현 상세**:
```typescript
get hooks(): string { return join(this.reapDir, "hooks"); }
get hookConditions(): string { return join(this.reapDir, "hooks", "conditions"); }
```

이미 존재하는지 확인 필요 — 없으면 추가.

### T-008: E2E 테스트

- **설명**: hook-engine과 commit 통합에 대한 E2E 테스트.
- **영향 파일**:
  - `tests/e2e/hook-engine.test.ts` (신규)
- **의존성**: T-001 ~ T-007
- **복잡도**: M

**E2E 시나리오**:

#### Scenario 1: Hook 스캔 — event에 매칭되는 hook 파일 발견
- **Setup**: temp dir에 `.reap/hooks/onLifeStarted.test-hook.sh` 생성 (condition: always, order: 10), `.reap/hooks/conditions/always.sh` 생성 (exit 0)
- **Action**: `executeHooks(hooksDir, "onLifeStarted", projectRoot)` 호출
- **Assertion**:
  - 결과 배열 길이 1
  - `name`이 `"test-hook"`
  - `type`이 `"sh"`
  - `status`가 `"executed"`

#### Scenario 2: Hook condition 평가 — false 시 skip
- **Setup**: `.reap/hooks/onLifeStarted.skip-hook.sh` (condition: never), `.reap/hooks/conditions/never.sh` 생성 (exit 1)
- **Action**: `executeHooks(hooksDir, "onLifeStarted", projectRoot)` 호출
- **Assertion**:
  - 결과에서 `skip-hook`의 `status`가 `"skipped"`

#### Scenario 3: `.md` hook — 내용 반환
- **Setup**: `.reap/hooks/onLifeCompleted.docs-update.md` (frontmatter: condition: always, order: 30, body: "Update docs")
- **Action**: `executeHooks(hooksDir, "onLifeCompleted", projectRoot)` 호출
- **Assertion**:
  - `type`이 `"md"`
  - `content`에 "Update docs" 포함

#### Scenario 4: Hook order 정렬
- **Setup**: 3개 hook 파일 (order: 30, 10, 20)
- **Action**: `executeHooks` 호출
- **Assertion**:
  - 결과 배열이 order 10, 20, 30 순서

#### Scenario 5: `reap run next` — hook 결과가 output에 포함
- **Setup**: `.reap/` 프로젝트 + `current.yml` (stage=objective) + `.reap/hooks/onLifeTransited.test.sh` (echo "transited")
- **Action**: `reap run next` 실행
- **Assertion**:
  - stdout JSON의 `context.hookResults`에 hook 결과 포함

#### Scenario 6: `reap run start --phase create` — onLifeStarted hook 실행
- **Setup**: `.reap/` 프로젝트 + REAP_START_GOAL env + `.reap/hooks/onLifeStarted.test.sh`
- **Action**: `reap run start --phase create` 실행
- **Assertion**:
  - `context.hookResults`에 onLifeStarted hook 결과 포함

#### Scenario 7: Submodule status 확인
- **Setup**: git repo + submodule
- **Action**: `checkSubmodules(projectRoot)` 호출
- **Assertion**:
  - 반환된 submodule 목록이 올바름

#### Scenario 8: 매칭되는 hook이 없는 경우
- **Setup**: `.reap/hooks/` 디렉토리에 다른 event의 hook만 존재
- **Action**: `executeHooks(hooksDir, "onLifeStarted", projectRoot)` 호출
- **Assertion**:
  - 결과 배열이 비어있음

#### Scenario 9: Condition 스크립트 미존재 시 skip
- **Setup**: hook 파일에 `condition: nonexistent` 설정, conditions/ 디렉토리에 해당 스크립트 없음
- **Action**: `executeHooks` 호출
- **Assertion**:
  - `status`가 `"skipped"`, `skipReason`에 "condition script not found" 포함

#### Scenario 10: `reap run back --phase apply` — onLifeRegretted hook 실행
- **Setup**: `current.yml` (stage=implementation) + `.reap/hooks/onLifeRegretted.test.sh`
- **Action**: `REAP_BACK_TARGET=planning REAP_BACK_REASON="test" reap run back --phase apply` 실행
- **Assertion**:
  - `context.hookResults`에 onLifeRegretted hook 결과 포함

## Dependencies

```
T-007 (paths.ts hooks 경로)
  │
T-001 (hook-engine.ts) ──┬── T-003 (start.ts 통합)
  │                       ├── T-004 (next.ts 통합)
  │                       ├── T-005 (back.ts 통합)
  │                       └── T-006 (completion.ts 통합)
  │
T-002 (commit.ts) ───────── T-006 (completion.ts 통합)
  │
T-008 (E2E 테스트) ── T-001 ~ T-007
```

## 구현 순서

T-007 → T-001 → T-002 → T-003 → T-004 → T-005 → T-006 → T-008
