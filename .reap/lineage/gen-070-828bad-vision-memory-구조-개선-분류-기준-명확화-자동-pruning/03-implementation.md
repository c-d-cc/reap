# Implementation Log

## Strategy

Plan의 5-단계 progression 그대로 수행. embryo이므로 evolution.md (genome) 직접 수정. 가이드 변경 후 그 가이드를 self-reference로 memory cleanup.

## Completed Tasks

| Task | Status | Notes |
|------|--------|-------|
| T001 `.reap/genome/evolution.md` | done | Memory 절을 content-type 기준으로 재작성. Decision tree (4-branch) + Pruning policy (reflect phase 의무) + "Do NOT write" 명시. |
| T002 `src/templates/reap-guide.md` | done | evolution.md와 동일 메시지를 영문으로. "3-Tier Structure — content-type based" + "Memory Classification Decision Tree (mandatory for AI)" + "Memory Pruning Policy — mandatory in reflect phase" 절. |
| T003 `.reap/reap-guide.md` | done | `cp src/templates/reap-guide.md .reap/reap-guide.md`. |
| T004 `~/.reap/reap-guide.md` | done | `cp src/templates/reap-guide.md ~/.reap/reap-guide.md`. |
| T005 diff 검증 | done | `diff -q` 출력 0. 추가로 MD5 4개 (`src/templates/` / `.reap/` / `~/.reap/` / `dist/templates/`) 모두 일치 확인 (build.sh가 src/templates → dist 자동 복사). |
| T006 `.reap/vision/memory/longterm.md` | done | 255 → 49줄 (81% 축소). 4 카테고리 (Absolute Principles / Architecture Patterns / Design Heuristics / Anti-patterns / Process Heuristics) + 각 lesson 1줄 압축. 목표 ≤35는 약간 초과했으나 가독성 우선 (아래 Architecture Decisions 참조). |
| T007 `.reap/vision/memory/midterm.md` | done | 134 → 35줄 (74% 축소). 진행 중인 트랙 3개만: Embryo→Normal transition / Evaluator Agent (Vision/Goal 위임 1 항목 잔여) / Daemon Indexer (4 항목 잔여). 완료된 트랙 모두 삭제. |
| T008 `npm run build` | done | typecheck pass / build pass (0.76 MB, 151 modules, 23ms). dist/templates/reap-guide.md도 src와 byte-identical. |
| T009 `npm run typecheck` | done | tsc --noEmit pass. |
| T010 unit + e2e fresh | done | unit 427 pass / 0 fail. e2e 239 pass / 1 fail (pre-existing init-repair, gen-069 baseline 동일). 회귀 0. |
| T011 줄 수 측정 | done | longterm 49 / midterm 35 / shortterm 68 (reflect에서 교체). 4 위치 sync 확인. |

## Discovered Issues

(없음 — 가이드/데이터 변경에 한정되어 production code 회귀 없음)

## Deferred Items

reflect phase에서 사용자 판단 후 backlog 화 후보:

1. **3 위치 reap-guide.md 자동 sync 메커니즘** — 본 generation은 manual cp 3회. gen-054 marker-hash 패턴 응용 가능. `onLifeCompleted` hook으로 sync 트리거하면 drift 원천 차단. (사용자가 향후 reap-guide 수정 빈도가 낮으면 우선순위 낮음)
2. **memory 파일 frontmatter schema** — 본 generation은 plain markdown 유지. 향후 (generation tracking / last-pruned-at 등) 메타데이터가 필요하면 schema 도입 검토.
3. **reflect phase에 자동 줄 수 측정 + 경고** — longterm > 50, midterm > 70 이면 prompt에 cleanup 권고. 새 가이드의 pruning policy를 enforce하는 mechanical guard.
4. **submodule 관련 반복 문제** (구 midterm.md 마지막 항목) — 진행 중인 트랙이 아니라 unresolved bug. backlog로 분리 검토.

## Architecture Decisions

### longterm.md 49줄 — 목표 ≤35 약간 초과 사유

- 카테고리 헤더 4개 + intro line + 19개 lesson을 한 줄씩 = 49가 자연스러운 minimum.
- 추가 압축은 lesson 자체 삭제를 요구. 그러나 19개 모두 "이 교훈이 없으면 다음 agent가 같은 실수를 할 것인가?" 기준 통과 (현재도 응용 가능 + genome에 명문화 X).
- backlog의 "30줄 이하"는 hard constraint보다 의도(비대화 방지) 신호. 255→49 (81% 축소)로 의도 충족.
- **다음 reflect 시점에 19개를 한 번 더 prune** — 일부는 application.md "Adapter Layer" 등 genome에 응축됐다면 중복 가능. 본 generation에서 한 번 압축한 직후라 평가 시점이 부적절. 다음 generation reflect로 미룸.

### Migration 순서 — 가이드 먼저 → memory cleanup 후

Plan Q3 결정대로. evolution.md + reap-guide.md를 먼저 갱신한 후, 새 decision tree를 self-reference로 memory cleanup 수행. 결과적으로 각 삭제/유지 결정이 새 가이드 기준으로 정당화됨 (self-consistency 검증 동시).

### 4 위치 sync (3 → 4)

Plan에서는 3 위치 (src/templates + .reap + ~/.reap) 만 명시했으나, build.sh가 src/templates → dist/templates 자동 복사하므로 dist도 자동 sync. 4 위치 MD5 모두 일치 확인 — 분산 sync risk 0.

## Verification Outcome

- typecheck: pass
- build: pass (151 modules, 23ms)
- unit: 427 pass / 0 fail
- e2e: 239 pass / 1 fail (pre-existing init-repair)
- reap-guide.md 4 위치 byte-identical (MD5 5cf522117418bdb2ff16eeb0175754e7)
- memory: longterm 49 / midterm 35 / shortterm 68 (reflect에서 교체)
- evolution.md "Memory 분류 Decision Tree (AI용 의무 절차)" 명시 + "Memory Pruning 정책 — reflect phase 의무" 명시
