# Planning

## Summary

merge.ts의 genome 읽기를 git ref 기반으로 리팩터하고, `reap merge {branch}` CLI subcommand를 구현한다.

## Technical Context
- **Tech Stack**: TypeScript, Commander.js, child_process (git 명령)
- **Constraints**: Node.js fs/promises, 외부 서비스 없음

## Tasks

### T1: src/core/git.ts 신규 — git ref 유틸
- `gitShow(ref: string, path: string, cwd: string)` — `git show {ref}:{path}` 실행, 내용 반환
- `gitLsTree(ref: string, path: string, cwd: string)` — `git ls-tree` 실행, 파일 목록 반환
- `gitRefExists(ref: string, cwd: string)` — ref 존재 여부 확인

### T2: merge.ts 리팩터 — git ref 기반 genome 읽기
- `readGenomeFiles` → `readGenomeFilesFromRef(ref, genomePath, cwd)` 추가 (git show 기반)
- `extractGenomeDiff` → ref 기반 오버로드: `extractGenomeDiffFromRefs(ancestorRef, currentRef, genomePath, cwd)`
- `detectDivergence` → ref 기반 오버로드: `detectDivergenceFromRefs(...)`
- 기존 filesystem 기반 함수는 유지 (하위 호환)

### T3: MergeGenerationManager.create() 확장
- `create(parents, goal)` → branch ref를 받아 git ref 기반 detect 수행
- 상대 branch의 lineage meta.yml을 git show로 읽어 공통 조상 탐색

### T4: src/cli/commands/merge.ts 신규 — CLI subcommand
- `reap merge {branch}` — MergeGenerationManager.create() 호출
- 01-detect.md artifact 자동 생성 (DivergenceReport 기반)
- 에러 처리: branch 미존재, active generation 있음, 공통 조상 없음

### T5: src/cli/index.ts에 merge subcommand 등록

### T6: 테스트
- `bunx tsc --noEmit`, `bun test`, `npm run build`

## Dependencies

```
T1 → T2 → T3 → T4 → T5 → T6
```

## Files Modified

| File | Change |
|------|--------|
| `src/core/git.ts` | **신규** — git ref 유틸 |
| `src/core/merge.ts` | git ref 기반 함수 추가 |
| `src/core/merge-generation.ts` | create() 확장 |
| `src/cli/commands/merge.ts` | **신규** — CLI subcommand |
| `src/cli/index.ts` | merge subcommand 등록 |
