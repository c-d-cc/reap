# Planning

## Summary

`reap run <command> [--phase <phase>]` CLI entry point를 구현하고, `next`, `back`, `start` command scripts를 Phase 1으로, `completion` command script를 Phase 2로 전환한다. 모든 deterministic 로직(gate, state 전환, artifact 생성, archiving 등)은 script가 `src/core/`를 직접 호출하여 수행하고, creative 작업이 필요한 지점에서만 structured JSON을 stdout으로 출력하여 AI에게 지시한다.

## Technical Context

- **Tech Stack**: TypeScript 5.x, Node.js >=18, Commander.js, YAML
- **Build**: `bun build` → `dist/cli.js` (단일 번들), `src/templates/` → `dist/templates/` 복사
- **Entry**: `src/cli/index.ts` — Commander.js 기반, 현재 5개 subcommand (init, status, fix, update, help)
- **Constraints**:
  - 파일 I/O는 `src/core/fs.ts` 경유 (Node.js fs/promises)
  - 외부 서비스 의존 없음
  - `npm run build` + `bunx tsc --noEmit` + `bun test` 통과 필수
  - 기존 CLI subcommand 리팩토링은 Out of Scope

## src/core/ 재사용 분석

### 직접 재사용 가능 (wrapper만 필요)

| 모듈 | 함수/클래스 | 용도 |
|------|------------|------|
| `generation.ts` | `GenerationManager.current()` | gate에서 현재 상태 읽기 |
| `generation.ts` | `GenerationManager.create()` | `start` — generation 생성 |
| `generation.ts` | `GenerationManager.advance()` | `next` — stage 전환 |
| `generation.ts` | `GenerationManager.save()` | `back` — regression 후 저장 |
| `generation.ts` | `GenerationManager.complete()` | `completion` — archiving + compression |
| `lifecycle.ts` | `LifeCycle.next()`, `.prev()`, `.canTransition()` | stage 유효성 검증 |
| `merge-lifecycle.ts` | `MergeLifeCycle.next()`, `.prev()` | merge type 분기 |
| `paths.ts` | `ReapPaths` | 모든 경로 해석 |
| `fs.ts` | `readTextFile`, `writeTextFile`, `fileExists` | 파일 I/O |
| `compression.ts` | `compressLineageIfNeeded()` | completion 시 lineage 압축 |
| `lineage.ts` | `resolveParents()`, `nextSeq()`, `listMeta()` | generation ID 계산 |

### 신규 구현 필요

| 기능 | 설명 | 복잡도 |
|------|------|--------|
| `reap run` dispatcher | Commander.js subcommand + `--phase` 옵션 + command 동적 로딩 | M |
| Structured JSON output | `RunOutput` 타입 정의 + `emit()` 유틸 | S |
| `back` regression 로직 | timeline에 regression entry 추가 + artifact 핸들링 | M |
| Backlog CRUD | frontmatter 파싱/수정 (status, consumedBy) | S |
| Hook 실행 엔진 | `.reap/hooks/` 스캔, condition 평가, 실행 | L (Phase 3) |

## 이번 Generation 스코프

**Phase 1 + Phase 2**를 이번 generation 범위로 한다.

- Phase 1: `reap run` 인프라 + `next`, `back`, `start` command scripts
- Phase 2: `completion` command script (archiving, compression 포함)

Phase 3 (hook 엔진, commit 로직, 전체 slash command 전환)와 Phase 4 (merge 계열)는 다음 generation으로 이월한다.

**근거**: Phase 1~2만으로도 핵심 normal lifecycle 전체가 Script Orchestrator 패턴으로 전환되며, 파일 변경량이 상당하다. Hook 엔진(Phase 3)은 독립적 모듈이므로 별도 generation에서 안정적으로 구현 가능하다.

**Phase 3 이전 hook 처리**: command script에서 hook 실행이 필요한 지점에 `// TODO: Phase 3 — hook engine` 주석을 남기고, structured JSON의 prompt에서 AI에게 hook 실행을 지시하는 방식으로 임시 처리한다.

## Tasks

### T-001: Structured JSON Output 타입 및 유틸 정의

- **설명**: `reap run` command script가 AI에게 creative 작업을 지시할 때 사용하는 JSON 출력 포맷 정의. `RunOutput` 인터페이스 + `emitOutput()` / `emitError()` 헬퍼 함수.
- **영향 파일**:
  - `src/types/index.ts` — `RunOutput`, `RunError` 타입 추가
  - `src/core/run-output.ts` — 신규. `emitOutput()`, `emitError()` 함수
- **의존성**: 없음
- **복잡도**: S

**구현 방법**:
```typescript
// src/types/index.ts에 추가
export interface RunOutput {
  status: "ok" | "prompt" | "error";
  command: string;
  phase: string;
  completed: string[];           // 완료된 deterministic 단계 목록
  context?: Record<string, unknown>; // creative 작업에 필요한 데이터
  prompt?: string;               // AI에게 수행할 작업 지시
  nextCommand?: string;          // 작업 완료 후 실행할 명령
  message?: string;              // 사람 판독용 메시지
}

// src/core/run-output.ts
export function emitOutput(output: RunOutput): never {
  console.log(JSON.stringify(output, null, 2));
  process.exit(0);
}
export function emitError(command: string, message: string, details?: Record<string, unknown>): never {
  const output: RunOutput = { status: "error", command, phase: "", completed: [], message, context: details };
  console.log(JSON.stringify(output, null, 2));
  process.exit(1);
}
```

### T-002: `reap run` CLI entry point (dispatcher)

- **설명**: Commander.js에 `reap run <command> [--phase <phase>]` subcommand 추가. command 이름으로 `src/cli/commands/run/` 디렉토리에서 해당 command script 모듈을 동적 로딩하여 실행.
- **영향 파일**:
  - `src/cli/index.ts` — `run` subcommand 등록
  - `src/cli/commands/run/index.ts` — 신규. dispatcher 로직
- **의존성**: T-001
- **복잡도**: M

**구현 방법**:
- `src/cli/commands/run/index.ts`에 dispatcher 함수 구현
- 각 command script는 `src/cli/commands/run/{command}.ts` 에 위치
- command script는 공통 인터페이스를 export: `execute(paths: ReapPaths, phase?: string): Promise<void>`
- dispatcher가 `ReapPaths`를 생성하고, command module을 import하여 `execute()` 호출
- 존재하지 않는 command는 exit code 2 + 에러 JSON 출력
- exit code 규약: 0=성공, 1=gate fail/비즈니스 에러, 2=시스템 에러

```typescript
// src/cli/commands/run/index.ts
import { ReapPaths } from "../../../core/paths";
import { emitError } from "../../../core/run-output";

const COMMANDS: Record<string, () => Promise<{ execute: CommandExecutor }>> = {
  next: () => import("./next"),
  back: () => import("./back"),
  start: () => import("./start"),
  completion: () => import("./completion"),
};

export type CommandExecutor = (paths: ReapPaths, phase?: string) => Promise<void>;

export async function runCommand(command: string, phase?: string): Promise<void> {
  const cwd = process.cwd();
  const paths = new ReapPaths(cwd);
  if (!(await paths.isReapProject())) {
    emitError(command, "Not a REAP project. Run 'reap init' first.");
  }
  const loader = COMMANDS[command];
  if (!loader) {
    emitError(command, `Unknown command: ${command}`);
  }
  const mod = await loader();
  await mod.execute(paths, phase);
}
```

CLI 등록 (`src/cli/index.ts`):
```typescript
program
  .command("run <command>")
  .description("Run a REAP command script")
  .option("--phase <phase>", "Start from a specific phase")
  .action(async (command: string, options: { phase?: string }) => {
    const { runCommand } = await import("./commands/run/index");
    await runCommand(command, options.phase);
  });
```

### T-003: `next` command script

- **설명**: `reap run next` — stage 전환. gate(활성 generation 존재 확인) → `GenerationManager.advance()` 호출 → artifact 템플릿 생성 지시(JSON prompt) → hook 실행 지점 마킹.
- **영향 파일**:
  - `src/cli/commands/run/next.ts` — 신규
- **의존성**: T-001, T-002
- **복잡도**: M

**구현 방법**:

Phase 구조 (단일 phase, creative 작업 없음 — 100% deterministic):
1. Gate: `GenerationManager.current()` — null이면 에러
2. `advance()` 호출 — stage 전환 + timeline 기록
3. 다음 stage의 artifact 템플릿 경로를 context에 포함
4. `status: "ok"` + 다음 slash command 안내를 출력

```typescript
export async function execute(paths: ReapPaths, phase?: string): Promise<void> {
  const gm = new GenerationManager(paths);
  const state = await gm.current();
  if (!state) emitError("next", "No active Generation. Run /reap.start first.");

  // advance 호출 (core가 stage 전환 + timeline 기록 수행)
  const updated = await gm.advance();
  const nextStage = updated.stage;

  // artifact 템플릿 파일 경로 결정
  const artifactMap: Record<string, string> = {
    planning: "02-planning.md", implementation: "03-implementation.md",
    validation: "04-validation.md", completion: "05-completion.md",
    // merge stages
    mate: "02-mate.md", merge: "03-merge.md", sync: "04-sync.md",
  };
  const artifactFile = artifactMap[nextStage];

  emitOutput({
    status: "prompt",
    command: "next",
    phase: "create-artifact",
    completed: ["gate", "advance-stage"],
    context: { generationId: updated.id, stage: nextStage, type: updated.type, artifactFile },
    prompt: artifactFile
      ? `Create the artifact file .reap/life/${artifactFile} from the template at ~/.reap/templates/${artifactFile}. Then proceed with /reap.${nextStage}.`
      : `Proceed with /reap.${nextStage}.`,
    message: `Advanced to ${nextStage}.`,
  });
}
```

### T-004: `back` command script

- **설명**: `reap run back [--phase <phase>]` — stage regression. gate → AI에게 reason/refs 수집 지시 → `--phase apply`로 재진입 시 regression 적용.
- **영향 파일**:
  - `src/cli/commands/run/back.ts` — 신규
- **의존성**: T-001, T-002
- **복잡도**: M

**구현 방법**:

2-phase 구조:
- **Phase 1 (default)**: Gate 검증 → structured JSON으로 AI에게 reason/target stage 수집 지시
- **Phase 2 (`apply`)**: stdin 또는 env var로 reason/target/refs를 받아 regression 수행

Phase 1:
```typescript
// gate: current 존재, stage !== "objective"
const state = await gm.current();
if (!state) emitError("back", "No active Generation.");
if (state.stage === "objective") emitError("back", "Already at the first stage.");

emitOutput({
  status: "prompt", command: "back", phase: "collect",
  completed: ["gate"],
  context: { currentStage: state.stage, type: state.type, id: state.id },
  prompt: "Ask the human: (1) target stage (default: previous stage), (2) reason for regression, (3) related refs (file paths, artifact sections). Then run: reap run back --phase apply. Pass the collected info as arguments via environment variables: REAP_BACK_TARGET, REAP_BACK_REASON, REAP_BACK_REFS (comma-separated).",
  nextCommand: "reap run back --phase apply",
});
```

Phase 2 (`apply`):
```typescript
// env에서 target, reason, refs 읽기
const target = process.env.REAP_BACK_TARGET || LifeCycle.prev(state.stage)!;
const reason = process.env.REAP_BACK_REASON || "No reason provided";
const refs = (process.env.REAP_BACK_REFS || "").split(",").filter(Boolean);

// canTransition 검증
if (!LifeCycle.canTransition(state.stage, target)) {
  emitError("back", `Cannot transition from ${state.stage} to ${target}`);
}

// state 업데이트
state.stage = target;
state.timeline.push({ stage: target, at: now, from: originalStage, reason, refs });
await gm.save(state);

emitOutput({
  status: "prompt", command: "back", phase: "record-regression",
  completed: ["gate", "collect", "apply-regression"],
  context: { targetStage: target, reason, refs, id: state.id },
  prompt: `Record the regression in the target stage artifact (.reap/life/${artifactMap[target]}) with a ## Regression section. Then proceed with /reap.${target}.`,
});
```

### T-005: `start` command script

- **설명**: `reap run start` — 새 generation 시작. gate(활성 generation 없음 확인) → backlog 스캔 → AI에게 goal 수집 지시 → `--phase create`로 재진입 시 generation 생성.
- **영향 파일**:
  - `src/cli/commands/run/start.ts` — 신규
- **의존성**: T-001, T-002
- **복잡도**: M

**구현 방법**:

3-phase 구조:
- **Phase 1 (default)**: Gate → backlog 스캔 → AI에게 goal 수집 지시
- **Phase 2 (`create`)**: goal을 받아 `GenerationManager.create()` 호출 → backlog consumed 처리 → artifact 생성 지시
- **Phase 3 (`finalize`)**: (예약) hook 실행 후 최종 확인

Phase 1:
```typescript
const state = await gm.current();
if (state && state.id) {
  emitError("start", `Generation ${state.id} is in progress (stage: ${state.stage}).`);
}

// backlog 스캔
const backlogItems = await scanBacklog(paths.backlog);

emitOutput({
  status: "prompt", command: "start", phase: "collect-goal",
  completed: ["gate", "backlog-scan"],
  context: { backlogItems },
  prompt: backlogItems.length > 0
    ? "Present the backlog items to the human. Ask: select one or enter a new goal. Set REAP_START_GOAL and optionally REAP_START_BACKLOG_FILE (selected backlog filename). Then run: reap run start --phase create"
    : "Ask the human for the goal of this generation. Set REAP_START_GOAL. Then run: reap run start --phase create",
  nextCommand: "reap run start --phase create",
});
```

Phase 2 (`create`):
```typescript
const goal = process.env.REAP_START_GOAL;
if (!goal) emitError("start", "REAP_START_GOAL is required.");

// GenerationManager.create() — ID 생성, current.yml 작성
const state = await gm.create(goal, genomeVersion);

// backlog consumed 처리 (gen ID 생성 후!)
const backlogFile = process.env.REAP_START_BACKLOG_FILE;
if (backlogFile) {
  await markBacklogConsumed(paths.backlog, backlogFile, state.id);
}

emitOutput({
  status: "prompt", command: "start", phase: "create-artifact",
  completed: ["gate", "backlog-scan", "create-generation", "backlog-consumed"],
  context: { generationId: state.id, goal: state.goal, genomeVersion: state.genomeVersion },
  prompt: `Generation ${state.id} created. Create .reap/life/01-objective.md from template with the Goal section filled in. Then proceed with /reap.objective or /reap.evolve.`,
  message: `Generation ${state.id} started.`,
});
```

### T-006: Backlog CRUD 유틸

- **설명**: `.reap/life/backlog/` 파일들의 frontmatter 파싱, 목록 조회, status 변경(consumed 마킹) 유틸.
- **영향 파일**:
  - `src/core/backlog.ts` — 신규
- **의존성**: 없음
- **복잡도**: S

**구현 방법**:
```typescript
// src/core/backlog.ts
import { readdir } from "fs/promises";
import { join } from "path";
import { readTextFile, writeTextFile } from "./fs";
import YAML from "yaml";

export interface BacklogFile {
  filename: string;
  type: string;
  status: string;
  target?: string;
  title: string;
  body: string;
}

export async function scanBacklog(backlogDir: string): Promise<BacklogFile[]> { ... }
export async function markBacklogConsumed(backlogDir: string, filename: string, genId: string): Promise<void> { ... }
```

- frontmatter 파싱: `---` 구분자로 split, YAML.parse
- consumed 마킹: frontmatter에 `status: consumed`, `consumedBy: {genId}` 추가 후 writeTextFile

### T-007: `completion` command script

- **설명**: `reap run completion` — 다중 phase로 completion 전체 흐름 실행. deterministic 단계(archiving, compression)는 script가 직접 수행, creative 단계(retrospective, genome 변경)는 AI에게 지시.
- **영향 파일**:
  - `src/cli/commands/run/completion.ts` — 신규
- **의존성**: T-001, T-002, T-006
- **복잡도**: L

**구현 방법**:

7-phase 구조:
- **Phase 1 (`default`)**: Gate(stage=completion, 04-validation.md 존재) → context 수집 → AI에게 Summary + Retrospective + Garbage Collection + Backlog Cleanup 지시
- **Phase 2 (`genome`)**: AI의 creative 작업 완료 후 재진입 → AI에게 genome-change 적용 지시 + validation commands 실행 지시
- **Phase 3 (`hook-suggest`)**: AI에게 hook 제안 지시 (최근 3 generation 패턴 분석)
- **Phase 4 (`compress`)**: lineage compression 직접 실행 (deterministic)
- **Phase 5 (`archive`)**: `GenerationManager.complete()` 호출 — archiving + compression (deterministic)
- **Phase 6 (`commit`)**: AI에게 commit 지시 (submodule check 포함)

Phase 1 (default):
```typescript
const state = await gm.current();
if (!state || state.stage !== "completion") emitError(...);
if (!(await fileExists(paths.artifact("04-validation.md")))) emitError(...);

// context 수집: backlog items, deferred tasks, recent lineage
const backlogItems = await scanBacklog(paths.backlog);
const validationContent = await readTextFile(paths.artifact("04-validation.md"));
const implContent = await readTextFile(paths.artifact("03-implementation.md"));

emitOutput({
  status: "prompt", command: "completion", phase: "retrospective",
  completed: ["gate", "context-scan"],
  context: { id: state.id, goal: state.goal, genomeVersion: state.genomeVersion,
             backlogItems, validationContent, implContent },
  prompt: "Fill 05-completion.md: Summary, Lessons Learned, Genome Change Proposals, Garbage Collection, Backlog Cleanup. Then run: reap run completion --phase genome",
  nextCommand: "reap run completion --phase genome",
});
```

Phase 5 (`archive`):
```typescript
// GenerationManager.complete() — archiving + compression 수행
const compression = await gm.complete();

emitOutput({
  status: "prompt", command: "completion", phase: "commit",
  completed: ["gate", "context-scan", "retrospective", "genome", "hook-suggest", "compress", "archive"],
  context: { compression, generationId: state.id },
  prompt: "Commit all changes (code + .reap/ artifacts). Check submodules first. Commit message: feat/fix/chore(gen-NNN-hash): [goal summary]",
  message: `Generation ${state.id} archived. Compression: L1=${compression.level1.length}, L2=${compression.level2.length}`,
});
```

### T-008: Slash command 1줄 wrapper 전환 (next, back, start, completion)

- **설명**: 4개 slash command(.md)를 1줄 wrapper로 축소.
- **영향 파일**:
  - `src/templates/commands/reap.next.md`
  - `src/templates/commands/reap.back.md`
  - `src/templates/commands/reap.start.md`
  - `src/templates/commands/reap.completion.md`
- **의존성**: T-003, T-004, T-005, T-007
- **복잡도**: S

**구현 방법**:
각 파일을 다음 형식으로 교체:
```markdown
---
description: "REAP Next — Advance to the next lifecycle stage"
---

Run `reap run next` and follow the stdout instructions exactly.
```

description은 기존 것을 유지. 본문은 1줄로 축소.

### T-009: E2E 테스트

- **설명**: `reap run` command scripts에 대한 E2E 테스트. sandbox에서 `.reap/` 프로젝트 셋업 후 실제 명령 실행 검증.
- **영향 파일**:
  - `tests/e2e/run-commands.test.ts` — 신규
- **의존성**: T-003, T-004, T-005, T-007
- **복잡도**: M

**E2E 시나리오**:

#### Scenario 1: `reap run next` — 정상 stage 전환
- **Setup**: temp dir에 `.reap/` 구조 생성, `current.yml`에 stage=objective인 generation 설정
- **Action**: `reap run next` 실행
- **Assertion**:
  - exit code 0
  - stdout이 valid JSON
  - JSON의 `status`가 `"ok"` 또는 `"prompt"`
  - `current.yml`의 stage가 `"planning"`으로 변경됨
  - `timeline`에 새 entry 추가됨
  - JSON의 `completed`에 `"gate"`, `"advance-stage"` 포함

#### Scenario 2: `reap run next` — 활성 generation 없을 때 gate fail
- **Setup**: temp dir에 `.reap/` 구조 생성, `current.yml` 비어있음
- **Action**: `reap run next` 실행
- **Assertion**:
  - exit code 1
  - stdout JSON의 `status`가 `"error"`
  - `message`에 "No active Generation" 포함

#### Scenario 3: `reap run start` — 새 generation 시작 (phase 1)
- **Setup**: temp dir에 `.reap/` 구조 생성, `current.yml` 비어있음, backlog에 1개 항목
- **Action**: `reap run start` 실행
- **Assertion**:
  - exit code 0
  - stdout JSON에 `backlogItems` 포함
  - `nextCommand`에 `--phase create` 포함

#### Scenario 4: `reap run start --phase create` — generation 생성
- **Setup**: temp dir에 `.reap/` 구조, `current.yml` 비어있음, `REAP_START_GOAL` env 설정
- **Action**: `REAP_START_GOAL="test goal" reap run start --phase create` 실행
- **Assertion**:
  - `current.yml`에 새 generation 기록됨
  - `id` 형식이 `gen-NNN-HHHHHH`
  - `stage`가 `"objective"`
  - `goal`이 `"test goal"`

#### Scenario 5: `reap run back` — regression gate 검증
- **Setup**: `current.yml`에 stage=objective
- **Action**: `reap run back` 실행
- **Assertion**:
  - exit code 1
  - `message`에 "first stage" 포함

#### Scenario 6: `reap run back` — 정상 regression collect phase
- **Setup**: `current.yml`에 stage=implementation
- **Action**: `reap run back` 실행
- **Assertion**:
  - exit code 0
  - JSON의 `phase`가 `"collect"`
  - `context.currentStage`가 `"implementation"`

#### Scenario 7: `reap run back --phase apply` — regression 적용
- **Setup**: `current.yml`에 stage=implementation, env REAP_BACK_TARGET=planning, REAP_BACK_REASON="test"
- **Action**: `reap run back --phase apply` 실행
- **Assertion**:
  - `current.yml`의 stage가 `"planning"`
  - `timeline` 마지막 entry에 `from: implementation`, `reason: "test"` 포함

#### Scenario 8: `reap run completion --phase archive` — archiving
- **Setup**: `current.yml`에 stage=completion, 01~05 artifact 파일 존재, lineage/ 디렉토리 존재
- **Action**: `reap run completion --phase archive` 실행
- **Assertion**:
  - `current.yml`이 비어있음
  - `.reap/lineage/`에 새 디렉토리 생성됨
  - artifact 파일들이 lineage로 이동됨
  - `meta.yml` 존재

#### Scenario 9: `reap run unknown` — 미지원 command
- **Setup**: 유효한 `.reap/` 프로젝트
- **Action**: `reap run unknown` 실행
- **Assertion**:
  - exit code 1 또는 2
  - `status`가 `"error"`

#### Scenario 10: `reap run next` — merge type에서도 동작
- **Setup**: `current.yml`에 type=merge, stage=detect
- **Action**: `reap run next` 실행
- **Assertion**:
  - stage가 `"mate"`로 전환됨

## Dependencies

```
T-001 (RunOutput 타입)
  ├── T-002 (dispatcher) ──┬── T-003 (next)
  │                        ├── T-004 (back)
  │                        ├── T-005 (start) ── T-006 (backlog)
  │                        └── T-007 (completion) ── T-006 (backlog)
  │
  └── T-008 (slash command wrapper) ── T-003, T-004, T-005, T-007
      T-009 (E2E 테스트) ── T-003, T-004, T-005, T-007
```

구현 순서: T-001 → T-006 → T-002 → T-003 → T-004 → T-005 → T-007 → T-008 → T-009

## Open Decisions (이번 Generation에서 해결)

1. **env var vs stdin**: `back`과 `start`에서 AI가 수집한 데이터를 script에 전달하는 방식. env var이 단순하고 AI가 `export` 후 `reap run ... --phase ...`를 실행하면 되므로 env var 방식 채택.

2. **completion phase 세분화**: completion의 7개 phase 중 `compress`와 `archive` 분리 여부. `GenerationManager.complete()`가 이미 archiving + compression을 한번에 수행하므로, `archive` phase 하나로 통합한다.

3. **merge type 지원**: `next`/`back`이 merge type에서도 동작해야 함. `GenerationManager.advance()`가 내부적으로 `MergeLifeCycle`을 사용하는지 확인 필요 → 현재 `advance()`는 `LifeCycle.next()`만 사용. merge type 분기 로직을 `next.ts`에 추가해야 함.
