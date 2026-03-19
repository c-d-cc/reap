# Merge Lifecycle

> Merge generation의 5단계 상세 명세. Normal lifecycle과 완전 분리.

## Stage Order

```
Detect → Genome Resolve → Source Resolve → Sync Test → Completion
```

## 분리 원칙

- `GenerationManager` — normal 전용
- `MergeGenerationManager` — merge 전용
- `lineage.ts` — 공유 lineage 조회 유틸 (읽기 전용)
- `MergeLifeCycle` — merge stage 상태 머신 (LifeCycle과 별도)

## current.yml 구조 (merge)

```yaml
id: gen-047-f5c3b7
type: merge
parents: [gen-046-a3f8c2, gen-046-d4e9a1]
commonAncestor: gen-045-7b2e1f
stage: genome-resolve
```

## 단계별 명세

### 1. Detect

| 항목 | 내용 |
|------|------|
| **입력** | parents (2개 branch/generation ID) |
| **동작** | git ref로 양쪽 .reap/lineage/ 스캔, 공통 조상 DAG BFS 탐색, genome diff 추출 |
| **출력** | 01-detect.md — parents, 공통 조상, 양쪽 genome 변경 요약, conflict 목록 |
| **판단** | conflict이 없으면 genome-resolve를 자동 통과 가능 |

### 2. Genome Resolve

| 항목 | 내용 |
|------|------|
| **입력** | 01-detect.md의 conflict 목록 |
| **동작** | WRITE-WRITE: 사람이 어느 쪽 선택 또는 병합. CROSS-FILE: 사람이 논리적 정합성 판단 |
| **출력** | 02-genome-resolve.md — conflict별 resolution 기록 + 확정 genome 스냅샷 |
| **판단** | 모든 conflict에 resolution이 있어야 다음 단계로 |

### 3. Source Resolve

| 항목 | 내용 |
|------|------|
| **입력** | 확정된 genome + 두 branch의 소스 |
| **동작** | `git merge --no-commit {target-branch}` 실행 → conflict 해결 (AI + 사람) |
| **출력** | 03-source-resolve.md — semantic conflict 목록 + 해결 내역 |
| **판단** | 확정 genome과 source가 일관되어야 함 |

### 4. Sync Test

| 항목 | 내용 |
|------|------|
| **입력** | merged source + 확정 genome |
| **동작** | constraints.md의 validation commands 실행 (test, tsc, build) |
| **출력** | 04-sync-test.md — 각 명령어 결과 |
| **판단** | 전부 pass → completion. 실패 → source-resolve 또는 genome-resolve로 regression |

### 5. Completion

| 항목 | 내용 |
|------|------|
| **입력** | 통과된 sync test |
| **동작** | genome 확정본을 .reap/genome/에 반영, git commit, meta.yml 저장 (type: merge, parents) |
| **출력** | 05-completion.md — summary, genome changelog |
| **판단** | — |

## Artifact Rules

| Stage | Artifact | Gate |
|-------|----------|------|
| Detect | 01-detect.md | — |
| Genome Resolve | 02-genome-resolve.md | 01-detect.md |
| Source Resolve | 03-source-resolve.md | 02-genome-resolve.md |
| Sync Test | 04-sync-test.md | 03-source-resolve.md |
| Completion | 05-completion.md | 04-sync-test.md |

## Regression

- Sync Test 실패 → Source Resolve 또는 Genome Resolve로 회귀
- Source Resolve에서 genome 문제 발견 → Genome Resolve로 회귀
- 회귀 규칙은 normal과 동일 (timeline 기록, artifact에 Regression 섹션)
