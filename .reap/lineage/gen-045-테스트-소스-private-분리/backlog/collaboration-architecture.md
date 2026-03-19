---
type: task
status: pending
priority: high
title: 멀티머신 협업 아키텍처 도입
---

# 멀티머신 협업 아키텍처

## 목표

REAP에 멀티머신/멀티에이전트 협업 지원을 추가한다. 서버 없이, 로컬 + Git 기반 원칙을 유지하면서.

## 핵심 설계 결정

### 1. Generation ID: `gen-{seq}-{hash}`

- **hash**: content hash (parents, goal, genomeHash, machineId, startedAt)로 생성 → 전역 고유성 보장
- **seq**: 로컬 DAG 순회로 계산한 표시용 순번 → 사람이 읽기 쉬움
- hash가 진짜 ID, seq가 겹쳐도 hash가 다르면 다른 generation

```
Machine A: gen-042-a3f8c2 (인증)
Machine B: gen-042-d4e9a1 (검색)  ← seq 같아도 hash 다름
Merge:     gen-043-f5c3b7
```

### 2. DAG 기반 Lineage (선형 → 그래프)

- 현재: gen-041 → gen-042 → gen-043 (선형)
- 변경: Generation이 `parents` 배열로 부모를 참조하는 DAG 구조
- 병렬 generation 자연스럽게 지원, fork/merge 표현 가능

```yaml
id: gen-043-f5c3b7
type: merge
parents: [gen-042-a3f8c2, gen-042-d4e9a1]
commonAncestor: gen-041-7b2e1f
```

### 3. Merge Generation (특수 Generation 타입)

일반 generation과 다른 lifecycle:

```
일반:  Objective → Planning → Implementation → Validation → Completion
Merge: Detect → Genome Resolve → Source Resolve → Sync Test → Completion
```

```yaml
# current.yml
id: gen-043-f5c3b7
type: merge
parents: [gen-042-a3f8c2, gen-042-d4e9a1]
stage: genome-resolve
```

Artifact:
- `01-detect.md` — fork된 generation 식별, 변경 요약
- `02-genome-resolve.md` — genome conflict + 판단 결과
- `03-source-resolve.md` — source semantic conflict + 해결 내역
- `04-sync-test.md` — genome↔source 정합성 검증 결과
- `05-completion.md` — 기존과 동일

### 4. Genome Conflict Resolution

**순서가 핵심**: Genome 먼저 확정 → Source를 맞춤 → Sync Test로 검증

```
Phase 1: Genome Resolve
  - 공통 조상 genome snapshot 기준으로 양쪽 diff 추출
  - 같은 파일 수정 → WRITE-WRITE conflict
  - 다른 파일이라도 양쪽 다 변경 → CROSS-FILE로 표시
  - genome-conflicts.md 생성 → 사람이 판단

Phase 2: Source Resolve
  - 확정된 genome 기준으로 source semantic conflict 해결

Phase 3: Sync Test (gate)
  - genome ↔ source 정합성 검증 (테스트 통과 필수)
  - 실패 시 Phase 2 또는 Phase 1로 regression
```

비유: Genome 확정 = 헌법 개정, Source resolve = 법률 정비, Sync test = 위헌 심사

### 5. 기각한 접근법

| 접근 | 기각 사유 |
|------|-----------|
| Server-Client 구조 | "외부 서비스 의존 없음" 원칙 위반, REAP이 SaaS가 됨 |
| Optimistic Rollup | merge generation에서 source도 함께 resolve하므로 불필요 |
| Hash chain + reads 추적 | Genome이 ~260줄로 작아서 "변경 전부 보여주기"가 가능, 복잡한 read-set 추적 불필요 |
| 순번 기반 ID 유지 | 멀티머신에서 같은 번호 생성 → 충돌 불가피 |

## 구현 범위 (예상)

- [ ] Generation ID 체계 변경 (seq → seq-hash)
- [ ] current.yml 스키마에 type, parents, commonAncestor 추가
- [ ] DAG 기반 lineage 저장/조회
- [ ] Merge generation lifecycle (5단계)
- [ ] genome-conflicts.md 자동 생성 로직
- [ ] Sync test 명령어
- [ ] 기존 선형 lineage → DAG 마이그레이션
