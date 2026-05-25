# Completion

## Summary

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

## Lessons Learned

### 잘된 점

1. **두 버그를 한 묶음으로 다루기 결정**: 두 버그가 직접 인과로 묶여 있어 분리 처리 시 어색했을 것. 같은 generation 안에서 root cause 두 곳 모두 fix + 누적 cleanup까지 한 번에. 사용자가 처음 A 옵션 (스코프 통합)을 선택한 게 옳았음.

2. **archive.ts 변경 회피 — root cause 정확히 식별**: 표면적으로는 archive 누락이지만 실제 원인은 frontmatter `status` 필드 부재 → scanBacklog 기본값 `pending` → filter 누락. Part 2 fix가 frontmatter를 보장하면 archive.ts 변경 불요. learning phase에서 archive.ts:46-48을 정확히 짚어내고 implementation 첫 작업으로 확인.

3. **YAML.parse는 분석만, write는 라인 단위**: YAML.stringify의 round-trip 손실 (comment / key 순서 / type 추론) 회피. 7개 cleanup도 같은 알고리즘으로 처리 — 결과 frontmatter 모두 사용자 작성 형식 보존.

4. **libs/cli.ts negate semantics 실험적 검증**: planning에서 `--backlog`와 `--no-backlog`의 key 공유 동작을 추론으로 결정하지 않고 `/tmp/test-cli.ts`로 즉시 실험. tri-state (true / false / string) 확인 후 implementation 진행. **gen-064 longterm memory "Plan 단계에서 함수 caller 를 직접 읽어라" 원칙 응용** — 추론이 아닌 실증.

5. **Part 4 객관 평가 (sycophancy 방지)**: 사용자가 backlog에 Part 4를 명시했지만 "Learning에서 결정"이라고 열어둠. 객관적 Pro/Con 분석 후 미구현 — 추측 기반 surface area 회피.

### 개선 여지

1. **본 backlog dog-fooding의 미묘한 caveat**: 본 backlog는 `reap make backlog`로 생성하지 않고 직접 작성됨 (gen-064 fitness 후 사용자 + agent 대화 중 결정된 scope을 직접 쓰는 게 자연스러웠음). frontmatter에 `status: pending`을 명시했기에 본 generation의 신규 `consumeBacklog` fix 없이도 기존 regex로 정상 처리됨. **즉 본 backlog 자체는 신규 fix의 직접 검증 사례가 아니다** — fix의 검증은 (a) e2e의 "legacy-no-status.md" 테스트, (b) Part 3 cleanup의 7개 file 자체가 담당. dog-fooding으로 검증되는 건 "frontmatter `status:` 정상 명시한 경우 회귀 없음"이라는 더 약한 명제.
   - 더 강한 dog-fooding을 원했다면 본 backlog를 `status:` 없이 작성하고 본 generation에서 자동 추가되는 시나리오로 만들 수도 있었음. 그러나 그건 backlog 작성 의도와 충돌 (사용자가 well-formed backlog를 만들고자 했음). 이번 dog-fooding은 약한 의미로 충분.

2. **e2e 신규 8개의 cleanup 안에서 단계적 검증**: 각 describe 블록이 새 setupProject를 호출하여 시간 cost 발생 (13.3s, 14% 증분). 단일 dir + 여러 backlog test 데이터를 한 번에 setup하면 더 빠를 것. 그러나 isolation이 깨질 위험. 본 변경의 일회성 작업이고 회귀 비용은 무시 가능 — 그대로 둠.

3. **Issue #18 issue body / commit message에 명시 안 함**: backlog 본문에는 `resolves: 18`이 있지만 본 generation의 commit message에 issue 번호를 명시할 계획. 그래야 v0.16.5 release 시 자동 close 가능.

## Next Generation Hints

### Release v0.16.5 (가장 자연스러운 다음 action)

gen-061~065 묶음 release. 24+ commits ahead of origin/main. 사용자가 release 시점에 OpenCode 환경 정식 테스트 + 본 generation의 backlog UX 정식 사용.

**Release notes에 명시 권장**:
- Issue #16 (early-close) — gen-061
- Issue #17 (Knowledge Loading) — gen-062
- Issue #18 (Backlog 처리 견고화) — gen-065
- Issue #19 (OpenCode adapter + slash commands) — gen-063~064
- 부수 성과: gen-061 reapdev 사고 근본 원인 해소 (gen-064)
- 누적 cleanup: 7개 stale backlog → 적절한 lineage로 정리 (gen-065)

### deferred 후보 (사용자 판단 후 backlog 화)

shortterm memory의 기존 항목 + 신규:

1. (기존) `opencode-init-agent-flag` — `reap init --agent opencode` 옵션 (medium)
2. (기존) `unify-sync-async-knowledge-builder` (small)
3. (기존) `init-repair-skipped-message-fix` — 1 pre-existing e2e fail (small)
4. (기존) `tests/helpers/setup.ts` fileExists 디렉토리 버그 fix (small)
5. (기존) `disable-model-invocation` variant 분리
6. (기존) prefix 충돌 보고 시 marker 기반 cleanup 강화
7. (기존) OpenCode plugin `tool.execute.after` dump 추가
8. (기존) Codex adapter (큰 트랙)
9. (기존) Evaluator agent 코드 통합
10. **(신규) `reap consume backlog` helper** — 본 generation에서 미구현. 향후 누락 retroactive 처리 use case 발생 시 검토.
11. **(신규) `reap make backlog`의 status field 강제**: 현재 자동 삽입되지만, 사용자가 Write tool로 직접 만든 경우는 여전히 status 없을 수 있음. consumeBacklog가 graceful 처리하지만, validation 단계에서 "backlog without status" warn 표시 기능 검토.

### Backlog 상태 (commit 직후 기준 예상)

- 본 backlog (`backlog-auto-prompt-on-start.md`) — gen-065 consumed → `lineage/gen-065-*/backlog/`로 archive 예정.
- `.reap/life/backlog/` 비어있을 예정 (pending 0개).

## Change Proposals

### Genome

**변경 없음** — adapt phase 검토 결과:
- **application.md**: 본 generation의 fix는 implementation-level (backlog.ts 견고화, start.ts gate). application.md는 prescriptive principle 담는 곳 — 새 절 불필요.
- **evolution.md "Workaround 금지"**: 본 generation의 silent fail 발견은 정확히 이 원칙의 사례. 이미 명시됨 — 별도 추가 불필요.
- 메타 교훈 3개 (Library/CLI option semantics 실증 / YAML round-trip 회피 / 인과 묶음 처리)는 **longterm memory에 명문화 완료** (reflect phase). genome에 중복 명시는 echo chamber 우려.

→ **본 generation은 genome 변경 제안 없음**. 본질이 code-level fix + 누적 cleanup. 메타 교훈은 longterm memory가 적합한 곳.

### Environment

- `src/core/backlog.ts`의 `consumeBacklog` signature 변경 (`Promise<void>` → `Promise<ConsumeBacklogResult>`) — environment summary의 backlog.ts 설명에 반영 완료 (reflect phase).
- `start.ts` backlog gate 도입 명시 — environment summary 갱신 완료.

### Vision Goals

본 generation은 어떤 vision goal도 직접 달성하지 않음. auto-suggester가 매핑한 "Validation에서 자기 CLI 검증 가능" / "Codex CLI adapter"는 본 generation 작업과 무관 — false positive (auto-mapping 한계). vision/goals.md 변경 없음.

### Backlog

- 없음 (adapt phase에서 생성 금지 — genome 원칙).
- next generation hints에 모든 deferred 후보 11개 명시. 사용자 판단 후 backlog 화.

## Project Diagnosis

- **Core functionality**: REAP의 generation lifecycle은 64+ generation 동안 stable. 본 generation으로 backlog 처리의 마지막 silent failure mode 제거. core lifecycle은 ready.
- **Architecture stability**: file-based state + transition graph + nonce 시스템 안정. multi-client adapter (claude-code + opencode) 패턴 확립.
- **Modularity**: src/core/, src/cli/, src/adapters/ 명확 분리. 본 generation은 backlog.ts, start.ts에 한정된 변경 — modularity 유지.
- **Error handling**: emitOutput / emitError JSON 구조. 본 generation으로 backlog silent fail 제거 → `ConsumeBacklogResult` 반환 패턴이 다른 silent failure mode를 찾는 데도 응용 가능.
- **Test coverage**: unit 412, e2e 198, 1 pre-existing fail. 본 generation 6 unit + 8 e2e 신규. backlog 처리 영역 강화.
- **Documentation**: reap-guide.md (template + project sync) + application.md + evolution.md + environment summary 모두 유지보수됨. 본 generation에서 "Starting a Generation — Backlog Selection" 절 신규.
- **Security**: nonce 기반 transition 무결성, supply chain 최소화 (yaml 1 production dep). 본 generation 변경은 security 영역 무관.
- **Performance**: bundle 0.55MB single file. YAML.parse 호출 추가는 backlog 1개당 <1ms — 무시 가능.
- **Deployment readiness**: gen-061~065 묶음 v0.16.5 release 준비. 24+ commits ahead. Issue #16/17/18/19 모두 close 가능.
- **Code quality**: ESM modules, async/await, JSON stdout 일관. 본 generation 신규 코드 모두 기존 패턴 준수.
- **User experience**: backlog 사용 시 silent skip 위험 제거 — `reap run start`가 명확한 의사결정 강제. AI agent의 명령 재호출 비용 minimal.
- **Visual verification**: CLI tool — N/A.
- **Integration layer**: claude-code + opencode 두 client 모두 검증됨 (gen-064 시점). 본 generation은 integration layer 무관.
- **Domain maturity**: generation lifecycle / nonce / archive / lineage 모두 안정. backlog 처리도 본 generation으로 견고화 완료.
- **Governance compliance**: genome immutability, workaround 금지, echo chamber 방지, dog-fooding sync — 본 generation 모두 준수. 특히 Part 4 객관 평가는 sycophancy 방지 원칙의 실증.
- **Genome stability**: gen-001~065 동안 genome 점진 보강만, breaking change 없음. invariants.md는 거의 불변.
