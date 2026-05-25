# Shortterm Memory

## 세션 요약 (2026-05-25)

### gen-064: OpenCode slash commands 등록 (Issue #19 UX 완성)

OpenCode 환경에서 `/reap.*` slash trigger 활성화. gen-063 의 4-항목 verification 중 (4) "slash trigger 등록" 의 직접적 충족.

- 신규: `installSlashCommands(home?)` (opencode, cleanup-then-copy, prefix `^reap\..+\.md$`), `installSlashCommandsOnly()` (claude-code, silent helper — `installSkills` 와 `registerSessionIntegration` 양쪽 재사용), 경로 helper (`opencodeCommandsDir`, `claudeCodeSkillsDir`). unit 13 / e2e 10 신규.
- 수정: opencode `installSkills` + `registerSessionIntegration` 둘 다 commands sync, claude-code `registerSessionIntegration` 도 commands sync (T011~T015 — 사용자 fitness 직전 갭 지적 후 back regression), `integrity.ts` legacy warning 제거, AGENTS.md template (Slash Commands 절), reap-guide / README (slash column + reserved prefix 정책).
- 핵심 결정: source 단일화 (Claude Code skills 19 파일 재사용) — OpenCode 형식 100% 호환. 글로벌 위치 (`~/.config/opencode/commands/`) — Claude Code 패리티. `reap.` prefix reserved 정책. **양 adapter `registerSessionIntegration` 이 `reap update` 시 user-level sync 도 수행** — planning Q4 의 잘못된 가정 (SessionStart 매번 호출이라 추정) 을 fitness 전 사용자 검토에서 정정.
- 결과: typecheck/build pass. unit 406 pass / 0 fail. e2e 190 pass / 1 fail (pre-existing init-repair). 본 작업 회귀 0. dogfooding `node dist/cli/index.js update` "Nothing to update".

### gen-064 fitness 응답 (2026-05-26)

> "build + reinstall 없이 바로 fitness OK"

- 전반적 만족 — 이전 build 로 OpenCode 환경 테스트는 잘 됐고, update 흐름 fix 는 e2e (unit 4 + e2e 5) 로 검증 충분.
- 재install + 정식 사용자 테스트는 push/release 시점에 진행.
- **부수 성과**: gen-061 reapdev 사고의 근본 원인 (= `registerSessionIntegration` 의 user-level skills sync 누락) 이 본 generation fix 로 자동 해소됨을 사용자도 인지.
- **사용자 직접 코드 검토가 fitness 직전 갭 catch** — agent 의 추상적 추론보다 사용자가 code 직접 읽기가 강력. lifecycle (back regression) 이 graceful 처리. evolution.md 와 longterm memory 에 명문화.

### 다음 세션 / 다음 generation

- **release v0.16.5 후보** (가장 자연스러운 다음 action): gen-061~064 묶음 release. 19+ commits ahead. 사용자가 release 시점에 OpenCode 환경 정식 테스트.
  - Issue #16 (early-close), #17 (Knowledge Loading), #19 (OpenCode adapter + slash commands) 모두 release 후 close + 코멘트 가능
  - 부수 성과 (gen-061 reapdev 사고 근본 원인 해소) release notes 에 명시 권장
- **Issue #18 (Backlog not consumed)** — 별도 generation 후보. 사용자가 처음 "오래된 것부터" 라고 했지만 OpenCode 트랙 우선으로 skip 됨. release 후 source 후보.
- **deferred 후보 (사용자 판단 후 backlog 등록)**:
  1. `opencode-init-agent-flag` — `reap init --agent opencode` 옵션 (medium)
  2. `unify-sync-async-knowledge-builder` — sync/async 빌더 합치기 (small, gen-063 부터 deferred)
  3. `init-repair-skipped-message-fix` — 1 pre-existing e2e fail (small)
  4. `tests/helpers/setup.ts` fileExists 디렉토리 버그 fix (small)
  5. `disable-model-invocation` variant 분리 — OpenCode 가 unknown frontmatter reject 보고 발생 시
  6. 사용자 prefix 충돌 보고 시 marker 기반 cleanup 강화
  7. OpenCode plugin `tool.execute.after` dump 추가 — 성능 trade-off, gen-063 부터 deferred
  8. Codex adapter (별도 큰 트랙) — 본 generation 명문화한 양 함수 user-level sync 패턴 그대로 적용
  9. Evaluator agent 코드 통합 — long-standing deferred

### Backlog 상태

- `opencode-slash-commands.md` (task, high) — gen-064 에서 **consumed**.
- `opencode-adapter.md` — gen-063 consumed.
- `claude-md-knowledge-loading-separation.md` — gen-062 consumed.
- `daemon-e2e-tests.md` — gen-060 consumed.
- `early-close-lifecycle.md` — gen-061 consumed.
- `fix-migrate-update-tests.md` — gen-059 consumed.
- `strict-merge-mode-bypass-for-merge-gen.md` — gen-058 consumed.

(모든 기존 backlog 가 consumed — 다음 generation 은 사용자가 새 source 를 backlog 화 하거나 vision/goals gap 으로 진행)

### 코드 변경 위치 (다음 세션이 참조할 수도)

- `src/adapters/opencode/install.ts` — installSlashCommands 함수, helper 들, registerSessionIntegration 갱신
- `src/adapters/claude-code/install.ts` — installSlashCommandsOnly 신규 export
- `src/adapters/claude-code/index.ts` — registerSessionIntegration 에 installSlashCommandsOnly 호출
- `src/core/integrity.ts:604-611` (변경 전) → 그 위치 정리됨
- `src/adapters/opencode/templates/agents.md` — `## Slash Commands` 절
- `src/templates/reap-guide.md` + `.reap/reap-guide.md` — `## AI Client Support` 표
- `README.md` — `## Agent Integration`
