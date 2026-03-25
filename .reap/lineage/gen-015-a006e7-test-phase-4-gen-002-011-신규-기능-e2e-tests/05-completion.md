# Completion — gen-015-a006e7

## Summary
gen-002~011에서 추가된 7개 기능에 대한 e2e 테스트 5개를 작성했다. 기존 1개와 합쳐 총 6개 e2e 테스트, 71 assertions가 모두 통과.

### Changes
- tests/e2e/test-init-claude-md.sh: 14 assertions (CLAUDE.md 생성/append 3 시나리오 + evolution.md 검증)
- tests/e2e/test-make-backlog.sh: 13 assertions (backlog 생성 + frontmatter + invalid type + createdAt)
- tests/e2e/test-backlog-consume.sh: 9 assertions (consume flow + consumedBy/consumedAt + sourceBacklog)
- tests/e2e/test-archive-backlog.sh: 17 assertions (full lifecycle + backlog 분리 검증)
- tests/e2e/test-cli-commands.sh: 9 assertions (version, status, make, cruise, help, start)

### Validation: PASS (typecheck, build, unit 55/55, e2e 6/6)

## Lessons Learned
- e2e에서 full lifecycle을 돌릴 때 각 stage는 work phase 진입(nonce 설정)이 필수. `--phase complete`만 직접 호출하면 nonce 검증 실패.
- `createBacklog`의 invalid type 에러가 JSON `emitError`가 아닌 plain throw로 나옴. CLI 에러 핸들링 일관성 개선 여지 있음.
- T004 (archive)는 git init + commit 필요 — completion commit이 gitCommitAll을 호출하므로 git repo가 아닌 환경에서는 commit hash가 null.

## Next Generation Hints
- tests/ submodule 커밋 + 푸시 필요
- `e2e-init-claude-md-scenarios.md` backlog는 이번 gen에서 T001로 이미 구현됨 — 중복 제거 가능
- CLI 에러 핸들링 일관성: throw → emitError 통일 검토 (backlog type validation 등)
- 남은 unit test 대상: stage-transition.ts, maturity.ts, cruise.ts
