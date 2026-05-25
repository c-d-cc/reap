# Implementation Log

## Completed Tasks

| Task | Description | Files | Notes |
|------|-------------|-------|-------|
| T001 | `.gitignore` — `.reap/.session-state.md` 추가 | `.gitignore` | dump 파일은 머신 상태이므로 commit 대상 X. |
| T002 | `paths.ts` — `sessionState: ".reap/.session-state.md"` 추가 | `src/core/paths.ts` | ReapPaths interface + createPaths 반환 객체에 추가. |
| T003 | `AdapterModule` interface 정의 | `src/adapters/types.ts` | id / installSkills / ensureProjectIntegration / registerSessionIntegration. IntegrationAction = "created"/"appended"/"updated"/"skipped". |
| T004 | Dispatcher + claude-code AdapterModule wrapper | `src/adapters/index.ts`, `src/adapters/claude-code/index.ts` | `getAdapter(agentClient)` 분기. codex는 helpful Error throw. unknown은 claude-code fallback. claude-code/index.ts는 기존 install.ts 함수를 AdapterModule shape으로 wrap. |
| T005 | AGENTS.md template | `src/adapters/opencode/templates/agents.md` | client-agnostic 표현 (Claude-specific 용어 제거). reap-guide reference + dump-state 안내 + plugin 버전 명시. |
| T006 | OpenCode plugin source | `src/adapters/opencode/plugin/reap-plugin.ts` | session.created + tool.execute.before guard (resume fallback). inline 타입 사용 — `@opencode-ai/plugin` 의존성 강제 X. `$.quiet()` optional 처리로 호환성 확보. |
| T007 | OpenCode adapter install — opencode.json/AGENTS.md/plugin/marker sync | `src/adapters/opencode/install.ts`, `src/adapters/opencode/index.ts` | REAP_INSTRUCTIONS 상수 9개 + REAP_PLUGIN_ENTRY. ensureOpencodeJson은 user 필드 보존 + dedupe. ensureAgentsMd는 marker hash sync (CLAUDE.md 패턴 동일). assetPath는 dist/dev 양쪽 지원. broken JSON는 untouched. |
| T008 | `reap dump-state` CLI 명령 + 등록 | `src/cli/commands/dump-state.ts`, `src/cli/index.ts` | --stdout/--silent 지원. buildKnowledgeContext 재사용으로 load-context와 byte-identical 출력 보장. |
| T009 | Best-effort async dump helper | `src/core/dump-state-helper.ts` | buildKnowledgeContext + writeTextFile. silent on error. 사용처 없을 수 있으나 향후 async caller용으로 유지. |
| T010 | emitOutput에 sync dump 통합 | `src/core/output.ts`, `src/core/dump-state-sync.ts` | DUMP_COMMANDS 화이트리스트 (lifecycle 명령만). 새 모듈 `dump-state-sync.ts`에 sync 버전 buildKnowledgeContextSync + dumpStateSync. sync 사용 이유: emitOutput이 동기-종료(process.exit)이므로 async dump는 await 불가. async load-context와 byte-identical 출력은 unit test로 검증. |
| T011 | `install-skills` dispatcher 활용 | `src/cli/commands/install-skills.ts` | config.yml에서 agentClient 읽어 getAdapter() → installSkills 호출. 미설정/parse-fail 시 claude-code fallback. |
| T012 | `update` dispatcher 활용 | `src/cli/commands/update.ts` | ensureClaudeMd / registerSessionHooks 직접 호출 → adapter.ensureProjectIntegration / adapter.registerSessionIntegration. CLAUDE.md vs AGENTS.md 라벨 분기. |
| T013 | `init/common.ts` — 변경 불필요 | (no change) | init은 항상 agentClient=claude-code 로 시작. 사용자가 config.yml 수정 후 update 실행하면 dispatcher가 자연스럽게 OpenCode 경로로 진입. |
| T014 | `dump-state.test.ts` (unit) | `tests/unit/dump-state.test.ts` | 9 tests: sync vs async parity, dump 파일 작성, gen merge parents, 덮어쓰기. |
| T015 | `opencode-json.test.ts` (unit) | `tests/unit/opencode-json.test.ts` | 15 tests: ensureOpencodeJson 4 cases (create/preserve/skipped/dedupe), broken JSON, custom $schema. ensureAgentsMd 5 cases (create/skipped/append-preserves/legacy-replace/marker-hash). installPluginFile 2 cases (copy/idempotent). computeSectionHash 안정성. |
| T016 | `adapter-dispatch.test.ts` (unit) | `tests/unit/adapter-dispatch.test.ts` | 7 tests: 모든 agentClient 값 (claude-code/opencode/undefined/empty/codex/unknown) + interface presence. |
| T017 | `opencode-install.test.ts` (e2e) | `tests/e2e/opencode-install.test.ts` | 7 tests: init→config-switch→install-skills→update 풀 시나리오. 기존 opencode.json 보존. claude-code 회귀 (AGENTS.md/opencode.json 미생성) 검증. dump-state CLI --stdout 동작. lifecycle 명령 후 .session-state.md auto-dump 검증. |
| T018 | `reap-guide.md` OpenCode 안내 추가 + dogfooding sync | `src/templates/reap-guide.md`, `.reap/reap-guide.md` | "## AI Client Support" 신설 — claude-code / opencode / codex 표. dump-state CLI 명령 추가. dogfooding은 `cp` 직접 (install-skills 호출하면 ~/.reap/도 갱신되지만 dogfooding repo 한정 manual sync). |
| T019 | README OpenCode 안내 | `README.md` | Agent Integration 절 재작성 — claude-code/opencode 양쪽 명시. agentClient 전환 가이드. dynamic state dump 흐름 추가. |
| T020 | build script에 opencode 자산 복사 | `scripts/build.sh` | dist/adapters/opencode/{plugin,templates}/ 생성 + 파일 복사. install.ts의 assetPath()가 이 경로를 참조. `npm run build` 성공, 0.55 MB bundle. |
| T021 | Dogfooding `reap update` 실행 — claude-code 회귀 0 | (verification) | `node dist/cli/index.js update` → "Project is up to date. Nothing to update." CLAUDE.md/HOOK 회귀 없음. |
| T022 | 전체 test suite — 신규 36 pass, 회귀 0 | (verification) | Unit: 29 신규 pass / 387 total pass (6 pre-existing notice fail 무관). E2E: 7 신규 pass / 180 total pass (1 pre-existing init-repair fail 무관, gen-062부터 잠재). 본 작업이 추가/변경한 코드의 회귀 0. |

## Discovered Issues

본 작업 중 새로 발견된 무관 이슈:

- `src/core/integrity.ts:604-611` 의 `~/.config/opencode/commands/reap.*` legacy warning은 본 작업과 충돌 없음. OpenCode adapter는 project-level만 다루고 user-level commands 안 만듦. 단 사용자가 자체 reap commands를 user-level에 두는 경우 false positive 가능. 별도 follow-up 후보.
- `init-repair.test.ts > skips when REAP section already present` — gen-062 시점부터 잠재한 사전 실패. 본 작업 무관. 별도 follow-up.
- `notice.test.ts` 6건 — RELEASE_NOTICE.md 파일 구조 변경으로 인한 사전 실패. 본 작업 무관.

## Deferred Items

backlog `opencode-adapter.md` 명시 out-of-scope:
- Codex adapter — 별도 issue/generation.
- `reap init` 인터랙티브 흐름에 `agentClient` 선택 UI — 별도. 현재는 config.yml 수동 수정 후 `reap update` 흐름으로 충분.
- OpenCode plugin 고급 hook (tool.execute.after dump 등).
- Daemon 통합, Evaluator 코드 통합.
- legacy `~/.config/opencode/commands/reap.*` warning 재설계 (false positive 우려는 별도 issue).

## Architecture Decisions

1. **Sync dump via `dump-state-sync.ts`** — 처음에는 emitOutput을 async로 변환 + lazy import 고려했으나, 222개 callsite 호환성 위험. sync 모듈 신설로 emitOutput sync 유지. async builder(`buildKnowledgeContext`)와 byte-identical 출력은 unit test로 검증.

2. **DUMP_COMMANDS 화이트리스트** — utility 명령(status/config/help 등)에서 불필요한 fs write 방지. lifecycle 명령만 dump 발생.

3. **Plugin source — inline 타입** — `@opencode-ai/plugin` import 없이 작동하도록 inline `PluginContext` 타입 + optional `quiet()` 처리. 사용자가 typed development를 원하면 README/AGENTS.md 안내로 옵트인.

4. **opencode.json merge 전략** — REAP_INSTRUCTIONS/REAP_PLUGIN_ENTRY 상수 화이트리스트 + dedupe. JSON에 marker 불가하므로 마커 기반 추적은 안 함. 사용자 다른 필드 (theme, model 등) 자동 보존.

5. **Broken JSON 처리** — opencode.json이 JSON.parse 실패 시 untouched로 두고 "skipped" 반환. 사용자가 파일 수정 후 재실행 가능. 자동 backup도 하지 않음 (사용자 파일은 사용자 책임).

6. **claude-code adapter wrapper** — 신규 모듈 `src/adapters/claude-code/index.ts`가 기존 함수들을 AdapterModule shape로 wrap. 기존 직접 import (e.g., 다른 곳에서 `installSkills` 호출하는 경우) 호환성 유지. install.ts 자체는 변경 없음.

7. **dogfooding 동기화** — `src/templates/reap-guide.md` ↔ `.reap/reap-guide.md` 수동 cp. install-skills 흐름은 ~/.reap/만 동기화하므로 본 repo 한정 manual.
