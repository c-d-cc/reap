# Planning

## Summary

Merge Generation lifecycle을 구현한다. 기존 normal lifecycle과 완전히 분리된 `MergeGenerationManager`를 만들어, normal 코드에 영향을 주지 않는다. lineage 조회 유틸만 공유.

## Technical Context
- **Tech Stack**: TypeScript, Node.js, Commander.js
- **Constraints**: 기존 normal lifecycle 코드 변경 최소화, 로컬 파일시스템만 사용

## Design Decisions

### 분리 전략
- `GenerationManager` — normal 전용, 기존 코드 그대로 유지
- `MergeGenerationManager` — merge 전용, 별도 클래스
- **공유**: lineage 조회(`listMeta`, `readMeta`, `listCompleted`)를 `src/core/lineage.ts`로 추출
- **각자 소유**: `create`, `advance`, `complete` 는 각 매니저가 독립 구현

### 타입 시스템 확장
- `MergeStage` 타입 별도 정의 (`"detect" | "genome-resolve" | "source-resolve" | "sync-test" | "completion"`)
- `MERGE_LIFECYCLE_ORDER` 상수 별도 정의
- `GenerationState.stage`를 `LifeCycleStage | MergeStage` union으로 확장
- `GenerationState`에 `commonAncestor?: string` 추가

### LifeCycle 분리
- `LifeCycle` 클래스 — normal 전용, 변경 없음
- `MergeLifeCycle` 클래스 — merge 전용, 동일 인터페이스

## Tasks

### T1: 타입 확장 (`src/types/index.ts`)
- `MergeStage` 타입 추가
- `MERGE_LIFECYCLE_ORDER` 상수 추가
- `GenerationState.stage`를 `LifeCycleStage | MergeStage`로 확장
- `TimelineEntry.stage` 동일 확장
- `GenerationState`에 `commonAncestor?: string` 추가

### T2: Lineage 유틸 추출 (`src/core/lineage.ts`)
- `GenerationManager`에서 `listCompleted`, `readMeta`, `listMeta`, `nextSeq` 추출
- `GenerationManager`와 `MergeGenerationManager` 모두 이 유틸 사용
- `GenerationManager`는 추출된 유틸을 호출하도록 리팩터 (위임)

### T3: MergeLifeCycle 클래스 (`src/core/merge-lifecycle.ts`)
- `LifeCycle`과 동일 인터페이스 (next, prev, canTransition, label, isComplete, isValid, stages)
- `MERGE_LIFECYCLE_ORDER` 기반 동작

### T4: MergeGenerationManager (`src/core/merge-generation.ts`)
- `create(parents: string[], goal: string)` — commonAncestor 자동 탐색, type: merge, stage: detect
- `advance()` — `MergeLifeCycle.next()` 사용
- `complete()` — merge artifact archiving + 확정된 genome 반영 + meta.yml 저장
- `current()` — lineage 유틸 + current.yml 읽기

### T5: Merge 핵심 로직 (`src/core/merge.ts`)
- `findCommonAncestor(parentA, parentB, metas)` — DAG LCA 탐색
- `detectDivergence(ancestorDir, parentADir, parentBDir)` — genome/source 변경 요약
- `extractGenomeDiff(ancestorGenome, currentGenome)` — file-level diff
- `classifyConflicts(diffA, diffB)` — WRITE-WRITE, CROSS-FILE 분류
- `runSyncTest(projectRoot)` — validation commands 실행

### T6: Merge artifact 템플릿 (`src/templates/artifacts/merge/`)
- `01-detect.md` — Divergence 분석 결과
- `02-genome-resolve.md` — Genome conflict + resolution
- `03-source-resolve.md` — Source conflict + resolution
- `04-sync-test.md` — Sync test 결과
- `05-completion.md` — merge completion

### T7: init/update에 merge 템플릿 설치 로직 추가
- `src/commands/init.ts` — merge 템플릿을 `~/.reap/templates/merge/`에 복사
- `src/commands/update.ts` — 동일

### T8: 테스트
- 타입 체크 (`bunx tsc --noEmit`)
- 기존 테스트 통과 (`bun test`)

## Dependencies

```
T1 → T2 → T4
T1 → T3 → T4
T1 → T5
T6 (독립)
T1 + T6 → T7
T1~T7 → T8
```

## Files Modified

| File | Change |
|------|--------|
| `src/types/index.ts` | MergeStage, MERGE_LIFECYCLE_ORDER, stage union 확장 |
| `src/core/lineage.ts` | **신규** — lineage 조회 공유 유틸 |
| `src/core/merge-lifecycle.ts` | **신규** — MergeLifeCycle 클래스 |
| `src/core/merge-generation.ts` | **신규** — MergeGenerationManager 클래스 |
| `src/core/merge.ts` | **신규** — merge 핵심 로직 (LCA, diff, conflict, sync test) |
| `src/core/generation.ts` | lineage 메서드를 lineage.ts 위임으로 변경 |
| `src/core/lifecycle.ts` | 변경 없음 |
| `src/templates/artifacts/merge/` | **신규** — 5종 artifact 템플릿 |
| `src/commands/init.ts` | merge 템플릿 설치 |
| `src/commands/update.ts` | merge 템플릿 설치 |
