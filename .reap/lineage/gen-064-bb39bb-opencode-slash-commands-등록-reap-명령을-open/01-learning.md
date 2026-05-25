# Learning

> Gen-064: OpenCode 환경에서 `/reap.*` slash commands가 동작하도록 등록.

## Project Overview

REAP v0.16.4 — Recursive Evolutionary Autonomous Pipeline. AI와 인간이 generation 단위로 소프트웨어를 공동 진화시키는 CLI 도구. 본 generation은 gen-063의 후속으로, OpenCode 어댑터의 마지막 UX gap을 메운다.

현재 상태(parent gen-063 직후):
- `agentClient: opencode` 설정 시 `installSkills` 가 `.opencode/plugins/reap-plugin.ts`, `opencode.json` (instructions + plugin), `AGENTS.md`, `~/.reap/reap-guide.md`를 배치.
- 그러나 `/reap.start`, `/reap.status` 같은 슬래시 트리거는 등록되지 않음. Claude Code 측 `~/.claude/commands/reap.*.md` 19개는 OpenCode 가 인식 불가 (전혀 다른 디렉토리).
- 사용자는 `reap status` CLI 또는 AI에게 자연어 요청으로 대체해야 함 — Claude Code 사용자와 비대칭 UX.

본 generation은 그 비대칭을 해소한다. 산출물은 (a) OpenCode에 reap.* 명령 파일 자동 배치, (b) idempotent install/update, (c) 사용자 custom command 보존, (d) legacy cleanup 정밀화.

## Key Findings

### 1. OpenCode commands 메커니즘 — 공식 docs 조사 결과 (https://opencode.ai/docs/commands/, 2026-05-25 확인)

핵심 사실:

| 항목 | 내용 |
|---|---|
| 위치 (글로벌) | `~/.config/opencode/commands/` |
| 위치 (프로젝트) | `.opencode/commands/` |
| 파일 형식 | Markdown — frontmatter + 본문 (본문이 LLM에 보내는 prompt template) |
| 파일명 → 명령명 | `test.md` → `/test` |
| 인자 | `$ARGUMENTS` (전체) + `$1`/`$2`/... (positional) |
| 지원 frontmatter 필드 | `description`, `agent`, `model`, `subtask`, `template` |
| Shell 출력 주입 | 본문에서 `` !`bash cmd` `` 형태로 stdout 삽입 (REAP 명령에는 불필요) |
| 파일 참조 | 본문에서 `@path/to/file` 로 자동 inline (REAP 명령에는 불필요) |
| Built-in 명령 override | 동일 이름 명령 정의 시 built-in (e.g., `/init`) 위에 덮어쓰기됨 |

또 다른 정의 경로(JSON): `opencode.json` 의 `command` 객체로도 정의 가능. 다만 REAP는 마크다운 파일로 통일하는 게 자연스러움 — Claude Code adapter와 형식 통일, `opencode.json` 을 늘 깨끗하게 유지.

### 2. Claude Code skill 형식과의 호환성 — **거의 100% 호환**

현재 Claude Code skills 19개 (`src/adapters/claude-code/skills/reap.*.md`)의 형식:

```markdown
---
description: "..."
[disable-model-invocation: true]  ← 일부만 보유 (refreshKnowledge, init)
---

Run `reap run <foo> $ARGUMENTS` and follow the stdout instructions exactly.
```

- `description` 필드 — OpenCode가 정확히 같은 의미로 지원
- `$ARGUMENTS` 본문 placeholder — OpenCode가 동일 사양 지원
- `disable-model-invocation: true` — Claude Code 전용. OpenCode docs 에 언급 없음. 임의 frontmatter는 무시될 가능성이 높음 — 즉 OpenCode 환경에서는 모든 명령이 동등하게 노출됨. (옵션: variant 작성 또는 통과)

결론: **별도 source를 만들 필요 없음**. Claude Code skills 19개를 그대로 OpenCode commands 디렉토리에 복사하면 동작. `disable-model-invocation` 은 OpenCode 에서 무시되며 그 효과(LLM이 자동 호출하지 않음)는 본질적으로 Claude Code 메타데이터이지 OpenCode 의 UX 모델과 1:1 매핑되지 않음 — 따라서 무시되어도 큰 문제 없다.

본 결정은 dogfooding과 maintenance 부담을 최소화 — 한 곳(`src/adapters/claude-code/skills/`)만 수정하면 양 adapter에 자동 반영. 향후 OpenCode 전용 필드를 추가해야 할 케이스가 생기면 그때 분리.

### 3. 설치 위치 — 글로벌(`~/.config/opencode/commands/`) vs 프로젝트(`.opencode/commands/`)

OpenCode 는 두 위치 모두 인식한다. 어느 쪽에 설치할지 결정 필요:

| 옵션 | 장점 | 단점 |
|---|---|---|
| (A) Global `~/.config/opencode/commands/` | 모든 OpenCode 프로젝트에서 `/reap.*` 사용 가능. Claude Code 측 `~/.claude/commands/` 와 패리티 | 프로젝트별 reap 버전이 다를 경우 명령도 충돌 가능 (단, 명령 본문은 단순히 `reap run ...` 호출 → reap CLI 가 PATH에서 해결되므로 큰 문제 없음) |
| (B) Project `.opencode/plugins/` 하위 (또는 별도 `.opencode/commands/`) | 프로젝트 격리 | non-reap 프로젝트에서 호출 불가, 매 프로젝트마다 설치 트리거 필요 |

**결정**: **(A) 글로벌**. 근거:
- Claude Code 측 `~/.claude/commands/` 와 패리티 — 행동 양식 통일.
- gen-063 의 `~/.config/opencode/commands/reap.*` legacy warning(`integrity.ts:604-611`)이 이미 글로벌 위치를 가리키고 있었음 — 본 결정으로 그 warning 을 "expected install location" 으로 전환하면 됨.
- 명령 본문이 단순한 CLI invocation (`reap run <stage>`) 이므로 프로젝트 격리는 본질적으로 필요 없음 — reap binary 자체가 PATH 에서 해결.
- 사용자가 본 generation 검증할 시나리오(prompt 에 명시)는 정확히 글로벌 위치(`~/.config/opencode/commands/reap.*.md`) 를 가정.

추가로 프로젝트 레벨 `.opencode/commands/` 에도 같은 파일을 복사할 필요는 **없음** — 글로벌이면 충분. 격리가 필요한 사용자는 직접 처리.

### 4. Legacy cleanup 위험 — gen-061 reapdev 사고와 동형 — 정밀 회피 필수

현재 `src/core/integrity.ts:604-611` 의 user-level artifact check 항목:

```ts
await checkGlobPattern(
  join(home, ".config", "opencode", "commands"),
  /^reap\./,
  "~/.config/opencode/commands/",
  "legacy reap command at user level (Phase 2 remnant)",
  warnings,
);
```

이 check 는 본 generation 작업으로 **합법적 reap commands 가 그 위치에 거주하는 순간 무의미해진다**. 모든 reap 사용자가 매번 warning 을 받게 됨. 본 generation 에서:

- **제거**: `integrity.ts:604-611` 의 `~/.config/opencode/commands/reap.*` legacy warning 절을 삭제.

cleanup 로직(installSkills 호출 시 stale reap.* 파일 제거)은 **prefix 기반** — `reap.` 으로 시작하는 파일만 제거하고 사용자 custom (`mytool.md`, `team-review.md` 등) 은 안 건드림. Claude Code adapter 의 `cleanupStaleSkills` 함수 패턴을 그대로 차용 (`SKILL_PATTERN = /^reap\..+\.md$/`).

**gen-061 reapdev 사고와의 차이**: gen-061은 cleanup 패턴이 너무 광범위해 `reapdev.*` 같은 정당한 사용자 명령도 제거. 본 generation 은 prefix `reap.` (점 포함)으로 좁혀, `reapdev.*`, `reap-x.*`, `myreap.*` 같은 변형은 안전. Claude Code 측의 검증된 패턴을 재사용한다.

### 5. AGENTS.md template 갱신 필요

현재 `src/adapters/opencode/templates/agents.md` 는 commands 언급 없음. 본 generation 후 사용자가 첫 `reap update` 받으면 AGENTS.md 안에 `/reap.*` slash commands 가 사용 가능하다는 안내가 들어가야 함. marker-hash sync 가 자동 처리.

### 6. Dispatch / Claude Code regression — 영향 없음 확인

- `getAdapter("claude-code")` 가 호출되는 모든 경로(install-skills, update, init/common)는 변경 없음.
- 본 generation 변경은 `getAdapter("opencode")` 경로 한정 — 새로운 step 추가만.
- 이미 e2e regression test (`opencode-install.test.ts` "claude-code regression — opencode work does not affect default flow")가 `agentClient: claude-code` 시 AGENTS.md / opencode.json 미생성을 검증. 동일 패턴으로 commands 디렉토리 미생성도 추가 검증 가능.

### 7. Idempotency — 반복 update 시 commands 중복 없음 보장

cleanup-then-install 패턴(Claude Code adapter `installSkills` 참조) 적용:
1. `~/.config/opencode/commands/` 에서 `reap.*.md` 패턴 매칭 파일 모두 삭제
2. `src/adapters/claude-code/skills/` 에서 모든 `.md` 파일 복사
3. 결과: 매 install 마다 깨끗한 상태

사용자 custom commands (`mytool.md`, `team.md` 등) 은 prefix 가 다르므로 안전. 같은 위치에 공존.

### 8. Asset 경로 — 빌드/dev 모두 처리

OpenCode adapter 의 `assetPath()` helper 가 이미 `dist` / `src` 양쪽을 처리. Commands 의 source 는 `src/adapters/claude-code/skills/` — 즉 cross-adapter 자원이 됨. 해결책:

- (옵션 i) 새 helper `claudeCodeSkillsDir()` 를 두고 dist 시 `dist/adapters/claude-code/skills/`, dev 시 `src/adapters/claude-code/skills/` 반환.
- (옵션 ii) Commands 를 별도 `src/adapters/opencode/commands/` 로 sym-link 또는 복제 — dogfooding 부담 증가.

**결정**: 옵션 (i). single source — claude-code adapter 와 같은 디렉토리에서 읽음. build script (`scripts/build.sh`) 는 이미 `dist/adapters/claude-code/skills/` 를 복사하므로 추가 변경 불필요. 단, OpenCode install code 가 그 경로를 안전하게 resolve.

### 9. `disable-model-invocation` 처리 — pass-through

OpenCode 가 알 수 없는 frontmatter 필드를 어떻게 다루는지: docs 에 명시 없음. 일반적 markdown parser 는 unknown field 를 무시. 무시되더라도 큰 부작용 없음 — `/reap.refreshKnowledge` 와 `/reap.init` 이 OpenCode 에서 LLM 자동 추천 후보로 잡힐 수 있지만, refreshKnowledge 는 deprecated 안내문이라 무해, init 은 첫 진입 명령으로 자연스러움. → **별도 처리 안 함**.

### 10. 테스트 전략 — gen-063 패턴 확장

- Unit:
  - `tests/unit/opencode-commands.test.ts` (신규) — 명령 파일 cleanup-then-install 패턴, prefix 가드, dispatch 분기 검증.
- E2E:
  - `tests/e2e/opencode-install.test.ts` 확장 — `install-skills` 후 `~/.config/opencode/commands/reap.*.md` 19 파일 존재 확인. 단, **글로벌 디렉토리에 쓰기는 위험** — bun:test 가 사용자 홈을 건드릴 위험. 해결: `HOME` 환경변수를 override 가능하게 install 코드를 `homedir()` 호출이 아닌 옵션 파라미터로 분리하거나, 테스트에서 임시 HOME 디렉토리 mock.
  - claude-code regression — `agentClient: claude-code` 시 `~/.config/opencode/commands/reap.*` 미생성 확인.

claude-code adapter 의 `installSkills` 가 이미 `homedir()` 를 직접 호출 — 같은 패턴. e2e test 들은 `HOME=...` env override 또는 process-level mock 으로 처리해야 함. 본 generation 의 e2e 도 그 패턴 차용.

### 11. Documentation 업데이트 — gen-063 sync 패턴

- `src/templates/reap-guide.md` 의 "AI Client Support" 표 → opencode row 의 `Static knowledge` 셀에 commands 추가 정보 또는 새 column "Slash trigger" 추가.
- `.reap/reap-guide.md` 동기화 (dogfooding).
- `README.md` — Agent Integration 절에 OpenCode commands 자동 등록 사실 한 줄 추가.

### 12. 사용자 검증 시나리오 — agent 환경에서는 정적 검증만

본 generation prompt 에 명시된 사용자 시나리오 (config 전환 → `reap update` → `ls ~/.config/opencode/commands/reap.*.md` → opencode 실행 → `/reap.status`):
- 1~3 단계는 agent 가 본 repo 의 sandbox 또는 e2e test 안에서 정적 검증 가능.
- 4 단계(`opencode` 실행) 는 agent 환경 한계. gen-063 과 동일하게 사용자 본인이 실시.
- fitness 단계에서 사용자 응답 대기.

## Previous Generation Reference

### gen-063 (parent) — OpenCode adapter 신설

- 결과: adapter 신설 완료, 7 completion criteria 충족. 사용자 fitness OK 했지만 "OpenCode 환경에서 슬래시 트리거 불가" 라는 UX gap을 직후 지적.
- gen-063 backlog/verification 에 4-항목 verification (static load / dynamic refresh / entry-point / **slash trigger**) 중 (4)가 누락되어 follow-up 으로 분리됨.
- adapt phase 에서 application.md "Adapter Layer — Multi-Client Support" 절에 4-항목 verification checklist 명문화 (본 generation 이 그 (4) 의 첫 실증).
- evolution.md 에 "사용자 UX gap 은 verification 항목으로 명시" 절 추가.

본 generation 의 핵심 자산:
- `src/adapters/index.ts` 의 dispatcher — 이미 존재. 변경 불필요.
- `installSkills(projectRoot)` 인터페이스 — opencode adapter 의 `installSkills` 함수 본체 확장만 필요.
- `cleanupLegacyProjectSkills` 의 prefix-anchored pattern — 검증된 cleanup 모델.

### gen-061 reapdev 사고 교훈 (longterm memory)

cleanup 패턴이 광범위하면 합법 명령도 휩쓸림. 본 generation 의 `reap\.` prefix 사용은 그 사고의 직접 반응:
- `reap.start.md`, `reap.status.md` → 매칭 (REAP 설치본)
- `reapdev.publish.md`, `myreap.md` → 비매칭 (사용자 영역)

## Backlog Review

### 본 generation source

- `opencode-slash-commands.md` (high, dependsOn: opencode-adapter) — **현재 consume 처리됨** (current.yml `sourceBacklog` 필드). gen-064 의 정확한 출발점.

### Pending — 본 generation 과 무관

| Filename | Status |
|---|---|
| `claude-md-knowledge-loading-separation.md` | gen-062 consumed (남은 상태) — 본 작업 무관 |
| `daemon-e2e-tests.md` | gen-060 consumed |
| `early-close-lifecycle.md` | gen-061 consumed |
| `fix-migrate-update-tests.md` | gen-059 consumed |
| `opencode-adapter.md` | gen-063 consumed |
| `strict-merge-mode-bypass-for-merge-gen.md` | gen-058 consumed |

모두 이전 generation 에서 consume 처리된 항목들 — 본 generation 작업과 영향 없음.

### 본 generation 종료 후 backlog 후보 (adapt phase 결정, 지금 등록 X)

memory shortterm 에 적힌 deferred 후보:
1. `unify-sync-async-knowledge-builder` — `dump-state-sync.ts` 와 `load-context.ts` 의 sync/async 합치기. 본 generation 과 직접 인과 없음 — adapt 에서 hint 만.
2. `notice-test-pre-existing-fix` — pre-existing 6 unit fail.
3. `init-repair-skipped-message-fix` — pre-existing 1 e2e fail.

본 generation 중 새로 발견되는 항목은 adapt phase 의 hints 에 적고, 사용자 판단으로 backlog 등록.

## Technical Deep-Dive

### Cleanup 패턴 정밀화

Claude Code 측 `cleanupStaleSkills`:

```ts
const SKILL_PATTERN = /^reap\..+\.md$/;
async function cleanupStaleSkills(targetDir: string): Promise<string[]> {
  const files = await readdir(targetDir);
  const staleFiles = files.filter((f) => SKILL_PATTERN.test(f));
  for (const file of staleFiles) await unlink(join(targetDir, file));
  return staleFiles;
}
```

이 패턴이 매칭하는 것:
- `reap.start.md` ✓
- `reap.early-close.md` ✓
- `reap.refreshKnowledge.md` ✓

매칭하지 않는 것:
- `reapdev.publish.md` (점 없음 — `^reap\.` 의 점이 강제됨)
- `myreap.md`
- `reap.txt` (`.md$` 강제)
- `reap.start.bak` (`.md$` 강제)

OpenCode commands directory 에도 동일 패턴 차용. 단지 target dir 만 다름:
- Claude Code: `~/.claude/commands/`
- OpenCode: `~/.config/opencode/commands/`

### installSkills 단계 추가 — 함수 책임 확장 vs 분할

현재 `src/adapters/opencode/install.ts` 의 `installSkills(projectRoot)`:
1. installPluginFile (project-level)
2. ensureOpencodeJson (project-level)
3. installReapGuide (user-level `~/.reap/`)
4. emitOutput

추가 단계 (4 → 5):
- `installSlashCommands()` (user-level `~/.config/opencode/commands/`) — cleanup-then-copy 패턴.

emitOutput 의 `completed` 배열도 갱신:
- 기존: `["install-plugin", "ensure-opencode-json", "install-reap-guide"]`
- 신규: `[..., "install-slash-commands"]`

`context` 객체에도 `slashCommands: { cleaned: number, installed: number, targetDir: string }` 추가.

### `registerSessionIntegration` 와의 분리

`registerSessionIntegration` 은 idempotent runtime registration 으로 user-level reap-guide / commands 같은 user 자산은 건드리지 않음 (현재 plugin + opencode.json 만 처리). 본 generation 도 그 경계 유지:
- `installSkills` → user-level commands 설치 (full install)
- `registerSessionIntegration` → 변경 없음 (project-level 만)

근거: `registerSessionIntegration` 은 SessionStart 매번 호출되어 silent 동작해야 함. user-level 파일을 매번 cleanup-rewrite 하면 noisy.

### Build script 영향

`scripts/build.sh` 가 이미 `src/adapters/claude-code/skills/` 를 `dist/adapters/claude-code/skills/` 로 복사. OpenCode adapter 가 같은 디렉토리를 읽으므로 **추가 변경 없음**. dev (bun) 모드는 src 직접 참조.

### 자산 경로 결정 코드 — 통합 helper

opencode/install.ts 의 `assetPath()` 가 `__dirname.includes("dist")` 분기. 같은 분기를 또 작성하지 말고 helper 추출 검토:

```ts
function claudeCodeSkillsDir(): string {
  return __dirname.includes("dist")
    ? join(__dirname, "..", "adapters", "claude-code", "skills")
    : join(__dirname, "..", "claude-code", "skills");
}
```

위치는 `src/adapters/opencode/install.ts` 내부 — cross-adapter import 없이.

## Context for This Generation

### Clarity Level: **High**

근거:
- vision/goals.md 에 `[x] OpenCode adapter (gen-063 완료 — ..., slash commands 등록은 follow-up opencode-slash-commands)` 명시. 본 작업 = 그 follow-up.
- backlog `opencode-slash-commands.md` 가 verification 12 항목까지 구체화. 결정도 6/6 확정.
- 사용자가 prompt 에서 "다음 업데이트 받았을 때 OpenCode에서도 reap 사용 가능" 단일 목표 명시.
- OpenCode docs 가 정확히 형식과 위치 명시 (단일 권위 source).
- 직전 generation(gen-063) adapter 인프라 완비 — 본 generation 은 dispatcher 위에 `installSlashCommands` 한 단계 추가.

판단 형식:
- 자율 실행 가능. 사용자에게 추가 질문 없이 진행.
- fitness 단계에서만 사용자 응답 대기.

### Echo Chamber 방지

본 generation 의 직접 인과 범위:
- (인과) OpenCode 사용자 슬래시 트리거 활성화 → commands 등록 / cleanup / docs
- (인과 외) Codex adapter, daemon, plugin tool.execute.after, pre-existing 테스트 fix 등은 모두 별도 backlog 후보. 본 generation 에서 **백로그 작성 금지**, adapt hints 에만 기록.

### Assumptions

1. OpenCode 명령 메커니즘은 docs 명세대로 동작 (글로벌 `~/.config/opencode/commands/`, `$ARGUMENTS` 지원).
2. 사용자 환경의 OpenCode 버전이 2026-05 시점 docs 기준에서 deviation 없음. README 에 그 사실 명시.
3. user-level cleanup 의 `reap\.` prefix 패턴은 충분히 좁다 — 사용자 영역 침범 0.
4. `HOME=...` env override 가 e2e test 에서 동작 (Claude Code adapter test 도 같은 패턴 사용 중이라면 그대로 차용).
5. `disable-model-invocation` frontmatter 가 OpenCode 에서 무시되더라도 critical 한 부작용 없음.

### Risks

| Risk | Mitigation |
|---|---|
| user-level glob 으로 `reapdev.*` 같은 합법 명령 삭제 | `reap\.` (점 포함) prefix anchor 강제. test 로 보장. |
| 글로벌 cleanup 이 사용자 custom command (`reap.mytool.md`) 삭제 | reap 가 `reap.` prefix 를 reserved 로 선언 (docs / README 명시). 그래도 우려되면 marker 기반으로 강화 가능 — 본 generation 1차에서는 prefix-only. |
| OpenCode 가 임의 frontmatter (`disable-model-invocation`) 로 reject | pass-through 가 안전. docs 에 unknown field reject 언급 없음 — 일반적인 markdown parser 동작 가정. |
| 빌드 산출물에 skills/ 누락 | scripts/build.sh 가 이미 복사. 추가 검증 없이 e2e test 가 잡아냄. |
| 사용자가 본 작업 후에도 OpenCode 자체 실행 안 됨 (gen-063 한계 그대로) | 본 generation 은 정적 산출물 검증만. runtime 검증은 사용자 의뢰. |
| integrity.ts 의 legacy warning 제거가 다른 곳에서 referenced | grep 으로 의존 확인 후 제거. |

### Verification 4-항목 체크 (gen-063 교훈)

본 generation 이 그 4-항목 중 (4) 의 직접적 구현:

| 항목 | 본 generation 상태 |
|---|---|
| (1) Static knowledge 자동 로드 | gen-063 완료 (opencode.json instructions) — 본 generation 범위 외 |
| (2) Dynamic state refresh | gen-063 완료 (plugin + reap dump-state) — 본 generation 범위 외 |
| (3) Entry-point 파일 | gen-063 완료 (AGENTS.md) — 본 generation 에서 commands 안내 추가 |
| (4) Slash trigger 등록 | **본 generation의 정확한 목적** |
