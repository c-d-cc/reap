# 발행 순서와 준비물

발행 자체(npm publish · git push · 태그 · 마켓플레이스 push)는 **사람의 결정**이다. 이 문서는 그 결정 직전까지 준비돼 있어야 하는 것과 순서를 적는다. 정책은 `docs/release-policy.md`가 소유한다 — 여기 옮겨 적지 않는다.

## 순서 — 바뀌면 다리가 끊긴다

1. **0.17.8을 먼저 latest로.** `reap_v17` 브랜치 v0.17: bump 0.17.8 · RELEASE_NOTES 절 · 태그 `v0.17.8` push → release.yml이 latest로 publish. 0.17.7 사용자가 다음 세션에 자동으로 0.17.8을 받는다
2. **upgrade agent 본문이 GitHub main에 있어야 한다.** 0.17.8의 `reap update`는 `raw.githubusercontent.com/c-d-cc/reap/main/docs/upgrade-agent/reap-upgrade.md`를 받는다. **지금 main(b4d3ae1)에는 그 파일이 없다** — v0.17 브랜치에만 있다. main에 그 파일 하나를 올리거나(사람 결정: main은 발행 상태에 머문다 → 0.17.8 발행 시 v0.17을 main에 merge하는 것이 곧 그것), URL을 v0.17 브랜치로 바꾼다. 어느 쪽이든 발행 전에 `curl -f`로 실재를 확인한다
3. **0.18.0을 next로.** v0.18 브랜치: 태그 `v0.18.0` push → v0.18의 release.yml이 `npm publish --tag next`. 그다음 `npm view @c-d-cc/reap dist-tags`로 latest가 0.17.8인지 **다시** 확인한다
4. **마켓플레이스.** `c-d-cc/plugins`의 항목을 `reap`(submodule `plugins/reap` → c-d-cc/reap, v0.18 태그 커밋)으로 교체. Q5의 답 뒤에
5. **latest 승격은 별도 결정** — release-policy

## v0.18 브랜치가 갖춰야 하는 것 (G6)

- `.github/workflows/ci.yml` — bun test · hook.test.sh · typecheck · build. Q3의 답에 따라 in-repo 실행
- `.github/workflows/release.yml` — 태그 `v0.18.*`에서 `npm publish --tag next --access public`. **`--tag next`가 없는 publish는 이 워크플로에 존재하지 않아야 한다.** floors 검사(`autoUpdateMinVersion`이 실재 발행인지)는 발행 뒤에야 참이 되므로 0.18.0 첫 발행에서는 건너뛰고 그 사실을 적는다
- `RELEASE_NOTES.md` — 0.18.0 절
- `package.json` — `@c-d-cc/reap` 0.18.0, `private` 제거, `bin`·`files`·`engines`, `reap.autoUpdateMinVersion: "0.18.0"` 유지
- `plugin/.claude-plugin/plugin.json` — version 0.18.0

## reap_v17이 갖춰야 하는 것

- `package.json` 0.17.8 · RELEASE_NOTES 0.17.8 절("0.18이 next에 있다, 자동으로 안 올라간다, `reap update`") · `check-docs-version.sh`가 요구하는 문서 버전 정합
- 다리 안내문에 Q2(언어)의 답을 반영

## 발행 직전 체크 (사람이 실행)

```bash
# 0.17.8
cd ~/cdws/reap_v17 && bun test && npm pack --dry-run
# 0.18.0
cd ~/cdws/reap && bun test && ./tests/hook.test.sh && npm pack --dry-run
curl -fsI https://raw.githubusercontent.com/c-d-cc/reap/main/docs/upgrade-agent/reap-upgrade.md
npm view @c-d-cc/reap dist-tags
```
