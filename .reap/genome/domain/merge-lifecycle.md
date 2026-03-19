# Merge Lifecycle

> Merge generation의 6단계 상세 명세. Normal lifecycle과 완전 분리.

## Stage Order

```
Detect → Mate → Merge → Sync → Validation → Completion
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
stage: mate
```

## 단계별 명세

### 1. Detect

| 항목 | 내용 |
|------|------|
| **입력** | parents (2개 branch/generation ID) |
| **동작** | git ref로 양쪽 .reap/lineage/ 스캔, 공통 조상 DAG BFS 탐색, genome diff 추출 |
| **출력** | 01-detect.md — parents, 공통 조상, 양쪽 genome 변경 요약, conflict 목록 |
| **판단** | conflict이 없으면 mate를 자동 통과 가능 |

### 2. Mate (Genome Mating)

| 항목 | 내용 |
|------|------|
| **입력** | 01-detect.md의 conflict 목록 |
| **동작** | WRITE-WRITE: 사람이 어느 쪽 선택 또는 병합. CROSS-FILE: 사람이 논리적 정합성 판단 |
| **출력** | 02-mate.md — conflict별 resolution 기록 + 확정 genome |
| **판단** | 모든 conflict에 resolution이 있어야 다음 단계로 |

### 3. Merge (Source Merge)

| 항목 | 내용 |
|------|------|
| **입력** | 확정된 genome + 두 branch의 소스 |
| **동작** | `git merge --no-commit {target-branch}` 실행 → conflict 해결 (AI + 사람) |
| **출력** | 03-merge.md — source conflict 목록 + 해결 내역 |
| **판단** | 커밋하지 않음 — sync + validation 통과 후 |

### 4. Sync (Genome-Source Consistency)

| 항목 | 내용 |
|------|------|
| **입력** | merged source + 확정 genome |
| **동작** | AI가 genome 규칙과 소스 코드를 비교. 불일치 발견 시 **사용자 컨펌 필수** |
| **출력** | 04-sync.md — genome-source 비교 결과, 불일치 항목, 사용자 결정 |
| **판단** | 불일치 해결 후 다음 단계. 해결 불가 시 merge 또는 mate로 regression |

### 5. Validation

| 항목 | 내용 |
|------|------|
| **입력** | synced source + 확정 genome |
| **동작** | constraints.md의 validation commands 실행 (test, tsc, build) |
| **출력** | 05-validation.md — 각 명령어 결과 |
| **판단** | 전부 pass → completion. 실패 → merge 또는 mate로 regression |

### 6. Completion

| 항목 | 내용 |
|------|------|
| **입력** | 통과된 validation |
| **동작** | git commit, meta.yml 저장 (type: merge, parents), archiving |
| **출력** | 06-completion.md — summary, genome changelog |
| **판단** | — |

## Artifact Rules

| Stage | Artifact | Gate |
|-------|----------|------|
| Detect | 01-detect.md | — |
| Mate | 02-mate.md | 01-detect.md |
| Merge | 03-merge.md | 02-mate.md |
| Sync | 04-sync.md | 03-merge.md |
| Validation | 05-validation.md | 04-sync.md |
| Completion | 06-completion.md | 05-validation.md |

## Regression

- Validation 실패 → Merge 또는 Mate로 회귀
- Sync 불일치 → Merge 또는 Mate로 회귀
- Merge에서 genome 문제 발견 → Mate로 회귀
- 회귀 규칙은 normal과 동일 (timeline 기록, artifact에 Regression 섹션)
