---
id: gen-0091-exec
slug: tests-submodule
type: exec
milestone: ms-023
title: tests submodule 전환 — reap-test v0.18 재동기, ci/release dispatch, skill·문서
startedAt: 2026-09-04T01:24:31Z
startCommit: 47ebe04
status: open
---
## Intent

ms-023 task 2 — ms-021이 고친 `tests/`를 scratchpad의 reap-test 클론 v0.18 브랜치에 다시 복사해 커밋하고, 이 리포의 `tests/`를 그 클론을 가리키는 submodule로(`.gitmodules` url은 GitHub, branch v0.18), `ci.yml`·`release.yml`을 dispatch 방식으로, `complete/SKILL.md` 한 줄, `environment/summary.md`·`06-release.md`·genome 갱신. `bun test`가 submodule 체크아웃에서 그대로 돈다. push는 사람.

## Delegation

brief로 subagent에게. worktree `../reap-wt-tests`(브랜치 `ms-023-tests`).

## Outcome

- **A** — 클론(`<scratchpad>/reap-test`, v0.18)의 `tests/`를 이 worktree의 현재 `tests/`(ms-021 en 전환 반영, 18개 `*.test.ts` + `helpers.ts` + `hook.test.sh`, `i18n.test.ts` 신규)로 교체하고 클론에 커밋(`4a5006e`, push 안 함)
- **B** — 이 worktree에서 `git rm -r --cached tests && rm -rf tests` → `git -c protocol.file.allow=always submodule add <클론 절대경로> tests`(file 프로토콜은 기본 차단이라 이 플래그가 그 호출에만 필요) → `.gitmodules`의 url을 `https://github.com/c-d-cc/reap-test.git`로, `branch = v0.18` 추가 → `git submodule sync`. 커밋 `b8014f2`
- **C** — `ci.yml`: build 잡을 typecheck·build·verify-package만으로, `dispatch-tests` 잡을 v0.17 `ci.yml`에서 승계(브랜치 조건은 v0.18·main 둘 다). `release.yml`: 테스트 단계 제거, checkout `submodules: false`, `npm publish --tag next --access public` 유지. 커밋 `7fa57f6`
- **D** — `complete/SKILL.md`에 submodule 포인터 stage 한 줄, `environment/summary.md` 테스트 절, `06-release.md`에 dispatch 사실·`TEST_DISPATCH_TOKEN`·push 순서, `genome/application.md` 테스트 줄. 커밋 `d89e4e3`

검증: `bun test` 227 통과, `bash tests/hook.test.sh` 전부 통과, `bun run typecheck`·`bun run build`·`bash scripts/verify-package.sh` 성공. `./dist/reap doctor` 결함 0.

## Dead Ends

- `git submodule add <절대경로> tests`가 기본 설정에서 `fatal: transport 'file' not allowed`로 막혔다 — git의 `protocol.file.allow` 기본값이 `user`가 아니라 clone 호출 자체를 막는 경우가 있다. `-c protocol.file.allow=always`를 그 한 호출에만 줘서 우회(전역 설정은 안 건드림). `.gitmodules`를 GitHub url로 바꾼 뒤 `git submodule sync`로 로컬 저장 remote도 함께 정정
