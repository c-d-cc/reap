# Planning

## Summary
compression.ts Level 2 재설계 + reap.completion 커맨드에 compression 단계 추가

## Tasks

### 1. compression.ts 상수 변경
- `LEVEL2_BATCH_SIZE = 5` → 삭제 (배치 아님, 싱글 파일)
- `LEVEL2_MIN_LEVEL1_COUNT = 100` 추가 (Level 1이 100개 초과 시 트리거)
- `LEVEL2_PROTECTED_COUNT = 9` 추가 (최근 9개 Level 1 보호)

### 2. git.ts에 branch 목록 조회 함수 추가
- `gitAllBranches(cwd)`: local + remote branch 이름 목록 반환
- `git branch -a --format='%(refname:short)'`

### 3. compression.ts fork 검사 함수 추가
- `findForkedGenerations(paths, cwd)`: 모든 branch의 lineage에서 parents를 수집하여 fork point 탐지
- 다른 branch에서 parent로 참조되는 generation ID set 반환
- fork point 이후의 모든 generation은 Level 2 압축 불가

### 4. compressLevel2 재작성
- 여러 epoch-NNN.md → 싱글 `epoch.md`
- frontmatter에 `generations` 배열 (id, parents, genomeHash per gen)
- body에 각 generation 한 줄 요약
- 기존 epoch.md가 있으면 append (frontmatter merge)
- Level 1 파일 중 보호 대상(최근 9개 + fork 이후) 제외하고 나머지 압축

### 5. reap.completion.md 템플릿에 compression 단계 추가
- completion artifact 작성 후 compression 판단/실행 안내

### 6. reap.merge.start.md에 epoch fork 차단 추가
- merge start 시 parent가 epoch에 포함된 generation이면 에러

## Dependencies
- Task 2 → Task 3 (git.ts 필요)
- Task 3 → Task 4 (fork 검사 필요)
