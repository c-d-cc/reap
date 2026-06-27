# Learning

> Explore the project and build context before starting this generation's work.

## Project Overview

REAP v0.17.0, embryo, gen-070 진입. self-hosting evolutionary pipeline의 dog-fooding 영역(`.reap/vision/memory/`)을 자체 개선하는 generation.

본 generation은 **production code 변경이 거의 없는 meta-evolution**이다. 핵심 변경 대상:
1. AI 행동 가이드 (genome `evolution.md`의 Memory 절)
2. REAP 도구 가이드 (`reap-guide.md` × 2 위치)
3. memory 인스턴스 자체 (`.reap/vision/memory/*.md` 3개)

## Source Backlog

Backlog `vision-memory-구조-개선-분류-기준-명확화-자동-pruning.md` (consumed by gen-070-828bad)가 본 generation의 기반.

### 핵심 문제 (backlog 요약)

1. **분류 기준 불명확 (time-based의 한계)**:
   - 현재 tier 구분 기준은 "얼마나 오래 쓸 것인가"(lifespan-based) — 미래 예측이 필요해 AI가 매번 추론 부담
   - 결과: 오분류 누적. longterm 35 섹션/255줄, midterm 19 섹션/134줄로 비대화
2. **pruning 메커니즘 부재**:
   - memory는 누적만 됨. 삭제/만료 로직 없음
   - 완료된 large task 맥락(OpenCode adapter gen-063~064 등)이 잔존
   - 초기 context(v0.15→v0.16 전환 등)가 longterm 상단 차지
   - agent가 stale vs current를 구분 불가

### 제안된 해결 방향 (backlog 명시)

**time-based → content-type-based tier 재정의**:

| 파일 | 새 역할 | 1-line 판단 기준 |
|------|---------|------------------|
| `shortterm.md` | Session handoff — 다음 세션 즉각 필요한 핸드오프 | "지금 당장 필요한가?" |
| `midterm.md` | Ongoing tracks — 진행 중인 멀티-generation 작업 | "아직 완료 안 된 큰 트랙인가?" |
| `longterm.md` | Design lessons — 반복 참조할 설계 교훈 | "이 교훈이 미래 generation에서 같은 실수를 막는가?" |

**Decision tree (AI용)**:
```
다음 세션에서 즉시 필요한가? → shortterm
아직 완료되지 않은 진행 중인 트랙/계획인가? → midterm
완료됐지만 설계 교훈으로 남겨야 하는가? → longterm
완료됐고 특별한 교훈도 없는가? → 삭제 (보관 불필요)
```

**Pruning 정책 (reflect phase 의무화)**:
- shortterm: 매 generation reflect에서 "이미 처리됨" 항목 삭제 (1~2 generation만 유지)
- midterm: 트랙 완료 시 핵심만 longterm 승격 후 midterm에서 삭제
- longterm: 주기적(10 gen마다 권장) 중복/stale 정리

### 사용자가 강조한 제약: migration plan 필수

단순히 새 구조를 정의(가이드 업데이트)만 하는 것이 아니라:
- 기존 memory 3 파일을 **새 기준으로 1회성 cleanup**
- evolution.md Memory 절에 decision tree 추가
- reap-guide.md (template + .reap/ + ~/.reap/) 동기화

## Key Findings

### 1. 현재 memory 파일 상태 (실측)

| 파일 | 현재 줄 수 | 섹션 수(##/###) | 목표 줄 수 |
|------|----------|----------------|----------|
| `longterm.md` | 255 | 1 ## + 34 ### | ≤30 (핵심 교훈만) |
| `midterm.md` | 134 | 9 ## + 11 ### | ≤50 (진행 중인 것만) |
| `shortterm.md` | 68 | 1 ## + 5 ### | 다음 generation 핸드오프로 교체 |

backlog의 완료 기준과 비교:
- longterm: 255 → ≤30줄 (88% 축소)
- midterm: 134 → ≤50줄 (63% 축소)
- shortterm: 새 generation 결과로 교체

### 2. longterm.md 삭제 후보 분석

backlog에서 명시한 후보를 실제 내용과 매칭:

**삭제 (역사적 맥락, 행동 지침 X)**:
- "프로젝트 기원과 방향" (lines 3-6) — v0.16 rewrite 배경, 현 시점 미참조
- "v0.15 → v0.16 명시적 차이" (lines 25-33) — 전환 완료
- "Cruise는 prompt-driven loop으로 구현" (lines 35-38) — "2026-03-27 결정으로 변경 예정"이라 stale
- "Lifecycle 준수는 AI 자신에게도 적용" (lines 50-52) — 단발 사건 회고, 현재는 default 동작
- "종료 path는 transition graph 외부" (lines 54-55) — genome application.md "Adapter Layer" 절에 termination paths 명시되어 중복
- "Plan 단계에서 함수 caller 를 직접 읽어라" / "Library/CLI option semantics는 추론보다 실증" / "YAML round-trip" / "Cross-adapter 자산 경로" / "Debug stash" 등 generation-specific debug lessons — 너무 세부적, 보존 가치 낮음. **선별** 필요.

**유지 (진짜 반복 참조할 교훈)**:
- "Slash command는 최소화, flow 제어는 CLI가" — architecture decision
- "정량적 평가 금지 (Goodhart)" — 절대 원칙
- "편향 분석은 잘못된 프레이밍" — anti-pattern
- "Workaround 금지 원칙의 탄생" — design lesson origin
- "Memory는 자유만으로는 작동하지 않는다" — 본 generation의 메타 motivation
- "Agent 정의 = 정적 템플릿, prompt = 동적 context" — architecture
- "Template = single source of truth + marker-hash sync" — 응용 가치 큼
- "Claude Code native 메커니즘 활용 + REAP hook 역할 분리" — 일반화 가능
- "Adapter dispatch 패턴 + client별 mechanism 활용" — 일반화 가능
- "사용자 UX gap은 backlog verification에 적극 포함" — 4-항목 checklist 영구 참조
- "여러 adapter 가 같은 형식을 채택하면 source 도 single source" — 일반화 가능
- "인과적으로 묶인 버그/작업은 한 묶음으로" — workaround 금지의 응용
- "Design 문서가 abort 후에도 lineage anchor" — design vs memory 경계 결정
- "Builder가 manual workflow 일 때 subagent 권한 부재" — advisor 패턴 fallback
- "Self-dogfooding 시점은 implementation 마지막" — 휴리스틱
- "Nonce-graph 외부 phase 패턴 (state 채널 / 부수효과 CLI)" — 일반화 가능
- "Append-only state 의 trade-off" — design 휴리스틱
- "점진 통합 트랙에서 미리 만든 hook 패턴" — design 휴리스틱
- "함수가 paths 주입으로 디스크 다중 파일을 읽으면 테스트 레벨 = e2e" — testing 휴리스틱
- "Opt-in flag 패턴 — config 게이트 + dynamic import" — application.md "Adapter Layer" 와 일부 중복이지만 일반 원칙
- "Debug 목적의 stash 시도 전 — 인과 매칭 먼저" — 메타 휴리스틱
- "검증 인프라 generation 의 discovered fix 범위 판단" — workaround 금지의 응용
- "검증 인프라 자동화의 자기-진화 패턴 (gen-068 → gen-069)" — 트랙 휴리스틱
- "Test isolation의 두 축 — port + path" — e2e 휴리스틱
- "Macro tip — realpath()가 macOS symlink 갭을 메운다" — 매우 구체적이지만 재발 가능성 있음

→ **유지 25개 중 일부는 통합 가능**. 30줄 목표 달성을 위해 한 줄 요약 + reference link 형태로 압축 필요.

### 3. midterm.md 삭제 후보 분석

**삭제 (완료된 트랙)**:
- "Agent 실행 구조 (확정)" (lines 4-9) — longterm "Agent 정의 = 정적 템플릿..." 와 중복
- "v0.15 기능 패리티" (lines 11-14) — 완료
- "Self-evolving 강화" (lines 16-18) — gen-028~031 완료, 더 이상 트랙 아님
- "Knowledge Loading 정/동 분리 (gen-062)" (lines 73-80) — 완료 트랙, longterm "Claude Code native 메커니즘..."에 교훈 응축됨
- "OpenCode adapter — 멀티-client 트랙 (gen-063~064)" (lines 82-120) — 완료 트랙, longterm에 4개 교훈 (Adapter dispatch, UX gap 4-checklist, single source, installSkills vs registerSession 책임) 모두 응축됨
- "Lifecycle Termination Paths (gen-061)" (lines 122-128) — 완료 트랙, application.md "Termination Paths" 절에 명문화
- "submodule 관련 반복 문제" (lines 130-134) — 정작 진행 중인 mitigation track 아님. "메모"에 가까움. 실제 fix를 backlog로 옮기는 게 맞음 (deferred 후보)

**유지 (진짜 진행 중)**:
- "Embryo → Normal 전환" (lines 20-23) — 결정 유지, 다음 판단 시점에 참조
- "Evaluator Agent — 점진 통합 트랙" (lines 25-41) — Vision/Goal 위임 1 항목 잔여
- "Daemon Indexer — 남은 작업" (lines 43-71) — MCP wrapper / dist queries fix / .js strip 등 잔여

→ 3개 항목만 남기면 ~50줄 달성 가능.

### 4. shortterm.md 처리

현재 gen-069 (직전) 핸드오프 내용. 본 generation 완료 시점에 gen-070 결과로 교체될 것. **본 generation의 reflect phase에서 작성**.

### 5. 가이드 문서 동기화 대상 (실제 확인)

```
src/templates/reap-guide.md (canonical source)
  ↓ npm run build (scripts/build.sh가 복사)
~/.reap/reap-guide.md (사용자 영역, install-skills 시점)

.reap/reap-guide.md (이 프로젝트 dog-fooding instance — 직접 sync 필요)
```

diff 검증: `.reap/reap-guide.md` ↔ `~/.reap/reap-guide.md` **동일** (출력 없음 확인). `src/templates/reap-guide.md` ↔ `.reap/reap-guide.md` **동일** (출력 없음 확인).

→ **3 위치 동시 수정 필요**: `src/templates/reap-guide.md` (canonical), `.reap/reap-guide.md` (dog-fooding), `~/.reap/reap-guide.md` (user-level installed copy). build 자동 sync로 일부 처리 가능하나, dog-fooding instance는 명시적 sync.

### 6. evolution.md Memory 절 — 현 상태 → 목표 변경

`evolution.md` lines 45-78:
- 현재 "tier 간 이동도 자율" / "각 tier가 비대해지지 않도록 주기적 정리" 같은 추상적 지침만 있음
- "Update Criteria" 표가 time-based (Lifespan)으로 정의되어 있음

목표 변경:
- 3-tier 표를 content-type-based로 재정의 (1-line 판단 기준 추가)
- Decision tree 명시 (4-branch)
- Pruning policy 명시 (shortterm/midterm/longterm 각각)
- reflect phase 의무 명시 ("shortterm cleanup 의무")

### 7. reap-guide.md Memory 섹션 (template + .reap + ~/.reap)

template lines 23-71의 Memory 절도 동일 패턴으로 업데이트 필요.

## Previous Generation Reference

gen-069: daemon e2e 검증 인프라 구축 (fixture + helper + 21 cases + 격리 + TS call references fix). 사용자 fitness "ok. 잘 했어." 본 generation과 직접 인과 없음 (영역 다름).

본 generation에 carry forward 할 교훈:
- gen-069 longterm "검증 인프라 generation 의 discovered fix 범위 판단" — 본 generation에서 가이드 문서 수정 중 발견되는 다른 dog-fooding 영역 drift도 본 generation에서 fix할지 판단 기준.
- gen-066~069 longterm 의 "self-dogfooding" 패턴 — 본 generation은 가이드 수정 + memory 자체 수정을 동시에 하므로, 수정한 가이드를 본 generation reflect phase가 자기 자신의 첫 사용자가 됨. self-referential 검증.

## Backlog Review

- consumed: `vision-memory-구조-개선-분류-기준-명확화-자동-pruning.md` (gen-070-828bad)
- 다른 pending 항목: 0

## Technical Deep-Dive

### 압축 알고리즘 — longterm 25개 lesson을 30줄 안에 담는 방법

**선택지 A**: 각 lesson 1줄로 압축 + 헤더 분류
**선택지 B**: 카테고리별 그룹화 (Architecture / Design Patterns / Anti-patterns / Debugging Heuristics)
**선택지 C**: 핵심 5~7개만 풀로 유지 + 나머지는 1줄 요약 + git log 참조

→ planning 단계에서 결정. 사용자 강조 사항: "지금 뭘 해야 하는지 명확히 알 수 있는 상태" — 가독성이 압축률보다 우선이므로 B 또는 C가 유력.

### Dog-fooding 영역의 3 위치 sync 메커니즘

- `src/templates/reap-guide.md` 수정 → `npm run build`가 dist에 복사 → `reap install-skills` / `reap update`가 `~/.reap/reap-guide.md` 갱신
- `.reap/reap-guide.md`는 **사용자 영역과 별도** — 본 프로젝트 자체의 dog-fooding instance. 명시적 sync 필요 (gen-054 marker-hash infra 활용 가능? — `.reap/reap-guide.md`는 marker가 없는 plain copy로 보임. 단순 cp가 안전).

검증: 본 generation implementation 마지막 단계에서 3 위치 byte-identical 확인.

### Migration 방식 — 1회성 vs 점진적

backlog 명시: "이번 generation에서 기존 memory 파일을 위 기준으로 일괄 정리" → **1회성 cleanup** 결정됨.

대안 (점진적 = 매 reflect에서 조금씩) 도 가능했으나, 현재 비대화된 상태(longterm 255줄)를 그대로 두면 다음 agent가 가이드를 따라도 stale 내용을 만나므로 효과 반감. → 1회성 cleanup이 정답.

## Context for This Generation

### Clarity Level: **HIGH**

근거:
- backlog가 매우 구체적 (problem + solution + decision tree + pruning policy + files to change + 완료 기준)
- 변경 대상 파일 명확 (memory 3개 + evolution.md Memory 절 + reap-guide.md 3 위치)
- 측정 가능한 완료 기준 명시 (≤30줄, ≤50줄, decision tree 명시 등)
- production code 변경 없음 (가이드 + 데이터만)
- 사용자가 "migration plan 포함" 강조 — scope가 정의된 상태

### 핵심 제약 & 가정

1. **본 generation은 production code 변경 거의 없음** — typecheck/build/test 부담 최소. 단 reap-guide.md template 변경은 `npm run build` 후 dist 사본 검증 필요.
2. **embryo이므로 genome 자유 수정 가능** — evolution.md Memory 절 직접 수정 OK.
3. **자기-참조성** — 본 generation의 reflect phase가 새 pruning 정책의 첫 사용자가 됨. 그래서 reflect 진행이 자연스러우면 정책이 작동, 부자연스러우면 재설계 필요.
4. **사용자 검토 가능성** — fitness phase에서 사용자가 새 memory 파일을 직접 읽고 "지금 뭘 해야 하는지 명확한가" 판단할 가능성 높음. 가독성이 압축률보다 중요.

### 누락 방지 체크리스트 (사용자 강조 사항)

1. ✅ memory 3 파일 1회성 cleanup (decision tree에 따라 reclassify + prune)
2. ✅ evolution.md Memory 절 update (decision tree + pruning policy + reflect phase 의무)
3. ✅ src/templates/reap-guide.md Memory 섹션 update
4. ✅ .reap/reap-guide.md 동기화 (dog-fooding instance)
5. ✅ ~/.reap/reap-guide.md 동기화 (사용자 영역, 본 프로젝트 install path)
6. ✅ 3 위치 byte-identical 검증
7. ✅ shortterm.md를 gen-070 핸드오프로 교체 (reflect phase에서)

### Next Stage: Planning

planning 단계에서 결정할 사항:
- Q1: longterm 압축 알고리즘 (선택지 A/B/C)
- Q2: 삭제할 lesson의 최종 list (위 분석을 사용자와 1회 합의)
- Q3: migration 순서 — gen-070 자체의 shortterm 작성을 어느 시점에 (reflect phase에서 자연스럽게 됨)
- Q4: reap-guide.md 변경의 src/templates → .reap → ~/.reap sync 순서 (build 단계 포함)
- Q5: testing 전략 — 본 generation은 데이터/가이드 수정이므로 test 변경 거의 없음. 검증은 (a) typecheck/build pass (b) memory file 줄 수 + decision tree 명시 (c) 3 위치 sync.
