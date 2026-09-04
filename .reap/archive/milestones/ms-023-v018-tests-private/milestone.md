---
id: ms-023
slug: v018-tests-private
title: 테스트 비공개 — reap-test v0.18 submodule과 CI dispatch
from: loop-0004-plan
refs:
  - ps-5e948f:07-i18n-docs-delegate.md
status: closed
openedAt: 2026-09-04T00:04:12Z
closedAt: 2026-09-04T01:33:58Z
---
## Background

사람 Q3 답 B(2026-09-04). v0.17 방식 — `c-d-cc/reap-test` private 리포 submodule + CI dispatch. 규범은 [07-i18n-docs-delegate.md](../../../../docs/reap-plan/reap_v_0_18_release/07-i18n-docs-delegate.md)의 G11. 로컬 클론은 `~/cdws/reap_v17/tests`(remote origin = reap-test).

## Exit Criteria

- reap-test 로컬 클론에 `v0.18` 브랜치: 이 리포 `tests/` 전부 + `.github/workflows/`(dispatch 수신 — `repository_dispatch: reap-push`, `reap_sha`·`tests_sha`로 두 리포 체크아웃, `bun install`·`bun test`·`hook.test.sh`·`verify-package.sh`) + README 한 줄. 커밋됨, **push는 사람**
- 이 리포: `tests/`가 submodule(`.gitmodules` url reap-test, branch v0.18). 로컬에서 `bun test`가 그대로 돈다(submodule 디렉토리가 체크아웃돼 있다)
- `.github/workflows/ci.yml`: 테스트 직접 실행을 dispatch로 교체 — 단 `bun run typecheck`·`bun run build`·`verify-package.sh`(테스트 없이 돌 수 있는 부분)는 남긴다. `release.yml`도 같은 방식(테스트는 dispatch 결과를 기다리지 못하므로 — v0.17이 그랬듯 — release는 typecheck·build·verify만 돌고, 테스트는 push 시 dispatch에 맡긴다. 그 사실을 06-release에 적는다)
- `complete/SKILL.md`에 "tests가 submodule이면 `git add tests`로 포인터를 stage한다" 한 줄. `environment/summary.md`의 테스트 절 갱신
- `TEST_DISPATCH_TOKEN` 시크릿이 필요하다는 것과 만드는 법(fine-grained PAT, reap-test contents:write)을 06-release 발행 준비물에

## Out of Scope

- reap-test push·시크릿 등록 — 사람
- v0.17-bridge 브랜치 — 손대지 않는다

## Plan Items

1. reap-test v0.18 브랜치 + 워크플로 (tasks/1)
2. 이 리포 submodule 전환 + ci/release + skill·문서 (tasks/2)

## Constraints

- submodule url은 https(v0.17과 같이). 로컬 체크아웃은 `~/cdws/reap_v17/tests` 클론에서 `git worktree`나 별도 clone으로 — reap_v17의 서브모듈 체크아웃(v0.17-bridge)을 움직이지 않는다

## Fitness (2026-09-04, 사람의 전체 위임 하 agent 판정)

- Exit Criteria 5개 전부 handoff 대조표에 근거. push·시크릿 등록은 사람 — reap-test v0.18(4a5006e)이 push되기 전까지 `.gitmodules`의 GitHub URL은 남에게 죽은 포인터다. 주 트리는 `.git/config`의 로컬 경로 override로 체크아웃했다(`git config submodule.tests.url`) — push 뒤 그 override를 지운다
- 개발 마찰: worktree에 submodule이 있으면 `git worktree remove`가 `--force`를 요구한다. 위임 모드의 worktree 흐름에 한 줄 필요 → lessons가 아니라 orchestrate skill 산문(다음 세대)
