# Completion — gen-023-5e7967

## Summary

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

## Lessons Learned

- abort는 이미 CLI 구현이 완전했으므로 스킬 축소만 필요했음. 다른 스킬도 동일 패턴으로 이전할 때, 기존 CLI 구현 상태를 먼저 확인하면 작업량을 정확히 산정할 수 있음.
- merge는 stage handler와 이름 충돌 문제가 있었으나, evolve가 이미 merge lifecycle을 처리하므로 별도 오케스트레이터 없이 해결. 스킬에서 start + evolve 안내로 충분.
- knowledge의 subcommand 전달에 `extra` 파라미터(기존에는 feedback/reason/goal)를 활용. run/index.ts에서 `options.goal`이 extra로 전달되므로 `--goal reload` 형태로 subcommand 지정 가능.

## Next Generation Hints

- 나머지 스킬들(reap.start, reap.evolve, reap.back, reap.next, reap.push, reap.status 등)도 같은 패턴으로 축소 가능. 다만 대부분 이미 CLI 핸들러가 있으므로 스킬 축소만 필요.
- pull/knowledge에 대한 e2e 테스트 추가 고려 (현재 수동 검증으로 통과).
- environment/summary.md에 pull.ts, knowledge.ts 추가 반영 필요 (이번 세대 reflect에서 처리).
