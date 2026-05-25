# Completion

## Summary

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

## Lessons Learned

### 잘된 점

- **gen-062 정/동 분리 재활용**: `buildKnowledgeContext()` 가 dynamic-only로 분리되어 있었기 때문에, OpenCode용 `reap dump-state` 가 그대로 같은 builder를 호출해 byte-identical 출력을 보장. 별도 dynamic-context 정의 작업 없이 끝남. application.md genome에 "Static/Dynamic 분리" 명문화한 것이 다음 generation의 자연스러운 진행을 도왔다.

- **Adapter dispatch 도입 시점 적절**: claude-code adapter 단독일 때는 굳이 dispatcher 없어도 됐지만, OpenCode 추가하는 시점에 dispatcher를 도입함. 추후 codex나 다른 client 추가 시 단일 변경 지점. claude-code/index.ts 는 얇은 wrapper로 기존 install.ts 함수를 감싸기만 해서 회귀 위험 최소.

- **emitOutput에 sync dump 통합 결정**: 처음에는 lifecycle 명령 20여 개 각각에 `await dumpStateBestEffort()` 추가하려 했으나, emitOutput 자체에 화이트리스트 기반 sync dump를 통합하여 변경 지점을 1개로 축소. async builder와 sync builder의 byte-identical 출력은 unit test로 보장.

- **OpenCode docs 사전 확인**: learning 단계에서 WebFetch로 OpenCode docs 재확인. AGENTS.md 위치 (`프로젝트 루트` 확정), opencode.json schema, plugin signature 모두 명시적으로 확보 후 진행. 추측에 의한 잘못된 design 회피.

- **사용자 환경 의존 최소화**: plugin source에 `@opencode-ai/plugin` 타입 import 강제 X. 사용자가 별도 npm 설치 없이 동작. typed development는 옵트인.

### 발견/개선

- **sync builder가 async builder의 source-of-truth duplication**: `dump-state-sync.ts`의 `buildKnowledgeContextSync()` 와 `load-context.ts`의 `buildKnowledgeContext()` 가 같은 로직을 동기/비동기 두 버전으로 가지고 있다. unit test로 byte-identical을 보장하지만, 한쪽이 변경되면 다른 쪽도 같이 변경해야 함. 향후 buildKnowledgeContext 로직 변경 시 양쪽 동시 수정 + parity test 유지 필요. 별도 follow-up backlog 후보: sync/async 합치는 refactor (e.g., 양쪽이 공통 "structure" 함수에서 데이터 수집 후 동기/비동기 wrapper).

- **AGENTS.md template 의 dogfooding 미적용**: claude-md-section.md 처럼 src/templates/ 에 두지 않고 src/adapters/opencode/templates/agents.md 에 둠. 본 repo는 agentClient=claude-code이므로 AGENTS.md를 dogfood 안 함. 추후 client 전환 dogfooding 실험 시 자연스럽게 생성됨.

- **broken opencode.json 자동 backup 미구현**: parse 실패 시 untouched + "skipped". 사용자가 파일을 직접 고쳐야 함. backup 자동화는 사용자 책임 vs REAP 책임 trade-off — 본 작업은 사용자 책임으로 두었으나, 추후 사용자 요청 시 백업 옵션 가능.

- **`reap init`에서 agentClient 선택 UI 없음**: 현재는 init 후 config.yml 수동 수정 → update 흐름. 사용자 친화도 낮음. 별도 follow-up.

- **install-skills의 출력 메시지가 claude-code 위주 표현**: claude-code 분기 시 "skill files to ~/.claude/commands/" 같은 specific 메시지 유지됨. opencode 분기 시는 신규 메시지지만, 둘이 통일된 출력 포맷 아님. cosmetic — 별도 cleanup 후보.

## Next Generation Hints

### 즉시 진행 가능 후보

1. **`reap init --agent opencode` 옵션** — init 시점에 agentClient 선택 UI. 본 generation으로 config.yml 변경 후 update로 동일 결과 도달하지만, 첫 진입 사용자 경험 개선. 작업 규모 medium.

2. **buildKnowledgeContext sync/async unify** — `src/core/dump-state-sync.ts` 의 sync builder와 `src/cli/commands/load-context.ts` 의 async builder 합치기. 공통 "structure" 함수 + sync/async wrapper 패턴. 작업 규모 small. 향후 출력 변경 시 단일 변경 지점.

3. **OpenCode plugin tool.execute.after dump** — 현재는 tool.execute.before guard만. 매 tool 후 dump 갱신하면 lifecycle 명령이 OpenCode 외부에서 실행된 경우도 다음 turn에 갱신됨. trade-off: I/O 증가. 사용자 first feedback 받은 후 판단.

### 잠재 follow-up

4. **`notice.test.ts` pre-existing 실패 정리** — RELEASE_NOTICE.md 구조 변경 영향. 별도 small.

5. **`init-repair.test.ts > skips when REAP section already present` pre-existing 실패** — `init --repair`의 skipped 메시지 누락. 별도 small.

6. **`~/.config/opencode/commands/reap.*` legacy warning 재검토** — REAP가 user-level commands 안 만들지만, 사용자가 자체 reap 별칭을 user-level에 두는 경우 false positive 가능. cosmetic.

7. **OpenCode 사용자 first feedback** — Issue #19 에 본 결과 코멘트 + `aresstokrat` 사용자에게 테스트 요청. real-world plugin 동작 검증은 사용자 환경에서만 가능. fitness 단계에서 사용자 결정에 따라 별도 follow-up.

## Change Proposals

본 generation에서 새로 추가/수정한 모듈들은 application.md의 "Knowledge Loading — Static / Dynamic 분리" 절(gen-062에서 추가)의 원칙을 OpenCode 환경에 적용한 것. 별도 genome 변경 제안 없음 — 기존 원칙이 충분히 일반화되어 있었다.

`src/adapters/` 디렉토리 패턴이 명시적으로 dispatcher + adapter 모듈 구조가 됨. 환경 문서(environment/summary.md)에 source structure 갱신 필요할 수 있음 (reflect 단계에서 검토).

새 backlog 제안 (adapt phase에서 인간 검토 후 결정):
- `unify-sync-async-knowledge-builder` (Lesson #1)
- `opencode-init-agent-flag` (Hint #1)
- `notice-test-pre-existing-failure-fix` (Hint #4)
- `init-repair-skipped-message-fix` (Hint #5)
