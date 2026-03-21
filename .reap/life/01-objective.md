# Objective

## Goal

Hook 실행 엔진(`src/core/hook-engine.ts`)과 commit 로직(`src/core/commit.ts`)을 독립 모듈로 구현하고, 기존 command script(next, back, start, completion)에 통합한다.

## Background

gen-087에서 Script Orchestrator Architecture를 도입하여 `reap run` CLI primitives와 4개 command script(`next.ts`, `back.ts`, `start.ts`, `completion.ts`)를 구현했다. 각 slash command `.md`는 1줄 wrapper로 전환되었다.

그러나 두 가지 핵심 로직이 아직 command script에 통합되지 않았다:

1. **Hook 실행**: `.reap/hooks/` 디렉토리를 스캔하여 event별 hook 파일을 찾고, frontmatter의 condition을 평가하고, `.sh`는 shell 실행 / `.md`는 AI prompt로 반환하는 로직이 `.md` 템플릿에서 AI에게 텍스트로 지시하는 방식으로 임시 처리 중이다.
2. **Git commit**: submodule 상태 확인, `git add`, `git commit` 로직 역시 `.md` prompt에서 AI에게 지시하는 방식이다.

이 두 로직을 deterministic하게 실행하는 TypeScript 모듈로 구현하여, AI 의존성을 제거하고 신뢰성을 높인다.

## Scope

- **Related Genome Areas**: `domain/hook-system.md`, `constraints.md` (hooks 섹션), `conventions.md` (Script Orchestrator Pattern), `source-map.md`
- **Expected Change Scope**:
  - `src/core/hook-engine.ts` (신규) — hook 스캔, condition 평가, `.sh` 실행, `.md` 내용 반환
  - `src/core/commit.ts` (신규) — submodule check + git add + git commit
  - `src/cli/commands/run/next.ts` — hook 실행 통합
  - `src/cli/commands/run/back.ts` — hook 실행 통합
  - `src/cli/commands/run/start.ts` — hook 실행 통합
  - `src/cli/commands/run/completion.ts` — hook 실행 + commit 통합
  - `src/core/git.ts` — submodule/commit 관련 유틸 추가 가능
  - `src/types/index.ts` — hook-engine 관련 타입 추가
  - E2E 테스트
- **Exclusions**:
  - Merge command script 전환 (별도 backlog)
  - 나머지 23개 command wrapper 전환 (별도 backlog)
  - SessionStart hook (이미 `hooks.ts`에서 관리, 이번 스코프와 무관)

## Completion Criteria

1. `src/core/hook-engine.ts`가 `.reap/hooks/` 스캔, condition 평가, `.sh` 실행, `.md` 내용 반환을 수행한다
2. `src/core/commit.ts`가 submodule check, git add, git commit을 수행한다
3. 4개 command script(next, back, start, completion)에서 적절한 시점에 hook-engine을 호출한다
4. `completion.ts`의 archive phase에서 commit 로직을 호출한다
5. Hook 실행 결과(`.md` prompt, `.sh` 실행 결과)가 `emitOutput`의 context에 포함된다
6. 기존 테스트 전체 통과 (`bun test`)
7. TypeScript 컴파일 통과 (`bunx tsc --noEmit`)
8. E2E 테스트로 hook 스캔→condition 평가→실행 흐름 검증

## Requirements

### Functional Requirements

**FR-1: Hook Engine (`src/core/hook-engine.ts`)**
- `.reap/hooks/` 디렉토리에서 지정된 event에 매칭되는 hook 파일들을 스캔한다
- 파일명 패턴: `{event}.{name}.{md|sh}`
- `.md` 파일의 YAML frontmatter에서 `condition`, `order` 필드를 파싱한다
- `.sh` 파일의 comment header에서 `# condition:`, `# order:` 를 파싱한다
- Condition 평가: `.reap/hooks/conditions/{conditionName}.sh` 실행, exit 0이면 true
- 같은 event 내 hook은 `order` 순 정렬 (같으면 알파벳순)
- `.sh` hook: project root에서 실행, stdout/stderr 캡처
- `.md` hook: 파일 내용을 읽어서 반환 (AI가 실행할 prompt)
- Condition 미충족 시 해당 hook을 skip

**FR-2: Commit Module (`src/core/commit.ts`)**
- `tests/` submodule의 dirty 상태를 확인한다 (git submodule status)
- submodule이 dirty이면 submodule 내에서 먼저 commit한다 (또는 경고 반환)
- `git add .reap/ src/` 등 지정된 경로를 staging한다
- `git commit -m "message"` 를 실행한다
- commit 결과(성공/실패, hash)를 반환한다

**FR-3: Command Script 통합**
- `start.ts` create phase 완료 후: `onLifeStarted` event hook 실행
- `next.ts` stage 전환 후: 해당 event hook 실행 (onLifeObjected, onLifePlanned, onLifeImplemented, onLifeValidated, onLifeTransited)
- `back.ts` regression 적용 후: `onLifeRegretted` event hook 실행
- `completion.ts` archive phase: commit 로직 실행 + `onLifeCompleted` event hook 실행

**FR-4: Hook 결과 전달**
- `.sh` hook 실행 결과: `context.hookResults`에 `{ name, type: "sh", exitCode, stdout, stderr }` 포함
- `.md` hook 내용: `context.hookResults`에 `{ name, type: "md", content }` 포함 → AI가 후속 실행
- 모든 hook이 skip된 경우에도 빈 배열로 명시

### Non-Functional Requirements

- **NFR-1**: Hook engine은 `src/core/fs.ts` 유틸을 사용한다 (Bun API 직접 사용 금지)
- **NFR-2**: 함수는 단일 책임, 50줄 이하 권장
- **NFR-3**: 에러는 호출자에게 throw, command script에서 `emitError`로 변환
- **NFR-4**: Condition 실행 timeout: 10초 (무한 루프 방지)
- **NFR-5**: Hook 스캔 결과 캐싱 불필요 (매 호출마다 스캔, hooks/ 파일 수가 적음)

## Open Questions

1. ~~Commit module에서 submodule이 dirty일 때 자동 commit vs 경고만 반환?~~ → emitOutput으로 경고 반환하여 AI가 처리하도록 함
2. Merge type generation에서도 hook-engine을 호출할지? → 이번 스코프에서는 normal type만. Merge는 별도 backlog에서 처리

## Out of Scope

- Merge command script 전환 (backlog: `merge-command-script-conversion.md`)
- 나머지 command wrapper 전환 (backlog: `remaining-command-wrapper-conversion.md`)
- SessionStart hook 로직 변경 (`src/core/hooks.ts`는 기존 유지)
- Hook suggestion 로직 (이미 completion.ts phase에서 AI prompt로 처리 중)

## Genome Reference

- `genome/domain/hook-system.md` — hook event 목록, 파일 기반 hook 구조, condition 시스템, 실행 규칙
- `genome/constraints.md` — hooks 16개 event, 파일 기반 구조, condition 정의
- `genome/conventions.md` — Script Orchestrator Pattern, 코드 스타일, 테스트 규칙
- `genome/source-map.md` — Core Components 맵, CLI Commands 구조

## Backlog (Genome Modifications Discovered)

- `source-map.md`에 `hook-engine.ts`, `commit.ts` 추가 필요 (genome-change, completion에서 처리)
