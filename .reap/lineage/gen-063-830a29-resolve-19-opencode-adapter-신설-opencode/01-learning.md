# Learning

> gen-063: OpenCode adapter 신설 — 외부 사용자 OpenCode 환경에서 REAP 사용 가능하게.

## Project Overview

REAP는 현재 `claude-code` 단일 adapter만 구현됨 (`src/adapters/claude-code/`). `src/types/index.ts:60`에 `agentClient: "claude-code" | "opencode" | "codex"` 타입은 존재하나 `opencode`/`codex` 경로는 dispatch도 install도 미구현. Issue #19에서 OpenCode 사용자가 REAP 도입 차단된 사실 보고.

Gen-062에서 Claude Code용 정/동 분리가 완료됨: `buildKnowledgeContext()`가 dynamic-only 출력으로 분리. application.md genome의 "Knowledge Loading — Static / Dynamic 분리" 절이 OpenCode 등 후속 adapter가 동일 원칙을 따르도록 명문화. 본 generation은 그 분리된 dynamic 출력을 OpenCode가 활용할 수 있는 형태(`.reap/.session-state.md` 파일)로 expose 하는 작업.

Clarity: **High**. backlog 항목이 매우 구체적 (9개 verification, 9개 구현 항목, 명시적 설계 결정 9건). OpenCode docs 조사도 학습 단계에서 완료. 단 두 가지 미확정 사항 — AGENTS.md 위치 / opencode.json schema — 본 학습에서 확정함.

## Key Findings

### OpenCode docs 재확인 결과 (2026-05-25 fetch)

**Rules 페이지** (https://opencode.ai/docs/rules/):
- 프로젝트 rules: 프로젝트 루트 `AGENTS.md` (또는 CLAUDE.md fallback)
- 글로벌 rules: `~/.config/opencode/AGENTS.md` (또는 `~/.claude/CLAUDE.md` fallback)
- **`.opencode/AGENTS.md`는 공식 문서에 언급 없음**. `.opencode/` 디렉토리는 plugin / config 용도. 따라서 **AGENTS.md는 프로젝트 루트로 확정**.
- Precedence: 로컬 traverse-up > 글로벌 > Claude Code fallback. 첫 매칭이 승. AGENTS.md가 CLAUDE.md보다 우선.
- OpenCode는 AGENTS.md의 `@` reference를 자동 파싱하지 않음. 단 docs에서 권장: "명시적 지시문으로 LLM이 Read tool로 로드"하게 유도 가능. ← REAP는 `opencode.json instructions`를 활용하므로 `@` ref 의존 X.
- `opencode.json` `instructions` 필드는 글로브 패턴 (`packages/*/AGENTS.md`), 원격 URL 모두 지원.

**Plugins 페이지** (https://opencode.ai/docs/plugins/):
- Plugin 위치: `.opencode/plugins/` (프로젝트), `~/.config/opencode/plugins/` (글로벌), 또는 `opencode.json`의 npm 패키지로.
- Plugin signature: `async ({ project, client, $, directory, worktree }) => hooksObject`
- TypeScript 지원: `import type { Plugin } from "@opencode-ai/plugin"`
- 본 작업 관련 hook: `session.created`, `tool.execute.before`, `tool.execute.after`, `session.idle` 등 (모두 명시됨)
- Plugin은 hooks object를 return. 시작 시 (모듈 로드 시) 한 번 실행되는 코드 + hook 등록.

**확정**: AGENTS.md는 **프로젝트 루트 `AGENTS.md`**.

### 기존 코드 구조 (claude-code adapter 패턴)

- `src/adapters/claude-code/install.ts` 만 존재. `installSkills()`가 진입점.
  - `~/.claude/commands/`에 `reap.*.md` skill 파일 복사
  - `~/.reap/reap-guide.md` 설치
  - `~/.claude/agents/` 에 agent 정의 복사
  - `~/.claude/settings.json` 의 `hooks.SessionStart` 에 `reap check-version` + `reap load-context` 등록
- `src/cli/commands/install-skills.ts` 가 adapter dispatch 위치 — 현재는 claude-code 직접 호출. 본 generation에서 agentClient 기준 분기 추가 필요.
- `src/cli/commands/init/common.ts` 의 `initCommon()` 이 `agentClient: "claude-code"` 하드코딩 (line 72). init 시점에 어떤 agentClient를 쓸지 결정 로직 필요.
- `ensureClaudeMd()` (`common.ts:190`) — marker-hash sync 기반. AGENTS.md도 동일 패턴 적용 가능 (gen-054에서 도입된 `<!-- reap:start ${hash} -->` 패턴).
- `src/cli/commands/load-context.ts` — gen-062 후 dynamic-only. **본 generation의 `dump-state`는 같은 `buildKnowledgeContext()` 를 재사용**해서 동일 출력을 파일로 기록.

### Adapter dispatch 설계 옵션

옵션 A — **`src/adapters/index.ts` dispatcher 신설**: agentClient 기준으로 `installSkills`/`getClaudeMdLikeFile` 등 분기 함수 export. claude-code/opencode/codex 각각 export.
옵션 B — install-skills, init, update 각각에서 `if (agentClient === "opencode")` 분기.

**옵션 A 채택**. 추후 codex 추가 시 단일 변경 지점. dispatch 패턴이 명확해지고 테스트도 dispatcher 단에서 가능.

### dump-state 위치 및 자동 호출

- 신규 명령: `src/cli/commands/dump-state.ts`
- `buildKnowledgeContext(cwd)` 재사용. null이면 silent exit (--silent 옵션이 있건 없건 일관).
- 출력 경로: `.reap/.session-state.md` (paths 모듈에 추가)
- 옵션:
  - `--stdout` — 파일 대신 stdout (디버깅용)
  - `--silent` — 항상 0 exit (실패 시 stderr 무음)
- 자동 호출 지점:
  - `run/start.ts`, `run/learning.ts`, `run/planning.ts`, `run/implementation.ts`, `run/validation.ts`, `run/completion.ts` 의 phase 완료 후
  - `run/abort.ts`, `run/early-close.ts` 종료 후
  - Claude Code 환경에서도 호출 — `.reap/.session-state.md` 파일만 생성되고, Claude Code는 이 파일을 자동 로드하지 않으므로 무해. 단 file content는 의미 있는 상태 (디버깅에 유용). 조건 분기 없이 모든 환경에서 호출.

`.reap/.session-state.md` 는 `.gitignore` 대상? — yes. 사용자 dump 결과는 머신 상태 의존이므로 gitignore에 추가. 단 dogfooding 시 reap repo 자체의 `.reap/.session-state.md`는 무시.

### opencode.json 자동 관리 전략

- 위치: 프로젝트 루트 `opencode.json` (글로벌 `~/.config/opencode/opencode.json`도 존재하나 REAP는 프로젝트 단위라 프로젝트 루트만 관리)
- 기존 파일 보존 — JSON merge. instructions 배열만 영향: 누락된 9개 REAP 항목만 추가. 중복 dedupe. plugin 배열도 동일.
- 신규 생성 — `{ "$schema": "https://opencode.ai/config.json", "instructions": [...], "plugin": [...] }`
- 사용자 커스텀 instructions/plugin이 있으면 그대로 보존. REAP는 자기 항목만 보장.
- marker 기반 분리는 JSON 특성상 부적합. 대신 "REAP 관리 instructions 목록" 상수 9개를 코드에 정의하고 그것만 ensure.

### Plugin 동작 설계

```typescript
import type { Plugin } from "@opencode-ai/plugin";

export const reapPlugin: Plugin = async ({ $, directory }) => {
  let dumpedThisSession = false;
  const dump = async () => {
    try {
      await $`reap dump-state --silent`.cwd(directory).quiet();
      dumpedThisSession = true;
    } catch { /* silent */ }
  };
  return {
    "session.created": async () => { await dump(); },
    "tool.execute.before": async () => {
      if (!dumpedThisSession) await dump();
    },
  };
};
export default reapPlugin;
```

- `dumpedThisSession` 변수는 plugin 모듈 스코프. 세션 단위가 아니라 OpenCode 프로세스 단위로 공유될 가능성 — 그러나 resume도 새 plugin instance를 만드는지는 docs 명시 없음. 안전한 fallback: 모든 `tool.execute.before` 호출마다 dump 해도 무해 (파일 쓰기만, ~1.8KB). 하지만 빈번한 dump는 부하 → **guard 유지**, 단 stale 우려가 있을 때마다 사용자가 `reap dump-state` 수동 가능.
- `quiet()` 메서드 — Bun shell API. stdout 부담 줄임.

### AGENTS.md 설계

- 프로젝트 루트 `AGENTS.md`. marker 분리 (CLAUDE.md와 동일 패턴).
- 내용 minimal:
  - "This project uses REAP."
  - opencode.json instructions로 static knowledge 자동 로드됨 안내
  - dynamic state는 `.reap/.session-state.md`에서 자동 로드됨 안내
  - 의심 시 `reap status` / `reap dump-state` 안내
  - `~/.reap/reap-guide.md` reference (사용자 home에 install-skills로 설치된 파일)
- **Claude-specific 표현 제거**: "reap-evolve" agent 같은 Claude Code-specific 용어 X. AGENTS.md는 client-agnostic.
- marker: `<!-- reap:start xxx --> ... <!-- reap:end -->` ← CLAUDE.md와 동일 사용 가능. `ensureClaudeMd` 로직 일반화하여 `ensureAgentsMd` 신설하거나 공통 `ensureAgentMarkerFile()` 함수로 추출.

### Legacy cleanup 재검토 (`src/core/integrity.ts:601-608`)

확인 필요. 현재 `~/.config/opencode/commands/reap.*` legacy 처리가 Phase 2 잔재로 존재한다고 backlog에 적힘. OpenCode adapter 신설 후엔 사용자가 정상적으로 user-level commands를 둘 수도 있어 cleanup 규칙 충돌 가능. Planning 단계에서 정확히 확인.

### 테스트 전략

- Unit:
  - opencode.json merge 로직 (신규/기존/충돌/dedupe)
  - dump-state 출력 = buildKnowledgeContext 출력 일치
  - adapter dispatch (`agentClient` 기준)
  - AGENTS.md marker sync
- E2E:
  - `reap init` with `agentClient: opencode` 시나리오 (config 수정 또는 init 옵션)
  - existing opencode.json 보존 검증
  - dump-state CLI 직접 호출
  - lifecycle 명령 후 dump 갱신
- OpenCode 자체 비설치. plugin TypeScript syntax check만 (`tsc --noEmit` 또는 import path 확인).

## Previous Generation Reference

gen-062 (CLAUDE.md `@` reference + load-context 정/동 분리):
- `buildKnowledgeContext()` dynamic-only 분리 완료 → 본 generation의 `reap dump-state`가 그대로 재사용
- application.md에 "Knowledge Loading — Static / Dynamic 분리" 절 명문화 → OpenCode adapter도 동일 원칙
- `extractReapSection` + `updateClaudeMdFile` marker-hash sync 패턴 → AGENTS.md에 그대로 적용 가능
- dog-fooding 적용 사례 (npm run build 직후 update 호출) → 본 generation에서도 동일하게 OpenCode 관련 파일 dog-fooding 가능 (선택)

fitness feedback: "1번(Gen-N+1 OpenCode adapter)는 본 generation 직후 바로 진행 예정" — 본 generation이 그것.

## Backlog Review

`.reap/life/backlog/opencode-adapter.md` (already consumed) 가 본 generation 기반. 9개 구현 항목 + 15개 verification 기준 + 9개 설계 결정 + 6개 risk/caveat 모두 명시. 추가 backlog 변경 불필요.

Pending backlog 5건 (claude-md-knowledge-loading-separation, daemon-e2e-tests, early-close-lifecycle, fix-migrate-update-tests, strict-merge-mode-bypass-for-merge-gen):
- claude-md-knowledge-loading-separation — gen-062에서 해결됨. consume 누락 가능성? — 확인 필요하나 본 generation scope 외.
- 나머지 4건 — 본 generation과 무관. 별도 generation에서.

## Technical Deep-Dive

### 정확한 dump-state 출력 (gen-062의 buildKnowledgeContext)

```
# Current State
- Generation: gen-063-830a29
- Type: normal
- Goal: ...
- Stage: implementation

---

(strict mode section if applicable)

---

# Language
Always respond in korean. ...
```

크기: <2KB (gen-062 measure 1814 bytes 기준). `.reap/.session-state.md` 헤더는 추가 X — file content 그대로가 opencode.json instructions로 inject.

### opencode.json schema

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["string or glob or URL", ...],
  "plugin": ["./path or @scope/pkg or URL", ...]
}
```

다른 필드 (model, agent, mcp, etc.) 는 본 작업과 무관 — merge 시 보존만.

### Plugin 등록 시점

- `.opencode/plugins/*.{js,ts}` 디렉토리에 파일만 있으면 자동 로드 (no opencode.json 등록 필요)
- 하지만 backlog는 opencode.json의 `plugin` 배열에도 등록하는 형태로 명시 → 명시적 등록이 더 안전 (개인 .opencode/ 디렉토리 제외 케이스 대비)
- **결정**: 둘 다. 파일 배치 + opencode.json `plugin` 배열 등록. dedupe 처리.

### TypeScript plugin source 형식

- `.opencode/plugins/reap-plugin.ts` (TypeScript). OpenCode가 Bun으로 컴파일.
- 본 REAP repo의 source는 `src/adapters/opencode/plugin/reap-plugin.ts`. install 시 그대로 copy.
- `@opencode-ai/plugin` 패키지 import는 사용자 환경에 그 패키지가 있어야 함. **REAP는 그 의존성 강제 X**. 따라서 type-import 생략 또는 inline 타입 정의. → **inline 시그니처**로 작성 (`async (ctx: any) => any` 또는 정확한 타입을 plugin source 내부 주석으로 명시). 사용자가 타입을 원하면 `@opencode-ai/plugin` 설치 후 import 추가.

## Context for This Generation

### 진행 원칙
- artifact before implementation
- dogfooding (`src/templates/` ↔ `.reap/` 동기화 필요한 경우 — 본 generation은 templates 추가가 많음)
- stale build 방지 (src 수정 후 `npm run build`)
- tests submodule 별도 commit
- objective review (sycophancy 금지)

### 확정 사항 (planning artifact에 반영)
1. AGENTS.md: 프로젝트 루트 `AGENTS.md`. marker 사용.
2. opencode.json `plugin` 배열에도 plugin 명시 등록 (디렉토리 + 명시 모두).
3. Adapter dispatch: `src/adapters/index.ts` dispatcher.
4. dump-state는 Claude Code 환경에서도 호출 (조건 분기 없음, 무해).
5. `.reap/.session-state.md` 는 `.gitignore` 대상.
6. plugin TypeScript source에서 `@opencode-ai/plugin` type import 생략 (사용자 환경 의존 방지).
7. AGENTS.md는 client-agnostic (Claude-specific 용어 제거).
8. legacy cleanup 재검토는 planning 단계에서 (`src/core/integrity.ts:601-608` 정확히 읽고 결정).
9. `reap init` 의 agentClient 선택 — 본 작업에서 init 인터랙티브 흐름 변경은 최소화 (별도 issue). 단 config.yml에서 `agentClient: opencode`로 수동 변경 후 `reap install-skills` 또는 `reap update` 가 작동하면 minimal viable.

### 가정 (assumptions)
- OpenCode 버전: 본 작업 시점 최신 (2026-05-25 docs 기준). plugin signature는 docs와 일치한다고 가정.
- 사용자 OpenCode 설치 여부: REAP는 신경 안 씀. 파일만 정합성 있게 생성.
- 사용자 Bun 설치 여부: OpenCode가 Bun으로 plugin을 컴파일하므로 OpenCode 사용자는 Bun 보유 가정 (OpenCode가 강제). REAP는 별도 요구 안 함.
- legacy `~/.config/opencode/commands/reap.*` cleanup 규칙은 현재 살아있고 OpenCode adapter 신설 후에도 user-level reap commands 와 충돌 안 함 (REAP는 user-level commands 안 만드므로). 단 planning 단계에서 확인.
