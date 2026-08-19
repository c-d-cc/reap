---
id: gen-063-830a29
type: normal
goal: "resolve #19: OpenCode adapter 신설 — opencode.json + reap dump-state + plugin (session.created/tool.execute.before) + AGENTS.md"
parents: ["gen-062-332df2"]
---
# gen-063-830a29
Issue #19 해결: OpenCode adapter 신설. 외부 사용자 `aresstokrat`가 보고한 "REAP를 OpenCode로 쓸 수 없다"는 차단 해결.

### 변경 내용

신규:
- `src/adapters/index.ts` + `src/adapters/types.ts` — adapter dispatcher 패턴 도입
- `src/adapters/claude-code/index.ts` — 기존 install 함수를 AdapterModule wrapper로 export
- `src/adapters/opencode/` 전체 — install.ts (opencode.json/AGENTS.md/plugin sync), plugin/reap-plugin.ts (session.created + tool.execute.before), templates/agents.md, index.ts
- `src/cli/commands/dump-state.ts` + CLI 등록 — `--stdout` / `--silent` 옵션
- `src/core/dump-state-helper.ts` (async) + `src/core/dump-state-sync.ts` (emitOutput 통합용)
- `tests/unit/dump-state.test.ts` (9), `opencode-json.test.ts` (13), `adapter-dispatch.test.ts` (7)
- `tests/e2e/opencode-install.test.ts` (7)

수정:
- `src/core/paths.ts` — `sessionState` 필드 추가
- `src/core/output.ts` — `emitOutput`에 lifecycle 명령용 sync dump 통합
- `src/cli/commands/install-skills.ts` + `src/cli/commands/update.ts` — dispatcher 경유
- `src/templates/reap-guide.md` + `.reap/reap-guide.md` (dogfooding sync) — AI Client Support 절 신설
- `README.md` — Agent Integration 절 재작성 (claude-code/opencode 동시 명시)
- `scripts/build.sh` — opencode 자산을 dist/로 복사
- `.gitignore` — `.reap/.session-state.md`

### 결과

- 7 completion criteria 모두 충족. 15 backlog verification 항목 중 13건 충족 (verification 15건 중 2건은 별도 처리: `opencode.json.template` 파일은 상수로 단순화, AGENTS.md 위치는 프로젝트 루트로 docs 확인 후 확정).
- Unit: 387 pass (+29 신규) / 6 fail (모두 pre-existing notice.test.ts, 본 작업 무관).
- E2E: 180 pass (+7 신규) / 1 fail (pre-existing init-repair, 본 작업 무관).
- 본 작업 회귀 0건.
- dogfooding 검증: `node dist/cli/index.js update` 본 repo에서 "Nothing to update" — claude-code 환경에서 변동 없음.