---
id: gen-065-b1b391
type: normal
goal: "resolve #18: backlog 처리 견고화 — --backlog 누락 prompt + consumeBacklog status 누락 fix + 누적 cleanup"
parents: ["gen-064-bb39bb"]
---
# gen-065-b1b391
Goal: Issue #18 + 신규 발견 `consumeBacklog` regex silent fail + 누적 7개 backlog 미archive 세 영역을 한 generation에서 root cause 수준에서 해결.

### Achieved

**Part 1 — `start --backlog` 누락 시 prompt + `--no-backlog` flag (Issue #18 fix)**
- `src/cli/index.ts`: `--no-backlog` boolean option 추가. libs/cli.ts negate option semantics 활용하여 `--backlog` key 공유, tri-state(string|true|false).
- `src/cli/commands/run/start.ts`: create phase 직후 (merge 제외) `!backlogFilename && !noBacklogFlag && pending > 0` → `status: prompt`/`phase: select-backlog` emit + return. idempotent (재호출 시 진행).
- `src/cli/commands/run/index.ts`: signature `string | boolean` 확장.

**Part 2 — `consumeBacklog` 견고화 (silent fail 제거)**
- `src/core/backlog.ts`: 4 케이스 graceful 처리. YAML.parse로 idempotency 판단만 (round-trip 손실 회피), 실제 write는 라인 단위 manipulation으로 사용자 frontmatter 형식 보존. `Promise<void>` → `Promise<ConsumeBacklogResult>` (`"ok" | "already" | "warning"`).
- `start.ts` 호출처: warning을 emitOutput `context.backlogWarning`으로 surface.

**Part 3 — 누적 7개 cleanup**
- shell + node script로 atomic 실행. 매핑 7개 (gen-058 ~ gen-064)는 각 lineage `meta.yml` goal 텍스트로 재검증 후 진행. 각 backlog frontmatter에 `status: consumed` / `consumedBy: <gen-id>` / `consumedAt: <last-commit-ISO>` 추가 + `<gen>/backlog/` 위치로 이동.
- 결과: `.reap/life/backlog/`에 본 backlog 1개만 남음. 각 `lineage/gen-058~064/backlog/<file>` 정확히 1 파일씩.

**Part 5 — 본 backlog dog-fooding 검증**
- 본 backlog는 `reap make backlog`로 생성된 게 아니라 작성됐지만, 작성 시 `status: pending`을 명시 → start phase의 기존 consumeBacklog regex가 매칭하여 정상 consume 처리됨 (consumedBy: gen-065-b1b391, consumedAt: 2026-05-25T15:42:27.315Z). completion commit이 호출되면 `archive.ts:46-61`이 `status: consumed` filter 통과한 본 파일을 `lineage/gen-065-*/backlog/`로 이동.

**Part 6 — 테스트**
- unit `tests/unit/backlog.test.ts`: 6 신규 케이스 + 2 기존 update. consumeBacklog 412 pass / 0 fail (전체 unit).
- e2e `tests/e2e/backlog-start-flags.test.ts`: 8 신규 케이스 (5 describe). 전체 e2e 198 pass / 1 fail (pre-existing init-repair, 회귀 아님).

**Part 7 — 문서**
- `src/templates/reap-guide.md` + `.reap/reap-guide.md` 양쪽 "Starting a Generation — Backlog Selection (Issue #18)" 절 추가 + `reap make backlog` 안내에 status field 보강. diff = 0 (완전 동기화).

### Out of Scope (의도된 미구현)

- **Part 4 — `reap consume backlog` helper 명령**: Learning phase에서 객관 평가 후 미구현 결정. Pro/Con 분석 결과: root cause fix 후 누락 경로 차단 + 1회성 cleanup은 shell 충분 + 사용자 use case 모호. surface area 추가 보류, 향후 실 사용에서 필요성 발견 시 별도 backlog로.