# Shortterm Memory

## 세션 요약 (2026-05-25)

### gen-063: OpenCode adapter 신설 (Issue #19 해결)

OpenCode 사용자가 REAP를 쓸 수 있도록 adapter 신설 + dispatcher 도입.

- 신규: `src/adapters/{index,types}.ts` (dispatcher + AdapterModule), `src/adapters/opencode/` 전체 (install/plugin/templates/index), `src/cli/commands/dump-state.ts`, `src/core/dump-state-{sync,helper}.ts`. 4 new test files (unit 3 + e2e 1, 36 신규 test).
- 수정: `src/core/{paths,output}.ts` (sessionState + emitOutput sync dump 통합), `src/cli/commands/{install-skills,update}.ts` (dispatcher 경유), `src/templates/reap-guide.md` + dogfooding sync, README, `scripts/build.sh` (opencode 자산 복사), `.gitignore`.
- 핵심 결정: AGENTS.md 위치 = 프로젝트 루트 (OpenCode docs 재확인), opencode.json merge = 상수 리스트 + dedupe, sync dump 통합 (lifecycle 명령 종료 시 자동). sync/async builder의 byte-identical 출력은 unit test로 보장.
- 결과: typecheck/build pass. unit 387 pass (+29 신규) / 6 pre-existing fail. e2e 180 pass (+7 신규) / 1 pre-existing fail. 본 작업 회귀 0. dogfooding `node dist/cli/index.js update` 본 repo에서 "Nothing to update" (claude-code 환경 회귀 X).

### gen-063 fitness 결과

> "음.. 이번 fitness 는 일단 ok 할게. 저 작업(OpenCode slash commands 등록)이 되고 나서야 opencode 에서 테스트 할 수 있겠다"

- gen-063 자체는 OK. OpenCode adapter 신설(opencode.json + plugin + AGENTS.md + dump-state) 결과 만족.
- 단, 실제 OpenCode 환경 사용 가능 여부는 next generation 후로 미룸.
- **누락된 UX gap**: Claude Code의 `~/.claude/commands/*.md` slash commands가 OpenCode(`~/.config/opencode/commands/` 등 별도 위치)에 자동 복사되지 않음. 사용자가 `/reap.start` 같은 슬래시 트리거 불가. gen-063 backlog/verification에 명시되지 않았던 갭.
- **교훈 → genome 반영 (adapt)**: evolution.md에 "사용자 UX gap은 verification 항목으로 명시" 절 추가 (4-항목 체크리스트: static load / dynamic refresh / entry-point / slash trigger). application.md "Adapter Layer — Multi-Client Support" 절에 동일 verification 체크리스트 명문화. 다음 세대가 이 누락 반복 방지.

### 다음 세션

- **강력 추천 source**: `opencode-slash-commands.md` (priority: **high**, dependsOn: opencode-adapter). 사용자가 fitness 직후 follow-up으로 등록. 사용자 명시 목표: "다음 업데이트(v0.16.6 또는 v0.17.0) 받았을 때 OpenCode에서도 reap 사용 가능".
- **OpenCode 사용자 first feedback 요청**은 opencode-slash-commands 완료 후로 미루는 게 자연스러움 — slash trigger 없이 사용자 테스트해도 불완전.
- **deferred 후보 (본 generation에서는 backlog 등록 안 함, 사용자 판단)**:
  1. `unify-sync-async-knowledge-builder` — `dump-state-sync.ts` 와 `load-context.ts` 의 sync/async 합치기 (small)
  2. `opencode-init-agent-flag` — `reap init --agent opencode` 옵션 (medium)
  3. `notice-test-pre-existing-fix` — RELEASE_NOTICE.md 구조 변경 영향 6 unit fail (small)
  4. `init-repair-skipped-message-fix` — pre-existing 1 e2e fail (small)
  5. OpenCode plugin `tool.execute.after` dump 추가 (성능 trade-off, 사용자 first feedback 후 판단)
  6. `~/.config/opencode/commands/reap.*` legacy warning 재검토 (opencode-slash-commands 작업과 충돌 가능 — 그때 같이 검토)

### Backlog 상태

- `opencode-adapter.md` (task, medium) — gen-063에서 **consumed**.
- `opencode-slash-commands.md` (task, **high**) — 사용자가 fitness 직후 follow-up으로 등록. **다음 generation source 최우선**.
- `claude-md-knowledge-loading-separation.md` — gen-062 consumed.
- `daemon-e2e-tests.md` — gen-060 consumed.
- `early-close-lifecycle.md` — gen-061 consumed.
- `fix-migrate-update-tests.md` — gen-059 consumed.
- `strict-merge-mode-bypass-for-merge-gen.md` — gen-058 consumed.
