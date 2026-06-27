# Shortterm Memory

## 세션 요약 (gen-070, 2026-06-27 시작 → 2026-06-28 commit)

### gen-070: vision memory 구조 개선 — content-type tier 재정의 + 1회성 cleanup + 가이드 갱신

backlog `vision-memory-구조-개선-분류-기준-명확화-자동-pruning.md` (사용자 강조: migration plan 포함) 의 직접 구현.

**핵심 변경**:

- **가이드 (4 위치 sync)**: `.reap/genome/evolution.md` Memory 절 + `src/templates/reap-guide.md` Memory 섹션 + `.reap/reap-guide.md` + `~/.reap/reap-guide.md` + (자동) `dist/templates/reap-guide.md`. MD5 동일.
  - Decision tree 4-branch 명시 (shortterm/midterm/longterm/삭제).
  - Pruning policy 의무화 — shortterm 매번 / midterm 트랙 완료 시 / longterm 주기적.
  - "Do NOT write" 명시.
- **memory 1회성 cleanup**:
  - longterm 255 → 49줄 (81% 축소, 4 카테고리 + 19 lesson 1줄 압축)
  - midterm 134 → 35줄 (74% 축소, 진행 중 트랙 3개만)
  - shortterm 교체 (본 파일, reflect 의무)

**결과**: typecheck pass / build pass / unit 427-0 / e2e 239 pass 1 fail (pre-existing). 회귀 0.

### 다음 세션 / 다음 generation

가장 가능성 높은 1순위 (midterm 트랙 기준):

1. **MCP server wrapper** (daemon 트랙). design 문서 (`vision/design/daemon-mcp.md`) 부터 시작 권장. claude-code / opencode 양 client 공용.
2. **Evaluator Vision/Goal 위임** (evaluator 트랙 마지막). adapt phase에서 evaluator가 gap 분석 + goal 추천. `vision/design/evaluator-agent.md` 잔여 절.
3. **Release v0.16.6** — gen-068 + gen-069 + gen-070 묶음. memory cleanup도 사용자가 다른 프로젝트에 적용해보고 싶을 가능성.

### deferred 후보 (사용자 판단 후 backlog 화)

본 generation 신규:
1. **3 위치 reap-guide.md 자동 sync** — marker-hash 패턴 (gen-054) 응용. template 수정 자동 propagate.
2. **reflect phase 자동 줄 수 측정 + 경고** — longterm > 50, midterm > 70 시 prompt. 새 pruning policy의 mechanical guard.
3. **memory 파일 frontmatter schema** — last-pruned-at 등 메타데이터. 당장 plain markdown 유지.
4. **submodule 관련 반복 문제 별도 backlog** — 구 midterm "submodule 관련 반복 문제" 항목 (본 generation 에서 memory cleanup 시 제거). proper backlog로 분리.
5. **longterm 두 번째 prune** — 49 → ~30 목표. genome 중복 항목 (Adapter dispatch / Opt-in pattern 등) 통합 가능. 본 generation 직후 평가 부적절, 다음 10-gen 주기 검토.

이전 세션 누적 (gen-066~069 shortterm에 있던 항목 — 본 generation에서 정리 안 한 것):
- daemon dist queries path resolution fix (gen-069 deferred 1번) — 다음 daemon 작업 시 함께
- import-resolver `.js` extension 자동 strip (gen-069 deferred 2번) — 다음 daemon 작업 시 함께
- `copyFixture()` realpath() 자동 적용 (gen-069 deferred 3번)
- Codex adapter (대형 트랙)
- `reap make backlog` 외 경로로 만든 backlog warn
- TS `noUnusedLocals` / `noUnusedParameters` 활성화 검토
- evaluator concerns 중복 detection 경고
- `report-evaluator` resolve/dismiss CLI

→ 사용자가 묶음 처리하거나 우선순위 정해서 backlog 생성 권장.

### 코드 변경 위치 (다음 세션 참조용)

**가이드 (4 위치)**:
- `.reap/genome/evolution.md` — Memory 절 재작성 (lines 45~)
- `src/templates/reap-guide.md` — Memory 섹션 재작성 (lines 23~)
- `.reap/reap-guide.md` + `~/.reap/reap-guide.md` + `dist/templates/reap-guide.md` — template 동기화

**Memory**:
- `.reap/vision/memory/longterm.md` — 4 카테고리 그룹화
- `.reap/vision/memory/midterm.md` — 트랙 3개만
- `.reap/vision/memory/shortterm.md` — 본 파일 (gen-070 핸드오프)

### Backlog 상태 (gen-070 commit 직후)

- `vision-memory-구조-개선-분류-기준-명확화-자동-pruning.md` (consumedBy: gen-070-828bad) → archive 시 `lineage/gen-070-*/backlog/` 로 이동.
- pending 항목: 0 예상.

### 자기-참조 검증 (self-dogfooding)

본 generation reflect phase가 새 Memory Pruning Policy의 첫 사용자. 적용 결과:
- ✅ shortterm.md를 본 파일로 **교체** (덮어쓰기, 누적 X) — policy 부합
- ✅ midterm 추가 cleanup 없음 (이미 implementation에서 35줄로 압축, 트랙 변화 없음)
- ✅ longterm 추가 lesson 없음 (echo chamber 방지 — 일반화 가능한 새 lesson 없음, 49줄 유지)
- → Pruning policy 자체가 작동함을 본 generation이 입증.
