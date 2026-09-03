# 3 — 워크플로

v0.17의 `.github/workflows/{ci,release}.yml`(`~/cdws/reap_v17`)이 참고다. 그대로 베끼지 않는다 — OpenCode 게이트·docs 검사·reap-test dispatch는 v0.18에 없다.

## ci.yml

push(v0.18·main)·PR: `bun install` → `bun run typecheck` → `bun test` → `bash tests/hook.test.sh` → `bun run build` → `bun run build:node` → `npm pack --dry-run`. 테스트는 리포 안에서 직접 돈다(05-open Q3의 답이 B면 그때 바꾼다).

## release.yml

태그 `v0.18.*` push: 위 검사 전부 → `npm publish --tag next --access public`(trusted publishing, `id-token: write`) → GitHub Release(RELEASE_NOTES.md 첫 `## ` 블록). **`--tag next`가 상수다** — 워크플로 입력으로 받지 않는다. latest 승격은 사람이 `npm dist-tag add`로 한다(release-policy).

## 함정

- v0.17 release.yml의 `check-version-floors.sh`는 floor 버전이 실재 발행인지 본다 — 0.18.0 첫 발행에서는 자기 자신이라 아직 없다. 넣지 않고 그 이유를 워크플로 주석이 아니라 06-release.md에 둔다
- `npm publish`는 `prepublishOnly`가 없으면 dist/를 빌드하지 않는다 — 워크플로가 `build:node`를 먼저 돈다. 로컬 실수 방지로 `prepublishOnly: bun run build:node`도 둔다

## 완료 판정

- `grep -c "npm publish" .github/workflows/release.yml`이 1이고 그 줄에 `--tag next`가 있다
- `act`가 없으므로 실제 실행은 push 뒤 — 문법은 `actionlint`가 있으면 돌리고 없으면 YAML 파싱만
