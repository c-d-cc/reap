# Implementation Log — gen-023-5e7967

## Completed Tasks

### T001: git.ts — pull 관련 git 유틸 함수 추가
`src/core/git.ts`에 6개 함수 추가:
- `gitCurrentBranch()` — 현재 브랜치명 반환
- `gitFetchAll()` — git fetch --all
- `gitAheadBehind()` — 두 ref 간 ahead/behind 카운트
- `gitHasRemoteBranch()` — remote tracking branch 존재 여부
- `gitUnmergedRemoteBranches()` — 미병합 remote 브랜치 목록
- `gitPullFfOnly()` — git pull --ff-only

### T002: pull.ts — pull CLI 핸들러 신규 생성
`src/cli/commands/run/pull.ts` 신규 생성. 기존 push.ts 패턴 참조.
- git fetch → branch 분석 → 4가지 케이스별 prompt 반환
- in-sync / ff-possible / diverged / ahead-only
- ff-possible인 경우 `--phase ff`로 fast-forward 실행 가능
- active generation 존재 시 경고 메시지 포함

### T003: knowledge.ts — knowledge CLI 핸들러 신규 생성
`src/cli/commands/run/knowledge.ts` 신규 생성.
- extra 파라미터로 subcommand 전달 (reload/genome/environment)
- reload: genome + environment + vision 파일 경로 반환 + 읽기 지시 prompt
- genome: genome 파일 경로 + 요약/수정 논의 prompt
- environment: environment 파일 경로 + 요약/업데이트 논의 prompt
- no argument: 선택지 prompt 반환

### T004: run/index.ts — pull, knowledge 핸들러 등록
`src/cli/commands/run/index.ts`에 pull, knowledge import + STAGE_HANDLERS 등록.

### T005: reap.abort.md — 1줄로 축소
34줄 → 5줄. `Run \`reap run abort $ARGUMENTS\` and follow the stdout instructions exactly.`

### T006: reap.merge.md — 축소
72줄 → 10줄. start + evolve 사용법 안내. 개별 stage 명령어 참조.

### T007: reap.pull.md — 1줄로 축소
58줄 → 5줄. `Run \`reap run pull $ARGUMENTS\` and follow the stdout instructions exactly.`

### T008: reap.knowledge.md — 1줄로 축소
46줄 → 5줄. `Run \`reap run knowledge $ARGUMENTS\` and follow the stdout instructions exactly.`

### T009: TypeCheck + Build 확인
- typecheck: 통과
- build: 0.40 MB, 121 modules, 26ms

### T010: 기존 테스트 실행
- unit: 82 pass, 0 fail
- e2e: 72 pass, 0 fail
- scenario: 41 pass, 0 fail
- 총 195 tests 전체 통과

## Changes Summary
| File | Action | Lines |
|------|--------|-------|
| `src/core/git.ts` | 수정 | +87 (6함수 추가) |
| `src/cli/commands/run/pull.ts` | 신규 | 147 |
| `src/cli/commands/run/knowledge.ts` | 신규 | 84 |
| `src/cli/commands/run/index.ts` | 수정 | +4 (import+등록) |
| `src/adapters/claude-code/skills/reap.abort.md` | 수정 | 34→5 |
| `src/adapters/claude-code/skills/reap.merge.md` | 수정 | 72→10 |
| `src/adapters/claude-code/skills/reap.pull.md` | 수정 | 58→5 |
| `src/adapters/claude-code/skills/reap.knowledge.md` | 수정 | 46→5 |
