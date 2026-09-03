---
id: gen-0077-exec
slug: npm-package
type: exec
milestone: ms-016
title: npm 패키지 — node 호환 세 파일·패키지 모양·ci/release 워크플로
startedAt: 2026-09-03T14:46:33Z
startCommit: d54a758
status: closed
closedAt: 2026-09-03T15:08:46Z
endCommit: 56568a9
---
## Intent

ms-016 task 1·2·3 — probe(02-distribution)가 실측한 세 파일 수정을 리포에 넣고, `@c-d-cc/reap` 0.18.0 패키지 모양(`build:node`·bin·files·engines)과 `.github/workflows/{ci,release}.yml`(`--tag next` 고정)을 만든다. 끝은 ms-016 Exit Criteria: Bun 없는 PATH에서 tarball 설치본이 명령 전부를 내고, Bun 쪽 테스트·컴파일이 그대로 초록.

수행: worktree `../reap-wt-package`(브랜치 `ms-016-package`)에서 subagent. 주 세션은 조율만.

## Outcome

task 1·2·3 전부 됐다. 커밋 넷:

- `9900df2` node 호환 — `plan.ts`(sources.yml 손 파서, 형식 깨지면 한국어 에러, 빈 파일·`sources: []`는 빈 목록) · `orch.ts`(`Atomics.wait`·`setTimeout`) · `languages.ts`(`import.meta.url` 기준 `resolveWasm`)
- `fc741fb` `tests/node-bundle.test.ts` — `beforeAll`에서 `bun build --target=node`로 번들을 한 번 만들고, 리포 밖 임시 git 리포에서 `spawnSync("node", …)`로 전 명령을 검사
- `e2c2292` 패키지 모양 — `package.json`을 발행 모양으로(`@c-d-cc/reap` 0.18.0 · `bin: dist/node/reap.js` · `files` · `engines` · `build:node`/`prepublishOnly`), `web-tree-sitter`는 번들에 인라인되므로 `dependencies`에서 `devDependencies`로, `plugin.json` 버전, `environment/summary.md` 빌드 절, `scripts/verify-package.sh`
- `3dcd60f` `.github/workflows/ci.yml`·`release.yml`

**실측**(`bash scripts/verify-package.sh`, 이 리포에서 직접 돌려 통과): `build:node` → `npm pack`(임시 디렉토리) → 임시 prefix에 `npm i -g` → PATH에서 `~/.bun/bin`을 뺀 채(`hash -r`로 bash의 명령 해시 캐시를 지워야 `command -v bun`이 실제로 빠졌는지 본다 — 안 지우면 이전에 부른 `bun`이 캐시로 남아 거짓으로 "있다"고 나온다) 임시 git 리포에서 `--version`(`reap 0.18.0`)·`init`·`make loop`·`make milestone`·`make generation`·`mark generation --aborted`·`ctx --hook`(JSON)·`doctor`·`plan sources`·`index update/status`·`orch claim/release` 전부 성공. `npm pack --dry-run` 18파일 · tarball 2.7MB · unpacked 28.3MB, `src/`·`tests/`·`plugin/`·`.reap/` 없음.

Bun 쪽: `bun test` 177 통과 · `bun run typecheck` 0 · `bun run build`(컴파일, 89.5MB) · `tests/hook.test.sh` 통과. `bun src/cli.ts --version`도 그대로 된다.

`.github/workflows/{ci,release}.yml` 문법은 `actionlint`가 이 환경에 없어 `Bun.YAML.parse`로만 확인했다. `grep -c "npm publish" .github/workflows/release.yml` = 1, 그 줄에 `--tag next`.

## Dead Ends

- `command -v bun`으로 "PATH에 bun이 없다"를 스스로 검증하려 했다가 처음엔 항상 실패했다 — bash가 이전 호출(`bun run build:node` 등)에서 `bun`의 경로를 해시 캐시에 넣어 두고, PATH를 바꿔도 `command -v`가 그 캐시를 먼저 본다. `hash -r`을 PATH를 바꾼 뒤 매번 넣어 해결

## 남은 것 (handoff.md에도)

- `RELEASE_NOTES.md`가 아직 없다 — `release.yml`의 notes 추출 단계(`awk`+`test -s`)는 지금 그 사실 때문에 실패한다. 다른 세대가 0.18.0 절을 쓴다
- README는 ms-018 범위
- 실제 publish·태그 push는 사람(06-release.md)
- ms-016 "끝나면 물어볼 것" 중 "Bun 없는 머신에서 설치 → 첫 세대까지"는 이 리포(개발 머신)에서 Bun을 PATH만 뺀 채 검증했다 — Bun이 아예 없는 별도 머신에서의 확인은 아니다
