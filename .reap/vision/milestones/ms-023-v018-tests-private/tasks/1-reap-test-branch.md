# 1 — reap-test v0.18 브랜치

- `git clone ~/cdws/reap_v17/tests <scratch>/reap-test`(로컬 클론에서 다시 clone, remote를 GitHub url로 맞춘다) → `git checkout -b v0.18 origin/main`(main이 v0.17 테스트라면 그 내용은 지우고 v0.18 것으로 — v0.18 테스트는 이 리포 `tests/` 전부)
- `.github/workflows/dispatch.yml`: `on: repository_dispatch: types: [reap-push]` → `actions/checkout`으로 reap(`c-d-cc/reap`, ref `client_payload.reap_sha`)과 자기 자신(ref `client_payload.tests_sha`)을 `tests/`에 → setup-bun·node → `bun install --frozen-lockfile` → `bun run typecheck` → `bun test` → `bash tests/hook.test.sh` → `bun run build` → `bash scripts/verify-package.sh`. v0.17 reap-test의 워크플로(`~/cdws/reap_v17/tests/.github/workflows/`)를 참고하되 v0.18 구조로
- `README.md` 한 줄: v0.18 브랜치는 c-d-cc/reap v0.18의 테스트
- 커밋(한국어). push 금지. 클론 경로를 handoff에
