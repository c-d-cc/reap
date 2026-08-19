---
id: gen-064-bb39bb
type: normal
goal: "OpenCode slash commands 등록 — /reap.* 명령을 OpenCode 환경에서 사용 가능하게"
parents: ["gen-063-830a29"]
---
# gen-064-bb39bb
**Goal**: OpenCode 환경에서 `/reap.*` slash commands 가 동작하도록, **`reap install-skills` 와 `reap update` 양 경로 모두에서** user-level commands 등록(`~/.config/opencode/commands/`) 을 보장. 추가로 Claude Code 측의 동일 갭 (update 시 `~/.claude/commands/` sync 누락) 도 함께 해결.

### 변경 내용

신규:
- `src/adapters/opencode/install.ts` — `installSlashCommands(home?)` 함수 + 경로 helper (`opencodeCommandsDir`, `claudeCodeSkillsDir`). cleanup-then-copy 파이프라인, prefix `^reap\..+\.md$`.
- `src/adapters/claude-code/install.ts` — `installSlashCommandsOnly()` 신규 export (T011). 기존 `installSkills` 의 cleanup+copy 단계를 silent helper 로 분리, `installSkills` 내부도 이 helper 호출하도록 리팩토 (중복 제거).
- `tests/unit/opencode-commands.test.ts` (신규, 13 tests / 39 expect) — fresh install, cleanup discipline, idempotency, user file 보존, dispatch parity, 양 adapter `registerSessionIntegration` source 정적 검사.
- e2e (`tests/e2e/opencode-install.test.ts`) 확장 (+10 tests / +50 expect) — opencode slash 설치, idempotency, 사용자 파일 보존, claude-code regression, **`reap update` 단독 흐름으로 양 adapter user-level sync 검증** (T015).

수정:
- `src/adapters/opencode/install.ts` — `installSkills(projectRoot)` 본체에 새 단계 + emitOutput `completed`/`context.slashCommands` 추가. **`registerSessionIntegration` 에 `installSlashCommands()` 호출 추가** (T013).
- `src/adapters/claude-code/index.ts` — adapter 의 `registerSessionIntegration` 에 `installSlashCommandsOnly()` 호출 추가 (T012). import 보강.
- `src/core/integrity.ts` — `~/.config/opencode/commands/reap.*` legacy warning 절(`:604-611`) 제거. 위치가 정상 install location 임을 알리는 주석 한 줄.
- `src/adapters/opencode/templates/agents.md` — `## Slash Commands` 절 신규 (19개 reap.* 명령 + reserved prefix 정책).
- `src/templates/reap-guide.md` + `.reap/reap-guide.md` (dogfooding sync) — AI Client Support 표에 `Slash commands` column 추가, prefix 예약 정책 한 줄.
- `README.md` — Agent Integration 두 client 행에 슬래시 명령 위치 명시, 예약 prefix 정책 단락 추가, "How It Works" 의 (2) 갱신.

### 결과

- 7 completion criteria 모두 충족. 12 backlog verification 모두 ✓. T011~T015 추가 verification 7건 모두 ✓.
- Unit: **406 pass / 0 fail** (gen-063 baseline 387 + 본 generation T001~T010 신규 9 + T014 신규 4 + notice.test.ts 6 자연 해소 = 406).
- E2E: **190 pass / 1 fail** (init-repair, gen-063 baseline 과 동일 pre-existing). 본 작업 T001~T015 신규 10 모두 pass. 본 작업 회귀 0건.
- 본 generation 변경 dist 사이즈 영향 0 (0.55 MB 유지).
- dogfooding 검증: `node dist/cli/index.js update` 본 repo (claude-code 환경) "Nothing to update" — 회귀 없음.
- application.md 의 4-항목 verification (static load / dynamic refresh / entry-point / **slash trigger**) 중 (4) 가 본 generation 으로 충족됨 — OpenCode adapter 4가지 verification 완비.
- **추가로 사용자 검증 시나리오 (`agentClient: opencode` 전환 → `reap update` → 슬래시 명령 자동 등록) 가 코드와 일치** — T011~T015 fix 후 `reap update` 단독으로 동작 보장 (사용자가 fitness 직전 갭 지적).