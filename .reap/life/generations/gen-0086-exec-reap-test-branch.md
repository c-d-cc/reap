---
id: gen-0086-exec
slug: reap-test-branch
type: exec
milestone: ms-023
title: reap-test v0.18 브랜치와 dispatch 워크플로
startedAt: 2026-09-04T00:07:05Z
startCommit: 142c11e
status: closed
closedAt: 2026-09-04T00:14:33Z
endCommit: 172b11d
---
## Intent

ms-023 task 1 — reap-test 로컬 클론에 `v0.18` 브랜치(이 리포 tests/ 전부 + dispatch 워크플로 + README 한 줄). 커밋만, push는 사람. task 2(submodule 전환)는 다음 세대.

수행: worktree `../reap-wt-tests`(브랜치 `ms-023-tests`)에서 subagent — 리포 쪽 변경은 없고 scratchpad의 reap-test 클론에 커밋한다.

## Outcome

- 클론: `/private/tmp/claude-501/-Users-hichoi-cdws-reap/914296f2-726f-4898-a743-f0894f15c233/scratchpad/reap-test`(origin `https://github.com/c-d-cc/reap-test.git`, gh 인증으로 직접 clone)
- 브랜치 `v0.18` = `origin/main`에서 분기, 커밋 `2f84fc8dbece924d553bcea52ba175604abb5fed` 1개. **push 안 함**
- 내용: v0.17 `unit/`·`e2e/`·`scenario/`·`helpers/setup.ts`를 전부 지우고 이 리포 `tests/`의 15개 `*.test.ts` + `helpers.ts` + `hook.test.sh`(실행 권한 유지)를 루트로 복사. 두 스위트 다 리포 루트 상대 경로(`../src/...`, `$(dirname "$0")/..`)를 쓰므로 submodule로 `tests/`에 물려도 그대로 동작
- `.github/workflows/test.yml` → `dispatch.yml`로 교체: `on: repository_dispatch: types: [reap-push]`, 1) `c-d-cc/reap`을 `reap_sha`로 checkout(`submodules: false`, 공개라 토큰 불필요) 2) 자기 자신을 `tests/`에 `tests_sha`로 checkout(비공개지만 자기 자신이라 기본 `GITHUB_TOKEN`으로 충분 — 워크플로 주석에 명시) 3) `setup-bun`·`setup-node@22` 4) `bun install --frozen-lockfile` → `typecheck` → `bun test` → `bash tests/hook.test.sh` → `bun run build` → `bash scripts/verify-package.sh`
- `README.md`: "v0.18 (이 브랜치)" 절을 위에 신설(submodule url·branch, dispatch 설명, 로컬 실행법), 기존 v0.17 내용은 "v0.17 (main 브랜치, 참고용)" 절로 아래에 유지
- 검증: `<scratch>/verify-repo`에 worktree(`/Users/hichoi/cdws/reap-wt-tests`)를 **로컬 clone**(worktree 자체는 건드리지 않음) → 그 클론의 `tests/`를 지우고 reap-test 클론의 v0.18 파일들로 교체 → `bun install`(7 packages) → `bun run build`(exit 0) → `bun run typecheck`(exit 0, 에러 없음) → `bun test`(exit 0, **214 pass / 0 fail / 714 expect() calls**, 17 files, ~24s) → `bash tests/hook.test.sh`(exit 0, 5개 검사 전부 통과). `verify-repo`는 검증 후 삭제
- `~/cdws/reap_v17/tests`(v0.17-bridge 체크아웃)는 읽기만 함(remote 확인, 기존 `test.yml` 내용 참고) — 건드리지 않음

## Dead Ends

없음 — 계획대로 진행됨. 참고: v0.17 `test.yml`은 reap을 `path: reap`에, 자기 자신을 `path: reap/tests`에 체크아웃해 `working-directory: reap`으로 스텝을 돌리는 구조였다. task 지시(및 milestone.md)는 reap을 워크플로 루트(기본 경로)에, 자기 자신만 `path: tests`에 체크아웃하는 구조를 요구해 그대로 따랐다 — v0.17과 다른 선택이지만 지시와 milestone 문서 양쪽이 일치해 확인 절차 없이 채택.
