# Planning

## Summary

Merge/분산 협업 워크플로우를 설계하고 genome domain 파일로 체계화한다. 코드 변경 없는 genome-only generation.

## Technical Context
- **Tech Stack**: Markdown (genome domain files)
- **Constraints**: genome 파일 ~100줄 한도, domain/ 가이드 준수, 코드 변경 없음

## Tasks

### T1: domain/collaboration.md 작성
분산 환경 전체 아키텍처:
- 핵심 원칙: opt-in 분산 (git pull/push 허용, reap pull/push/merge 추가)
- reap pull 워크플로우: git fetch + .reap/ 상태 스캔 + 새 generation 감지/알림
- reap push 워크플로우: REAP 상태 검증 + git push
- reap merge 워크플로우: genome-first merge orchestration (git ref 기반)
- 시나리오 예시: Machine A/B 병렬 작업 → merge 흐름
- git ref 기반 genome/lineage 읽기 (git show)

### T2: domain/merge-lifecycle.md 작성
Merge 5단계 상세 명세 (lifecycle-rules.md에서 이관 + 대폭 확장):
- Detect: git ref로 상대 branch genome/lineage 읽기, 공통 조상 DAG BFS, 변경 요약
- Genome Resolve: diff 추출, WRITE-WRITE/CROSS-FILE conflict 분류, 사람 판단
- Source Resolve: git merge --no-commit 실행, 확정 genome 기준 conflict 해결
- Sync Test: validation commands 실행, 실패 시 regression
- Completion: genome 확정본 반영, meta.yml에 type: merge + parents 기록
- 각 단계의 입력/출력/판단기준/artifact 내용

### T3: lifecycle-rules.md 정리
- "## Merge Generation Lifecycle" 섹션 제거
- `→ domain/merge-lifecycle.md 참조` 포인터만 남김

### T4: reap.merge.* slash command namespace 설계
constraints.md 또는 별도 domain 파일에 기록:
- `reap.merge.start` — merge generation 생성 (parents 지정)
- `reap.merge.detect` — detect 단계 실행
- `reap.merge.genome-resolve` — genome resolve 단계
- `reap.merge.source-resolve` — source resolve 단계
- `reap.merge.sync-test` — sync test 단계
- `reap.merge.evolve` — merge full lifecycle 실행
- 기존 reap.next/reap.back은 merge에서도 동작 (type 분기)

### T5: Merge hook event 타이밍 정의
hook-system.md에 추가:
- `onMergeStart` — reap.merge.start 후
- `onGenomeResolved` — genome-resolve 완료 후
- `onMergeComplete` — merge generation archiving 후
- 기존 onStageTransition은 merge stage에서도 동작

### T6: constraints.md 업데이트
- CLI subcommand에 pull, push, merge 추가 (미구현, 설계만)
- Slash commands에 reap.merge.* 추가

### T7: 구현 로드맵 backlog
향후 generation에서 구현할 항목을 backlog로 정리:
- reap merge 코드 구현 (git ref 기반 merge.ts 수정)
- reap pull / reap push CLI subcommand
- reap.merge.* slash command 템플릿 파일
- merge hook 등록 로직

## Dependencies

```
T1, T2 (독립, 병렬 가능)
T2 → T3 (merge 이관 후 정리)
T1 + T2 → T4, T5 (설계 기반)
T4 + T5 → T6 (constraints 반영)
T1~T6 → T7 (로드맵 정리)
```

## Files Modified

| File | Change |
|------|--------|
| `.reap/genome/domain/collaboration.md` | **신규** |
| `.reap/genome/domain/merge-lifecycle.md` | **신규** |
| `.reap/genome/domain/lifecycle-rules.md` | merge 섹션 제거, 포인터 추가 |
| `.reap/genome/domain/hook-system.md` | merge hook event 추가 |
| `.reap/genome/constraints.md` | CLI subcommand, slash commands 업데이트 |
