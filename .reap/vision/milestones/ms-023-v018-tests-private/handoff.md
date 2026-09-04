# Handoff — task 2 (submodule 전환)로

task 1(gen-0086-exec)에서 만든 것:

- reap-test 클론: `/private/tmp/claude-501/-Users-hichoi-cdws-reap/914296f2-726f-4898-a743-f0894f15c233/scratchpad/reap-test`
  (scratchpad라 이 세션이 끝나면 사라질 수 있다 — task 2 세션에서 없으면 `https://github.com/c-d-cc/reap-test.git`를 다시 clone해 `git log`로 아래 커밋이 있는지 확인. 없으면 push가 아직 안 된 것)
- 브랜치 `v0.18`, 커밋 `2f84fc8dbece924d553bcea52ba175604abb5fed` (origin/main에서 분기, **push 안 됨** — 사람이 push해야 이 SHA가 GitHub에 존재한다)
- `.gitmodules`에 넣을 값:
  ```
  [submodule "tests"]
  	path = tests
  	url = https://github.com/c-d-cc/reap-test.git
  	branch = v0.18
  ```
- reap-test v0.18 브랜치 루트 구조: `*.test.ts`(15개) + `helpers.ts` + `hook.test.sh` + `.github/workflows/dispatch.yml` + `README.md`. v0.17 시절의 `unit/`·`e2e/`·`scenario/`·`helpers/`는 이 브랜치에 없음(main 브랜치에만 남아있음)
- `dispatch.yml`은 `repository_dispatch: types: [reap-push]`를 받아 `client_payload.reap_sha`·`client_payload.tests_sha`로 reap 리포와 자기 자신을 조립한다 — task 2가 `ci.yml`에 추가할 dispatch 잡은 v0.17 `ci.yml`의 `dispatch-tests` 잡(TEST_DISPATCH_TOKEN, `curl -X POST .../dispatches`, event_type `reap-push`, payload `{reap_sha, tests_sha}`)을 그대로 참고하면 된다(`/Users/hichoi/cdws/reap_v17/.github/workflows/ci.yml` 참조)
- **submodule 포인터는 push된 커밋만 가리킬 수 있다** — 이 리포에서 `git submodule add`/`.gitmodules` 설정, `git -C tests checkout v0.18`까지는 로컬에서 되지만, 사람이 reap-test를 push하기 전까지 그 포인터는 GitHub 상에서 깨진 링크다. milestone.md에 이미 명시됨
- 검증 결과: worktree를 로컬 clone한 `<scratch>/verify-repo`에서 `tests/`를 v0.18 클론 내용으로 교체 후 `bun install`·`bun run build`·`bun run typecheck`·`bun test`(214 pass / 0 fail) · `bash tests/hook.test.sh`(전부 통과) 확인. `verify-repo`는 삭제함 — task 2가 재검증하려면 같은 방식으로 다시 clone
