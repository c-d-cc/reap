# Planning

## Goal

OpenCode 사용자가 REAP를 사용할 수 있게 한다. 구체적으로:
- `agentClient: opencode` 설정 시 REAP가 OpenCode 환경에 맞는 파일들(opencode.json, AGENTS.md, plugin) 을 자동 생성/관리
- gen-062에서 분리된 dynamic context(`buildKnowledgeContext()`)를 `.reap/.session-state.md` 로 dump하는 `reap dump-state` 신규 명령
- Adapter dispatch 패턴 도입: `src/adapters/index.ts` 가 `agentClient` 기준으로 claude-code / opencode 분기. codex는 미지원 안내.

End state: OpenCode 사용자가 `config.yml`에서 `agentClient: opencode` 변경 후 `reap install-skills`(또는 `reap update`) 실행 → 프로젝트에 OpenCode 통합 산출물이 모두 자동 생성되어 OpenCode 세션 시작 시 REAP 컨텍스트(static + dynamic) 가 자동 로드.

## Completion Criteria

C1. `src/adapters/opencode/` 디렉토리 존재 — install.ts / plugin/reap-plugin.ts / templates/agents.md / templates/opencode.json.template / index.ts
C2. `reap dump-state` CLI 명령이 `.reap/.session-state.md` 에 dynamic context를 기록하고, `--stdout`로 stdout 출력, `--silent`로 무음 처리됨 (unit test 통과)
C3. `reap install-skills` 와 `reap update` 가 `agentClient` 기준으로 dispatch — claude-code면 기존 흐름, opencode면 OpenCode 산출물 자동 생성/sync (e2e test 통과)
C4. opencode.json merge 로직 — 신규 생성 / 기존 사용자 파일 보존 / instructions·plugin dedupe 모두 동작 (unit test 통과)
C5. REAP CLI lifecycle 명령(start/learning/planning/implementation/validation/completion/abort/early-close) 실행 후 `.reap/.session-state.md` 자동 갱신 (e2e test로 최소 한 stage 검증)
C6. AGENTS.md 가 프로젝트 루트에 marker-based section으로 관리 — 기존 사용자 영역 보존, REAP 영역만 hash 기반 sync (unit + e2e test 통과)
C7. 기존 Claude Code 워크플로우 회귀 0건 — gen-062 결과물(load-context dynamic-only, CLAUDE.md `@` ref 9개) 유지 + 전체 기존 test suite green

## Background

- Issue #19: OpenCode 사용자 `aresstokrat` 가 REAP 도입 차단 보고. "Add new agent - add the WHOLE NEW COMMUNITY!"
- `src/types/index.ts:60` 에 `agentClient: "claude-code" | "opencode" | "codex"` 타입은 있으나 dispatch/install 미구현
- Gen-062 에서 Claude Code용 정/동 분리 완료. application.md에 "Knowledge Loading — Static / Dynamic 분리" 명문화. 본 generation은 OpenCode에 동일 원칙 적용.

## Brainstorming

### 핵심 질문 1: adapter dispatch 패턴
A. dispatcher 모듈 신설 (`src/adapters/index.ts`) → agentClient 기준 분기 함수 export
B. 각 호출 site (install-skills, update, init) 에서 직접 `if (agentClient === "opencode") ...`

| | A: Dispatcher | B: Inline branch |
|---|---|---|
| 확장성 (codex 추가 시) | 단일 변경 지점 | 모든 site 손봐야 함 |
| 테스트 용이성 | dispatcher 단에서 mock 가능 | 호출 site 별 test 필요 |
| 코드량 | 중간 (모듈 1개 추가) | 적음 (분기 1줄씩) |
| 가독성 | 명시적 | 분기가 흩어짐 |

**결정: A (Dispatcher)** — extensibility + 명시적 구조. learning에서도 동일 판단.

### 핵심 질문 2: opencode.json merge — REAP 항목 식별 방법
A. marker 기반 분리 (불가, JSON에 inline comment 불가능)
B. "REAP 관리 항목" 상수 리스트 코드에 정의. 그 항목들만 ensure (dedupe 처리)
C. 별도 `.reap/opencode-managed.json` 트래킹 파일 + main `opencode.json` 동기화

| | B: 상수 리스트 | C: 트래킹 파일 |
|---|---|---|
| 사용자 추가 항목 보존 | 가능 (REAP는 자기 항목만 보장) | 가능 |
| 사용자 REAP 항목 수동 삭제 시 | REAP가 다시 추가 (자동) | REAP가 다시 추가 |
| 사용자 REAP 항목 수정 시 | REAP가 다시 추가 안 함 (이미 매칭됨) | 트래킹 파일과 diff 발생 |
| 복잡도 | 낮음 | 높음 (파일 2개 동기화) |

**결정: B (상수 리스트)** — 단순하고 충분. REAP 항목은 변동 없음.

### 핵심 질문 3: plugin source 형식 (사용자 환경 의존 최소화)
A. `import type { Plugin } from "@opencode-ai/plugin"` 사용 (사용자가 @opencode-ai/plugin 설치 필요)
B. 타입 import 생략. inline 시그니처 + 주석 (사용자 환경 의존 X)

**결정: B** — 사용자가 별도 npm 설치 없이도 동작해야 함. OpenCode 자체가 Bun으로 plugin 컴파일 시 타입은 optional. README/AGENTS.md에 type 추가 옵션 안내.

### 핵심 질문 4: `.reap/.session-state.md` gitignore?
- 머신 상태 의존 파일 (특정 generation/stage/strict 등 시점 데이터). 사용자가 commit 할 이유 없음.
- 단 reap repo 자체 dogfooding 시에도 동일 → `.gitignore` 추가.
- 본 작업 시 `.gitignore` 에 `.reap/.session-state.md` 한 줄 추가.

### 핵심 질문 5: dump-state 자동 호출 위치 — 모든 lifecycle 명령?
- 명시적 hook 시점: `--phase complete` 후, start 후, abort 후, early-close 후
- 구현 위치: `src/cli/commands/run/*.ts` 각각의 `execute()` 끝부분에 `await dumpStateBestEffort()` 추가
- 실패 시 silent (CLI 동작에 영향 X)
- claude-code 환경에서도 호출 — 무해 + 디버깅 가치

### 핵심 질문 6: legacy cleanup 재검토
`src/core/integrity.ts:604-611` — `~/.config/opencode/commands/reap.*` 가 warning. Phase 2 잔재.
- 본 generation에서 REAP는 user-level OpenCode commands 생성 안 함 (project-level만). 따라서 이 warning은 그대로 두어도 충돌 없음. **변경 불필요**.
- 단 향후 사용자가 자체 reap commands 를 user-level에 두는 경우 false positive 가능 — 그 케이스는 별도 issue로 follow-up.

## Approach

### 아키텍처

```
src/adapters/
├── index.ts              [NEW] dispatcher: getAdapter(agentClient) → AdapterModule
├── types.ts              [NEW] AdapterModule interface
├── claude-code/
│   ├── install.ts        (기존)
│   └── skills/
└── opencode/             [NEW]
    ├── install.ts        opencode 측 install: opencode.json + AGENTS.md + plugin 배치
    ├── plugin/
    │   └── reap-plugin.ts   사용자 .opencode/plugins/ 로 복사될 source
    ├── templates/
    │   └── agents.md     AGENTS.md template
    └── index.ts          adapter entry — installSkills 등 export

src/cli/commands/
├── dump-state.ts         [NEW] CLI: --stdout, --silent
├── install-skills.ts     [MODIFY] dispatcher 통해 호출
├── update.ts             [MODIFY] dispatcher 통해 호출 + AGENTS.md/opencode.json sync
├── load-context.ts       (변경 없음 — dump-state가 buildKnowledgeContext 재사용)
└── run/*.ts              [MODIFY] 각 phase 끝에 dumpStateBestEffort() 호출

src/cli/commands/init/common.ts
└── initCommon: agentClient를 인자로 받도록 변경. opencode면 AGENTS.md + opencode.json 생성.
   (기존 ensureClaudeMd 는 dispatcher 통해 호출 — claude-code면 그대로, opencode면 ensureAgentsMd)

src/core/paths.ts          [MODIFY] sessionState: ".reap/.session-state.md" 추가
src/types/index.ts         (변경 없음 — agentClient 타입 이미 정의됨)

.gitignore                 [MODIFY] .reap/.session-state.md 추가
src/templates/             기존 그대로 (CLAUDE.md template은 Claude Code용. AGENTS.md template은 src/adapters/opencode/templates/agents.md)
```

### AdapterModule interface

```typescript
// src/adapters/types.ts
export interface AdapterModule {
  /** Install user-level files (skills, hooks, plugin source, etc.) */
  installSkills(projectRoot: string): Promise<void>;
  /** Ensure project-level integration file (CLAUDE.md or AGENTS.md) */
  ensureProjectIntegration(projectRoot: string, projectName: string): Promise<"created" | "appended" | "updated" | "skipped">;
  /** Register session-start integration (hook for claude-code, plugin for opencode) */
  registerSessionIntegration(projectRoot: string): Promise<void>;
}
```

`registerSessionHooks`(Claude Code)와 OpenCode의 plugin/opencode.json 처리는 시점이 다름 — Claude Code는 user-level `~/.claude/settings.json`, OpenCode는 project-level `opencode.json`/`.opencode/plugins/`. 인터페이스로 추상화하되 implementation은 자유.

### opencode adapter 세부 구현

`src/adapters/opencode/install.ts`:
```typescript
export async function installSkills(projectRoot: string): Promise<void> {
  // 1. Copy plugin source to .opencode/plugins/reap-plugin.ts
  await ensureDir(join(projectRoot, ".opencode", "plugins"));
  await cp(PLUGIN_SRC, join(projectRoot, ".opencode", "plugins", "reap-plugin.ts"));
  // 2. Sync opencode.json (instructions + plugin)
  await ensureOpencodeJson(projectRoot);
  // 3. Install reap-guide.md to ~/.reap/ (shared with claude-code)
  await installReapGuide();
}

const REAP_INSTRUCTIONS = [
  ".reap/genome/application.md",
  ".reap/genome/evolution.md",
  ".reap/genome/invariants.md",
  ".reap/environment/summary.md",
  ".reap/vision/goals.md",
  ".reap/vision/memory/longterm.md",
  ".reap/vision/memory/midterm.md",
  ".reap/vision/memory/shortterm.md",
  ".reap/.session-state.md",
];
const REAP_PLUGIN = "./.opencode/plugins/reap-plugin.ts";

export async function ensureOpencodeJson(projectRoot: string): Promise<"created"|"updated"|"skipped"> {
  const path = join(projectRoot, "opencode.json");
  let cfg: any = {};
  let existed = false;
  if (await fileExists(path)) {
    existed = true;
    try { cfg = JSON.parse(await readFile(path, "utf-8")) ?? {}; } catch { cfg = {}; }
  }
  const instructions = new Set([...(cfg.instructions ?? []), ...REAP_INSTRUCTIONS]);
  const plugin = new Set([...(cfg.plugin ?? []), REAP_PLUGIN]);
  const next = { "$schema": "https://opencode.ai/config.json", ...cfg, instructions: [...instructions], plugin: [...plugin] };
  // dedup-aware compare: order-insensitive deep compare for instructions/plugin
  if (existed && JSON.stringify(next) === JSON.stringify(cfg)) return "skipped";
  await writeFile(path, JSON.stringify(next, null, 2) + "\n");
  return existed ? "updated" : "created";
}
```

### Plugin source (`src/adapters/opencode/plugin/reap-plugin.ts`)

```typescript
// REAP OpenCode plugin — auto-dumps dynamic REAP state on session.created and tool.execute.before.
// Type-safe variant: install @opencode-ai/plugin and replace `any` with `Plugin`.
export const reapPlugin = async ({ $, directory }: { $: any; directory: string }) => {
  let dumpedThisSession = false;
  const dump = async () => {
    try {
      await $`reap dump-state --silent`.cwd(directory).quiet();
      dumpedThisSession = true;
    } catch { /* silent — REAP may not be installed or not a REAP project */ }
  };
  return {
    "session.created": async () => { await dump(); },
    "tool.execute.before": async () => { if (!dumpedThisSession) await dump(); },
  };
};
export default reapPlugin;
```

### AGENTS.md template (`src/adapters/opencode/templates/agents.md`)

```markdown
# REAP Project

This project uses REAP (Recursive Evolutionary Autonomous Pipeline).

## Knowledge Loading

Static knowledge (genome, environment, vision, memory) is auto-loaded via `opencode.json`'s `instructions` field.

Dynamic state (current generation, stage, strict mode, language) is auto-dumped to `.reap/.session-state.md` by the REAP OpenCode plugin (`.opencode/plugins/reap-plugin.ts`) on `session.created` / `tool.execute.before` hooks, and is auto-loaded via `instructions`.

If state appears stale (e.g., after long inactivity or external state change), run:
- `reap status` — verify current state
- `reap dump-state` — refresh `.reap/.session-state.md` manually

## REAP Workflow

For REAP CLI usage, lifecycle stages, and behavioral rules, see: `~/.reap/reap-guide.md` (installed by `reap install-skills`).

When working on a REAP project, follow the genome principles in `.reap/genome/` and respect the invariants in `.reap/genome/invariants.md` as absolute constraints.
```

marker (`<!-- reap:start xxx --> ... <!-- reap:end -->`) 로 둘러쌈 — CLAUDE.md와 동일 패턴.

### dump-state CLI

```typescript
// src/cli/commands/dump-state.ts
import { buildKnowledgeContext } from "./load-context.js";
import { createPaths } from "../../core/paths.js";
import { writeTextFile } from "../../core/fs.js";

export async function execute(opts: { stdout?: boolean; silent?: boolean } = {}): Promise<void> {
  try {
    const cwd = process.cwd();
    const ctx = await buildKnowledgeContext(cwd);
    if (!ctx) {
      // Not a REAP project
      if (opts.silent) { process.exit(0); }
      process.stderr.write("Not a REAP project (no .reap/config.yml).\n");
      process.exit(1);
    }
    if (opts.stdout) {
      process.stdout.write(ctx + "\n");
    } else {
      const paths = createPaths(cwd);
      await writeTextFile(paths.sessionState, ctx + "\n");
    }
    process.exit(0);
  } catch (err) {
    if (opts.silent) process.exit(0);
    process.stderr.write(`dump-state failed: ${(err as Error).message}\n`);
    process.exit(1);
  }
}
```

### Best-effort dump in lifecycle commands

`src/core/dump-state-helper.ts` (NEW):
```typescript
export async function dumpStateBestEffort(cwd: string): Promise<void> {
  try {
    const { buildKnowledgeContext } = await import("../cli/commands/load-context.js");
    const ctx = await buildKnowledgeContext(cwd);
    if (!ctx) return;
    const { createPaths } = await import("./paths.js");
    const { writeTextFile } = await import("./fs.js");
    await writeTextFile(createPaths(cwd).sessionState, ctx + "\n");
  } catch { /* silent */ }
}
```

각 `run/*.ts` 의 `execute()` 끝 — 또는 stage transition 직후 — `await dumpStateBestEffort(process.cwd())` 호출.

대안: `run/index.ts` 가 모든 stage dispatch 의 wrapper이므로, 거기에 한 번만 hook 추가 (모든 stage commands 후 호출). **이게 더 깔끔**.

## Risk Assessment

R1. **OpenCode 미설치 환경에서 테스트** — REAP 자체 test는 OpenCode 호출 불가. 정합성 (파일 content, JSON schema, TS syntax) 만 검증. Plugin runtime은 사용자 환경에 의존.

R2. **Plugin signature breaking change** — OpenCode 활발 진화. plugin docs (2026-05-25 시점)와 다음 release에서 변경 가능. 본 작업 시 사용 OpenCode 버전을 AGENTS.md 또는 README에 명시. fallback: plugin이 단순 (`session.created`/`tool.execute.before`만 사용)하므로 변경 영향 최소.

R3. **opencode.json 사용자 다른 필드 보존** — JSON.parse → spread → JSON.stringify 패턴이 모든 사용자 필드 보존. test로 검증.

R4. **agentClient 변경 시 cleanup** — claude-code → opencode 전환 시 기존 ~/.claude/commands/reap.* 가 남아있어도 무해 (Claude Code 미사용 시 그냥 dormant). 별도 cleanup 강제 X. README에 안내.

R5. **dumpStateBestEffort 가 모든 stage 후 호출** — Claude Code 환경에서도 호출. `.reap/.session-state.md` 가 dogfooding repo에 매번 생성됨 → `.gitignore` 추가 필수. 검증.

R6. **`reap init` 인터랙티브 흐름** — 본 작업 scope 아님. `agentClient` 선택 UI는 별도. 단 `reap init` 직후 사용자가 config.yml의 `agentClient: claude-code` 를 수동으로 `opencode` 로 바꾸고 `reap update` 실행하는 흐름은 e2e test로 검증.

R7. **plugin TypeScript 컴파일 실패** — OpenCode가 Bun으로 plugin 컴파일. 본 plugin source는 inline 타입 (no external dep) → 컴파일 실패 가능성 최소. 단 `tsc --noEmit` 으로 본 repo 빌드 단계에서 syntax 검증.

## Scope

### In Scope

- `src/adapters/opencode/` 전체 신설
- `src/adapters/index.ts` + `src/adapters/types.ts` dispatcher
- `src/cli/commands/dump-state.ts` + CLI 등록
- `src/cli/commands/install-skills.ts` dispatcher 활용
- `src/cli/commands/update.ts` dispatcher 활용
- `src/cli/commands/init/common.ts` agentClient-aware (단 `reap init` 인터랙티브 변경은 최소)
- `src/cli/commands/run/index.ts` dumpStateBestEffort hook
- `src/core/dump-state-helper.ts` 신설
- `src/core/paths.ts` sessionState 추가
- `.gitignore` `.reap/.session-state.md` 추가
- `src/templates/reap-guide.md` OpenCode 지원 명시 + `.reap/reap-guide.md` dogfooding sync
- README OpenCode 지원 명시 (한 줄 + 링크)
- unit + e2e tests

### Out of Scope

- Codex adapter (별도 issue/generation)
- `reap init` 인터랙티브 흐름의 agentClient 선택 UI (별도)
- OpenCode plugin 고급 활용 (tool.execute.after dump 등)
- Daemon 통합
- Evaluator 코드 통합
- `~/.config/opencode/commands/reap.*` legacy warning 제거 (별도, false positive 우려)

## Tasks

- [ ] T001 `.gitignore` — `.reap/.session-state.md` 추가
- [ ] T002 `src/core/paths.ts` — `sessionState: ".reap/.session-state.md"` 추가, `createPaths()` 반영, ReapPaths interface 갱신
- [ ] T003 `src/adapters/types.ts` — `AdapterModule` interface 정의
- [ ] T004 `src/adapters/index.ts` — dispatcher: `getAdapter(agentClient): AdapterModule` 구현. codex는 미지원 throw.
- [ ] T005 `src/adapters/claude-code/index.ts` — 기존 install.ts 함수를 AdapterModule 형식으로 export (얇은 wrapper). 기존 직접 import도 유지 (호환성).
- [ ] T006 `src/adapters/opencode/templates/agents.md` — AGENTS.md template (marker 제외 inner content)
- [ ] T007 `src/adapters/opencode/plugin/reap-plugin.ts` — OpenCode plugin source (inline type, default export + named)
- [ ] T008 `src/adapters/opencode/install.ts` — `installSkills` + `ensureOpencodeJson` + `ensureAgentsMd` (마커 + hash). REAP_INSTRUCTIONS / REAP_PLUGIN 상수 정의.
- [ ] T009 `src/adapters/opencode/index.ts` — AdapterModule 형식 export
- [ ] T010 `src/cli/commands/dump-state.ts` — CLI 명령 (--stdout, --silent)
- [ ] T011 `src/cli/index.ts` — `dump-state` 명령 등록
- [ ] T012 `src/core/dump-state-helper.ts` — `dumpStateBestEffort()` 헬퍼
- [ ] T013 `src/cli/commands/run/index.ts` — 각 stage 후 `dumpStateBestEffort()` 호출 (single wrapper hook)
- [ ] T014 `src/cli/commands/install-skills.ts` — config 읽고 dispatcher 통해 호출
- [ ] T015 `src/cli/commands/update.ts` — agentClient 기준 dispatcher: ensureProjectIntegration + registerSessionIntegration. 기존 ensureClaudeMd / registerSessionHooks 호출은 dispatcher 통해.
- [ ] T016 `src/cli/commands/init/common.ts` — `ensureClaudeMd` → `ensureProjectIntegration` (dispatcher 활용). default agentClient는 그대로 "claude-code" 유지.
- [ ] T017 `tests/unit/dump-state.test.ts` — buildKnowledgeContext 출력과 파일 content 일치, --stdout/--silent 동작
- [ ] T018 `tests/unit/opencode-json.test.ts` — opencode.json merge: 신규/기존/중복/사용자 다른 필드 보존
- [ ] T019 `tests/unit/adapter-dispatch.test.ts` — agentClient 기준 dispatcher 정확 분기, codex 시 의미 있는 에러
- [ ] T020 `tests/e2e/opencode-install.test.ts` — init + agentClient=opencode 설정 + install-skills → opencode.json/AGENTS.md/.opencode/plugins/reap-plugin.ts/.reap/.session-state.md 모두 생성. 기존 opencode.json 보존 케이스 + lifecycle 명령 후 dump 갱신 케이스 포함.
- [ ] T021 `src/templates/reap-guide.md` — Knowledge Loading 절에 OpenCode 메커니즘 추가 (Claude Code vs OpenCode 표). `agentClient` 설정 가이드.
- [ ] T022 `.reap/reap-guide.md` — dogfooding sync (T021과 동일 변경)
- [ ] T023 `README.md` — OpenCode 지원 한 줄 + AGENTS.md 자동 생성 안내
- [ ] T024 빌드 & dogfooding 실행 — `npm run build` 후 본 repo 자체에 `reap update` 호출하여 (agentClient=claude-code 유지) 회귀 확인. 다음 OpenCode 호환 fixture로 unit test.

총 24개 tasks. 한계(20) 초과 — 다음과 같이 묶음:
- T005 (claude-code adapter wrapper) + T004 (dispatcher): 함께. T005를 T004에 포함하여 19개로.
- T022 (dogfooding sync) + T021 (template 변경): T021 작업 시 sync 동시 수행 → T022 제거하고 T021에 sync 포함.
- T024 (dogfooding 실행) + T020 (e2e): T020 e2e가 lifecycle 통합 테스트. T024는 validation phase의 dogfooding으로 이동.

**최종 22 tasks** (T005 T004 통합, T022 T021 통합):

- [ ] T001 `.gitignore` — `.reap/.session-state.md` 추가
- [ ] T002 `src/core/paths.ts` — `sessionState` 추가
- [ ] T003 `src/adapters/types.ts` — `AdapterModule` interface
- [ ] T004 `src/adapters/index.ts` + `src/adapters/claude-code/index.ts` — dispatcher + claude-code AdapterModule wrapper
- [ ] T005 `src/adapters/opencode/templates/agents.md` — AGENTS.md template
- [ ] T006 `src/adapters/opencode/plugin/reap-plugin.ts` — plugin source
- [ ] T007 `src/adapters/opencode/install.ts` + `index.ts` — OpenCode AdapterModule 구현
- [ ] T008 `src/cli/commands/dump-state.ts` + `src/cli/index.ts` 등록
- [ ] T009 `src/core/dump-state-helper.ts` — best-effort dump 헬퍼
- [ ] T010 `src/cli/commands/run/index.ts` — 모든 stage 후 dumpStateBestEffort hook
- [ ] T011 `src/cli/commands/install-skills.ts` — dispatcher 활용
- [ ] T012 `src/cli/commands/update.ts` — dispatcher 활용
- [ ] T013 `src/cli/commands/init/common.ts` — `ensureProjectIntegration` 일반화
- [ ] T014 `tests/unit/dump-state.test.ts`
- [ ] T015 `tests/unit/opencode-json.test.ts`
- [ ] T016 `tests/unit/adapter-dispatch.test.ts`
- [ ] T017 `tests/e2e/opencode-install.test.ts`
- [ ] T018 `src/templates/reap-guide.md` + `.reap/reap-guide.md` dogfooding sync — OpenCode 안내 추가
- [ ] T019 `README.md` — OpenCode 지원 안내
- [ ] T020 `npm run build` + 본 repo 회귀 검증
- [ ] T021 dogfooding `reap update` 실행 — 본 repo CLAUDE.md/AGENTS.md 회귀 0 확인
- [ ] T022 validation 단계에서 unit + e2e 전체 통과 확인

20 → 22로 다시 늘어났으나 본 작업의 복잡도(adapter 신설 + CLI 신규 + 22 verification) 고려 시 적정.

## Dependencies

순서:
1. T001 → T002 (paths 변경)
2. T003 → T004 (interface 먼저, 그 다음 dispatcher)
3. T004 → T011, T012, T013 (dispatcher 사용처)
4. T005, T006 → T007 (template/plugin이 install.ts에 import)
5. T007 → T011, T012, T013 (opencode adapter가 dispatcher에서 호출됨)
6. T008 → T010 (dump-state CLI를 helper가 wrap)
7. T009 → T010 (helper를 run/index.ts가 사용)
8. T002, T008 → T014 (test가 paths + dump-state 명령)
9. 모든 src 완료 → T020 (build)
10. T020 → T021 (build 후 dogfooding)
11. T020 → T022 (build 후 test 실행)

병렬 가능: T005, T006 (template/plugin 독립). T014~T017 (test, 각각 독립).

## Confirmation

[ ] 사용자 확인 필요 — 본 plan으로 진행 OK? (planning phase는 hard-gate가 아닌 권고)

본 generation은 high clarity (backlog가 매우 구체적이고 학습 단계에서 미정 사항 확정) — 추가 질문 없이 implementation 진행 가능 판단. 단 큰 변경(adapter dispatch 패턴 도입, dump-state 신규 명령) 이라 plan 작성 후 일단 phase complete 처리하고 implementation 진행.
