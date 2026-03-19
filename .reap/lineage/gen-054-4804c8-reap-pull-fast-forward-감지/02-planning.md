# Planning

## Tasks

### T1: canFastForward() 함수 (merge-generation.ts)
- 상대 branch의 lineage DAG에서 로컬 최신 generation이 ancestor에 포함되는지 확인
- git ref로 상대 branch의 meta.yml들을 읽고 DAG 탐색
- 반환: `{ fastForward: boolean, reason: string }`

### T2: reap.pull.md — fast-forward 분기 추가
- Phase 1 (Fetch + Detect) 후 canFastForward 판단
- fast-forward → `git merge --ff {branch}` + lineage 동기화 + STOP
- 아니면 → 기존 Phase 2 (full merge lifecycle)

### T3: tsc, bun test, build
