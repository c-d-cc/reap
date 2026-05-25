# Shortterm Memory

## 세션 요약 (2026-05-26)

### gen-065: Backlog 처리 견고화 (Issue #18 + consumeBacklog silent fail + 누적 cleanup)

세 영역을 한 generation에서 root cause 수준에서 해결.

- **Part 1 (Issue #18)**: `start --backlog` 누락 + pending > 0 시 prompt + 명령 중단. `--no-backlog` flag 신설 (commander negate semantics 활용 — `--backlog` key 공유, tri-state). idempotent.
- **Part 2 (silent fail 제거)**: `consumeBacklog` YAML.parse 분석 + 라인 단위 write. 4 케이스 graceful (`status: pending` 있음/없음/이미 consumed/frontmatter 없음). `Promise<void>` → `Promise<ConsumeBacklogResult>`.
- **Part 3 (누적 cleanup)**: 7개 stale backlog (gen-058~064 sourceBacklog) → 각 lineage `<gen>/backlog/` 로 이동. frontmatter에 `status: consumed`/`consumedBy`/`consumedAt` (해당 gen의 마지막 commit timestamp) 추가.
- **Part 4 (helper 명령)**: Learning에서 객관 평가 후 **미구현** 결정 (root cause fix 후 누락 경로 차단됨).
- **dog-fooding**: 본 backlog는 정상 `status: consumed` 마킹 후 completion commit에서 archive 예정.
- **결과**: typecheck/build pass. unit 412/0. e2e 198/1 (pre-existing init-repair, 회귀 아님). reap-guide.md ↔ .reap/reap-guide.md 동기화 완료.

### 다음 세션 / 다음 generation

- **release v0.16.5 후보** (가장 자연스러운 다음 action): gen-061~065 묶음 release. 24+ commits ahead. Issue #16, #17, #18, #19 모두 close 가능.
  - **Issue #18 close 시 본 generation commit message 활용** (parent commit이 reference)
  - Release notes 권장 항목:
    - gen-061 reapdev 사고 근본 원인 해소 (gen-064)
    - 누적 7개 backlog → lineage cleanup (gen-065)
    - backlog UX 견고화: `--no-backlog` 명시 + frontmatter status 자동 보강 (gen-065)
- **사용자가 직접 OpenCode 환경 + 본 generation의 backlog UX 정식 테스트** — release 시점에 진행.

### deferred 후보 (사용자 판단 후 backlog 화)

기존 shortterm 9개 + 신규 2개 (총 11):

1. (기존) `opencode-init-agent-flag` (medium)
2. (기존) `unify-sync-async-knowledge-builder` (small)
3. (기존) `init-repair-skipped-message-fix` (small) — 1 pre-existing e2e fail
4. (기존) `tests/helpers/setup.ts` fileExists 디렉토리 버그 fix (small)
5. (기존) `disable-model-invocation` variant 분리
6. (기존) prefix 충돌 marker 기반 cleanup 강화
7. (기존) OpenCode plugin `tool.execute.after` dump 추가
8. (기존) Codex adapter (큰 트랙)
9. (기존) Evaluator agent 코드 통합
10. **(신규) `reap consume backlog <filename> --gen <id>` helper** — gen-065 미구현. 향후 누락 retroactive 처리 use case 발생 시 검토.
11. **(신규) `reap make backlog` 외 경로로 만든 backlog warn 검토** — validation 단계에서 "backlog frontmatter 형식 부적합" warn 표시 기능.

### Backlog 상태 (gen-065 commit 직후 예상)

- 본 backlog (`backlog-auto-prompt-on-start.md`) — gen-065 consumed → `lineage/gen-065-*/backlog/` 로 archive.
- `.reap/life/backlog/` 비어있을 예정 (pending 0개).
- 누적 7개도 모두 정리 — 적절한 lineage에 위치.

### 코드 변경 위치 (다음 세션이 참조할 수도)

- `src/core/backlog.ts:55-145` — `consumeBacklog` YAML 기반 재작성, `ConsumeBacklogResult` interface 추가
- `src/cli/commands/run/start.ts:10-83, 154-208` — backlog flag normalize + select-backlog prompt + warning surface
- `src/cli/index.ts` — `--no-backlog` option
- `src/cli/commands/run/index.ts` — signature 확장
- `tests/unit/backlog.test.ts:178-301` — 6 신규 case + 2 update
- `tests/e2e/backlog-start-flags.test.ts` — 신규 파일, 5 describe / 8 test
- `src/templates/reap-guide.md` + `.reap/reap-guide.md` — "Starting a Generation — Backlog Selection (Issue #18)" 절

### 메타 교훈 (longterm 후보)

- **Library/CLI option semantics는 실증 우선**: planning Q에서 추론하지 말고 `/tmp/test-*.ts` 같은 minimal repro로 즉시 검증. 본 generation에서 `--backlog`/`--no-backlog` tri-state 동작을 실험으로 사전 확인.
- **YAML round-trip 손실 회피 패턴**: 사용자 frontmatter 형식 보존이 중요한 곳에서는 `YAML.parse` 분석만 + 라인 단위 manipulation 권장. backlog 외에도 향후 다른 .md frontmatter 조작 시 응용.
- **두 버그가 인과로 묶여 있으면 한 묶음으로 처리**: 본 generation은 Issue #18 + consumeBacklog regex + 누적 cleanup을 분리하지 않고 한 묶음 처리. 분리 시 첫 generation이 archive 누락 (Part 2 fix 없음으로) → 두 번째 generation이 cleanup 필요 → 누락이 또 발생 가능. **인과적으로 묶인 작업은 separate 안 됨**.
