---
id: gen-023-5e7967
type: embryo
goal: "prompt 기반 flow를 CLI script로 이전 (merge, pull, knowledge, abort)"
parents: ["gen-022-947193"]
---
# gen-023-5e7967
4개 스킬(abort, merge, pull, knowledge)의 flow 제어 로직을 prompt에서 CLI script로 이전 완료.

### Changes
- `src/core/git.ts` — 6개 git 유틸 함수 추가 (currentBranch, fetchAll, aheadBehind, hasRemoteBranch, unmergedRemoteBranches, pullFfOnly)
- `src/cli/commands/run/pull.ts` (신규) — git fetch + branch 분석 + 4가지 케이스별 prompt 반환
- `src/cli/commands/run/knowledge.ts` (신규) — reload/genome/environment/no-arg 4가지 subcommand 처리
- `src/cli/commands/run/index.ts` — pull, knowledge 핸들러 등록
- 스킬 4개 축소: abort(34→5줄), merge(72→10줄), pull(58→5줄), knowledge(46→5줄)

### Test Results
- 229 tests 전체 통과 (unit 116 + e2e 72 + scenario 41)
- 신규 테스트 34개: pull(13), knowledge(6), git-pull-functions(15)