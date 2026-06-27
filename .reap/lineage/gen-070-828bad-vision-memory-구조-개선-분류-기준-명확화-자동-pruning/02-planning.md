# Planning

## Goal

vision memory 구조를 **time-based tier (lifespan으로 분류)** 에서 **content-type-based tier (역할로 분류)** 로 재정의하고, 기존 누적된 memory를 1회성 cleanup하며, 가이드 문서(evolution.md + reap-guide.md × 3 위치)를 새 정책으로 갱신한다.

완료 후 상태: 다음 generation의 agent가 새 가이드만 보고도 "어디에 무엇을 쓸지" 즉각 결정 가능하며, 본 generation에 이미 정리된 memory를 그대로 사용 가능.

## Completion Criteria

1. **새 decision tree 명문화**: `evolution.md` Memory 갱신 Criteria 절에 4-branch decision tree (shortterm/midterm/longterm/삭제) 명시.
2. **Pruning 정책 명문화**: `evolution.md` + `reap-guide.md`에 reflect phase의 cleanup 의무 (shortterm 매번, midterm 트랙 완료 시, longterm 주기적) 명시.
3. **longterm.md 압축**: 현재 255줄 → 30줄 내외 (±5 허용). 핵심 design lesson만 유지, 역사적/세부적 항목 삭제.
4. **midterm.md 압축**: 현재 134줄 → 50줄 내외 (±5 허용). 진행 중인 트랙 3개만 (Embryo→Normal, Evaluator Agent 잔여, Daemon Indexer 남은 작업).
5. **shortterm.md 교체**: reflect phase에서 gen-070 핸드오프로 교체 (deferred 후보 정리 + 다음 generation 가이드).
6. **3 위치 sync**: `src/templates/reap-guide.md` ↔ `.reap/reap-guide.md` ↔ `~/.reap/reap-guide.md` byte-identical 검증.
7. **회귀 0**: typecheck pass / build pass / unit + e2e 기존 통과 수준 유지 (본 generation은 production code 변경 거의 없으므로 회귀 가능성 낮음).

## Background

본 generation은 backlog `vision-memory-구조-개선-분류-기준-명확화-자동-pruning.md` 의 직접 구현. 사용자가 명시한 두 가지 메타 문제:

1. **분류 기준 불명확** — time-based tier(lifespan)는 미래 예측이 필요해 AI가 매번 추론 부담, 결과적으로 오분류 누적
2. **pruning 메커니즘 부재** — 완료된 트랙/세션 내용이 영원히 잔존, agent가 stale vs current 구분 불가

해결책은 backlog에 이미 충분히 detail 되어 있어 본 planning에서 추가 brainstorming 거의 불필요. 단 longterm 압축 알고리즘은 한 가지 결정 필요.

## Brainstorming

### Q1: longterm.md 압축 알고리즘 (learning Technical Deep-Dive의 A/B/C)

| 옵션 | 방식 | 장점 | 단점 |
|------|------|------|------|
| A | 각 lesson 1줄 + flat | 압축률 최대 | 카테고리 없어 탐색 어려움 |
| B | 카테고리별 그룹화 (Architecture / Patterns / Anti-patterns / Heuristics) | 탐색성 우수 | 한 lesson이 여러 카테고리에 걸칠 수 있음 |
| C | 핵심 5~7개 풀 유지 + 나머지 1줄 요약 | 가독성 + 압축률 균형 | "핵심"의 기준이 주관적 |

**결정**: **B (카테고리별 그룹화)** + 각 lesson 1~2줄 요약. 이유:
- 사용자 강조 사항 "지금 뭘 해야 하는지 명확히 알 수 있는 상태" = 탐색성 우선
- 30줄 목표는 카테고리 4개 + 각 5~7 lessons × 1줄로 달성 가능
- gen-XXX 참조는 git log/lineage로 trace 가능하므로 본문에서 생략 가능

### Q2: midterm.md 구조

현재 9 ## 헤더로 비대화. 새 구조는 backlog 명시한 "진행 중인 큰 트랙만". learning에서 식별한 유지 항목 3개:
1. Embryo → Normal 전환 (결정 유지, 다음 판단 시점 참조)
2. Evaluator Agent — Vision/Goal 위임 (잔여 1 항목)
3. Daemon Indexer — 남은 작업 (MCP wrapper / dist queries fix / .js strip / staleness 자동화)

→ 각 트랙별 5~10줄 ≈ 30~50줄 목표 달성.

### Q3: migration 순서 — 한 commit vs 분리

선택지:
- (a) 가이드 먼저 (evolution.md + reap-guide.md) → memory cleanup → reflect에서 shortterm 작성
- (b) memory cleanup 먼저 → 가이드 → reflect
- (c) 모두 implementation 단계, reflect는 shortterm만

**결정**: (a). 이유: 가이드를 먼저 갱신하면 cleanup 시 새 decision tree를 self-reference 가능. cleanup 시 "왜 이 항목을 삭제하는가"가 새 가이드로 정당화됨 → self-consistency 검증 동시 진행.

### Q4: reap-guide.md sync 메커니즘

`src/templates/reap-guide.md` 수정 후:
- `npm run build`가 dist에 복사 (scripts/build.sh 확인 필요 — 실제로 reap-guide.md 복사하는지)
- `~/.reap/reap-guide.md`는 사용자 영역, `reap install-skills`나 사용자 직접 update 시점
- `.reap/reap-guide.md`는 본 프로젝트 dog-fooding instance — 명시적 cp

→ 본 generation에서는 **3 위치 모두 동시 수정**으로 단순화. build/install 자동화에 의존하지 않고 직접 수정 후 diff 검증. (sync 자동화는 별도 backlog 후보)

### Q5: testing 전략

본 generation은 production code 변경 거의 없음. 검증:
- (a) typecheck pass
- (b) build pass (template 변경이 dist에 반영되는지)
- (c) memory file 줄 수 측정 + decision tree 명시 확인
- (d) 3 위치 reap-guide.md byte-identical (diff 0)
- (e) 기존 unit/e2e fresh 실행해서 회귀 0 확인

unit/e2e 새로 작성할 것 없음. 가이드 문서 + 데이터 변경.

## Approach

**5-단계 progression**:

1. **가이드 갱신** (decision tree + pruning policy 명문화) — evolution.md + reap-guide.md × 3
2. **longterm.md 압축** — 카테고리 4개 그룹화 + 각 lesson 1~2줄 요약
3. **midterm.md 압축** — 진행 중인 트랙 3개만 유지
4. **검증** — typecheck/build/test fresh + sync diff + 줄 수 측정
5. **shortterm.md는 reflect phase에서 교체** — 본 generation의 결과로 작성 (lifecycle 자연 흐름)

## Risk Assessment

| 리스크 | 영향 | 완화 |
|--------|------|------|
| longterm 30줄 목표가 무리해서 정보 손실 | 다음 agent가 lesson 못 봄 | 30줄 ±5 허용. "보존 가치 vs 압축률" 판단 시 가독성 우선. 정 누락이 걱정되면 lineage가 backup 역할. |
| 가이드 변경이 본 generation 안의 reflect phase에 직접 영향 | 자기-참조성으로 lifecycle 작동 안 할 수도 | 새 가이드가 reflect 동작과 호환되도록 작성. 실제로는 더 명확해질 뿐 동작 자체는 같음. |
| 3 위치 reap-guide.md sync 누락 | 사용자가 stale 버전 봄 | implementation 마지막 task가 diff 검증. |
| build/test 회귀 (예상 외) | release 차단 | implementation 마지막에 fresh test 실행. fail 시 즉시 수정. |
| longterm에서 삭제한 lesson이 미래에 필요해짐 | recurrence | git history + lineage에 보존됨. 실제 손실 0. |

## Scope

### 변경 파일 (직접 수정)

**가이드 문서 (3 위치 동기화)**:
- `.reap/genome/evolution.md` — Memory 절 (lines 45-78)
- `src/templates/reap-guide.md` — Memory 절 (lines 23-71)
- `.reap/reap-guide.md` — Memory 절 (template과 byte-identical)
- `~/.reap/reap-guide.md` — Memory 절 (template과 byte-identical)

**Memory 인스턴스 (1회성 cleanup)**:
- `.reap/vision/memory/longterm.md` — 255 → ≤30줄
- `.reap/vision/memory/midterm.md` — 134 → ≤50줄
- `.reap/vision/memory/shortterm.md` — reflect phase에서 gen-070 핸드오프로 교체

**환경 요약 갱신 (reflect phase)**:
- `.reap/environment/summary.md` — 변경된 파일 목록 반영 (genome + memory)

### Explicit out of scope

- production code (src/) 변경 0 — 단 template은 정적 자산이라 변경.
- 자동 sync 메커니즘 구현 (3 위치를 자동으로 keep-in-sync) — 별도 backlog 후보.
- memory 파일 schema 변경 (frontmatter 추가 등) — 본 generation은 markdown plain 유지.
- 다른 dog-fooding 영역 (CLAUDE.md, application.md 등) drift 확인 — 본 generation scope 외, 발견 시 별도 backlog.

## Tasks

- [ ] T001 `.reap/genome/evolution.md` — Memory 절 (lines 28-78) 재작성. 새 decision tree + pruning policy + reflect phase 의무. Vision 활용 원칙 절의 Memory 부분도 같이 정리.
- [ ] T002 `src/templates/reap-guide.md` — Memory 섹션 (lines 23-71) 재작성. evolution.md와 동일 메시지 (decision tree + pruning policy). "When to Update" + "Update Criteria" 표 모두 content-type 기준으로 재구성.
- [ ] T003 `.reap/reap-guide.md` — T002 결과를 그대로 복사 (cp src/templates/reap-guide.md .reap/reap-guide.md).
- [ ] T004 `~/.reap/reap-guide.md` — T002 결과를 그대로 복사 (cp src/templates/reap-guide.md ~/.reap/reap-guide.md).
- [ ] T005 3 위치 reap-guide.md diff 검증 — `diff -q` 출력이 비어있어야 OK.
- [ ] T006 `.reap/vision/memory/longterm.md` — 카테고리 4개 (Architecture / Design Patterns / Anti-patterns / Heuristics) + 각 lesson 1~2줄 압축. 30줄 ±5 목표. 새 가이드의 "이 교훈이 미래 generation에서 같은 실수를 막는가?" 기준으로 selection.
- [ ] T007 `.reap/vision/memory/midterm.md` — 진행 중인 트랙 3개만 유지 (Embryo→Normal / Evaluator Agent 잔여 / Daemon Indexer 남은 작업). submodule 항목은 deferred backlog 후보로 reflect에서 처리. 50줄 ±5 목표.
- [ ] T008 `npm run build` 실행 (template 변경의 dist 반영 확인 + 회귀 검출). build/scripts 가 template 복사하는지 확인.
- [ ] T009 `npm run typecheck` — 회귀 0 확인.
- [ ] T010 unit + e2e fresh 실행 (`bun test tests/unit/` + `bun test tests/e2e/`) — pre-existing fail 외 회귀 0 확인.
- [ ] T011 줄 수 측정 — longterm ≤ 35, midterm ≤ 55, shortterm 는 reflect 이후.

(T012 shortterm 교체는 reflect phase에서 자연스럽게 수행 — implementation task 아님)

## Dependencies

- T001 → T002 (evolution.md의 메시지를 reap-guide.md template에 반영. 두 문서가 같은 메시지 전달.)
- T002 → T003 → T004 → T005 (template canonical → .reap → ~/.reap → diff 검증)
- T001 + T002 완료 후 → T006, T007 (가이드 갱신 후 그 가이드를 self-reference로 cleanup)
- T006 + T007 → T008, T009, T010 (변경 완료 후 회귀 검증)
- T011 마지막 (모든 변경 후 측정)

## Testing Strategy

| Task | 검증 방법 |
|------|-----------|
| T001~T004 | 수동 검토 (인간 fitness phase에서 가독성/명확성 평가) |
| T005 | `diff -q` shell 명령 (출력 0 → OK) |
| T006~T007 | `wc -l` 줄 수 + 새 가이드 decision tree와의 self-consistency 검토 |
| T008 | bun build output 확인 (no error) |
| T009 | typecheck output 확인 |
| T010 | fresh test 실행, gen-069 baseline (unit 427/0, e2e 239 pass 1 fail) 유지 |

## Echo Chamber Prevention

본 generation의 직접 인과 범위:
- vision memory 구조 (분류 기준 + pruning) → 가이드 + memory 인스턴스 변경
- self-consistency → 변경 직후 본 generation 자체에 적용

범위 외 (별도 backlog 후보로 reflect에서):
- memory file frontmatter schema 추가
- 3 위치 reap-guide.md 자동 sync 메커니즘 (gen-054 marker-hash 패턴 응용)
- onLifeCompleted hook으로 reflect cleanup 자동화
- CLAUDE.md / application.md drift 확인

[autonomous] 추가: midterm.md 의 "submodule 관련 반복 문제" 섹션은 진행 중인 트랙이 아니라 unresolved bug에 가까움 → backlog 후보로 분리. 본 generation에서 직접 작성하지 않고 reflect phase에서 사용자에게 deferred 후보로 보고.
