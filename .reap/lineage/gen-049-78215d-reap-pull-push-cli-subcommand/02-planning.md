# Planning

## Summary
reap pull과 reap push CLI subcommand를 구현한다.

## Tasks

### T1: src/cli/commands/pull.ts
- `git fetch origin` (또는 --remote 옵션)
- 원격 branch들의 .reap/lineage/ 스캔 (git ls-remote + git ls-tree)
- 로컬에 없는 generation ID 감지
- 결과 출력: branch별 새 generation 목록

### T2: src/cli/commands/push.ts
- active generation 상태 확인 (current.yml이 비어있거나 completion이어야)
- 경고 후 git push origin {current-branch}

### T3: src/cli/index.ts에 pull, push subcommand 등록

### T4: 테스트 — tsc, bun test, build
