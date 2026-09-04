---
id: gen-0085-exec
slug: site-skeleton
type: exec
milestone: ms-022
title: 문서 사이트 골격과 앞쪽 네 쪽 — VitePress·docs.yml·소개·설치·첫 사용·개념
startedAt: 2026-09-04T00:07:05Z
startCommit: 142c11e
status: closed
closedAt: 2026-09-04T00:17:08Z
endCommit: 9c5c6a0
---
## Intent

ms-022 task 1 — `site/` VitePress 골격, 루트 스크립트, `docs.yml`(main 전용), 한국어 네 쪽(소개·설치·첫 사용·개념). 실물 출력 예시는 실제로 찍어 넣는다. 끝은 `bun run site:build` dead link 0.

수행: worktree `../reap-wt-site`(브랜치 `ms-022-site`)에서 subagent.

## Outcome

task 1(`tasks/1-skeleton-and-intro.md`) 완료.

- `site/` VitePress 골격 — `site/package.json`(vitepress `^1.6.4`, bun devDependency), `site/bun.lock` 커밋, `site/.vitepress/config.ts`(title REAP, `locales.root`가 ko, nav·sidebar에 지금 있는 네 쪽만 — 없는 쪽은 dead link라 안 넣음, `ignoreDeadLinks: false`), `site/index.md`(홈), `site/public/CNAME`(`reap.cc`, v0.17 `docs/public/CNAME` 값 승계)
- 루트 `package.json`에 `site:dev`(`bun run --cwd site dev`)·`site:build`(`bun run --cwd site build`) 추가 — 둘 다 실측. `bun --cwd site run build`는 안 되고 `bun run --cwd site build`가 맞는 문법이었다(아래 Dead Ends). `npm pack --dry-run`으로 `files: ["dist/node"]`가 site를 이미 배제함을 확인
- `.gitignore`에 `site/node_modules`·`site/.vitepress/dist`·`site/.vitepress/cache` 추가
- `.github/workflows/docs.yml` — v0.17 `docs.yml`의 Pages 배포 부분만 승계(typecheck·prerender 검사 없음). `on: push: branches: [main], paths: [site/**, .github/workflows/docs.yml]` + `workflow_dispatch`. `oven-sh/setup-bun@v2`(리포의 ci.yml·release.yml과 같은 액션) 뒤 `bun install --cwd site --frozen-lockfile` → `bun run site:build` → `upload-pages-artifact`(path `site/.vitepress/dist`) → `deploy-pages`. permissions·concurrency는 v0.17 것 그대로
- 한국어 네 쪽 — `introduction.md`(한 문장, 무엇이 달라졌나, 일곱 원칙 각 한 줄, spec 01 GitHub 링크), `install.md`(README와 같은 명령 전부를 완전하게 — npm next, marketplace add·install, `reap --version` 확인, 제거, v0.17에서 왔다면), `quick-start.md`(init→evolve→complete 세 skill, **실물 `reap ctx` 출력** — 스크래치패드의 임시 git 리포에서 `reap init` → `make loop --type plan` → `make milestone --focus --from <loop-id>` → `make generation --milestone <ms-id>` 뒤 찍은 것을 그대로 실음), `concepts.md`(세 층 판단·확정·사실, loop·milestone·generation과 exec·fix, 3단 저장소 vision·life·archive와 나란히 선 plan·genome·environment·idea, map.md, 상태 줄이 지도라는 것)
- `bun run site:build` — dead link 0, `dist/`에 다섯 페이지(`index`·`introduction`·`install`·`quick-start`·`concepts`) + `CNAME` 생성 확인
- `./dist/reap doctor` — 결함 0 (다른 열린 세대의 "바인딩 안 됨" 참고 3건은 이 세대와 무관)
- 커밋 셋 — 골격(`7ea4aa2`) / 워크플로(`ae12fdc`) / 네 쪽(`94bb0af`)

## Dead Ends

- `bun --cwd site run build` — bun이 `--cwd`를 `run`의 옵션이 아니라 스크립트 실행 대상 파일 인자로 읽어 실패한다(패키지 스크립트 목록만 출력하고 안 돎). `bun run --cwd site build`(플래그가 `run` 앞)가 맞는 순서. milestone task가 적어둔 `cd site && bunx vitepress build` 대신 이 형태로 실측해서 바꿨다
- `bun run --cwd site dev`를 `--help`로 확인하려다 실제 dev 서버가 background로 떠버렸다 — `pkill -f "vitepress dev"`로 종료. `site:dev`는 이 세대에서 띄워 검증할 필요가 없다(milestone task 지시)
