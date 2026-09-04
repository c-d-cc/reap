# 2 — submodule 전환과 CI

- 이 리포에서 `git rm -r --cached tests && rm -rf tests` → `git submodule add -b v0.18 https://github.com/c-d-cc/reap-test.git tests` — 원격에 v0.18이 없으므로 실패한다. 대신: `.gitmodules`를 손으로 쓰고 `git submodule add`의 결과를 흉내내지 말고, **로컬 클론 경로로 add한 뒤 `.gitmodules`의 url만 GitHub로 바꾼다**(`git submodule add <scratch>/reap-test tests` → `.gitmodules` 편집 → `git submodule sync`). 포인터는 task 1의 커밋
- `bun test`가 여전히 214 통과, `tests/hook.test.sh` 경로 그대로
- `ci.yml`: v0.17 dispatch 잡 승계(`TEST_DISPATCH_TOKEN` 없으면 실패로 말한다), build 잡은 typecheck·build·verify-package만. `release.yml`도 테스트 단계 제거·verify 유지
- `complete/SKILL.md` 한 줄, `environment/summary.md` 테스트 절, `06-release.md` 준비물(시크릿·reap-test push가 v0.18 push보다 먼저)
- `.reap/genome/application.md`의 "테스트는 bun test" 줄에 submodule 사실 한 줄
