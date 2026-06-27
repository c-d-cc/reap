# Shortterm Memory

## 세션 요약 (2026-06-27)

### gen-068: daemon 통합 강화 — config opt-in + lifecycle 자동 인덱싱 + agent 지시문 + commit staleness 노출

backlog `daemon-mcp-server-interface-추가-ai-agent가-코드-지식-직접-쿼리-가능.md` 의 5 항목 중 4 항목 (config opt-in / agent 지시문 / 인덱스 갱신 시점 / commit staleness check) 완료. 항목 5 (MCP server interface) 는 명시적 다음 generation 이월.

- **Part 1 (config opt-in)**: `ReapConfig.daemon?: boolean` 신설. 미설정 시 기존 사용자 회귀 0. JSDoc 명시.
- **Part 2 (4 lifecycle 진입점 게이트)**: `start.ts` (create 직후) / `learning.ts` (work) / `implementation.ts` (complete auto-transition 직후) / `completion.ts` (commit) 가 `config?.daemon === true` 시 dynamic import 후 `ensureRegistered` + `triggerIndexing`. 함수 자체에 config inject 하지 않고 호출 측 게이트 — daemon 미사용 사용자는 모듈 로드도 안 함 (dynamic import 효과). silent fail 도 그대로 존속 → 게이트 + 내부 fallback 2단 안전망.
- **Part 3 (daemon `lastIndexedCommit` 노출)**: `ProjectEntry.lastIndexedCommit?: string | null` + `register` null 초기화 + `updateLastIndexed(id, commit?)` 시그니처 확장. `PipelineResult.lastCommit?` 4 path (full/incremental/no-change/concurrent-guard) 모두 반환. `api/projects.ts` index handler 가 registry 에 전달.
- **Part 4 (static knowledge daemon 절)**: `buildDaemonStaticSection()` export 신설. async (`load-context.ts`) / sync (`dump-state-sync.ts`) 양 builder 동일 helper 호출 → byte-identical 보장. readiness probe 의도적 제외 (sync 환경 제약 + caller 위임).
- **Part 5 (agent prompt daemon 절)**: `buildBasePrompt` 가 `config?.daemon === true` 시 "Code Intelligence (Daemon)" 절 추가. 단계별 활용 + 정체성 검사 protocol + fallback 명시.
- **Part 6 (reap-guide + agent 템플릿 갱신)**: template + 양 reap-guide.md (`~/.reap/`, `.reap/`) sync. `reap-evolve.md` 의 daemon 단계별 지시, `reap-evaluate.md` Phase 2 Verification 5번 (impact 분석, silent skip).
- **Part 7 (dog-fooding)**: `.reap/config.yml: daemon: true` 활성화 — 본 generation 의 validation/completion 호출이 자기 변경의 첫 사용자.

**결과**: typecheck/build pass. unit 427/0. e2e 218/1 (pre-existing init-repair). scenario 35/5 (pre-existing multi-generation, gen-065 fix 이후 update 안 된 sandbox). 본 generation 회귀 0.

### 다음 세션 / 다음 generation 후보

**1. MCP server interface (백로그 항목 5 잔여)** — daemon 의 코드 지식을 표준화된 protocol (Model Context Protocol) 로 노출. claude-code / opencode 양 client 가 같은 형식으로 query. design 문서 후보 (`vision/design/daemon-mcp.md`). adapter 트랙 (gen-063~064) 의 4-항목 verification 체크리스트 적용.

**2. Release v0.16.7 검토** — gen-066~068 묶음 (evaluator end-to-end + daemon opt-in). gen-066~067 의 evaluator 변경분이 release 전인 상태에서 gen-068 가 진행됐으므로 묶어서 v0.16.7 가능. Release notes 권장 주제:
- Evaluator end-to-end (gen-066~067): validation + fitness + cruise abort.
- Daemon opt-in 통합 (gen-068): config flag + lifecycle 자동 인덱싱 + agent 지시문 + commit staleness 노출.

**3. Vision/Goal management 위임** — evaluator 트랙의 마지막 큰 항목 (gen-067 shortterm 에서 이월). adapt phase 에서 evaluator 가 vision goals.md ↔ 최근 lineage 의 gap 분석 → 다음 goal 후보 추천. daemon 통합 완료된 지금이 자연스러운 다음 step.

**4. Scenario / e2e 테스트 sync 누락 정리** — `tests/scenario/multi-generation.test.ts` 5건 (gen-065 fix 이후 update 안 됨) + `tests/e2e/init-repair.test.ts` 1건 (gen-067 deferred 후보 3번). 묶어서 작은 generation.

### deferred 후보 (사용자 판단 후 backlog 화)

기존 16 (gen-067 shortterm) + 신규 5:

기존 (간단 list):
1. `opencode-init-agent-flag`
2. `unify-sync-async-knowledge-builder`
3. `init-repair-skipped-message-fix` (1 pre-existing e2e fail)
4. `tests/helpers/setup.ts fileExists` 디렉토리 버그 fix
5. `disable-model-invocation` variant 분리
6. prefix 충돌 marker 기반 cleanup 강화
7. OpenCode plugin `tool.execute.after` dump
8. Codex adapter (큰 트랙)
9. Evaluator agent 코드 통합 — fitness + cruise 완성 (gen-067). 잔여 vision/goal 위임이 마지막 큰 항목.
10. `reap consume backlog <filename> --gen <id>` helper
11. `reap make backlog` 외 경로로 만든 backlog warn
12. TS `noUnusedLocals` / `noUnusedParameters` 옵션 활성화 검토
13. validation prompt 의 fallback 절 "Agent tool 부재" 케이스 명시 강화
14. `evaluatorConcerns` 중복 detection 경고
15. `report-evaluator` 의 resolve/dismiss CLI (cross-generation 이월 시)
16. 테스트 레벨 선택 휴리스틱 명문화 (gen-067 의 unit→e2e 재분류)

**신규 (gen-068)**:
17. **MCP server interface** (큰 트랙 — 다음 generation 1순위 후보).
18. **`tests/scenario/multi-generation.test.ts` gen-065 fix sync** — `--no-backlog` 명시 또는 sandbox setup 단계의 pending backlog 정리.
19. **daemon `storage.ts` 의 `bun:sqlite` 타입 정리** — `@types/bun` 설치 또는 conditional import 분기 (gen-052 이후 누적 noise).
20. **자동 staleness 판단으로 자동 reindex** — 본 generation 은 `lastIndexedCommit` 노출까지만. CLI 가 자동 비교 + reindex 트리거 흐름은 향후.
21. **Daemon 통합 verification 4-항목 체크리스트** — application.md 의 adapter 4-항목과 유사하게 "외부 도구 / 데이터 인덱싱 통합" 시 (a) opt-in flag (b) lifecycle 진입점 게이트 (c) static knowledge 절 (d) agent prompt 지시. 명문화 검토.

### 본 generation 의 self-evolving 작동 사례

- **gen-066 패턴 재사용 — self-dogfooding 시점 의도적 선택**: T016 (`config.yml: daemon: true`) 을 implementation 의 마지막 task 로 배치. 본 generation 의 validation/completion 호출이 자기 변경의 첫 사용자. evaluator 트랙 (gen-066) 과 같은 패턴.
- **gen-064 패턴 재사용 — sync/async 양 builder 같은 helper 호출**: `installSkills` / `registerSessionIntegration` 양쪽 helper 호출 (gen-064) 과 동일하게 `buildDaemonStaticSection()` 을 양 builder 가 공유. byte-identical 보장.
- **gen-066 longterm "Builder manual workflow 시 subagent 권한 부재" 케이스 재현**: 본 generation 의 builder 가 `npx reap run validation` 직접 호출 환경 → Task tool 미보장. validation prompt 의 fallback 절이 자연스럽게 작동 → lifecycle 진행 중단 0.

### 코드 변경 위치 (다음 세션 참조용)

- `src/types/index.ts` — `ReapConfig.daemon?: boolean` (JSDoc 회귀 안전 명시)
- `src/cli/commands/run/start.ts` — create 직후 daemon gate
- `src/cli/commands/run/learning.ts` — work phase daemon gate
- `src/cli/commands/run/implementation.ts` — complete (auto-transition 직후) daemon gate
- `src/cli/commands/run/completion.ts` — commit phase daemon gate
- `src/cli/commands/load-context.ts` — `buildDaemonStaticSection()` import + 호출
- `src/core/dump-state-sync.ts` — `buildDaemonStaticSection()` export + 자기 호출
- `src/core/prompt.ts` — `buildBasePrompt` 의 daemon 절
- `src/templates/reap-guide.md` — "Code Intelligence (Daemon)" 섹션
- `src/templates/agents/reap-evolve.md` — daemon 단계별 활용
- `src/templates/agents/reap-evaluate.md` — Phase 2 Verification 5번
- `.reap/reap-guide.md`, `~/.reap/reap-guide.md` — template sync (cp)
- `.reap/config.yml` — `daemon: true` 활성화
- daemon: `src/types.ts` / `src/registry.ts` / `src/indexer/pipeline.ts` / `src/indexer/index.ts` / `src/api/projects.ts` — `lastIndexedCommit` 관련

### Backlog 상태 (gen-068 commit 직후 예상)

- `daemon-mcp-server-interface-추가-ai-agent가-코드-지식-직접-쿼리-가능.md` — gen-068 consumed → `lineage/gen-068-*/backlog/` 로 archive.
- `.reap/life/backlog/` 비어있을 예정 (pending 0개).
