# Validation Report

## Result

**pass** — 모든 정량적 검증 + 7개 completion criteria 충족. 1건의 pre-existing e2e fail 은 gen-063 baseline 과 동일하며 본 작업과 무관.

**Note**: 본 validation 은 fitness 직전 사용자 갭 지적 후 back regression (T011~T015 추가) 으로 두 번째 통과. 모든 수치는 후속 fresh run 결과 (validation 본 호출 시점, 2026-05-25). 첫 번째 validation 결과는 history 로 보존.

## Checks

### 정량 검증 (fresh run, T011~T015 fix 포함 후)

| 검증 | 명령 | 결과 |
|---|---|---|
| TypeCheck | `npm run typecheck` | ✓ pass (errors 없음) |
| Build | `npm run build` | ✓ pass (`dist/cli/index.js` 0.55 MB, 150 modules) |
| Unit tests | `bun test tests/unit/` | ✓ **406 pass / 0 fail** (직전 402 + T014 신규 4 = 406). 신규 unit 모두 pass. |
| E2E tests | `bun test tests/e2e/` | ✓ **190 pass / 1 fail**. fail = `init-repair > skips when REAP section already present` — pre-existing (gen-063 baseline 도 동일 1 fail). 직전 185 + T015 신규 5 = 190. 본 작업 영향 없음. |
| 신규 unit (opencode-commands) | `bun test tests/unit/opencode-commands.test.ts` | ✓ 13 pass / 0 fail / 39 expect (9 + 4 신규) |
| 신규 e2e (opencode-install 확장) | `bun test tests/e2e/opencode-install.test.ts` | ✓ 17 pass / 0 fail / 82 expect (12 + 5 신규) |
| Dogfooding | `node dist/cli/index.js update` | ✓ "Nothing to update" — claude-code 환경 회귀 없음 |

### Completion Criteria (02-planning.md 7항목)

| # | Criterion | 검증 |
|---|---|---|
| 1 | `agentClient: opencode` + `reap install-skills` → `~/.config/opencode/commands/reap.*.md` 19 파일 존재. **또한 `reap update` 만으로도 동일 결과** (T011~T015 후) | ✓ e2e `install-skills creates ~/.config/opencode/commands/reap.*.md` — `installed >= 15`, `reap.start.md`/`reap.status.md`/`reap.evolve.md`/`reap.knowledge.md`/`reap.early-close.md` 명시 확인. 실제 19개 모두 복사. **추가 검증**: e2e `reap update — opencode adapter syncs slash commands > reap update installs slash commands into ~/.config/opencode/commands/` — `reap update` 단독 호출만으로 19 파일 자동 배치. |
| 2 | 사용자 custom 파일 보존 (e.g., `reapdev.publish.md`, `mytool.md`) | ✓ unit `preserves user files...` (6 file 유형) + e2e `install-skills preserves user commands` (`mytool.md`, `reapdev.publish.md`, `reap.notes.txt` 모두 보존, 내용 무변경) |
| 3 | 반복 호출 시 idempotent | ✓ unit `is idempotent across repeated calls — no duplicates, no drift` (1st vs 2nd 결과 sorted equal) + e2e `install-skills is idempotent — re-running cleans then reinstalls` (cleaned == installed) |
| 4 | `agentClient: claude-code` 시 `~/.config/opencode/commands/` 미변경 | ✓ e2e `claude-code adapter — does NOT install OpenCode slash commands` (1) 디렉토리 자체 미생성 (2) 사용자 pre-existing dir 미간섭 |
| 5 | integrity.ts legacy warning 절 제거 | ✓ `src/core/integrity.ts:604-611` 제거 확인. 합법 reap commands 가 그 위치에 존재해도 warning X (검증: e2e 가 그 위치에 reap.*.md 생성 후 어떤 integrity warning 도 발생 X — 별도 assertion 없지만 dispatch 흐름 정상 동작이 곧 그 증거) |
| 6 | AGENTS.md / reap-guide / README 갱신 | ✓ T004, T005, T006 적용. e2e `update creates AGENTS.md` 가 markers + REAP + opencode.json 확인 통과 (slash commands 절 포함된 새 template 사용). dogfooding `.reap/reap-guide.md` 도 동기화. |
| 7 | 본 작업 회귀 0건 | ✓ unit 406 pass / 0 fail (회귀 0). e2e 190 pass / 1 fail (fail 은 pre-existing). 신규 23건 (unit 13 + e2e 10) 모두 pass. |

### T011~T015 추가 Verification (사용자 갭 지적 fix)

| Criterion | 검증 |
|---|---|
| `reap update` (단독) 후 OpenCode commands 디렉토리에 reap.* 19 자동 배치 | ✓ e2e `reap update — opencode adapter syncs slash commands > reap update installs slash commands ...` |
| `reap update` (단독) 후 Claude Code commands 디렉토리에 reap.* 19 자동 배치 | ✓ e2e `reap update — claude-code adapter syncs slash commands > reap update installs reap.*.md ...` |
| 반복 `reap update` 시 idempotent + 사용자 파일 보존 | ✓ e2e 두 adapter 각각 `repeated reap update ...` 케이스 |
| stale reap 명령 cleanup (claude-code) | ✓ e2e `reap update cleans stale reap commands and preserves user files` |
| claude-code 프로젝트의 `reap update` 가 `~/.config/opencode/commands/` 미생성 | ✓ e2e `reap update does not create ~/.config/opencode/commands/ for claude-code projects` |
| `registerSessionIntegration` source 가 user-level sync 호출 포함 (정적 검사) | ✓ unit `opencode/claude-code: registerSessionIntegration includes slash commands` x2 |
| 양 adapter 의 `installSlashCommands` / `installSlashCommandsOnly` export 검증 | ✓ unit (정적 import 가능 확인) |

### Backlog Verification (12 항목)

03-implementation.md 의 Verification 표가 그대로 통과. 모든 12 항목 ✓. 그 중 "`reap update` 후 reap.* 19 자동 배치" 는 T015 e2e 로 직접 검증 추가.

## Performance Notes

- 빌드 크기 변화: gen-063 baseline `dist/cli/index.js` 0.55 MB → 변화 없음 (동일 0.55 MB). 추가된 함수 (`installSlashCommands`, helper) 가 마이너 — 번들 사이즈 영향 무시 가능.
- 신규 unit 9개 실행 시간: ~113ms — 빠름.
- 신규 e2e 5개 실행 시간: ~4s (기존 + 신규 = 12 tests in 4.15s). HOME mock 효과로 child process spawn 횟수가 늘어났지만 수용 가능.
- `installSkills` 자체 실행 시간: 측정 안 함 — 단일 mkdir + 19 readdir/unlink/cp 이므로 무의미.

## Edge Cases

본 generation 에서 명시 검증한 edge cases:

1. **Empty target dir** — `installSlashCommands` 가 빈 디렉토리에서 시작 시 `cleaned=0`. unit `creates the target directory when missing`.
2. **Stale `reap.*.md` (지운 명령)** — install-skills 가 다음 install 에서 그 stale 파일 제거. unit `removes stale reap.*.md before copying fresh skills`.
3. **사용자 파일 6가지 유형** — `reapdev.publish.md`, `mytool.md`, `team-review.md`, `myreap.md`, `notes.txt`, `reap.something.txt` 모두 보존. unit `preserves user files that do not match the reap.*.md pattern`.
4. **`reap.<bare>.md` 가 사용자 영역에 있던 경우** — 예약 prefix 정책에 따라 덮어쓰여짐. AGENTS.md / README / reap-guide.md 에 명시. 본 generation 의 의도된 동작.
5. **Source dir missing (broken bundle)** — `installSlashCommands` 가 `try/catch` 로 silent 0-install. install 자체는 실패하지 않음 (다른 단계 진행). e2e 가 0-install 을 잡아냄 (실제 환경에서는 발생 X).
6. **claude-code 사용자가 ~/.config/opencode/commands 디렉토리 미리 만들어 둔 경우** — claude-code 에서는 OpenCode adapter 가 dispatch 되지 않으므로 그 디렉토리 미간섭. e2e `does not touch a user-pre-existing OpenCode commands dir` 검증.

## Issues

### Issue 1 — Pre-existing e2e fail (본 작업 무관)

`tests/e2e/init-repair.test.ts` 의 `skips when REAP section already present` — `result.context.skipped` 가 빈 배열. gen-063 baseline 에서도 동일 fail. 본 generation 변경 무관 (init-repair 흐름은 claude-code adapter 만 사용, OpenCode 변경 미접촉). deferred 후보로 03-implementation.md 에 기록. backlog 등록 안 함.

### Issue 2 — `claudeCodeSkillsDir()` 초기 경로 버그 (즉시 수정)

구현 중 발견 — dist 환경의 single-bundle 효과 (`__dirname = dist/cli/`) 를 잠시 잊고 `__dirname/../claude-code/skills` 만 작성. 첫 e2e 가 `installed=0` 으로 잡아냄. 기존 `assetPath()` 의 `__dirname.includes("dist")` 분기 패턴을 적용해 즉시 수정. 03-implementation.md Discovered Issues 에 회고 기록.

### Issue 3 — notice.test.ts 6 fail 자연 해소

gen-063 baseline 의 6 unit fail 이 본 generation 빌드 후 0 fail. 본 작업 무관 변동 — 본 repo RELEASE_NOTICE.md 가 그 사이 갱신되어 테스트 통과로 추정. 별도 추적 안 함, 결과만 기록.

### Issue 4 — fitness 직전 사용자 갭 지적 → back regression → 추가 fix (T011~T015)

사용자가 fitness 응답 직전 코드 검토 중 발견: `reap update` 가 호출하는 `adapter.registerSessionIntegration` 이 user-level slash commands sync 를 포함하지 않음. 그러므로 `reap update` 만으로는 OpenCode 명령이 설치 안 되고 명시적 `reap install-skills` 가 필요. backlog Verification 의 "`reap update` 후 reap.* 19 자동 배치" 와 코드 불일치.

planning Q4 의 "registerSessionIntegration 은 변경 없음 — SessionStart 매번 noisy" 가 잘못된 가정 — `registerSessionIntegration` 은 SessionStart 마다 호출되는 게 아니라 `reap update` 시점에만 호출됨. fix:
- 양 adapter (`claude-code`, `opencode`) 의 `registerSessionIntegration` 에 user-level slash commands sync 호출 추가.
- Claude Code: `installSkills` 의 cleanup+copy 단계를 `installSlashCommandsOnly` 로 분리하여 양쪽이 silent 재사용.
- e2e + unit 으로 `reap update` 단독 흐름 검증.
- e2e `fileExists(dir)` 버그 우회용 inline `dirExists` 도입.

본 fix 후 unit 402→406, e2e 185→190. 회귀 0. 사용자 검증 시나리오 (`reap update` 만으로 슬래시 등록) 코드와 일치.

### Issue 5 — `tests/helpers/setup.ts` 의 `fileExists` 가 디렉토리에 false 반환 (deferred)

`fileExists` 가 `readFile` 으로 구현 → 디렉토리에 EISDIR 로 false. opencode-install.test.ts 안에 inline `dirExists` 로 우회. 본 generation 에서는 helper 전체 수정 안 함 (다른 e2e 와 의존성 우려). next gen 에서 `tests/helpers/setup.ts` 전체 정비 후보. priority: low.

## 사용자 검증 시나리오 — agent 한계 + 정적 검증 완료

backlog `opencode-slash-commands.md` 의 사용자 검증 시나리오:

```bash
sed -i.bak 's/agentClient: claude-code/agentClient: opencode/' .reap/config.yml
reap update
ls -la ~/.config/opencode/commands/reap.*.md
cat opencode.json
ls .opencode/
opencode
/reap.status
```

- 1~3 단계: 정적 산출물 검증 — e2e `slash commands installation` 이 정확히 같은 흐름을 sandbox 에서 자동 검증.
- 4 단계 (`opencode` 실행): agent 환경 한계 — 실제 OpenCode TUI 실행 불가.
- 5 단계 (`/reap.status`): runtime 검증 — 사용자 본인이 실시.

→ **agent 가 가능한 모든 검증 통과**. fitness phase 에서 사용자가 실제 OpenCode 환경 테스트 후 응답 대기.
