# Implementation Log

## Completed Tasks

| Task | 변경 위치 | 요약 |
|---|---|---|
| T001 | `src/adapters/opencode/install.ts` | `installSlashCommands(home?)` 신규 — cleanup-then-copy 파이프라인 + helper `opencodeCommandsDir(home)` / `claudeCodeSkillsDir()` (dist vs dev 분기). 패턴 `^reap\..+\.md$` 로 prefix anchor. `cleaned`/`installed`/`targetDir` 반환. |
| T002 | `src/adapters/opencode/install.ts` | `installSkills(projectRoot)` 본체에 `installSlashCommands()` 호출 추가. `emitOutput` 의 `completed` 에 `install-slash-commands` 추가, `context.slashCommands = { cleaned, installed, targetDir }`, message 갱신. |
| T003 | `src/core/integrity.ts` | `~/.config/opencode/commands/reap.*` legacy warning 절(`:604-611`) 제거. 대신 위치가 정상 install location 임을 알리는 한 줄 주석. |
| T004 | `src/adapters/opencode/templates/agents.md` | `## Slash Commands` 절 신규. 19개 reap.* 명령 안내 + `reap.` prefix reserved 정책 명시. |
| T005 | `src/templates/reap-guide.md` + `.reap/reap-guide.md` (dogfooding sync) | AI Client Support 표에 `Slash commands` column 추가 — claude-code/opencode/codex row 모두 업데이트. prefix 예약 정책 한 줄 추가. |
| T006 | `README.md` | Agent Integration 절: 두 client 행에 슬래시 명령 위치 명시, 예약 prefix 정책 한 단락 추가. "How It Works" 의 (2) 항목을 OpenCode 도 slash commands 지원으로 수정. |
| T007 | `tests/unit/opencode-commands.test.ts` (신규, 9 tests) | dispatch / fresh install / cleanup discipline (stale 제거, 사용자 파일 보존, idempotency) / dispatch parity. 모두 임시 home dir 사용. |
| T008 | `tests/e2e/opencode-install.test.ts` (확장, 신규 5 tests) | `cliWithHome` helper 추가. opencode slash 설치 + idempotency + 사용자 파일 보존 + claude-code regression (commands dir 미생성 + 기존 사용자 dir 미간섭). |
| T009 | (검증) | `npm run build` ok, `npm run typecheck` ok, `bun test tests/unit/` → 402 pass 0 fail, `bun test tests/e2e/` → 185 pass 1 fail (pre-existing init-repair, 본 작업 무관 — 직전 gen-063 baseline 그대로). |
| T010 | (dogfooding sync) | `node dist/cli/index.js update` → "Nothing to update" — 본 repo (claude-code 환경) 회귀 없음. dogfooding `.reap/reap-guide.md` 가 src/templates/reap-guide.md 와 동기화됨 (수동 sync 완료). |

## Discovered Tasks — completion 직전 back regression (사용자 지적)

### 배경

사용자가 fitness 응답 직전 코드 검토 중 갭 발견: `src/cli/commands/update.ts` 가 `adapter.ensureProjectIntegration` + `adapter.registerSessionIntegration` 만 호출하고 `adapter.installSkills` 는 호출 안 함. **그런데 두 adapter 모두 `registerSessionIntegration` 이 user-level slash commands sync 를 포함하지 않음** — 그러므로 `reap update` 만으로는 OpenCode 명령이 설치 안 되고 명시적 `reap install-skills` 가 필요. backlog Verification 의 "`reap update` 후 reap.* 19 자동 배치" 와 코드 불일치. e2e 가 `installSkills` 를 직접 호출해서 통과했지만 **`reap update` 흐름은 검증 안 됨**.

**Planning Q4 결정 정정**: 02-planning.md 의 Q4 에서 "`registerSessionIntegration` 은 변경 없음 — SessionStart 매번 user-level 파일을 rewrite 하면 noisy" 라 결정했지만, **`registerSessionIntegration` 은 SessionStart 마다 호출되는 게 아님** (`reap update` 시점에만 호출됨). 사용자 명시적 `update` 트리거이므로 user-level sync 가 자연스럽다. 잘못된 가정 — 사용자가 코드 검토 후 정정.

### 추가 Tasks (T011~T015)

- [x] T011 `src/adapters/claude-code/install.ts` — `installSlashCommandsOnly()` 신규 export 함수. 기존 `installSkills` 의 cleanup+copy 단계만 분리 (no emitOutput, no agents copy, no hooks). 반환: `{cleaned: string[], installed: number, files: string[], targetDir: string}`. `installSkills` 도 이 helper 를 내부 호출하도록 리팩토 (중복 제거).
- [x] T012 `src/adapters/claude-code/index.ts` — adapter 의 `registerSessionIntegration` 에 `installSlashCommandsOnly()` 호출 추가. import 보강. 주석에 "called by `reap update` and must keep both user-level slash commands and SessionStart hooks in sync" 명시.
- [x] T013 `src/adapters/opencode/install.ts` — `registerSessionIntegration` 에 `installSlashCommands()` 호출 추가. 주석에 (a) project + user-level 양쪽 sync, (b) reap-guide 는 install-skills 만 — 본 함수에서 skip 이유 명시.
- [x] T014 `tests/unit/opencode-commands.test.ts` 확장 — 양 adapter 의 `registerSessionIntegration` source 가 user-level sync 호출을 포함하는지 정적 검사. import 도 검증. 신규 4 tests / 7 expect (`opencode: registerSessionIntegration includes slash commands` x2, `claude-code: registerSessionIntegration includes slash commands` x2).
- [x] T015 `tests/e2e/opencode-install.test.ts` 확장 — `reap update` 흐름 (NOT install-skills) 로 양 adapter 의 user-level commands sync 검증. 신규 5 tests (`reap update — opencode adapter syncs slash commands` x2, `reap update — claude-code adapter syncs slash commands` x3). e2e helper `dirExists` 신규 — `fileExists(dir)` 가 항상 false 반환하는 버그 우회.

### Discovered Sub-issue — e2e `fileExists(dir)` 버그

`tests/helpers/setup.ts` 의 `fileExists` 가 `readFile()` 으로 구현 → 디렉토리에 EISDIR 로 항상 false. 기존 e2e 가 디렉토리 검증 시 토트로지 (파일 없음 → false, 존재 → false 둘 다 일치) 로 우연히 통과한 케이스 있음. opencode-install.test.ts 안에 `dirExists(path)` (readdir 기반) inline helper 추가. `tests/helpers/setup.ts` 자체는 다른 e2e 와의 의존성 우려로 변경 안 함 — 별도 후보로 deferred (next gen 에서 helper 통합 검토 가능).

### 결과 (T011~T015)

- typecheck/build pass.
- Unit: 406 pass / 0 fail (T014 신규 4 추가).
- E2E: 190 pass / 1 fail (T015 신규 5 추가, 1 fail 은 pre-existing init-repair).
- 본 fix 회귀 0건. dogfooding `node dist/cli/index.js update` "Nothing to update" — 본 repo (claude-code 환경) 변화 없음.
- 사용자 OpenCode 검증 시나리오: `reap update` 한 번에 `~/.config/opencode/commands/reap.*.md` 19 자동 배치 — 코드와 verification 일치.

## Discovered Issues

### `claudeCodeSkillsDir()` dist 경로 버그 (구현 중 발견 → 즉시 수정)

처음에 helper 를 단순히 `join(__dirname, "..", "claude-code", "skills")` 로 작성. dev (`src/adapters/opencode/install.ts`) 에서는 정상이지만, dist 환경에서는 `__dirname = dist/cli/` (single-bundle 효과) 이라 `../claude-code/skills` = `dist/claude-code/skills` (존재하지 않음). e2e 첫 실행 시 `installed=0` 으로 잡혀 즉시 발견 → `installed.includes("dist")` 분기로 `dist/adapters/claude-code/skills` 해결.

근본 원인: opencode adapter 의 기존 `assetPath()` 가 이미 같은 분기 패턴을 쓰고 있었음. 처음에 (잘못 가정한) "코드가 dist 안에서 모듈 단위로 분리된다"는 전제를 따랐다가, 단일 번들 구조를 잊고 helper 작성. 기존 `assetPath` 패턴을 참고했으면 한 번에 맞았을 일. 향후 cross-adapter 자산 참조 시 항상 `__dirname.includes("dist")` 분기 + `dist/adapters/<adapter>/<asset>` 경로 사용.

### Pre-existing notice.test.ts 6 fail → 0 fail (자연 해소)

gen-063 baseline 은 6 unit fail (notice.test.ts) 이었으나, 본 generation 빌드 후 0 fail. 본 작업과 무관한 자연 해소 — 아마도 본 repo 의 RELEASE_NOTICE.md 가 그 사이 갱신되어 테스트가 다시 통과. 별도 추적 안 함.

## Deferred Items

### Adapt phase 에서 hint 로 기록할 항목 (backlog 등록은 사용자 판단)

1. **`opencode-init-agent-flag`** — `reap init --agent opencode` 옵션. 사용자가 명령행에서 직접 opencode 어댑터를 선택할 수 있게. 본 generation 의 직접 인과 외.
2. **`unify-sync-async-knowledge-builder`** — `dump-state-sync.ts` 와 `load-context.ts` 의 sync/async 빌더 합치기. gen-063 shortterm 에 이미 노출된 후보. 본 generation 과 직접 인과 외.
3. **OpenCode `disable-model-invocation` 처리** — 본 generation 은 pass-through. 사용자 보고 후 variant 분리 검토.
4. **사용자 prefix 충돌 시 marker 기반 cleanup 강화** — 현재 `reap.` prefix reserved 정책. 사용자 보고 발생 시 (e.g., `reap.mytool.md` 를 본인이 만들었다는 보고) marker-based 또는 install 시점 메타 활용으로 강화.

## Architecture Decisions

### 1. Claude Code skills 디렉토리 단일 source 재사용

OpenCode 명령은 Claude Code skill 과 형식 100% 호환 (frontmatter `description` + `$ARGUMENTS`). 별도 source (`src/adapters/opencode/commands/`) 를 두지 않고 `src/adapters/claude-code/skills/` 만 source 로 사용. 양 adapter 가 같은 19 파일을 참조. 향후 OpenCode 전용 frontmatter (예: `subtask`, `model`) 가 필요해지면 그 시점에 분리.

근거 — gen-063 학습("adapter 는 client 별 mechanism 을 호환 layer 로 추상화하는 것이지, 동일 메커니즘을 강제하는 것이 아니다") 의 자연스러운 응용: **두 client 가 동일 형식을 채택했다면, source 도 single source — 굳이 분리하지 않는다**.

### 2. 글로벌 위치 (`~/.config/opencode/commands/`) 채택

OpenCode docs 가 글로벌과 프로젝트 두 위치를 모두 지원하지만, 글로벌만 사용. 근거:
- Claude Code 측 `~/.claude/commands/` 와 패리티 — 사용자 행동 양식 통일.
- reap CLI 가 PATH 해결이므로 프로젝트 격리 가치 < 모든 reap 프로젝트에서 동일 슬래시 명령 노출 가치.
- 사용자 검증 시나리오와 일치.

### 3. Cleanup pattern — `^reap\..+\.md$` (Claude Code 와 동일)

gen-061 reapdev 사고 교훈 ("cleanup 패턴이 광범위하면 합법 명령도 휩쓸림") 을 정밀하게 적용. 본 패턴이 잡는 것:
- `reap.start.md` ✓ (REAP install)
- `reap.dev.md` ✓ (사용자가 만들었어도 reap prefix 는 reserved — 덮어쓰여짐)

안 잡는 것:
- `reapdev.*` (점 없음 → `\.` 강제)
- `myreap.*` (^ anchor)
- `reap.notes.txt` (`.md$` 강제)

`reap.` prefix 의 reserved 정책을 README + AGENTS.md + reap-guide.md 모두에 명시 → 사용자에게 미리 고지. 1차 release 후 사용자가 충돌 보고 시 marker 기반으로 강화 검토.

### 4. `installSkills` vs `registerSessionIntegration` 경계 — 정정 (T011~T015)

**최초 계획**: `installSkills` 에만 commands 설치 추가. `registerSessionIntegration` 은 변경 없음 — "SessionStart 매번 user-level 자산을 rewrite 하면 noisy" 우려.

**정정 (back regression 사유)**: `registerSessionIntegration` 은 SessionStart 마다 호출되는 게 아니라 **`reap update` 시점에만 호출됨**. 사용자 명시적 `update` 트리거이므로 user-level sync 가 자연스럽다. 잘못된 가정이었고 사용자 코드 검토에서 발견.

**최종**: 양 adapter 의 `registerSessionIntegration` 이 user-level slash commands sync 를 포함한다. cleanup-then-copy 패턴이 idempotent 라 noisy 없음. backlog Verification 의 "`reap update` 후 reap.* 자동 배치" 와 코드 일치.

### 5. Test 격리 — `HOME` env override 패턴

bun:test 에서 `process.env.HOME = tempDir` 또는 `$.env({ HOME: tempDir })` 로 child process 의 `os.homedir()` 결과를 격리. Node 의 POSIX `os.homedir()` 가 `$HOME` 을 우선 사용함을 활용. 새 helper `cliWithHome(cwd, fakeHome, ...args)` 를 e2e 에 추가. 기존 `cli()` 는 그대로 유지 — 기존 테스트 영향 0.

### 6. integrity.ts legacy warning 제거

`~/.config/opencode/commands/reap.*` 는 본 generation 이후 정상 install location. 제거 후 그 위치에 reap commands 가 거주하는 상태가 더 이상 warning 으로 잡히지 않음. 사용자 보고 케이스가 크게 줄어드는 의도된 결과.

## Verification 결과 (backlog 12 항목)

| Verification | 상태 |
|---|---|
| OpenCode commands 메커니즘 (위치+형식) Learning artifact 명시 | ✓ 01-learning.md Key Findings 1 |
| `installSkills` 에 commands 등록 로직 추가 | ✓ T001, T002 |
| `agentClient: opencode` + `reap update` 후 reap.* 19 자동 배치 | ✓ e2e `reap update — opencode adapter syncs slash commands` (T015 신규 — `reap update` 흐름 직접 검증). `install-skills creates ~/.config/opencode/commands/reap.*.md` 도 통과. |
| 사용자 custom commands 보존 | ✓ unit `preserves user files` + e2e `preserves user commands` |
| 반복 update 시 idempotent | ✓ unit `is idempotent across repeated calls` + e2e `install-skills is idempotent` |
| Legacy cleanup REAP 설치본만 정리 | ✓ T001 prefix pattern + unit `removes stale reap.*.md before copying fresh skills` |
| Adapter dispatch 정상, claude-code regression 0 | ✓ unit `dispatch parity` + e2e `claude-code adapter — does NOT install OpenCode slash commands` |
| AGENTS.md template 갱신 | ✓ T004 |
| reap-guide / docs / README 갱신 | ✓ T005, T006 |
| Unit + E2E 추가 | ✓ unit 9 신규 + e2e 5 신규 |
| dogfooding: src/templates ↔ .reap 동기화 | ✓ T005 (sync 완료) + T010 ("Nothing to update") |
| 본 작업 OpenCode 버전 README 기록 | ✓ T006 — "OpenCode commands API as of 2026-05" |
