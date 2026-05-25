# Planning

## Goal

OpenCode 환경에서 `/reap.*` slash commands 가 동작하도록, OpenCode adapter 의 `installSkills` 단계에 user-level commands 등록(`~/.config/opencode/commands/`)을 추가. Claude Code 와 OpenCode 사이의 slash UX 비대칭을 제거한다.

완료 시점에:
- `agentClient: opencode` 인 프로젝트에서 `reap install-skills` 또는 `reap update` 한 번에 `~/.config/opencode/commands/reap.*.md` 19 파일이 자동 설치된다.
- 반복 호출 시 idempotent. 사용자 custom commands (`reap.` 접두사가 아닌 파일) 은 보존된다.
- `agentClient: claude-code` 인 프로젝트는 영향 없음 (regression 0).
- AGENTS.md / README / reap-guide 에 OpenCode slash commands 사용 가능 사실 명시.

## Completion Criteria

1. `agentClient: opencode` 설정 후 `reap install-skills` 호출 시 `~/.config/opencode/commands/reap.{19 commands}.md` 가 모두 존재한다.
2. 같은 사용자가 비-REAP `reap.` 명령을 들고 있어도 `reap install-skills` 가 `reap.` 접두사 파일만 cleanup 한 뒤 reap 명령으로 덮어쓴다. 사용자 custom 파일 (e.g., `reapdev.publish.md`, `mytool.md`) 은 보존된다.
3. `install-skills` 가 반복 호출되어도 commands 디렉토리에 파일이 중복되거나 stale 하지 않는다.
4. `agentClient: claude-code` 환경에서 `install-skills` 호출 시 `~/.config/opencode/commands/` 가 변경되지 않는다 (regression 0).
5. `src/core/integrity.ts` 의 `~/.config/opencode/commands/reap.*` legacy warning 절이 제거되어, 합법적 reap commands 가 그 위치에 존재하는 정상 상태가 warning 으로 잡히지 않는다.
6. AGENTS.md template, reap-guide.md, README 가 OpenCode slash commands 사용 가능 사실을 명시한다.
7. Unit + E2E 테스트가 추가되어 (1)~(4) 모두 검증된다. 본 작업 회귀 0건 (claude-code 테스트 전부 pass 유지).

## Background

Gen-063 에서 OpenCode adapter 신설로 (a) opencode.json instructions auto-load (b) plugin dynamic dump (c) AGENTS.md entry-point 까지 완료. 그러나 **`/reap.start` 같은 slash 트리거가 OpenCode 에 등록되지 않음** — Claude Code 측 `~/.claude/commands/reap.*.md` 19개는 OpenCode 가 인식 불가 (별도 위치 + 별도 메커니즘).

gen-063 fitness 단계에서 사용자가 "OpenCode 환경에서 실사용 시 슬래시 호출 불가" 라는 UX gap 보고. follow-up `opencode-slash-commands.md` (priority: high) 로 분리. 본 generation 이 그 정확한 해결.

genome 측 영향:
- application.md "Adapter Layer — Multi-Client Support" 절: 4-항목 verification 의 (4) "slash trigger 등록" 이 본 작업의 직접적 충족 항목.
- evolution.md "사용자 UX gap 은 verification 항목으로 명시" 절: 본 작업의 가이드 원칙.

OpenCode 공식 docs (https://opencode.ai/docs/commands/) 조사 결과: 명령 mechanism 은 글로벌 `~/.config/opencode/commands/` 또는 프로젝트 `.opencode/commands/` 의 markdown 파일. frontmatter `description` + 본문 prompt + `$ARGUMENTS` placeholder. **Claude Code skill 형식과 거의 100% 호환** — 별도 source 불필요.

## Brainstorming

본 generation 은 high-clarity 라서 brainstorming 은 짧게 — 결정 사항만 정리.

### Q1. Commands source 를 어디서 읽을 것인가?

| Option | 설명 | 평가 |
|---|---|---|
| (i) Claude Code skills 재사용 (`src/adapters/claude-code/skills/`) | 한 source, 양 adapter 동일 파일 사용 | **채택** — 형식 100% 호환, dogfooding 부담 최소, build 추가 변경 없음 |
| (ii) OpenCode 전용 commands (`src/adapters/opencode/commands/`) | adapter 별 격리 | 19 파일 중복, 유지보수 2배, 현 시점 OpenCode-only frontmatter 필요 없음 |

→ (i) 채택. 향후 OpenCode 전용 필드 필요 시 그 시점에 분리.

### Q2. 설치 위치 (글로벌 vs 프로젝트)?

| Option | 평가 |
|---|---|
| 글로벌 `~/.config/opencode/commands/` | **채택** — Claude Code (`~/.claude/commands/`) 와 패리티, integrity legacy warning 위치와 자연스럽게 통합 |
| 프로젝트 `.opencode/commands/` | 격리 가치 < 모든 reap 프로젝트에서 동일 명령 노출 가치. reap CLI 자체가 PATH 해결이라 격리 무의미 |

→ 글로벌. 사용자가 prompt 에서 가정한 경로와도 일치.

### Q3. Cleanup pattern 정밀도?

| Pattern | 매칭 | 안전성 |
|---|---|---|
| `/^reap\./` (Claude Code 현 패턴 일부) | `reapdev.*` 도 매칭? — `^reap\.` 는 점 강제하므로 `reapdev` (점 없음) 안 잡힘. 하지만 `reap.dev.md` 같은 사용자 파일은 잡힘 | 중간 |
| `/^reap\..+\.md$/` (Claude Code `SKILL_PATTERN`) | `.md$` 강제. `reap.dev.md` 같은 사용자 reserved-prefix 파일은 잡힘 | 중간 |
| Marker-based (각 파일 첫 줄에 `<!-- reap-managed -->` 같은 마커) | REAP 가 설치한 파일만 제거 | 가장 안전, 하지만 Claude Code 측은 안 그렇게 함 → 불일치 |

**결정**: `/^reap\..+\.md$/` (Claude Code 와 같은 패턴) — `reap.` 접두사를 REAP 가 reserve 한다고 README + docs 에 명시. `reapdev.*` 같은 변형은 안전. 사용자가 `reap.mytool.md` 를 만들면 덮어쓰여짐(허용 — reap prefix 는 reserved). 양 adapter 일관성 유지.

### Q4. `installSkills` vs `registerSessionIntegration` 경계?

- `installSkills` (full install, user-level 포함): commands 설치
- `registerSessionIntegration` (idempotent runtime, project-level 만): commands 미관여

근거: SessionStart 매번 user-level 파일을 rewrite 하면 noisy. user 자산 변경은 명시적 `install-skills` 또는 `update` 트리거 시점에만.

→ `installSkills` 안에만 추가. `registerSessionIntegration` 은 변경 없음.

### Q5. `disable-model-invocation: true` 처리?

- 영향받는 파일: `reap.refreshKnowledge.md` (deprecated 안내), `reap.init.md` (interactive setup)
- OpenCode docs 에 unknown frontmatter 처리 언급 없음 — 일반적인 markdown parser 는 무시
- 만약 reject 한다면 install 자체 실패 — 단, 현실적으로 무시 가능성 높음
- variant 작성 시 dogfooding 2배 부담

**결정**: pass-through. 첫 사용자 보고 시 별도 대응.

## Approach

### 핵심 변경 위치

1. **`src/adapters/opencode/install.ts`** 에 `installSlashCommands(): Promise<{cleaned: number, installed: number, targetDir: string}>` 함수 추가:
   - Target: `~/.config/opencode/commands/` (ensureDir).
   - Cleanup: 기존 디렉토리에서 `^reap\..+\.md$` 매칭 파일 모두 삭제.
   - Copy: claude-code skills 디렉토리(dist/dev 분기)에서 모든 `.md` 복사.
   - Return: 통계 (test 검증용).

2. **`installSkills(projectRoot)` 본체** 에 `installSlashCommands()` 호출 추가. emitOutput `completed` 와 `context` 에 결과 반영.

3. **`src/core/integrity.ts:604-611`** 의 `~/.config/opencode/commands/reap.*` legacy warning 절 제거. 이제 그 위치는 정상 install location.

4. **`src/adapters/opencode/templates/agents.md`** 갱신 — slash commands 사용 가능 사실 한 절 추가.

5. **`src/templates/reap-guide.md` + `.reap/reap-guide.md`** (dogfooding sync) — AI Client Support 표의 opencode row 또는 별도 안내에 commands 자동 등록 사실 추가.

6. **`README.md`** Agent Integration 절에 한 줄 추가.

### Helper

cross-adapter directory resolution helper 를 `src/adapters/opencode/install.ts` 안에 inline (cross-import 회피):

```ts
function claudeCodeSkillsDir(): string {
  return __dirname.includes("dist")
    ? join(__dirname, "..", "claude-code", "skills")
    : join(__dirname, "..", "claude-code", "skills");
}
```

dev 시 `src/adapters/opencode/install.ts` 의 `__dirname = src/adapters/opencode/` → `../claude-code/skills` 가 정확히 `src/adapters/claude-code/skills`. dist 시 `dist/adapters/opencode/install.js` → `../claude-code/skills` 가 `dist/adapters/claude-code/skills`. 두 환경 모두 동일.

### Test 전략

- **Unit (`tests/unit/opencode-commands.test.ts`, 신규)** —
  - cleanup-then-copy 동작 (HOME mock 으로 임시 디렉토리 사용).
  - prefix 가드: `reapdev.publish.md`, `mytool.md` 등 사용자 파일 보존.
  - 반복 호출 idempotency.
  - dispatch 분기: `getAdapter("opencode")` → opencode adapter 가 commands 설치.

- **E2E (`tests/e2e/opencode-install.test.ts`, 확장)** —
  - 기존 OpenCode e2e 흐름에 commands 디렉토리 검증 추가 — `~/.config/opencode/commands/` 안의 reap.* 파일 19개 존재.
  - 기존 사용자 custom commands 보존 (사전에 `mytool.md` 작성 후 install-skills 호출).
  - `agentClient: claude-code` regression: commands 디렉토리 unchanged.

- HOME mock: bun:test 에서 `process.env.HOME = tempDir` 로 override. Claude Code adapter test 가 같은 방식인지 확인 후 차용.

## Risk Assessment

1. **글로벌 디렉토리에 쓰기 위험** — 테스트가 실제 사용자 홈을 건드릴 가능성. mitigate: HOME mock + tempdir.
2. **`reap.` prefix conflict** — 사용자가 `reap.foo.md` 라는 custom 명령을 가질 가능성. mitigate: README/docs 에 prefix reserved 명시. 1차 release 후 사용자 보고 시 marker 기반으로 강화 검토.
3. **OpenCode 가 unknown frontmatter reject** — 가능성 낮음. mitigate: 첫 사용자 보고 후 대응. variant 미리 분리하면 dogfooding 부담만 증가.
4. **integrity.ts legacy warning 제거 후 사용자 디렉토리에 stale Phase 2 잔재** — 합법 reap commands 와 구분 어려움. mitigate: 본 generation 이 cleanup-then-install 흐름을 매번 수행하므로 사용자가 한 번 `install-skills` 만 호출하면 정리됨. warning 제거는 정상 동작.
5. **claude-code skills 가 dist 빌드에 누락** — 가능성 낮음 (build.sh 가 이미 처리). mitigate: e2e 가 그 누락을 직접 잡아냄.

## Scope

### In Scope (본 generation 변경 대상 파일)

- `src/adapters/opencode/install.ts` — `installSlashCommands` 추가 + `installSkills` 흐름 갱신.
- `src/adapters/opencode/templates/agents.md` — commands 안내 한 절.
- `src/core/integrity.ts` — legacy warning 절 제거 (`:604-611`).
- `src/templates/reap-guide.md` + `.reap/reap-guide.md` — AI Client Support 갱신.
- `README.md` — Agent Integration 한 줄.
- `tests/unit/opencode-commands.test.ts` (신규) — unit 검증.
- `tests/e2e/opencode-install.test.ts` — e2e 확장.

### Out of Scope

- Codex adapter slash commands (별도 트랙, 큰 작업).
- 프로젝트 `.opencode/commands/` 동시 설치 (글로벌만 충분).
- OpenCode `tui.command.execute` plugin 활용 (현재 docs 기반 markdown 방식으로 충분).
- `disable-model-invocation` variant 분리 (pass-through, 사용자 보고 후 대응).
- Plugin runtime 검증 / 사용자 환경 OpenCode 실행 테스트 (agent 한계, 사용자 의뢰).
- 6 pre-existing unit fail + 1 pre-existing e2e fail (본 작업과 무관).

## Tasks

- [ ] T001 `src/adapters/opencode/install.ts` — `installSlashCommands(): Promise<{cleaned, installed, targetDir}>` 신규. cleanup-then-copy 로직, prefix `^reap\..+\.md$`.
- [ ] T002 `src/adapters/opencode/install.ts` — `installSkills(projectRoot)` 흐름에 `installSlashCommands()` 호출 + emitOutput `completed`/`context` 갱신.
- [ ] T003 `src/core/integrity.ts` — `:604-611` 의 `~/.config/opencode/commands/reap.*` legacy warning 절 제거. comment 도 정리.
- [ ] T004 `src/adapters/opencode/templates/agents.md` — slash commands 사용 가능 절 추가 (`## Slash Commands`).
- [ ] T005 `src/templates/reap-guide.md` — AI Client Support 표의 opencode row 에 commands column 또는 별도 한 줄. dogfooding sync (`.reap/reap-guide.md`) 도 동일 변경.
- [ ] T006 `README.md` — Agent Integration 절에 OpenCode slash commands 자동 등록 사실 한 줄.
- [ ] T007 `tests/unit/opencode-commands.test.ts` (신규) — installSlashCommands 단위 테스트 (cleanup, prefix guard, idempotency, 사용자 파일 보존). HOME mock.
- [ ] T008 `tests/e2e/opencode-install.test.ts` — install-skills 후 commands 디렉토리 검증, 사용자 custom 보존, claude-code regression 추가.
- [ ] T009 빌드 + 회귀 검증 — `npm run build`, `npm run typecheck`, `npm run test:unit`, `bun test tests/e2e/opencode-install.test.ts`. Pre-existing 6 unit fail + 1 e2e fail 외 회귀 0건 확인.
- [ ] T010 dogfooding sync 최종 확인 — `node dist/cli/index.js update` 본 repo (claude-code 환경) 에서 "Nothing to update" 또는 정상 sync 확인 (commands 디렉토리 변경 없음 확인).

## Dependencies

- T001 → T002 (function 정의가 caller 보다 먼저)
- T001~T002 → T007 (unit test 가 implementation 의 export 의존)
- T001~T004 → T008 (e2e 가 모든 변경 통합 검증)
- T001~T008 → T009 (full test run 은 모든 변경 후)
- T009 → T010 (dist build 후 dogfooding sync 확인)
- T003 은 T001~T002 와 독립이지만 같은 PR 단위로 합쳐서 진행 (의미적 응집).
- T005~T006 (문서) 은 implementation 과 독립 — 병렬 가능. validation 전 완료.

## Verification (backlog 12 항목 대응)

| Backlog Verification | 본 plan 대응 |
|---|---|
| OpenCode commands 메커니즘 (위치+형식) Learning artifact 명시 | 01-learning.md `Key Findings 1` |
| `installSkills` 에 commands 등록 로직 추가 | T001, T002 |
| `agentClient: opencode` + `reap update` 후 reap.* 19 자동 배치 | T008 e2e |
| 사용자 custom commands 보존 | T007 unit + T008 e2e |
| 반복 update 시 idempotent | T007 unit |
| Legacy cleanup REAP 설치본만 정리 | T001 prefix pattern + T007 unit |
| Adapter dispatch 정상, claude-code regression 0 | T008 e2e regression 케이스 |
| AGENTS.md template 갱신 | T004 |
| reap-guide / docs / README 갱신 | T005, T006 |
| Unit + E2E 추가 | T007, T008 |
| dogfooding: src/templates ↔ .reap 동기화 | T005 (sync) + T010 (검증) |
| 본 작업 OpenCode 버전 README 기록 | T006 |
