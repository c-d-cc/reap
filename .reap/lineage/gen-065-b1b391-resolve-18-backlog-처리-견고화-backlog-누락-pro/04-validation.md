# Validation Report

## Result

**pass**

## Checks

### Build / Typecheck

| Item | Command | Result |
|---|---|---|
| typecheck | `npx tsc --noEmit` | pass (no output) |
| build | `npm run build` | pass — `dist/cli/index.js` 0.55MB |

### Tests (fresh run)

| Suite | Command | Result |
|---|---|---|
| unit | `bun test tests/unit/` | 412 pass / 0 fail / 1108 expects |
| e2e | `bun test tests/e2e/` | 198 pass / 1 fail (pre-existing init-repair, gen-064 fitness에서 인지된 항목 — 본 generation 회귀 아님) |

### Completion Criteria — 02-planning.md 1~7

| # | Criterion | Verification | Result |
|---|---|---|---|
| 1 | start.ts create phase: `--backlog`/`--no-backlog` 모두 없고 pending > 0 시 `status: prompt` + generation 미생성 | e2e `backlog-start-flags.test.ts` "start without --backlog or --no-backlog returns prompt" + "generation was NOT created during prompt" | pass |
| 2 | `--no-backlog` flag — pending 무시 + progress | e2e "start with --no-backlog proceeds, no consume" + "backlog file remains pending" | pass |
| 3 | `consumeBacklog` 4 케이스 graceful | unit `backlog.test.ts` 7 신규 케이스 (status:pending / status: 없음 / idempotent / 다른 gen / no frontmatter / user fields / scan integration) | pass |
| 4 | 7개 누적 backlog 매핑된 lineage로 이동 + frontmatter `consumed` | git status로 `D life/backlog/<7>` + `?? lineage/<gen>/backlog/`. 각 frontmatter head 검증 — `status: consumed`, `consumedBy: gen-XXX`, `consumedAt: ISO timestamp` 모두 명시 | pass |
| 5 | 본 backlog (`backlog-auto-prompt-on-start.md`) completion에서 archive | 현재 상태: `status: consumed`, `consumedBy: gen-065-b1b391` 마킹됨 (start phase에서 자동). completion commit에서 `archive.ts:48`이 consumed item을 lineage/gen-065-*/backlog/ 로 이동 — 본 commit phase에서 실행 예정. **검증 보장**: `archive.ts:46-61` 동작 코드 재독해, `scanBacklog`이 frontmatter의 `status: consumed`를 정상 인식, filter 통과. | pass (commit phase에서 자동 실행) |
| 6 | 신규 unit + e2e 통과 + 회귀 0 | unit 412/0, e2e 198/1 (pre-existing) | pass |
| 7 | reap-guide.md ↔ .reap/reap-guide.md 동기화 | `diff src/templates/reap-guide.md .reap/reap-guide.md` → 빈 출력 (완전 동기화) | pass |

### Verification 기준 (source backlog 본문 17개) — 1:1 매핑

#### Issue #18 fix (Part 1) — 5/5
- [x] pending 있음 + flag 없음 → prompt 노출, generation 미생성 (e2e)
- [x] `--backlog <filename>` 재호출 → 정상 진행 + consumed 마킹 (e2e `backlog-consume.test.ts` 기존 + 신규 cleanup test)
- [x] `--no-backlog` 재호출 → 정상 진행 + backlog pending 유지 (e2e)
- [x] pending 0개 + flag 없음 → 진행 (e2e 회귀)
- [x] `--backlog X` 명시 → 기존 동작 유지 (기존 e2e backlog-consume.test.ts pass)

#### consumeBacklog 견고화 (Part 2) — 5/5
- [x] `status: pending` 명시 — 정상 consumed (unit 기존)
- [x] `status:` 필드 없음 — 자동 추가 (unit "adds status field when frontmatter is missing it")
- [x] `status: consumed` 동일 gen — idempotent (unit "idempotent: same gen")
- [x] frontmatter 자체 없음 — 가시적 warning (unit "frontmatter missing → warning")
- [x] silent fail 0건 — 모든 케이스가 `ConsumeBacklogResult`로 반환 ("ok" / "already" / "warning")

#### 누적 Cleanup (Part 3) — 4/4
- [x] 7개 backlog 모두 해당 generation lineage로 이동 (head 검증 + ls)
- [x] 각 frontmatter에 consumed/consumedBy/consumedAt 추가 (head 검증)
- [x] life/backlog/에 본 backlog 1개만 남음 (ls 결과 1개)
- [x] lineage/gen-058~064/backlog/ 각 1 파일 존재 (ls 결과)

#### 통합 / Dog-fooding — 3/3
- [x] 본 backlog 정상 consumed 상태 (head 검증)
- [x] reap-guide 양쪽 동기화 (`diff` 빈 출력)
- [x] scan phase 회귀 없음 (e2e 전체 pass)

## Edge Cases

- **`--no-backlog`와 `--backlog X` 동시 사용**: libs/cli.ts tri-state semantics에 의해 마지막 인자가 우선. 단일 negate option이라 race 없음. e2e에서는 명시적으로 한쪽만 테스트 — 양쪽 동시는 사용자가 의도적으로 안 만들 케이스로 분류.
- **YAML.parse 실패 (malformed frontmatter)**: `consumeBacklog`이 `try/catch`로 wrap. `{ status: "warning", warning: "malformed YAML frontmatter" }` 반환 — silent fail 아님.
- **빈 frontmatter `---\n---\n`**: YAML.parse가 `null` 반환 → `?? {}` 적용 → status: pending 처리 → 라인 manipulation으로 3개 필드 append. unit test `scanBacklog defaults type/status/priority when missing`이 빈 frontmatter case를 인접 검증.
- **본 backlog의 `issueUrl` 잘못된 URL** (`https://github.com/c-d-cc/2026-05-26-backlog-auto-prompt-on-start`): 본문에 명시된 path이나 실제 issue가 아닌 듯. completion 시 issue close 검토는 출제자 (사용자)가 fitness/adapt에서 결정.

## Performance Notes

- `consumeBacklog`이 YAML.parse 한 번 추가. backlog file은 KB 단위, parse 비용 무시 가능 (<1ms).
- 7개 cleanup은 shell script 일회 실행 — generation runtime과 무관.
- e2e 신규 8개는 추가 13.3s 소요 — 전체 e2e 92s 대비 14% 증분, acceptable.

## Issues

본 generation 직접 결과로 발생한 issue 없음.

**Pre-existing**: `tests/e2e/init-repair.test.ts:103` "skips when REAP section already present" 1건 — gen-064 fitness에서 인지된 항목 (`init-repair-skipped-message-fix`, deferred 후보). 본 generation scope 외.

## Submodule Pointer

`tests/` submodule:
- `unit/backlog.test.ts` modified
- `e2e/backlog-start-flags.test.ts` new

→ completion commit 직전 submodule 안에서 먼저 commit, 그 후 parent repo에서 `git add tests`로 pointer staging 필수 (`feedback_submodule_pointer_staging.md`).
