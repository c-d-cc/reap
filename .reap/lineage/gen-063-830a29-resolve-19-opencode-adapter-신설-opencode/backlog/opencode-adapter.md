---
title: OpenCode adapter 신설 — opencode.json + dump-state + plugin (session.created/tool.execute.before)
priority: medium
created: 2026-05-25
resolves: 19
issueUrl: https://github.com/c-d-cc/reap/issues/19
dependsOn: claude-md-knowledge-loading-separation
status: consumed
consumedBy: gen-063-830a29
consumedAt: 2026-05-25T21:29:54+09:00
---

## 배경

Issue #19 — 외부 사용자(`aresstokrat`)가 OpenCode 지원 요청. 현재 REAP는 `agentClient` 타입에 `"opencode"`를 정의해 두었으나(`src/types/index.ts:60`) `src/adapters/`에는 `claude-code/` 한 어댑터만 존재. OpenCode 사용자는 REAP 사용 불가.

본 작업은 `claude-md-knowledge-loading-separation.md` (이슈 #17, Gen-N) 완료를 전제로 한다. Gen-N에서 도입한 **정적 / 동적 분리 원칙**을 OpenCode에도 동일하게 적용해 일관성 유지.

## OpenCode 메커니즘 조사 결과 (2026-05-25 세션)

- **SessionStart hook 미지원** — OpenCode Issue [#5409](https://github.com/anomalyco/opencode/issues/5409) 미구현 상태
- **사용 가능 메커니즘**:
  - `opencode.json`의 `instructions` 필드 — 정적 파일 자동 로드 (모든 세션, resume 포함, OpenCode native)
  - Plugin `session.created` hook — 새 세션 시 발화 (resume 제외)
  - Plugin `tool.execute.before` hook — 첫 도구 호출 시 (resume 케이스 fallback에 활용 가능)
  - Plugin init function — OpenCode 로드 시 1회 (모든 세션 공통)
- **Plugin 위치**: project-level `.opencode/plugins/`, 또는 global `~/.config/opencode/plugins/`, 또는 `opencode.json`의 `"plugin"` array (npm package)
- **Plugin signature**: `async ({ project, client, $, directory, worktree }) => hooksObject`

## 합의된 방향 (2026-05-25 세션 결정)

Gen-N의 정/동 분리 원칙을 OpenCode에 적용. resume 케이스 robustness까지 확보.

| Knowledge 종류 | 메커니즘 | resume 동작 |
|---|---|---|
| Static (genome×3, env summary, goals, memory×3, reap-guide) | `opencode.json`의 `instructions` 필드 | ✅ 매 세션 자동 로드 |
| Dynamic state (current generation, strict, language) | 정적 파일로 dump (`reap dump-state` → `.reap/.session-state.md`) + `opencode.json instructions`에 포함 | ✅ 매 세션 dump 파일 자동 로드 (slightly stale 가능) |
| Dump 파일 갱신 | (a) REAP CLI 주요 명령 후 자동 dump (b) OpenCode plugin `session.created` hook에서 dump (c) `tool.execute.before` guard로 resume fallback | a+b+c 조합으로 startup/resume 모두 cover |

## 구현 범위 (Gen-N+1, OpenCode adapter)

### 1. `src/adapters/opencode/` 신설

디렉토리 구조:

```
src/adapters/opencode/
├── install.ts             # opencode.json 생성/수정, plugin 파일 배치
├── plugin/
│   └── reap-plugin.ts     # OpenCode plugin source (TypeScript, 사용자 환경으로 복사)
├── templates/
│   ├── agents.md          # AGENTS.md template (minimal 진입 가이드)
│   └── opencode.json.template  # 신규 사용자용 opencode.json 초안
└── index.ts               # adapter entry (claude-code/와 패턴 동일)
```

### 2. `reap dump-state` 신규 CLI 명령

- 새 파일: `src/cli/commands/dump-state.ts`
- 동작: `load-context.ts`의 `buildKnowledgeContext()` (Gen-N 후 dynamic-only)를 호출 → `.reap/.session-state.md`에 기록
- 옵션:
  - `--stdout` — 파일 대신 stdout으로 출력 (디버깅용)
  - `--silent` — REAP 프로젝트 아니거나 에러 시 조용히 0 exit
- 자동 호출 통합 지점:
  - `src/cli/commands/run/start.ts` (generation 시작 후)
  - `src/cli/commands/run/learning.ts`, `planning.ts`, `implementation.ts`, `validation.ts`, `completion.ts` (각 stage 완료 후)
  - `src/cli/commands/run/abort.ts`, `early-close.ts` (종료 후)
  - 단, **Claude Code 환경에서는 dump가 불필요** (load-context hook이 dynamic을 직접 inject). `agentClient` 기준으로 조건부 호출 또는 dump는 모든 환경에서 실행하되 Claude Code 환경에서 무해 (파일만 생성, 자동 로드 안 됨)

### 3. opencode.json 자동 관리

- 신규 사용자 (`reap init --agent opencode`): opencode.json 신규 생성 또는 기존 파일에 instructions/plugin 추가
- 기존 사용자 (`reap update`, `agentClient: opencode`인 경우): 기존 opencode.json에 REAP 관련 instructions 보장
- 형식:
  ```json
  {
    "instructions": [
      ".reap/genome/application.md",
      ".reap/genome/evolution.md",
      ".reap/genome/invariants.md",
      ".reap/environment/summary.md",
      ".reap/vision/goals.md",
      ".reap/vision/memory/longterm.md",
      ".reap/vision/memory/midterm.md",
      ".reap/vision/memory/shortterm.md",
      ".reap/.session-state.md"
    ],
    "plugin": ["./.opencode/plugins/reap-plugin.ts"]
  }
  ```
- ~/.reap/reap-guide.md는 home 경로라 instructions에 포함하기 어려움. AGENTS.md에 명시적 reference로 처리(또는 dump-state가 reap-guide 일부를 inline).

### 4. OpenCode plugin 파일

- 위치: 사용자 프로젝트 `.opencode/plugins/reap-plugin.ts`
- `reap install-skills`가 src/adapters/opencode/plugin/reap-plugin.ts → 사용자 프로젝트로 복사
- 핵심 동작:
  ```typescript
  export const reapPlugin = async ({ $, directory }) => {
    let dumpedThisSession = false;
    const dump = async () => {
      try {
        await $`reap dump-state --silent`.cwd(directory);
        dumpedThisSession = true;
      } catch { /* silent */ }
    };

    return {
      "session.created": async () => {
        await dump();
      },
      "tool.execute.before": async () => {
        if (!dumpedThisSession) await dump();
      },
    };
  };
  export default reapPlugin;
  ```
- 결과: startup 케이스는 session.created로, resume 케이스는 첫 도구 호출 직전 tool.execute.before로 자동 갱신

### 5. AGENTS.md template

- 위치: 사용자 프로젝트 `AGENTS.md` (또는 .opencode/AGENTS.md 권장 위치 확인 필요)
- 내용 (minimal):
  ```markdown
  # REAP Project

  This project uses REAP (Recursive Evolutionary Autonomous Pipeline).

  Static knowledge (genome, environment, vision, memory) is auto-loaded via `opencode.json`'s `instructions` field.

  Dynamic state (current generation, strict mode, language directive) is auto-updated by the REAP OpenCode plugin (`.opencode/plugins/reap-plugin.ts`) and recorded in `.reap/.session-state.md` — also auto-loaded.

  If state appears stale (e.g., after long inactivity), run `reap status` to verify or `reap dump-state` to refresh manually.

  For REAP CLI usage and lifecycle: `~/.reap/reap-guide.md`.
  ```
- 사용자 커스터마이즈 영역과 REAP 영역을 마커로 분리 (`<!-- reap:start xxx --> ... <!-- reap:end -->`) — Claude Code CLAUDE.md와 동일 패턴

### 6. Adapter dispatch 로직

- `src/adapters/index.ts` 또는 dispatcher 모듈 신설 (현재 claude-code 직접 호출 패턴 리팩토링)
- `agentClient` 값 기준으로 분기:
  - `claude-code` → 기존 로직
  - `opencode` → 신규 OpenCode adapter
  - `codex` → 미구현 에러 또는 minimal 안내 (out of scope)
- 영향 받는 명령:
  - `reap install-skills` (skill 파일 + plugin 파일 복사)
  - `reap check-version` (legacy cleanup, OpenCode 측 정리 항목 정의)
  - `reap init` (CLAUDE.md vs AGENTS.md + opencode.json)
  - `reap update` (template sync)

### 7. legacy cleanup 확장

- `src/core/integrity.ts:601-608` 이미 `~/.config/opencode/commands/reap.*` legacy 처리 존재 (Phase 2 remnant)
- OpenCode adapter 신설 후엔 합법적 reap commands가 user-level에 있을 수도 — 현재 cleanup 규칙 재검토 필요
- (a) user-level commands는 cleanup 대상에서 제외 (b) 또는 marker 기반으로 REAP가 설치한 것만 정리

### 8. 테스트

- **Unit**:
  - `opencode.json` 생성/수정 로직 (신규/기존/충돌 케이스)
  - dump-state 출력 형식 (Gen-N의 load-context dynamic과 동일)
  - adapter dispatch (`agentClient` 분기)
- **E2E**:
  - `reap init --agent opencode` → opencode.json + .opencode/plugins/ + AGENTS.md + .reap/.session-state.md 생성
  - 기존 OpenCode 프로젝트에서 `reap init` 실행 시 기존 opencode.json 보존 (instructions만 merge)
  - dump-state 호출 후 `.reap/.session-state.md` 내용이 hook 출력과 일치
  - REAP CLI lifecycle 명령(start/completion 등) 실행 후 dump 자동 갱신 검증
- **테스트 한계**: OpenCode 자체를 테스트 환경에 설치하지 않음. REAP가 생성하는 파일들의 정합성만 검증. Plugin runtime은 사용자 환경에서 OpenCode가 실행

### 9. 문서 업데이트

- `src/templates/reap-guide.md`:
  - OpenCode 지원 사실 명시 (Knowledge Loading 섹션에서 client별 메커니즘 설명)
  - `agentClient` 설정 가이드
- `.reap/reap-guide.md` (dog-fooding 동기화)
- `docs/`: OpenCode setup 가이드 페이지 신규 (영문/한국어)
- README: OpenCode 지원 배지/링크

## 확정된 설계 결정

| 항목 | 결정 |
|---|---|
| Static knowledge 전달 | `opencode.json` `instructions` |
| Dynamic state 전달 | `reap dump-state` → `.reap/.session-state.md` + instructions |
| Dump 갱신 주체 | (a) REAP CLI 명령 후 자동 (b) plugin session.created (c) plugin tool.execute.before guard |
| Resume 케이스 | plugin tool.execute.before에서 한 번 더 dump |
| Plugin 위치 | 사용자 프로젝트 `.opencode/plugins/reap-plugin.ts` |
| AGENTS.md 위치 | 프로젝트 루트 `AGENTS.md` (또는 `.opencode/AGENTS.md` — 조사 후 확정) |
| ~/.reap/reap-guide.md | AGENTS.md의 명시적 reference로 처리 |
| reap-plugin.ts source 형식 | TypeScript. OpenCode가 컴파일 |
| Adapter dispatch | `agentClient` 값 기준 분기. 신규 `src/adapters/dispatcher.ts` 또는 기존 adapter index 활용 |
| Codex 처리 | Out of scope. 별도 issue/generation |

## Out of Scope (별도 처리)

- **Codex adapter** — `@` import도 hook도 미지원. AGENTS.md 직접 포함 방식 필요. 별도 issue/generation.
- **Daemon 관련** — `daemon-open-questions.md`와 별개 트랙
- **Evaluator 코드 통합** — 메모리 longstanding follow-up
- **OpenCode plugin의 고급 활용** (예: tool.execute.after에서 dump 갱신 등) — 본 generation은 minimal로 시작

## Verification 기준

- [ ] `src/adapters/opencode/` 디렉토리에 install.ts / plugin/ / templates/ / index.ts 모두 존재
- [ ] `reap dump-state` 명령이 `.reap/.session-state.md`에 Gen-N load-context와 동일 dynamic 출력 기록
- [ ] `reap dump-state --stdout`이 stdout으로 동일 내용 출력 (디버깅 용)
- [ ] REAP CLI lifecycle 명령(start, completion, abort, early-close) 실행 후 dump 자동 갱신됨
- [ ] `reap init --agent opencode` 또는 `agentClient: opencode` 설정 시 opencode.json 자동 생성/갱신
- [ ] opencode.json에 9개 static 파일 + `.reap/.session-state.md` instructions 포함
- [ ] `.opencode/plugins/reap-plugin.ts` 파일 자동 배치 (install-skills 시)
- [ ] AGENTS.md template이 프로젝트 루트에 자동 생성 (또는 사용자 confirm 후)
- [ ] 기존 OpenCode 프로젝트에서 사용자 커스터마이즈 opencode.json 보존 (instructions만 merge)
- [ ] adapter dispatch가 `agentClient` 기준으로 claude-code/opencode 정확히 분기
- [ ] Codex `agentClient` 설정 시 minimal 안내 메시지 (오류 또는 미지원 안내)
- [ ] 기존 Claude Code 워크플로우 회귀 없음 (Gen-N 결과물 유지)
- [ ] Plugin 파일이 OpenCode plugin signature와 일치 (TypeScript 컴파일 가능)
- [ ] dump 호출 실패 시 silent (사용자 작업 차단 안 함)
- [ ] reap-guide.md / docs / README가 OpenCode 지원 사실 반영
- [ ] dog-fooding 동기화 확인 (src/templates/ ↔ .reap/)

## Risk / Caveat

1. **AGENTS.md 위치** — OpenCode가 프로젝트 루트 `AGENTS.md`를 읽는지 `.opencode/AGENTS.md`를 우선시하는지 확정 필요. Gen-N+1 시작 시 OpenCode docs 재확인.
2. **opencode.json 충돌** — 기존 사용자가 자신만의 opencode.json 가지고 있을 가능성. instructions 필드 merge 로직 견고해야 함 (배열 중복 제거).
3. **Plugin signature 변경 위험** — OpenCode가 활발히 진화 중. plugin API breaking change 가능성 → 본 작업 시 사용된 OpenCode 버전을 README에 명시.
4. **Resume 시 dump 지연** — `tool.execute.before` fallback이 첫 도구 호출 직전에 발화. 그 사이 AI가 stale state로 응답 가능. AGENTS.md에 "state 의심 시 `reap status`" 명시로 완화.
5. **Plugin 등록 위치 경로** — 프로젝트 루트 기준 vs 사용자 home 기준. install-skills 시 결정 필요.
6. **테스트 OpenCode 미설치** — runtime 검증 불가. 정적 파일 정합성만 unit/e2e로. 사용자 환경에서 첫 OpenCode user feedback 받아야 진정한 검증.

## 후속 작업 (Gen-N+2 이후 후보)

- **Codex adapter** (별도 큰 작업)
- **OpenCode SessionStart hook 정식 지원 시 마이그레이션** — Issue #5409 구현되면 tool.execute.before fallback 제거 가능
- **사용자별 plugin 마이그레이션 도우미** — 기존 OpenCode 사용자가 REAP 도입 시
- **OpenCode adapter dog-fooding** — REAP 자체를 OpenCode로 한 번 돌려보는 실험적 generation
