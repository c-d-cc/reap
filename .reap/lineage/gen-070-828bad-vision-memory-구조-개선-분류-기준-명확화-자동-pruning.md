---
id: gen-070-828bad
type: embryo
goal: "vision memory 구조 개선 — 분류 기준 명확화 + 자동 pruning + migration plan"
parents: ["gen-069-8d6f0e"]
---
# gen-070-828bad
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