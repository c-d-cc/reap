# Completion

## Summary

**Goal**: daemon 통합 강화 — config opt-in, agent 지시문, 인덱스 갱신 시점, 생명주기 관리, commit hash staleness check.

**Result**: backlog 의 5 항목 중 4 항목 (1: config opt-in / 2: agent 지시문 / 3: 인덱스 갱신 시점 / 4: commit hash staleness 노출) 모두 구현 및 검증 완료. 항목 5 (MCP server interface) 는 명시적으로 다음 generation 으로 이월 — 새 backlog 후보로 adapt 단에서 별도 검토. 본 generation 회귀 0 (typecheck/build/unit/e2e 의 본 변경 관련 fail 없음).

### Key Changes

1. **`ReapConfig.daemon?: boolean`** — opt-in flag. 미설정 시 기존 사용자 회귀 0 보장 (JSDoc 명시).
2. **4 lifecycle 진입점 게이트** — `src/cli/commands/run/{start,learning,implementation,completion}.ts` 가 `config?.daemon === true` 시 dynamic import 후 `ensureRegistered` + `triggerIndexing`.
3. **daemon `lastIndexedCommit` 노출 + pipeline 4 path 일관 반환** — `ProjectEntry.lastIndexedCommit?: string | null`, `register` null 초기화, `PipelineResult.lastCommit?` 4 path (full/incremental/no-change/concurrent-guard) 모두 반환, index handler 가 registry 에 전달.
4. **Static knowledge daemon 절** — `buildDaemonStaticSection()` 신설, sync(`dump-state-sync.ts`) / async(`load-context.ts`) 양 builder 동일 helper 호출. byte-identical 유지.
5. **agent prompt daemon 절** — `buildBasePrompt` 가 `config?.daemon === true` 시 "Code Intelligence (Daemon)" 절 추가. 사용자 fallback (daemon down / opt-out) 명시.
6. **reap-guide + agent 템플릿 갱신** — template + 양 reap-guide.md sync. `reap-evolve.md` 에 단계별 활용, `reap-evaluate.md` 에 Phase 2 Verification 5번 항목 추가 (impact 분석, silent skip 명시).
7. **dog-fooding** — `.reap/config.yml: daemon: true` 활성화. 본 generation 의 validation/completion 호출이 자기 자신을 첫 사용자로 검증.

### Verification Outcome

- typecheck (메인): pass.
- build (메인): pass — 0.57 MB / 150 modules / 8 ms.
- unit: 427 / 0.
- e2e: 218 pass / 1 fail (pre-existing init-repair, 회귀 0).
- scenario: 35 pass / 5 fail (pre-existing multi-generation; gen-065 fix 이후 update 안 된 sandbox 시나리오, 회귀 0).

## Lessons Learned

### 잘된 점

1. **Self-dogfooding 시점 의도적 선택 (gen-066 패턴 재사용)** — T016 (`config.yml: daemon: true`) 을 implementation 의 마지막 task 로 배치하여 본 generation 의 validation/completion 호출이 자기 변경의 첫 사용자가 됨. evaluator 트랙 (gen-066) 과 같은 패턴이 daemon 트랙에서도 그대로 작동.

2. **함수 자체에 config 를 inject 하지 않고 호출 측 게이트 패턴 선택** — `triggerIndexing` / `ensureRegistered` 시그니처는 그대로. 호출 측 4곳이 각각 `config?.daemon === true` 체크 후 dynamic import. 함수 내부 silent fail 도 그대로 존속 → 게이트 + 내부 fallback 의 2단 안전망. daemon 미사용 사용자는 모듈 로드 자체도 안 함 (dynamic import 효과).

3. **양 builder byte-identical 보장을 위해 `buildDaemonStaticSection` helper 분리** — sync 빌더가 readiness probe (`/health` fetch) 를 표현 불가능한 제약을 인정하고, 양 빌더가 동일한 static 절만 emit 하도록 설계. readiness 판단은 caller (subagent / agent prompt) 에 위임. gen-064 의 `installSlashCommands` / `installSkills` 양쪽 helper 호출 패턴과 동일.

4. **subagent 권한 부재 환경 fallback** — manual `npx reap run validation` 환경에서 Task tool 미보장. validation prompt 의 fallback 절 ("Agent tool 부재 시 통상 진행") 가 자연스럽게 작동 → lifecycle 진행 중단 0. gen-066 longterm 의 advisor 원칙이 또 한 번 보호 막으로 기능.

### 개선할 점

1. **scenario 테스트가 gen-065 fix 이후 업데이트 안 됨** — `tests/scenario/multi-generation.test.ts` 가 `reap run start --goal "..."` 호출 시 `prompt` 반환을 예상하지 않음. gen-065 의 Issue #18 fix 가 scenario layer 까지 mirror 되지 않은 사례. 본 generation 의 5 scenario fail 의 직접 원인. 다음 generation 의 hint 로 명시.

2. **daemon `storage.ts` 의 pre-existing TS error 2건** — `bun:sqlite` 모듈 타입 / globalThis index. gen-052 commit 이후 누적된 noise. daemon 작업 시 typecheck 가 신호로 활용 안 되는 상태. 본 generation 의 daemon 변경분 검증에는 무관했지만, 향후 daemon 측 변경이 잦아지면 cleanup 필요.

3. **시작 단계 stash 실수** — validation 단계에서 우리 변경분이 scenario fail 의 원인인지 확인하려고 `git stash` 를 시도. 시스템 리마인더가 즉시 알려준 덕분에 `stash pop` 으로 복원. 교훈: **debug 목적의 stash 시도 전에 변경된 파일 list 와 fail 의 인과 매칭을 먼저 확인**. multi-generation scenario 가 `run start` 게이트 prompt 를 받는 것은 gen-065 변경 (보존된 git log 로 즉시 확인 가능) 이라 stash 없이도 결정 가능.

## Next Generation Hints

### 자연스러운 다음 후보

1. **MCP server interface (백로그 항목 5 잔여)** — 본 generation 에서 명시적으로 제외. AI agent 가 daemon 의 코드 지식을 표준화된 protocol 로 조회. claude-code / opencode 양 client 가 같은 형식으로 query. design 문서 후보 (`vision/design/daemon-mcp.md`). adapter 트랙 (gen-063~064) 의 4-항목 verification 체크리스트 적용.

2. **scenario 테스트 보강** — `tests/scenario/multi-generation.test.ts` 의 gen2 start 호출에 `--no-backlog` 명시 또는 sandbox setup 단계의 pending backlog 정리. gen-067 shortterm 의 deferred 후보 3번 (`init-repair-skipped-message-fix`) 과 함께 묶어서 "테스트 시나리오 sync 누락" 트랙으로 처리 검토.

3. **자동 staleness 판단으로 자동 reindex** — 본 generation 은 daemon 측 `lastIndexedCommit` 노출까지만. CLI 가 자동으로 git HEAD 와 비교해 reindex 트리거하는 흐름은 향후. 단순 노출만으로 agent prompt 에서 staleness 판단 가능하므로 현재로는 충분. trigger 자동화는 사용자 패턴 관찰 후 결정.

4. **daemon `storage.ts` 의 `bun:sqlite` 타입 에러 정리** — `@types/bun` 설치 또는 conditional import 분기. 작은 generation 으로 묶기 좋은 항목.

5. **Vision/Goal management 위임 (evaluator 트랙 마지막 큰 항목)** — gen-067 shortterm 에서 이월된 hint. daemon 통합이 완료된 지금이 자연스러운 다음 step. adapt phase 에서 evaluator 가 vision goals.md ↔ 최근 lineage 의 gap 분석 → 다음 goal 후보 추천.

### Release 후보

- gen-068 단독 release 보다 gen-066~068 묶음 (evaluator + daemon) 으로 v0.16.7 검토.
- Release notes 권장 주제:
  - Evaluator end-to-end (gen-066~067): validation + fitness + cruise abort.
  - **Daemon opt-in 통합 (gen-068)**: config flag + lifecycle 자동 인덱싱 + agent 지시문 + commit staleness 노출.

## Change Proposals

### Genome 후보 (adapt phase 처리)

- **application.md**: "Adapter Layer" 의 4-항목 verification 표 옆에 "Code Intelligence 도구 통합 시 적용 가능" 절 한 줄 추가 검토. daemon 도 사실상 외부 도구 통합의 한 사례.
- **evolution.md**: "사용자 UX gap" 절에 "도구 통합 시 자동 호출 지점은 agent prompt 의 지시 + 호출 측 게이트 2단으로" 추가 검토.
- **environment/summary.md**: 본 generation 의 신규 helper / 게이트 진입점을 reflect 단계에 부분 갱신 (Memory 업데이트 시 동시 처리).

### Backlog 후보 (adapt phase 에서 인간 판단)

- daemon MCP server interface (백로그 항목 5 잔여, 큰 트랙).
- scenario 테스트 sync 누락 트랙.
- daemon `bun:sqlite` 타입 정리.
- 자동 staleness 판단 + 자동 reindex.

(adapt phase 에서 `reap make backlog` 호출은 금지 — text 만으로 next-generation hint 기록.)

## Project Diagnosis — Software Completion Criteria

embryo mode 의 본 generation 결과를 16 criteria 에 대해 정성 평가. 점수 없이 현재 상태만 기술.

- **1. Core functionality**: REAP 자체의 lifecycle, nonce 검증, 양 adapter (claude-code / opencode) 모두 안정 동작. 본 generation 의 daemon 통합도 정상 게이트 확인 (self-dogfooding). evaluator agent end-to-end (gen-066~067) 검증 완료. 핵심 기능 안정.
- **2. Architecture stability**: 5-stage lifecycle / transition graph nonce / adapter dispatcher / 정적-동적 knowledge 분리 (gen-062) / opt-in feature flag 패턴 (evaluator, daemon) 등 핵심 architecture 안정화. 본 generation 의 daemon opt-in 도 evaluator (gen-066) 와 동형이라 architectural pattern 일관.
- **3. Modularity**: core / cli / adapters / templates 명확 분리. helper 분리 (`buildDaemonStaticSection`, `installSlashCommands`, `installAgents`) 패턴 정착. dynamic import 로 호출 측 게이트 — 미사용 path 의 cold-load.
- **4. Error handling**: `emitError` + JSON exit code 0 패턴 일관. daemon down / opt-out 시 silent skip + 게이트 2단 안전망. evaluator subagent 호출 실패 시 fallback 절. 의도된 결정.
- **5. Test coverage**: unit 427 / e2e 218 / scenario 35 (5 pre-existing fail — gen-065 fix sync 누락). 신규 feature 와 함께 테스트 추가하는 evolution.md 원칙 지속. 본 generation 은 e2e 미추가 (호출 측 게이트 + helper 호출 위주, scenario 가 자연스러운 검증이지만 pre-existing fail 로 인해 별도 묶음 필요).
- **6. Documentation**: README + AGENTS.md + reap-guide + 양 client docs sync 정착. 본 generation 도 reap-guide template + agent 템플릿 (evolve / evaluate) + 양 reap-guide.md sync. dog-fooding 자동화 정착.
- **7. Security**: zero-dependency CLI (yaml v2 만 production dep) — supply chain 최소화. signature-based nonce — stage skip / replay 방지. SHA256. 충분.
- **8. Performance**: bundle 0.57 MB / 150 modules / build 8 ms. daemon 통합도 dynamic import 라 미사용 사용자 cold path. 충분.
- **9. Deployment readiness**: npm 배포 가능. postinstall + autoUpdate 정착. release notice 메커니즘 (`fetchReleaseNotice`) 검증됨. 본 generation 묶음 (gen-066~068) v0.16.7 release 후보.
- **10. Code quality**: pattern-first + consistency over preference + no duplication 원칙 정착. 본 generation 도 unused import + unreachable return 정리 (T017) — pattern alignment.
- **11. User experience**: 4-항목 verification (static load / dynamic refresh / entry-point / slash trigger) 도구 통합 시 적용. 본 generation 의 daemon 도 agent prompt + reap-guide + static knowledge 모두 sync — 사용자가 별도 설정 없이 `daemon: true` 만으로 활성화.
- **12. Visual verification**: N/A (CLI tool).
- **13. Integration layer**: daemon HTTP API + git child_process + npm registry 호출 등 외부 통합 모두 graceful fallback. 본 generation 의 daemon 통합도 silent skip 안전망.
- **14. Domain maturity**: REAP 의 lifecycle / genome / vision / lineage / memory 개념 모두 코드 + docs 매핑. environment/summary.md 가 source structure 와 함께 maintenance. 본 generation 도 reflect 에서 environment 부분 갱신.
- **15. Governance compliance**: workaround 금지 + 정량적 fitness 금지 + adapt phase backlog 금지 + lifecycle 준수 등 원칙 모두 자기 적용. 본 generation 도 fitness 단에서 정량 점수 미부여, adapt 단에서 backlog 미생성, lifecycle 단계 순서 준수.
- **16. Genome stability**: gen-068 시점 67 generations 진행. application.md / evolution.md 큰 변경 빈도 감소세. 본 generation 도 환경/summary 변경만 있고 genome 변경 0. 안정 추세.

### Embryo → Normal 전환 검토

- Genome modification frequency: 최근 generations (gen-061~068) 에서 application.md / evolution.md 변경은 새 트랙 추상화 (4-항목 verification, installSkills/registerSessionIntegration 책임 표) 위주 — 큰 재설계 0. 빈도 감소.
- Application.md stability: REAP 핵심 정체성, 아키텍처 layer, adapter pattern, 메타 정/동 분리 모두 명문화 완료. 안정.
- Abort frequency: 최근 abort 거의 없음 (gen-052 이후). early-close (gen-061 도입) 도 사용된 사례 미관찰.
- Vision/goals clarity: vision/goals.md 의 미완료 항목 8 / 12 → clear actionable items. 단, daemon 트랙은 goals.md 에 명시되지 않은 채 midterm memory 로 추적됨 — goals.md 의 forward-looking 역할 검토 필요.

**권고**: 전환 조건은 4개 모두 충족. 그러나 midterm memory 의 사용자 판단 (2026-03-26): "REAP 자체가 아직 완성 단계가 아니고 예상치 못한 genome 변경이 더 있을 수 있으므로 embryo 유지" 가 본 generation 까지 그대로 적용. 단, 6개월 가까이 안정세이므로 다음 generation 에서 사용자 재확인 추천. **본 generation 에서는 embryo 유지 — 단, vision/goals.md 에 daemon 트랙을 명시 추가하면 forward-looking 정합도 향상** (next-generation hint).

## Vision Goals Reconciliation

CLI auto-match 가 제안한 3 항목 — Codex CLI adapter / Validation에서 자기 CLI 검증 / Vision/Goal/Memory 위임 — 은 모두 **본 generation 의 실제 작업 (daemon 통합) 과 직접 매칭되지 않음 (거짓 양성)**. CLI auto-match 는 키워드 기반이라 본 generation 의 daemon 트랙을 잡지 못함 (vision/goals.md 에 daemon 트랙이 명시되지 않은 결과). **`vision/goals.md` 의 [x] 마킹 0 항목** — 잘못된 마킹 회피.

대신 다음 generation hint:
- vision/goals.md 에 **Daemon (Code Intelligence)** 새 섹션 추가 검토 — current items: (i) opt-in 통합 [x] (gen-068), (ii) MCP server interface [ ] (백로그 항목 5), (iii) 자동 staleness reindex [ ]. midterm 의 daemon 트랙을 vision 으로 승격하면 future generation 이 goal-driven 으로 picked.

이 변경은 본 adapt phase 에서 자동 적용하지 않음 (vision 은 사용자 검토 영역). 사용자가 next session 에서 결정.

## Next Generation Hints (확장)

본 reflect 단의 hint 외, adapt 단에서 추가로:

### 우선순위 정렬 (사용자 검토)

1. **Release v0.16.7** (실행 가능, 즉시) — gen-066~068 묶음. evaluator end-to-end + daemon opt-in 통합. CHANGELOG/RELEASE_NOTES 작성 + tag + publish.
2. **MCP server interface** (다음 generation 1순위 — 백로그 항목 5 잔여, 큰 트랙). adapter 트랙 (gen-063~064) 의 4-항목 verification 체크리스트 적용. claude-code / opencode 양 client 가 같은 protocol 로 daemon query. design 문서 (`vision/design/daemon-mcp.md`) 필요.
3. **Vision/Goal management 위임** (evaluator 트랙 마지막 큰 항목 — gen-067 shortterm 에서 이월). adapt phase 의 vision update 를 evaluator 에 위임.
4. **Scenario / e2e 테스트 sync 누락 정리** — 작은 generation. scenario 5건 + e2e 1건. backlog 후보 18 + 3 (gen-067) 묶음.
5. **vision/goals.md 의 Daemon 섹션 추가** — 위 reconciliation 의 후속 작업. 작은 단위로 1~2 task.

### Genome 추상화 후보 (사용자 검토 후 다음 generation)

- **application.md** 에 "외부 도구 / 데이터 인덱싱 통합 4-항목 verification" 추가 검토: (a) opt-in flag (b) lifecycle 진입점 게이트 + dynamic import (c) static knowledge 절 (sync/async 양 builder) (d) agent prompt 지시. application.md 의 adapter 4-항목과 형제 패턴. backlog 후보 21번.
- **evolution.md** 에 "Debug 목적의 stash 시도 전 — 인과 매칭 먼저" 절 추가 검토 (gen-068 longterm 의 새 교훈을 evolution.md 로 승격할지). 또는 longterm 만으로 충분한지 사용자 판단.

(adapt phase 에서 `reap make backlog` 호출은 금지 — 위 모든 hint 는 artifact text 만. 사용자가 next session 에서 `reap make backlog` 로 변환.)
