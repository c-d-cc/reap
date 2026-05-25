# Completion

## Summary

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

## Lessons Learned

### 잘된 점

- **gen-063 의 application.md 4-항목 verification checklist 가 본 generation 의 정확한 출발점이 됐다**. gen-063 adapt phase 에서 명문화한 (1)~(4) 체크리스트 중 (4) 가 본 작업의 직접적 목표였고, 그 추상화가 작업 범위를 즉시 명확하게 했다. evolution.md 의 "사용자 UX gap 은 verification 항목으로 명시" 절도 동일한 효과 — clarity high 로 학습 → 계획 → 구현 의 progression 이 자연스러웠다.

- **Source 단일화 결정**: OpenCode docs 가 Claude Code skill 형식과 거의 100% 호환임을 학습 단계에서 확인 → 별도 OpenCode commands source 를 만들지 않고 `src/adapters/claude-code/skills/` 를 재사용. 19 파일 중복을 회피했고 향후 명령 추가/수정은 한 곳만 건드림. 양 adapter 어디서든 같은 trigger.

- **Cleanup pattern 재사용 (gen-061 교훈)**: Claude Code adapter 의 `SKILL_PATTERN = /^reap\..+\.md$/` 를 그대로 차용. gen-061 reapdev 사고에서 검증된 정밀 패턴이라 새로 설계할 필요 없었음. `reap.` 접두사 reserved 정책을 README/AGENTS.md/reap-guide 에 명시 → 사용자 영역 침범 0 보장.

- **Test 격리 — HOME mock**: `cliWithHome(cwd, fakeHome, ...args)` helper 신규로 e2e 가 실제 user home 을 건드리지 않음. POSIX `os.homedir()` 가 `$HOME` 을 우선 사용하는 점을 활용. unit/e2e 모두 임시 디렉토리만 사용 → CI 환경에서도 안전.

### 개선 가능

- **`claudeCodeSkillsDir()` 의 dist 분기 누락 (초기 실수, 즉시 수정)**: dist 가 single bundle (`dist/cli/index.js`) 이라 `__dirname = dist/cli/` 이고, `../claude-code/skills` 가 `dist/claude-code/skills` (존재 X) 로 풀린다는 사실을 처음에 잊었다. 같은 파일의 기존 `assetPath()` 가 이미 `__dirname.includes("dist")` 분기를 쓰고 있었는데 그 패턴을 미참조. 결과: 첫 e2e 가 `installed=0` 으로 즉시 잡아냄 → 분기 추가로 수정. 교훈: **새 helper 작성 시 같은 파일 안의 기존 helper 패턴부터 확인**. cross-asset 경로는 단일 패턴으로 통일.

- **e2e 새 helper `cliWithHome` 추가 위치**: `tests/helpers/setup.ts` 가 아닌 `tests/e2e/opencode-install.test.ts` 안에 inline 으로 추가. 향후 다른 e2e 가 같은 패턴을 필요로 하면 `setup.ts` 로 이동 검토. 본 generation 에선 OpenCode-specific 한 격리라 inline 이 적절했지만, 재사용 신호가 보이면 promote.

- **Planning Q4 의 잘못된 가정 — 사용자가 fitness 직전 잡아냄**: 02-planning.md Q4 에서 "`registerSessionIntegration` 은 변경 없음 — SessionStart 매번 user-level 자산을 rewrite 하면 noisy" 라 결정. 그러나 `registerSessionIntegration` 은 SessionStart 마다 호출되는 게 아니라 **`reap update` 시점에만 호출됨**. 사용자가 fitness 응답 직전 `src/cli/commands/update.ts` 의 호출 흐름을 검토하고 갭 지적: `reap update` 가 `adapter.installSkills` 를 호출하지 않고 `registerSessionIntegration` 만 호출하므로, 본 함수에 user-level sync 가 없으면 사용자는 `reap update` 후 명시적으로 `reap install-skills` 를 별도 실행해야 함. 결과: back regression (T011~T015) 으로 fix. 교훈:
  - **plan 단계에서 함수의 호출 경로(caller)를 명시적으로 점검**. 본 generation 에선 `installSkills` 와 `registerSessionIntegration` 의 차이를 *언제* 호출되는지 기준으로 추론했지만, 실제 caller 인 `update.ts` 를 직접 읽지 않음. caller 검증이 추상적 추론보다 우선.
  - **e2e 가 verification scenario 의 모든 entry point 를 cover 해야 한다**. 본 generation 의 첫 e2e 는 `cli install-skills` 만 호출했지만, backlog verification 은 `reap update` 흐름도 명시함 — 그것을 별도 e2e 로 검증하지 않았다. 사용자 시나리오를 e2e 가 1대1 mirror 해야 함.
  - **사용자 검토가 마지막 safety net 으로 작동했다** — agent 의 추상적 추론보다 사용자가 코드 직접 읽기가 강력. 다음 generation 부터는 fitness 전 self-audit 절차에 "사용자 verification scenario 의 모든 CLI invocation 을 e2e 가 cover 하는가" 확인.

### 메타 교훈

gen-063 → gen-064 흐름이 보여준 패턴: **첫 fitness 에서 발견된 UX gap 을 즉시 backlog 화 + genome 4-항목 verification 으로 추상화 → 다음 generation 이 그 추상화로 1대1 매핑된 작업을 수행**. backlog 가 사후-처치이지만, **그 처치의 결과가 다시 추상화 (4-항목 checklist) 가 되어 미래 재발을 방지**한다. self-evolving 의 작동 사례.

## Project Diagnosis

- **Core functionality**: lifecycle 3-path (abort/early-close/completion), 양 adapter 의 install/update/session integration 모두 안정 동작. 본 generation 으로 OpenCode adapter 4-항목 verification 완비.
- **Architecture stability**: gen-063 에서 dispatcher + AdapterModule 패턴 정착. 본 generation 은 그 위에서 helper 추가만 — 아키텍처 변경 없음. v0.16 들어 stable.
- **Modularity**: adapter 별 modular 분리 + 공통 helper (slash-command sync) 패턴 정립. Codex adapter 추가 시 같은 패턴 적용 가능.
- **Error handling**: `installSlashCommands` 가 source dir missing 케이스를 try/catch 로 처리. emitOutput / emitError 일관성 유지. invariants 위반 없음.
- **Test coverage**: 본 generation 으로 unit 13 + e2e 10 신규. 양 adapter 의 `installSkills` + `registerSessionIntegration` 양 경로 모두 e2e 검증. 1 pre-existing init-repair fail 만 잔존.
- **Documentation**: README + reap-guide.md + AGENTS.md template 모두 slash commands 사용 안내 + reserved prefix 정책 명시. dogfooding sync 완료.
- **User experience**: OpenCode 사용자가 `reap update` 한 번으로 Claude Code 동등 UX 확보. 사용자 검증 시나리오와 코드 일치 (fitness 단계 사용자 검토로 catch 한 갭까지 fix).
- **Deployment readiness**: v0.16.4 base + gen-061~064 묶음 → v0.16.5 release 후보. Issue #16/17/19 모두 코드 측면 close 준비됨.
- **Code quality**: helper 분리 패턴 (single source / silent helper / `registerSessionIntegration` 책임) 이 application.md 에 명문화됨 — 다음 adapter 가 같은 패턴 따를 수 있도록 가이드.
- **Integration layer**: claude-code + opencode 양쪽 모두 (a) static load (b) dynamic refresh (c) entry-point (d) slash trigger 4가지 통합 layer 모두 동작. codex 미구현 (dispatcher throw).
- **Domain maturity**: adapter dispatch + multi-client 영역이 application.md "Adapter Layer" 절에 명문화. environment summary 도 양 adapter 구조 반영. Codex 추가 시 같은 패턴 재사용.
- **Genome stability**: 본 generation 이 application.md / evolution.md 각각 1개 절씩 추가했지만 기존 절은 모두 그대로. 누적 변경이지 구조 변경 아님. embryo → normal 전환 후에도 안정.

## Next Generation Hints

### 즉각 후보 — release 트랙

1. **v0.16.5 release** (gen-061~064 묶음): early-close (gen-061) + Knowledge Loading 정/동 분리 (gen-062) + OpenCode adapter (gen-063) + OpenCode slash commands & `registerSessionIntegration` 갭 fix (gen-064). 19+ commits ahead of origin/main 이 누적된 상태. 사용자가 release 시점에 OpenCode 환경 정식 테스트. **권장**: minor bump (`v0.16.5`) — feature 추가 + 버그 수정 묶음으로 충분. v0.17.0 까지 갈 정도의 breaking 변경 없음.
   - Issue #16 (early-close), #17 (Knowledge Loading), #19 (OpenCode adapter + slash commands) 모두 close 가능 — release 후 코멘트.
   - 부수 성과: gen-061 reapdev 사고의 근본 원인 (= `registerSessionIntegration` 의 user-level skills sync 누락) 도 본 generation fix 로 자동 해소. release notes 에 명시 권장.

2. **Issue #18 (Backlog not consumed)** — 별도 generation 후보. 사용자가 처음 "오래된 것부터" 라고 했지만 OpenCode 트랙 우선으로 skip 됨. 다음 source 후보.

### 중간 우선순위 (다음 generation 들)

3. **`opencode-init-agent-flag`**: `reap init --agent opencode` 옵션. 현재는 config.yml 수동 편집 + `reap update`. 사용자 진입 마찰 한 단계 더 줄임. dispatcher 위에 명시 옵션만 노출. medium.

4. **`unify-sync-async-knowledge-builder`**: gen-063 shortterm 에 이미 노출된 후보. `dump-state-sync.ts` 와 `load-context.ts` 의 sync/async 빌더 합치기. 본 generation 과 직접 인과는 없으나, 두 generation 연속으로 안 다뤘으므로 후순위 처리.

5. **`init-repair-skipped-message-fix`** — 1 pre-existing e2e fail. 다음 generation 잡을 후보. small.

6. **`tests/helpers/setup.ts` fileExists 디렉토리 버그 fix** — opencode-install.test.ts 에 inline `dirExists` 로 우회. 다른 e2e 도 동일 영향 가능. helper 전체 정비. small.

### 낮은 우선순위 (deferred / wait-and-see)

7. **`disable-model-invocation` variant 분리** — OpenCode 가 unknown frontmatter 를 어떻게 처리하는지 사용자 보고 후 결정. variant 가 필요하다면 그 시점에. 본 generation 의 pass-through 가 안전한 default.
8. **사용자 prefix 충돌 보고 시 marker 기반 cleanup 강화** — 현재는 `reap.` reserved 정책 + 문서 명시. 충돌 보고 발생 시 marker (`<!-- reap-managed -->`) 기반으로 강화.
9. **OpenCode plugin `tool.execute.after` dump 추가** — 성능 trade-off, gen-063 부터 deferred. 사용자 first feedback 후 판단.
10. **Codex adapter** — 별도 큰 트랙. dispatcher 위에 신설 모듈. application.md 의 4-항목 verification + `installSkills`/`registerSessionIntegration` 양쪽 user-level sync 패턴 그대로 적용.
11. **Evaluator agent 코드 통합** — long-standing deferred (gen-051 템플릿 완료 후 미진행).

## Change Proposals (adapt phase 에서 적용 완료)

### Environment 갱신 (reflect phase 완료)

- `environment/summary.md` 의 source structure 에서:
  - claude-code adapter: `installSlashCommandsOnly()` export + `registerSessionIntegration` 책임 갱신 명시
  - opencode adapter: `installSlashCommands(home?)` + `registerSessionIntegration` 책임 갱신 명시
  - skills/: 양 adapter 가 single source 로 재사용한다는 사실 명시
- Scripts 절: 이전의 `e2e-*.sh` 가 bun:test 로 일원화됨을 정정 (이전 outdated).
- tests/ submodule branch: `self-evolve` → `main` 정정.

### Genome 변경 (adapt phase 적용 완료)

본 generation 에서 두 절 신규/확장:

1. **`.reap/genome/application.md` — "Adapter Layer — Multi-Client Support" 절 확장**:
   - 새 표/단락: "`installSkills` vs `registerSessionIntegration` — user-level sync is required in both"
   - `reap update` 의 caller 흐름 명시 (`installSkills` 호출 X, `registerSessionIntegration` 만)
   - 양 함수의 책임 표 — user-level assets must refresh in both
   - 표준 패턴: silent helper (`installSlashCommands` / `installSlashCommandsOnly`) 를 양쪽이 호출
   - gen-061 reapdev 사고의 근본 원인 = 이 갭임을 명시
   - **다음 codex adapter 추가 시 같은 실수 방지**

2. **`.reap/genome/evolution.md` — "사용자 UX gap" 절에 하위 절 추가**:
   - "사용자 직접 테스트가 e2e가 못 잡는 갭을 잡는다 (gen-064 사례)"
   - fitness 전 self-audit 체크리스트 3항목
   - 사용자 인 더 루프의 가치를 lifecycle 작동 사례로 입증
   - back regression path 가 graceful 하게 처리한 점 명시

### Vision 갱신 (adapt phase 적용 완료)

- `vision/goals.md` "Agent Client 확장" 의 OpenCode adapter 항목 — gen-063→gen-063~064 로 갱신, slash commands 포함 사실 + 4-항목 verification 충족 명시.

### Memory 갱신 (reflect + adapt phase 분산)

- **shortterm.md**: gen-064 세션 요약 + fitness 결과 + 다음 세션 인계 + 코드 변경 위치.
- **midterm.md**: "OpenCode adapter — 멀티-client 트랙 (gen-063 + gen-064)" 통합. user-level sync 책임 원칙 명시 예정 (commit phase 직전 추가).
- **longterm.md**: "Plan 단계에서 함수 caller 를 직접 읽어라" + "사용자 직접 테스트가 e2e가 못 잡는 갭을 잡는다" — 2개 새 절. 향후 re-reference 빈도 높을 lesson.

### Backlog (사용자 판단 영역)

본 generation 에서 backlog 자체 생성 안 함 (adapt phase 원칙). 위 Next Generation Hints 의 1~11 중 어느 항목을 backlog 로 등록할지는 사용자 판단. release 트랙 (Hint 1) 이 가장 자연스러운 다음 source 후보.
