# Completion

## Summary

**Goal**: vision memory 구조를 time-based tier → content-type-based tier 로 재정의 + 1회성 cleanup + 가이드 문서 동기화 (migration plan 포함).

**Result**: 완료. 가이드 명문화 + memory 압축 + 4 위치 sync 모두 달성.

### Key Changes

**가이드 갱신 (decision tree + pruning policy)**:
1. **`.reap/genome/evolution.md`** — Memory 절 전면 재작성. "Memory 분류 Decision Tree (AI용 의무 절차)" 4-branch + "Memory Pruning 정책 — reflect phase 의무" + "Memory에 쓰지 않을 것" 명시. embryo이므로 genome 직접 수정.
2. **`src/templates/reap-guide.md`** — evolution.md 와 동일 메시지를 영문으로. "3-Tier Structure — content-type based" 표 + "Memory Classification Decision Tree (mandatory for AI)" + "Memory Pruning Policy — mandatory in reflect phase" + "Do NOT write to memory".
3. **`.reap/reap-guide.md`** + **`~/.reap/reap-guide.md`** — template 그대로 cp. build.sh가 `dist/templates/reap-guide.md` 자동 sync.

**Memory 1회성 cleanup (새 decision tree self-reference)**:
4. **`.reap/vision/memory/longterm.md`** — 255 → 49줄 (81% 축소). 4 카테고리 (Absolute Principles / Architecture Patterns / Design Heuristics / Anti-patterns / Process Heuristics) 그룹화 + 각 lesson 1줄 압축. 역사적 맥락 (v0.15→v0.16, 프로젝트 기원 등) 모두 삭제.
5. **`.reap/vision/memory/midterm.md`** — 134 → 35줄 (74% 축소). 진행 중인 트랙 3개만 (Embryo→Normal / Evaluator Agent Vision/Goal 위임 잔여 / Daemon Indexer 4 항목 잔여). 완료된 트랙 (OpenCode adapter, Knowledge Loading 분리, Lifecycle Termination Paths 등) 모두 삭제 — 교훈은 longterm으로 응축.
6. **`.reap/vision/memory/shortterm.md`** — reflect phase에서 gen-070 핸드오프로 교체 (본 phase).

### Verification Outcome

- typecheck: pass
- build: pass (151 modules, 15ms, 0.76 MB)
- unit: 427 pass / 0 fail
- e2e: 239 pass / 1 fail (pre-existing init-repair)
- reap-guide.md 4 위치 byte-identical (MD5 5cf522117418bdb2ff16eeb0175754e7)
- 회귀 0 (gen-069 baseline 동일)

## Lessons Learned

### Well — 자기-참조성 (self-dogfooding) 패턴 작동

본 generation은 (a) 새 가이드 작성 → (b) 가이드를 self-reference로 memory cleanup → (c) reflect phase가 새 Memory Pruning Policy의 첫 사용자가 됨, 세 단계 모두 한 generation 내에서. gen-066~069 longterm "Self-dogfooding timing is deliberate" 패턴의 가이드 영역 응용.

### Well — Migration plan 명시가 backlog 가치를 증폭

사용자가 강조한 "migration plan 포함"이 본 generation의 골격을 결정. backlog가 단지 "decision tree 도입" 만 명시했다면 가이드만 수정하고 memory 잔존 → 다음 generation이 새 가이드로 cleanup 필요 → 두 generation 분산. 사용자 강조 덕분에 한 generation에서 완성.

### Improvement — longterm 줄 수 목표 (≤30~35) 의 현실성

본 generation 결과 49줄. 19 lesson을 한 줄씩 + 4 카테고리 헤더 + intro = 49가 자연스러운 minimum. **30줄 목표는 lesson 자체를 5~7개로 줄여야 달성 가능**. 다음 reflect (또는 다음 10-gen 주기) 에서 application.md "Adapter Layer" 와의 중복 가능 항목 (Adapter dispatch / Opt-in pattern 등) 을 별도 검토하면 일부 통합 가능. 본 generation에서 한 번 압축 직후라 평가 시점 부적절.

### Improvement — 3 위치 sync는 manual

cp 3회로 처리했음. drift risk. gen-054 marker-hash 패턴을 reap-guide.md 에 적용하면 template 한 줄 수정으로 자동 propagate 가능. backlog 후보 (1번, deferred).

## Next Generation Hints

사용자가 fitness "ok" 후 명시 지정한 3 후보:

### 1순위 후보: REAP migration instruction layer (사용자 지정)

각 버전별 migration 지시 레이어 — `reap update` 시 버전 gap 감지 + agent context 주입.

- **문제 인식**: 현재 `reap update`는 구조적 sync (CLAUDE.md/AGENTS.md marker-hash, opencode.json instructions, slash commands, agents 등) 만 수행. 사용자/agent에게 "v0.X → v0.Y로 올라오면서 행동/관습이 어떻게 달라졌는지" 를 명시적으로 전달하는 채널이 없음. v0.15 → v0.16 같은 큰 전환은 별도 migrate 명령이 있으나, **마이너 버전 간 행동 변화** (예: 본 gen-070의 memory pruning policy 의무화) 는 사용자/agent가 인지하지 못한 채 stale 한 방식으로 작업할 risk.
- **방향성 제안**:
  - 버전별 migration note 파일 (예: `src/migrations/v0.16.x.md`) — "이 버전부터 무엇이 달라졌고, agent는 무엇을 해야 하는가" 자연어 + 코드 차이
  - `reap update` 가 이전 버전(`.reap/.last-known-version` 같은 marker) 과 현재 버전 사이의 gap migration note들을 수집해 사용자/agent에게 surface
  - SessionStart hook / dump-state 에 "최근 migration note" 절을 dynamic context로 포함 → 다음 session의 agent가 자동 인지
- **활용할 기존 패턴**: gen-054 marker-hash sync + gen-062 정/동 분리. instruction을 static (note 파일) + dynamic (session 주입) 으로 분리. application.md "Knowledge Loading — Static / Dynamic 분리" 절과 동일 구조.
- **본 gen-070와의 연결**: 본 generation이 만든 새 Memory Pruning Policy가 바로 instruction layer의 첫 use case — "이 버전부터 reflect phase에서 memory cleanup 의무". instruction layer가 있었다면 사용자가 다른 프로젝트에서 update 했을 때 자동 surface 됐을 것.
- **권장 시작점**: design 문서 (`vision/design/migration-instruction-layer.md`) 작성 → migration note 형식 결정 → `reap update` 흐름에 gap detection 통합.

### 2순위 후보: MCP server wrapper for daemon (midterm 트랙)

midterm "Daemon Indexer 트랙 — 남은 작업" 1순위. AI agent가 daemon 지식을 표준 protocol (Model Context Protocol) 로 쿼리. claude-code / opencode 공용 — 양 client가 같은 wrapper를 통해 daemon에 접근하므로 adapter별 중복 회피. design 문서 (`vision/design/daemon-mcp.md`) 부터 시작 권장.

### 3순위 후보: Evaluator Vision/Goal 위임 (midterm 트랙)

midterm "Evaluator Agent 트랙 — Vision/Goal 위임만 남음". adapt phase에서 evaluator가 gap 분석 + 다음 goal 추천. `vision/design/evaluator-agent.md` 잔여 절 참조. evaluator 트랙의 마지막 큰 항목 — 완료 시 longterm으로 응축 + midterm에서 트랙 자체 삭제 (pruning policy 의 시연 케이스).

### 참고: Release v0.16.6 (사용자 판단)

gen-068 + gen-069 + gen-070 묶음 가능. 위 3 후보와 별도 trajectory. 사용자가 release timing 결정 후 별도 generation.

## Change Proposals

본 generation에서 만든 변경은 (a) genome (evolution.md) — embryo 직접 수정, (b) 가이드 (reap-guide.md × 3 위치) — template + 복사본, (c) memory (3 파일) — 1회성 cleanup. 모두 본 generation 안에 적용 완료.

### Backlog 후보 (사용자 판단 후 backlog 화)

| # | 후보 | priority | 사유 |
|---|------|---------|------|
| 1 | 3 위치 reap-guide.md 자동 sync (marker-hash 패턴) | medium | drift 원천 차단. template 수정 빈도 낮으면 우선순위 낮음. |
| 2 | reflect phase 자동 줄 수 측정 + 경고 | low | 새 pruning policy의 mechanical guard. longterm > 50 시 prompt. |
| 3 | memory 파일 frontmatter schema | low | last-pruned-at 등 메타데이터 필요 시. 당장은 plain markdown. |
| 4 | submodule 관련 반복 문제 분리 | medium | 구 midterm의 unresolved bug 항목. 본 generation에서 memory cleanup 시 제거. proper backlog로 분리. |
| 5 | longterm 두 번째 prune 검토 | low | 49 → 30 목표. genome 중복 항목 (Adapter dispatch / Opt-in pattern) 통합 가능. |

(adapt phase에서 backlog 생성 금지 — 사용자 판단 후 backlog 화)

## Project Diagnosis (16 Software Completion Criteria)

본 generation 시점 평가. 본 generation 자체가 가이드/메타 변경이므로 production 영역은 직전 generation들 평가가 그대로 유효.

- **Core functionality**: REAP lifecycle (learning → completion + abort/early-close)와 모든 stage 전환이 검증됨. 본 generation도 정상 흐름으로 완료.
- **Architecture stability**: gen-050~069 동안 transition graph + adapter dispatcher + opt-in flag 패턴이 안정화. 본 generation은 데이터/가이드 영역만 변경, 코어 아키텍처 영향 0.
- **Modularity**: src/core/ + src/adapters/ + src/cli/commands/ 분리. 어댑터 추가가 dispatcher만 거치는 구조로 검증 완료.
- **Error handling**: ReapOutput JSON 통일, emitError 일관 사용. silent fail 정책 (daemon 등)도 명시화됨.
- **Test coverage**: unit 427 / e2e 240 / scenario 별도. 본 generation은 가이드 변경이라 신규 테스트 없음. gen-069 baseline 유지.
- **Documentation**: CLAUDE.md / AGENTS.md / reap-guide.md / genome 3개 / environment summary / vision goals & memory. 본 generation이 memory 분류 기준을 명문화하면서 문서 일관성 향상.
- **Security**: nonce SHA256 + 외부 의존 최소 (yaml v2 only) + git 직접 호출. 본 generation 변경 없음.
- **Performance**: build 15ms / bundle 0.76 MB. 본 generation 변경 없음.
- **Deployment readiness**: npm 배포 환경 정비 완료 (postinstall, install-skills). 본 generation 변경 없음.
- **Code quality**: TypeScript strict + pattern-first + no-duplication 원칙 명문화. 본 generation은 dog-fooding 영역 (가이드/memory) 일관성 강화.
- **User experience**: slash commands + CLI 핑퐁 + JSON output. 본 generation은 agent용 UX (memory 사용 기준 명확화) 개선.
- **Visual verification**: 해당 없음 (CLI tool).
- **Integration layer**: daemon HTTP API + claude-code/opencode adapter. 본 generation 변경 없음.
- **Domain maturity**: environment/summary.md 가 source structure + tests를 매 generation 갱신. 본 generation도 영향 영역만 갱신 (가이드 변경은 source-map에 영향 X).
- **Governance compliance**: lifecycle 따름 (본 generation도 learning→…→commit 전체 진행). embryo invariants 준수.
- **Genome stability**: gen-050 이후 application.md 안정. evolution.md는 본 generation에서 Memory 절 재작성 — 큰 변경이지만 embryo 모드 + 사용자 backlog 명시 + 자체 검증으로 정당화.

## Embryo → Normal Transition Check

- generation count: 70 (>= 6 threshold 충족)
- application.md 안정성: gen-050 이후 큰 변경 없음 (Adapter Layer 추가 정도)
- evolution.md 변경 빈도: 본 generation에서 Memory 절 큰 재작성. 아직 evolving 중.
- abort 빈도: 최근 10 generation 내 abort 거의 없음 (gen-052 abort 후 안정)
- vision/goals.md 명확성: 구체적 항목 다수

**판단**: 본 generation이 evolution.md를 큰 폭으로 재작성했으므로 직후 normal 전환은 시기상조. 사용자 판단 (2026-03-26) 도 "REAP 자체가 self-evolving 중이라 embryo 유지" 였음. **embryo 유지 권고**. 다음 5~10 generation 동안 genome 변경 빈도가 다시 감소하면 재검토.

(memory midterm "Embryo → Normal transition" 트랙과 일관)

## Vision Goals Review

자동 제안된 매칭 중 실제 본 generation 작업과 매칭되는 항목 **없음**:

- ❌ "Vision/Goal/Memory 관리 위임" (Evaluator Agent 절) — 자동 제안. **거짓 매칭**. 본 generation은 Memory 구조 개선이지 evaluator의 vision/goal 위임 위탁이 아님. "Memory" 단어 매칭으로 인한 false positive.
- ❌ "Update agent Phase 2/3" (Distribution) — 무관. CLI 의 reap update와 본 generation 무관.
- ❌ "Codex CLI adapter" — 무관.

→ **vision/goals.md 자동 마킹 보류**. 본 generation의 작업은 메타 영역 (memory 구조) 이라 기존 vision goal 항목과 직접 매칭되는 것이 없음. 사용자가 vision 절에 "Memory 관리 구조" 같은 항목을 신설할지 별도 판단.

다음 generation 후보는 위 "Next Generation Hints" 절 참조 (사용자 명시 1순위: REAP migration instruction layer).

## Vision Development Suggestions (CLI 자동 제안)

CLI 가 "missing coverage" 제안한 5개 (Architecture stability / Modularity / Error handling / Test coverage / Documentation) 는 모두 본 generation 직접 인과 범위 외. 본 generation은 echo chamber 방지 원칙에 따라 vision/goals.md 직접 수정하지 않음. 사용자 판단 후 별도 generation에서 처리.
