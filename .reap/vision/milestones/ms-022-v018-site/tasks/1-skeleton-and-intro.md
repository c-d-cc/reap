# 1 — 골격과 앞쪽 네 쪽

- `site/package.json`(vitepress devDependency, bun으로 설치) · `site/.vitepress/config.ts`(title REAP, locales ko root, nav·sidebar, `ignoreDeadLinks: false`) · `site/index.md`(홈)
- 루트 `package.json` scripts: `site:dev`·`site:build`(`cd site && bunx vitepress build`). `.gitignore`에 `site/.vitepress/dist`·`site/.vitepress/cache`·`site/node_modules`
- `.github/workflows/docs.yml` — v0.17 `docs.yml`의 Pages 배포 부분만 승계(typecheck·prerender 검사는 없다), `paths: site/**`, `branches: [main]`. `site/public/CNAME` = v0.17 `docs/public/CNAME` 값
- 쪽: `introduction.md`(REAP 한 문장, 원칙 일곱 요약 — spec 01 링크), `install.md`(README 설치 절과 같은 명령 — README를 가리키지 말고 여기 완전하게), `quick-start.md`(init→evolve→complete, 상태 줄 실물 예시 — `reap ctx` 출력을 실제로 찍어 넣는다), `concepts.md`(세 층·loop/milestone/generation·3단 저장소·map)

함정: VitePress는 `[[...]]` 같은 위키 링크를 해석하지 않는다. spec 문서를 include하지 않는다(spec은 리포 안 상대경로라 사이트 밖). 예시 출력은 실제로 실행해 넣고, 실행한 명령을 주석으로 남기지 않는다
