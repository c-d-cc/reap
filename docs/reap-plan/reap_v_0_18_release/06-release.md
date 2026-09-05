# 발행 순서와 준비물

발행 자체(npm publish · git push · 태그 · 마켓플레이스 push)는 **사람의 결정**이다. 이 문서는 그 결정 직전까지 준비돼 있어야 하는 것과 순서를 적는다. 정책은 `docs/release-policy.md`가 소유한다 — 여기 옮겨 적지 않는다.

## 순서 (2026-09-05 개정 — 0.17.8 단계 없음, latest 직접)

1. **reap-test 먼저.** `git -C tests push origin HEAD:v0.18` → `TEST_DISPATCH_TOKEN` 시크릿 등록. 이 리포의 v0.18 push가 그 SHA를 dispatch한다
2. **v0.18 push** → ci.yml(build·verify-package) + dispatch-tests 결과를 사람이 확인
3. **태그 `v0.18.0` push** → release.yml이 typecheck·build·verify-package·`check-release-version.sh` 뒤 `npm publish --access public`(latest). `npm view @c-d-cc/reap dist-tags`로 latest가 0.18.0인지 확인
4. **마켓플레이스.** `c-d-cc/plugins`의 submodule `plugins/reap`를 태그 커밋으로 → `python3 tools/validate_marketplace.py` → push. `reap setup`이 이 마켓플레이스를 등록하므로 **npm publish보다 늦어도 되지만 사용자가 `reap setup`을 치기 전에는** 있어야 한다
5. **main merge** — 브랜치 흐름(release-policy)대로 발행된 상태를 main에

0.17.8 다리와 upgrade agent 본문(main의 `docs/upgrade-agent/`)은 발행하지 않는다 — release-policy "0.17.8 이행 다리는 발행하지 않는다".

## v0.18 브랜치가 갖춰야 하는 것 (G6)

- `.github/workflows/ci.yml` — typecheck · build · verify-package만(테스트는 직접 안 돌린다). `dispatch-tests` 잡이 push마다 `TEST_DISPATCH_TOKEN`으로 `c-d-cc/reap-test`에 dispatch — Q3 답 B(submodule + dispatch, v0.17 방식)
- `.github/workflows/release.yml` — 태그 `v0.18.*`에서 `npm publish --access public`(latest). `--tag next`는 쓰지 않는다(2026-09-05 결정). 발행 앞에 `scripts/check-release-version.sh`(버전 넷 일치·floor). **release는 테스트를 안 돌린다** — typecheck·build·verify만. 태그를 밀기 전에 마지막 push의 `dispatch-tests` 결과(reap-test 쪽 워크플로)를 사람이 확인한다
- `RELEASE_NOTES.md` — 0.18.0 절
- `package.json` — `@c-d-cc/reap` 0.18.0, `private` 제거, `bin`·`files`·`engines`, `reap.autoUpdateMinVersion: "0.18.0"` 유지
- `plugin/.claude-plugin/plugin.json` — version 0.18.0
- `TEST_DISPATCH_TOKEN` 시크릿 — fine-grained PAT, 대상 리포 `c-d-cc/reap-test`, 권한 contents:write. 이 리포(`c-d-cc/reap`)의 Actions 시크릿으로 등록. **reap-test v0.18 브랜치 push가 이 리포의 v0.18 push보다 먼저 있어야** dispatch가 존재하는 SHA를 가리킨다

## reap_v17

은퇴. 0.17.8 bump 커밋(0f25750·be2664a)은 로컬에 남고 태그·publish·main merge를 하지 않는다.

## 발행 직전 체크 (사람이 실행)

```bash
cd ~/cdws/reap && bun test && bash tests/hook.test.sh && bash scripts/check-release-version.sh && bash scripts/verify-package.sh
npm view @c-d-cc/reap dist-tags   # 발행 전: latest 0.17.7 / 발행 후: latest 0.18.0
```
